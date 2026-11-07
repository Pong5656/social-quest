import {
  computeBangkokStreak,
  computeRegeneratedHearts,
  getBangkokDateString,
  MAX_HEARTS,
} from "./gamification";
import { StrandId } from "./schema";
import { recordReviewOutcome, SpacedRepetitionItem } from "./spacedRepetition";

export interface TopicProgress {
  answered: number;
  correct: number;
  stars: number; // 0 - 3
  bestAccuracy: number; // 0 - 100
}

export interface VirtualControlsConfig {
  mode: "auto" | "show" | "hide";
  sizePx: number; // 56 - 84
  opacity: number; // 0.4 - 1.0
  swapHands: boolean;
}

export interface LastGameConfig {
  topicIds: string[];
  count: number;
  difficulty: "all" | 1 | 2 | 3;
  gameId: string;
  mode: "practice" | "challenge" | "wrong-only";
}

export interface DailyQuestState {
  dateBangkok: string;
  questionsAnsweredToday: number;
  correctToday: number;
  stagesClearedToday: number;
  claimedIds: string[];
}

export interface PlayerProgressState {
  version: number;
  nickname: string;
  avatarId: string;
  xp: number;
  coins: number;
  hearts: number;
  lastHeartRegenAt: number;
  streak: number;
  lastActiveBangkokDate: string | null;
  streakFreezes: number;
  totalAnswered: number;
  totalCorrect: number;
  stagesCleared: number;
  bossesDefeated: number;
  mockExamsCompleted: number;
  bestMockScore: number;
  highScoresByGame: Record<string, number>;
  topicProgress: Record<string, TopicProgress>;
  reviewQueue: Record<string, SpacedRepetitionItem>;
  recentQuestionIds: string[];
  approvedQuestionIds: string[];
  ownedSkins: string[];
  equippedSkin: string;
  unlockedAchievements: string[];
  dailyQuest: DailyQuestState;
  settings: {
    darkMode: boolean;
    soundEnabled: boolean; // Muted by default!
    devMode: boolean; // True by default so draft bank is playable immediately
    enemyDensity: "normal" | "few" | "none";
    virtualControls: VirtualControlsConfig;
  };
  lastGameConfig: LastGameConfig;
}

const STORAGE_KEY = "tiwland_social_8bit_save_v1";

export function createDefaultState(): PlayerProgressState {
  const now = Date.now();
  return {
    version: 1,
    nickname: "นักติว 8-Bit",
    avatarId: "tiw-classic",
    xp: 0,
    coins: 50,
    hearts: MAX_HEARTS,
    lastHeartRegenAt: now,
    streak: 1,
    lastActiveBangkokDate: getBangkokDateString(new Date(now)),
    streakFreezes: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    stagesCleared: 0,
    bossesDefeated: 0,
    mockExamsCompleted: 0,
    bestMockScore: 0,
    highScoresByGame: {},
    topicProgress: {},
    reviewQueue: {},
    recentQuestionIds: [],
    approvedQuestionIds: [],
    ownedSkins: ["skin-default"],
    equippedSkin: "skin-default",
    unlockedAchievements: [],
    dailyQuest: {
      dateBangkok: getBangkokDateString(new Date(now)),
      questionsAnsweredToday: 0,
      correctToday: 0,
      stagesClearedToday: 0,
      claimedIds: [],
    },
    settings: {
      darkMode: false,
      soundEnabled: false,
      devMode: true,
      enemyDensity: "normal",
      virtualControls: {
        mode: "auto",
        sizePx: 64,
        opacity: 0.85,
        swapHands: false,
      },
    },
    lastGameConfig: {
      topicIds: ["buddhism-history"],
      count: 10,
      difficulty: "all",
      gameId: "runner",
      mode: "practice",
    },
  };
}

export function loadProgress(): PlayerProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createDefaultState();
      saveProgress(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<PlayerProgressState>;
    const defaults = createDefaultState();
    const merged: PlayerProgressState = {
      ...defaults,
      ...parsed,
      settings: {
        ...defaults.settings,
        ...(parsed.settings || {}),
        virtualControls: {
          ...defaults.settings.virtualControls,
          ...(parsed.settings?.virtualControls || {}),
        },
      },
      lastGameConfig: {
        ...defaults.lastGameConfig,
        ...(parsed.lastGameConfig || {}),
      },
      dailyQuest: {
        ...defaults.dailyQuest,
        ...(parsed.dailyQuest || {}),
      },
    };

    // Apply heart regeneration & Bangkok streak check
    const heartRes = computeRegeneratedHearts(merged.hearts, merged.lastHeartRegenAt);
    merged.hearts = heartRes.hearts;
    merged.lastHeartRegenAt = heartRes.lastRegenAt;

    const streakRes = computeBangkokStreak(
      merged.lastActiveBangkokDate,
      merged.streak,
      merged.streakFreezes
    );
    merged.streak = streakRes.streak;
    merged.lastActiveBangkokDate = streakRes.lastActiveBangkokDate;
    merged.streakFreezes = streakRes.streakFreezes;

    // Reset daily quest if new day in Bangkok
    const todayBkk = getBangkokDateString();
    if (merged.dailyQuest.dateBangkok !== todayBkk) {
      merged.dailyQuest = {
        dateBangkok: todayBkk,
        questionsAnsweredToday: 0,
        correctToday: 0,
        stagesClearedToday: 0,
        claimedIds: [],
      };
    }

    return merged;
  } catch {
    return createDefaultState();
  }
}

export function saveProgress(state: PlayerProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors in restricted private browsing modes
  }
}

export function applyQuestionResultToState(
  prev: PlayerProgressState,
  params: {
    questionId: string;
    topicId: string;
    isCorrect: boolean;
    xpEarned: number;
    coinsEarned: number;
    loseHeartOnWrong: boolean;
  }
): PlayerProgressState {
  const { questionId, topicId, isCorrect, xpEarned, coinsEarned, loseHeartOnWrong } = params;
  const now = Date.now();
  const prevTopic = prev.topicProgress[topicId] || {
    answered: 0,
    correct: 0,
    stars: 0,
    bestAccuracy: 0,
  };

  const nextAnswered = prevTopic.answered + 1;
  const nextCorrect = prevTopic.correct + (isCorrect ? 1 : 0);
  const acc = Math.round((nextCorrect / nextAnswered) * 100);
  const stars = acc >= 85 && nextAnswered >= 5 ? 3 : acc >= 65 && nextAnswered >= 3 ? 2 : nextCorrect >= 1 ? 1 : 0;

  const updatedTopic: TopicProgress = {
    answered: nextAnswered,
    correct: nextCorrect,
    stars: Math.max(prevTopic.stars, stars),
    bestAccuracy: Math.max(prevTopic.bestAccuracy, acc),
  };

  const nextHearts =
    !isCorrect && loseHeartOnWrong ? Math.max(0, prev.hearts - 1) : prev.hearts;
  const nextHeartRegenAt =
    prev.hearts === MAX_HEARTS && nextHearts < MAX_HEARTS ? now : prev.lastHeartRegenAt;

  const updatedReview = recordReviewOutcome(
    prev.reviewQueue[questionId],
    questionId,
    isCorrect,
    now
  );

  const recentIds = [questionId, ...prev.recentQuestionIds.filter((id) => id !== questionId)].slice(
    0,
    40
  );

  const todayBkk = getBangkokDateString();
  const dq =
    prev.dailyQuest.dateBangkok === todayBkk
      ? prev.dailyQuest
      : {
          dateBangkok: todayBkk,
          questionsAnsweredToday: 0,
          correctToday: 0,
          stagesClearedToday: 0,
          claimedIds: [],
        };

  return {
    ...prev,
    xp: prev.xp + xpEarned,
    coins: prev.coins + coinsEarned,
    hearts: nextHearts,
    lastHeartRegenAt: nextHeartRegenAt,
    totalAnswered: prev.totalAnswered + 1,
    totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
    topicProgress: {
      ...prev.topicProgress,
      [topicId]: updatedTopic,
    },
    reviewQueue: {
      ...prev.reviewQueue,
      [questionId]: updatedReview,
    },
    recentQuestionIds: recentIds,
    dailyQuest: {
      ...dq,
      questionsAnsweredToday: dq.questionsAnsweredToday + 1,
      correctToday: dq.correctToday + (isCorrect ? 1 : 0),
    },
  };
}

export function exportProgressJson(state: PlayerProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function exportProgressShortCode(state: PlayerProgressState): string {
  const compact = {
    n: state.nickname,
    x: state.xp,
    c: state.coins,
    s: state.streak,
    ta: state.totalAnswered,
    tc: state.totalCorrect,
    sc: state.stagesCleared,
    bd: state.bossesDefeated,
    tp: state.topicProgress,
    os: state.ownedSkins,
    es: state.equippedSkin,
    ap: state.approvedQuestionIds,
  };
  const json = JSON.stringify(compact);
  const encoded = btoa(encodeURIComponent(json));
  return `TIW1:${encoded}`;
}

export function importProgressData(
  rawInput: string,
  currentState: PlayerProgressState
): { ok: true; state: PlayerProgressState } | { ok: false; error: string } {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, error: "กรุณาวางข้อมูล JSON หรือรหัสโอนย้ายความคืบหน้า" };
  }

  try {
    if (trimmed.startsWith("TIW1:")) {
      const payload = trimmed.slice(5);
      const decodedJson = decodeURIComponent(atob(payload));
      const compact = JSON.parse(decodedJson);
      const restored: PlayerProgressState = {
        ...currentState,
        nickname: compact.n || currentState.nickname,
        xp: Number(compact.x) || 0,
        coins: Number(compact.c) || 0,
        streak: Number(compact.s) || 1,
        totalAnswered: Number(compact.ta) || 0,
        totalCorrect: Number(compact.tc) || 0,
        stagesCleared: Number(compact.sc) || 0,
        bossesDefeated: Number(compact.bd) || 0,
        topicProgress: compact.tp || {},
        ownedSkins: Array.isArray(compact.os) ? compact.os : ["skin-default"],
        equippedSkin: compact.es || "skin-default",
        approvedQuestionIds: Array.isArray(compact.ap) ? compact.ap : [],
      };
      return { ok: true, state: restored };
    }

    const parsed = JSON.parse(trimmed) as Partial<PlayerProgressState>;
    if (typeof parsed.xp !== "number" || typeof parsed.coins !== "number") {
      return { ok: false, error: "รูปแบบไฟล์ JSON ไม่ถูกต้อง (ไม่พบค่า XP หรือ Coins)" };
    }
    const defaults = createDefaultState();
    return {
      ok: true,
      state: {
        ...defaults,
        ...parsed,
        settings: {
          ...defaults.settings,
          ...(parsed.settings || {}),
        },
      },
    };
  } catch {
    return { ok: false, error: "ไม่สามารถอ่านข้อมูลได้ โปรดตรวจสอบว่าคัดลอกโค้ดหรือไฟล์ครบถ้วน" };
  }
}

export function getStrandMasteryPercent(
  strandId: StrandId,
  topicIdsInStrand: string[],
  topicProgress: Record<string, TopicProgress>
): number {
  void strandId;
  if (topicIdsInStrand.length === 0) return 0;
  let totalAcc = 0;
  for (const tid of topicIdsInStrand) {
    const p = topicProgress[tid];
    if (p && p.answered > 0) {
      totalAcc += Math.round((p.correct / p.answered) * 100);
    }
  }
  return Math.round(totalAcc / topicIdsInStrand.length);
}
