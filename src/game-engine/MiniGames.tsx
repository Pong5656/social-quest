import React, { useEffect, useMemo, useState } from "react";
import {
  PIXEL_MAPS,
  TIMELINE_CHALLENGES,
  WORD_QUEST_ITEMS,
} from "../content/interactiveData";
import { ALL_LESSONS } from "../content/lessons";
import { getStrandById } from "../content/strands";
import { soundEngine } from "../lib/audio";
import {
  BOSS_CLEAR_XP,
  calculateAnswerReward,
  STAGE_CLEAR_XP,
} from "../lib/gamification";
import { Question } from "../lib/schema";
import {
  MonsterSprite,
  PixelCoin,
  PixelStar,
  TiwHeroSprite,
} from "../ui/PixelIcons";

export interface ArcadeGameProps {
  gameId: string;
  questions: Question[];
  topicIds: string[];
  mode: "practice" | "challenge" | "wrong-only";
  skinId: string;
  onRecordAnswer: (params: {
    questionId: string;
    topicId: string;
    isCorrect: boolean;
    xpEarned: number;
    coinsEarned: number;
    loseHeartOnWrong: boolean;
  }) => void;
  onComplete: (summary: {
    gameId: string;
    score: number;
    correctCount: number;
    totalCount: number;
    bonusXp: number;
    coinsCollected: number;
    isBoss?: boolean;
  }) => void;
  onExit: () => void;
}

export const MiniGameArena: React.FC<ArcadeGameProps> = (props) => {
  switch (props.gameId) {
    case "boss":
      return <BossFightGame {...props} />;
    case "door-run":
      return <DoorRunGame {...props} />;
    case "memory":
      return <MemoryMatchGame {...props} />;
    case "timeline":
      return <TimelineBuilderGame {...props} />;
    case "map-quest":
      return <MapQuestGame {...props} />;
    case "coin-catcher":
      return <CoinCatcherGame {...props} />;
    case "speed-rush":
      return <SpeedRushGame {...props} />;
    case "word-quest":
      return <WordQuestGame {...props} />;
    case "space-shooter":
    default:
      return <SpaceShooterGame {...props} />;
  }
};

/* ============================================================================
   2. BOSS FIGHT GAME (3-Phase Strand Boss Battle)
============================================================================ */
const BossFightGame: React.FC<ArcadeGameProps> = ({
  questions,
  mode,
  skinId,
  onRecordAnswer,
  onComplete,
  onExit,
}) => {
  const strand = getStrandById(questions[0]?.strand || "religion");
  const [qIdx, setQIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [heroHp, setHeroHp] = useState(100);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [finished, setFinished] = useState<"win" | "lose" | null>(null);

  const currentQ = questions[qIdx % Math.max(1, questions.length)];
  const bossPhase = bossHp > 66 ? 1 : bossHp > 33 ? 2 : 3;

  const handleAttack = (choiceIdx: number) => {
    if (finished || feedback) return;
    const elapsed = Date.now() - startedAt;
    const isCorrect = choiceIdx === currentQ.answer;
    const reward = isCorrect
      ? calculateAnswerReward(currentQ.difficulty, 2, elapsed)
      : { xpEarned: 0, coinsEarned: 0, antiSpamTriggered: false };

    onRecordAnswer({
      questionId: currentQ.id,
      topicId: currentQ.topic,
      isCorrect,
      xpEarned: reward.xpEarned,
      coinsEarned: reward.coinsEarned,
      loseHeartOnWrong: mode === "challenge",
    });

    if (isCorrect) {
      soundEngine.playBossHit();
      const isCrit = elapsed < 8000;
      const dmg = isCrit ? 30 : 20;
      const nextBossHp = Math.max(0, bossHp - dmg);
      setBossHp(nextBossHp);
      setCorrectCount((c) => c + 1);
      setEarnedCoins((c) => c + reward.coinsEarned);
      setFeedback(
        isCrit
          ? `⚡ CRITICAL HIT! ตอบไวโจมตีบอสแรง ${dmg} DMG!`
          : `⚔️ โจมตีสำเร็จ! ลดพลังบอส ${dmg} DMG`
      );
      if (nextBossHp <= 0) {
        soundEngine.playStageClear();
        setTimeout(() => {
          setFinished("win");
          onComplete({
            gameId: "boss",
            score: (correctCount + 1) * 150,
            correctCount: correctCount + 1,
            totalCount: qIdx + 1,
            bonusXp: BOSS_CLEAR_XP,
            coinsCollected: earnedCoins + reward.coinsEarned,
            isBoss: true,
          });
        }, 900);
        return;
      }
    } else {
      soundEngine.playWrong();
      const nextHeroHp = Math.max(0, heroHp - 25);
      setHeroHp(nextHeroHp);
      setFeedback(`💥 บอสสวนกลับ -25 HP! เฉลย: ${currentQ.choices[currentQ.answer]}`);
      if (nextHeroHp <= 0) {
        setTimeout(() => setFinished("lose"), 1100);
        return;
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setQIdx((i) => i + 1);
      setStartedAt(Date.now());
    }, 1200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= (currentQ?.choices.length || 4)) {
        handleAttack(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold text-base sm:text-lg">
          👹 BOSS FIGHT • {strand.bossName} (Phase {bossPhase}/3)
        </div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออกจากด่าน
        </button>
      </div>

      {/* Arena Battle Stage */}
      <div className="pixel-box p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="grid grid-cols-2 gap-4 items-center mb-4">
          {/* Hero HP */}
          <div className="pixel-box-sm p-3 bg-slate-800/90 border-sky-400">
            <div className="flex items-center gap-2 mb-1">
              <TiwHeroSprite skinId={skinId} size={36} />
              <div>
                <div className="font-bold text-sm">น้องติว (ผู้กล้า)</div>
                <div className="font-pixel text-[10px] text-emerald-400">HP {heroHp}/100</div>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-950 border border-slate-500">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${heroHp}%` }} />
            </div>
          </div>

          {/* Boss HP */}
          <div className="pixel-box-sm p-3 bg-slate-800/90 border-red-500">
            <div className="flex items-center justify-end gap-2 mb-1 text-right">
              <div>
                <div className="font-bold text-sm text-amber-300">{strand.bossName}</div>
                <div className="font-pixel text-[10px] text-red-400">BOSS HP {bossHp}/100</div>
              </div>
              <MonsterSprite variant="boss" size={40} />
            </div>
            <div className="w-full h-3 bg-slate-950 border border-slate-500">
              <div className="h-full bg-red-600 transition-all" style={{ width: `${bossHp}%` }} />
            </div>
          </div>
        </div>

        {feedback && (
          <div className="p-2.5 mb-3 bg-amber-400 text-slate-950 font-heading-th font-bold text-center">
            {feedback}
          </div>
        )}

        {!finished && currentQ && (
          <div className="pixel-box p-4 bg-[var(--px-surface)] text-[var(--px-text)] space-y-3">
            {currentQ.stimulus.type !== "none" && currentQ.stimulus.content && (
              <div className="p-2.5 bg-[var(--px-surface-alt)] border border-[var(--px-border)] text-sm whitespace-pre-line">
                {currentQ.stimulus.content}
              </div>
            )}
            <h3 className="font-heading-th font-bold text-lg">{currentQ.question}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.choices.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAttack(i)}
                  className="pixel-btn justify-start text-left bg-[var(--px-surface-alt)] hover:bg-amber-300 hover:text-slate-950 text-sm"
                >
                  <span className="font-pixel text-xs px-2 py-1 bg-slate-900 text-amber-300">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div className="pixel-box p-6 bg-[var(--px-surface)] text-[var(--px-text)] text-center space-y-3">
            <div className="font-pixel text-lg text-amber-500">
              {finished === "win" ? "BOSS DEFEATED! (+100 XP)" : "DEFEATED BY BOSS"}
            </div>
            <p className="text-base">
              {finished === "win"
                ? `คุณปราบ ${strand.bossName} สำเร็จ! ตอบถูก ${correctCount} ข้อ`
                : "พลังหมดก่อน ลองทบทวนบทเรียนแล้วกลับมาท้าทายบอสใหม่นะ!"}
            </p>
            <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
              กลับหน้าเลือกด่าน
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   3. DOOR RUN GAME (Steer into the right numbered gate!)
============================================================================ */
const DoorRunGame: React.FC<ArcadeGameProps> = ({
  questions,
  mode,
  skinId,
  onRecordAnswer,
  onComplete,
  onExit,
}) => {
  const [idx, setIdx] = useState(0);
  const [lane, setLane] = useState(1); // 0..3
  const [progress, setProgress] = useState(0); // 0..100
  const [correctCount, setCorrectCount] = useState(0);
  const [resultBanner, setResultBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const choices = q ? q.choices.slice(0, 4) : [];

  useEffect(() => {
    if (done || resultBanner || !q) return;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          return 100;
        }
        return p + 2.5;
      });
    }, 150);
    return () => window.clearInterval(timer);
  }, [done, resultBanner, q, idx]);

  useEffect(() => {
    if (progress >= 100 && !resultBanner && !done && q) {
      evaluateDoor(lane);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const evaluateDoor = (chosenLane: number) => {
    if (!q || resultBanner) return;
    const isCorrect = chosenLane === q.answer;
    const reward = isCorrect
      ? calculateAnswerReward(q.difficulty, 1, 3000)
      : { xpEarned: 0, coinsEarned: 0, antiSpamTriggered: false };

    onRecordAnswer({
      questionId: q.id,
      topicId: q.topic,
      isCorrect,
      xpEarned: reward.xpEarned,
      coinsEarned: reward.coinsEarned,
      loseHeartOnWrong: mode === "challenge",
    });

    if (isCorrect) {
      soundEngine.playCorrect();
      setCorrectCount((c) => c + 1);
      setResultBanner(`✅ เข้าประตู ${chosenLane + 1} ถูกต้อง! +${reward.xpEarned} XP`);
    } else {
      soundEngine.playWrong();
      setResultBanner(`❌ ผิด! ประตูที่ถูกคือประตู ${q.answer + 1}: ${choices[q.answer]}`);
    }

    setTimeout(() => {
      setResultBanner(null);
      setProgress(0);
      if (idx + 1 >= questions.length) {
        setDone(true);
        onComplete({
          gameId: "door-run",
          score: (correctCount + (isCorrect ? 1 : 0)) * 100,
          correctCount: correctCount + (isCorrect ? 1 : 0),
          totalCount: questions.length,
          bonusXp: STAGE_CLEAR_XP,
          coinsCollected: (correctCount + (isCorrect ? 1 : 0)) * 10,
        });
      } else {
        setIdx((i) => i + 1);
      }
    }, 1200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setLane((l) => Math.max(0, l - 1));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setLane((l) => Math.min(3, l + 1));
      } else if (e.key === "Enter" || e.key === " ") {
        evaluateDoor(lane);
      } else {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 4) {
          setLane(n - 1);
          evaluateDoor(n - 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done || !q) {
    return (
      <div className="max-w-lg mx-auto pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
        <div className="font-pixel text-lg text-amber-500">DOOR RUN CLEAR!</div>
        <p className="text-lg font-bold">
          วิ่งเข้าประตูถูก {correctCount} / {questions.length} ด่าน
        </p>
        <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
          กลับหน้าเลือกด่าน
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold">
          🚪 DOOR RUN ({idx + 1}/{questions.length}) • เลือกเลนประตูคำตอบที่ถูก!
        </div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      <div className="pixel-box p-4 bg-[var(--px-surface)]">
        <div className="text-center font-heading-th font-bold text-lg mb-3">
          {q.question_short || q.question}
        </div>

        {/* Distance Progress Bar */}
        <div className="w-full h-3 bg-slate-300 dark:bg-slate-800 border-2 border-[var(--px-border)] mb-4">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {resultBanner && (
          <div className="p-2.5 mb-3 bg-amber-300 text-slate-950 font-bold text-center">
            {resultBanner}
          </div>
        )}

        {/* 4 Numbered Doors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          {choices.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setLane(i);
                evaluateDoor(i);
              }}
              className={`p-3 min-h-[120px] border-4 flex flex-col justify-between text-left cursor-pointer transition-transform ${
                lane === i
                  ? "border-amber-400 bg-indigo-900 text-white -translate-y-1 shadow-[4px_4px_0px_#000]"
                  : "border-[var(--px-border)] bg-[var(--px-surface-alt)] text-[var(--px-text)]"
              }`}
            >
              <span className="font-pixel text-xs px-2 py-1 bg-amber-400 text-slate-950 self-start">
                DOOR {i + 1}
              </span>
              <span className="text-sm font-semibold leading-snug mt-2">{c}</span>
            </button>
          ))}
        </div>

        {/* Hero Lane Track */}
        <div className="grid grid-cols-4 gap-2 bg-slate-800 p-3 border-2 border-[var(--px-border)]">
          {[0, 1, 2, 3].map((l) => (
            <div key={l} className="flex flex-col items-center justify-center h-14">
              {lane === l ? (
                <TiwHeroSprite skinId={skinId} size={42} className="animate-pixel-bob" />
              ) : (
                <span className="font-pixel text-[10px] text-slate-500">LANE {l + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Touch Lane Controls */}
        <div className="flex justify-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => setLane((l) => Math.max(0, l - 1))}
            className="pixel-btn bg-slate-700 text-white px-6"
          >
            ◀ ซ้าย
          </button>
          <button
            type="button"
            onClick={() => evaluateDoor(lane)}
            className="pixel-btn bg-emerald-500 text-slate-950 font-bold px-6"
          >
            พุ่งเข้าประตู {lane + 1}!
          </button>
          <button
            type="button"
            onClick={() => setLane((l) => Math.min(3, l + 1))}
            className="pixel-btn bg-slate-700 text-white px-6"
          >
            ขวา ▶
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. MEMORY MATCH GAME (Flashcard Pairs)
============================================================================ */
const MemoryMatchGame: React.FC<ArcadeGameProps> = ({
  topicIds,
  onComplete,
  onExit,
}) => {
  const pairs = useMemo(() => {
    const lessons =
      topicIds.length > 0 && !topicIds.includes("all")
        ? ALL_LESSONS.filter((l) => topicIds.includes(l.topic))
        : ALL_LESSONS;
    const pool = lessons.flatMap((l) => l.flashcards);
    return pool.slice(0, 6);
  }, [topicIds]);

  const cards = useMemo(() => {
    const deck: { uid: string; pairId: string; text: string; kind: "Q" | "A" }[] = [];
    pairs.forEach((p) => {
      deck.push({ uid: `${p.id}-q`, pairId: p.id, text: p.front, kind: "Q" });
      deck.push({ uid: `${p.id}-a`, pairId: p.id, text: p.back, kind: "A" });
    });
    return deck.sort(() => Math.random() - 0.5);
  }, [pairs]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const handleFlip = (uid: string) => {
    if (flipped.length >= 2 || flipped.includes(uid) || matched.includes(uid)) return;
    const nextFlipped = [...flipped, uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const c1 = cards.find((c) => c.uid === nextFlipped[0]);
      const c2 = cards.find((c) => c.uid === nextFlipped[1]);
      if (c1 && c2 && c1.pairId === c2.pairId) {
        soundEngine.playCorrect();
        const nextMatched = [...matched, c1.uid, c2.uid];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === cards.length) {
          soundEngine.playStageClear();
          onComplete({
            gameId: "memory",
            score: Math.max(100, 600 - moves * 20),
            correctCount: pairs.length,
            totalCount: pairs.length,
            bonusXp: STAGE_CLEAR_XP,
            coinsCollected: 30,
          });
        }
      } else {
        soundEngine.playWrong();
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold">
          🃏 MEMORY MATCH • จับคู่คำถาม-คำตอบ ({matched.length / 2}/{pairs.length} คู่ | เปิด {moves} ครั้ง)
        </div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      {matched.length === cards.length ? (
        <div className="pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
          <div className="font-pixel text-lg text-amber-500">ALL PAIRS MATCHED!</div>
          <p className="text-lg">จับคู่ครบทั้งหมดใน {moves} ครั้ง รับโบนัส +{STAGE_CLEAR_XP} XP!</p>
          <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
            กลับหน้าเลือกด่าน
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card) => {
            const isOpen = flipped.includes(card.uid) || matched.includes(card.uid);
            const isDone = matched.includes(card.uid);
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleFlip(card.uid)}
                className={`p-3 min-h-[125px] border-3 border-[var(--px-border)] shadow-[3px_3px_0px_var(--px-shadow)] text-left flex flex-col justify-between cursor-pointer ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isOpen
                    ? "bg-[var(--px-surface)] text-[var(--px-text)]"
                    : "bg-indigo-800 text-amber-300 items-center justify-center"
                }`}
              >
                {isOpen ? (
                  <>
                    <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-amber-400 text-slate-950 self-start">
                      {card.kind === "Q" ? "โจทย์/แนวคิด" : "คำตอบ/นิยาม"}
                    </span>
                    <span className="text-sm font-medium leading-snug mt-1">{card.text}</span>
                  </>
                ) : (
                  <span className="font-pixel text-2xl">?</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   5. TIMELINE BUILDER GAME (Tap-to-Swap / Order Events & Steps)
============================================================================ */
const TimelineBuilderGame: React.FC<ArcadeGameProps> = ({
  questions,
  onComplete,
  onExit,
}) => {
  const challenge = useMemo(() => {
    const strand = questions[0]?.strand;
    return (
      TIMELINE_CHALLENGES.find((c) => c.strand === strand) || TIMELINE_CHALLENGES[0]
    );
  }, [questions]);

  const [orderList, setOrderList] = useState(() =>
    [...challenge.items].sort(() => Math.random() - 0.5)
  );
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const handleTapItem = (idx: number) => {
    if (checked) return;
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      const copy = [...orderList];
      [copy[selectedIdx], copy[idx]] = [copy[idx], copy[selectedIdx]];
      setOrderList(copy);
      setSelectedIdx(null);
      soundEngine.playBlockHit();
    }
  };

  const handleCheck = () => {
    setChecked(true);
    const correctPositions = orderList.filter((item, idx) => item.orderIndex === idx).length;
    if (correctPositions === orderList.length) {
      soundEngine.playStageClear();
    } else {
      soundEngine.playWrong();
    }
    onComplete({
      gameId: "timeline",
      score: correctPositions * 100,
      correctCount: correctPositions,
      totalCount: orderList.length,
      bonusXp: correctPositions === orderList.length ? STAGE_CLEAR_XP : 20,
      coinsCollected: correctPositions * 8,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold">⏳ TIMELINE BUILDER • {challenge.title}</div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      <div className="pixel-box p-4 bg-[var(--px-surface)] space-y-3">
        <p className="text-sm text-[var(--px-text-muted)]">
          {challenge.instruction} — <strong>แตะเลือกรายการที่ 1 แล้วแตะรายการที่ 2 เพื่อสลับตำแหน่ง</strong>
        </p>

        <div className="space-y-2">
          {orderList.map((item, idx) => {
            const isRightPos = item.orderIndex === idx;
            let rowBg = "bg-[var(--px-surface-alt)]";
            if (checked) {
              rowBg = isRightPos
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white";
            } else if (selectedIdx === idx) {
              rowBg = "bg-amber-300 text-slate-950";
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTapItem(idx)}
                className={`w-full p-3.5 border-3 border-[var(--px-border)] shadow-[3px_3px_0px_var(--px-shadow)] flex items-center justify-between gap-3 text-left cursor-pointer ${rowBg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-pixel text-xs px-2 py-1 bg-slate-900 text-amber-300">
                    #{idx + 1}
                  </span>
                  <span className="font-heading-th font-bold text-base">{item.label}</span>
                </div>
                {checked && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-black/30">
                    {item.detail}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end gap-2">
          {!checked ? (
            <button
              type="button"
              onClick={handleCheck}
              className="pixel-btn bg-emerald-500 text-slate-950 font-bold"
            >
              ✅ ตรวจลำดับคำตอบ
            </button>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className="pixel-btn bg-amber-400 text-slate-950 font-bold"
            >
              กลับหน้าเลือกด่าน
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   6. MAP QUEST GAME (Interactive Pixel Map with >= 48px Touch Pins)
============================================================================ */
const MapQuestGame: React.FC<ArcadeGameProps> = ({ onComplete, onExit }) => {
  const [mapIdx, setMapIdx] = useState(0);
  const currentMap = PIXEL_MAPS[mapIdx % PIXEL_MAPS.length];
  const [targetIdx, setTargetIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const target = currentMap.targets[targetIdx];

  const handlePinTap = (tId: string, label: string) => {
    if (feedback || done) return;
    const isCorrect = tId === target.id;
    if (isCorrect) {
      soundEngine.playCorrect();
      setScore((s) => s + 1);
      setFeedback(`🎯 ถูกต้อง! พิกัดนี้คือ ${label}`);
    } else {
      soundEngine.playWrong();
      setFeedback(`❌ จุดที่แตะคือ ${label} — เป้าหมายที่ถูกคือ ${target.label}`);
    }

    setTimeout(() => {
      setFeedback(null);
      if (targetIdx + 1 >= currentMap.targets.length) {
        setDone(true);
        onComplete({
          gameId: "map-quest",
          score: (score + (isCorrect ? 1 : 0)) * 100,
          correctCount: score + (isCorrect ? 1 : 0),
          totalCount: currentMap.targets.length,
          bonusXp: STAGE_CLEAR_XP,
          coinsCollected: (score + (isCorrect ? 1 : 0)) * 10,
        });
      } else {
        setTargetIdx((i) => i + 1);
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex flex-wrap items-center justify-between gap-2">
        <div className="font-heading-th font-bold">
          🗺️ MAP QUEST • {currentMap.title} ({targetIdx + 1}/{currentMap.targets.length})
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMapIdx((m) => (m + 1) % PIXEL_MAPS.length);
              setTargetIdx(0);
              setScore(0);
              setDone(false);
            }}
            className="pixel-btn !min-h-[38px] bg-sky-500 text-white text-xs"
          >
            เปลี่ยนแผนที่
          </button>
          <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
            ออก
          </button>
        </div>
      </div>

      {done ? (
        <div className="pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
          <div className="font-pixel text-lg text-emerald-500">MAP EXPLORED!</div>
          <p className="text-lg font-bold">
            ปักหมุดพิกัดถูกต้อง {score} / {currentMap.targets.length} จุด!
          </p>
          <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
            กลับหน้าเลือกด่าน
          </button>
        </div>
      ) : (
        <div className="pixel-box p-4 bg-[var(--px-surface)] space-y-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-600 text-base">
            <strong>ภารกิจค้นหาพิกัด:</strong> {target.clue}
          </div>

          {feedback && (
            <div className="p-2 bg-amber-300 text-slate-950 font-bold text-center">
              {feedback}
            </div>
          )}

          {/* Custom Original Pixel Map Canvas */}
          <div className="relative w-full aspect-[16/10] bg-sky-900 border-4 border-[var(--px-border)] overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Pixel Grid Ocean */}
              <rect x="0" y="0" width="100" height="100" fill="#0c4a6e" />
              {currentMap.mapType === "thailand" && (
                <path
                  d="M28,12 L42,12 L44,26 L72,26 L75,44 L55,58 L44,56 L38,68 L36,90 L28,90 L30,62 L24,46 Z"
                  fill="#22c55e"
                  stroke="#fef08a"
                  strokeWidth="1"
                />
              )}
              {currentMap.mapType === "asean" && (
                <>
                  <path d="M30,15 L54,18 L54,48 L36,52 L32,32 Z" fill="#22c55e" />
                  <path d="M38,54 L46,54 L46,66 L38,66 Z" fill="#16a34a" />
                  <path d="M34,72 L74,72 L74,84 L34,84 Z" fill="#22c55e" />
                  <path d="M70,26 L82,26 L82,48 L70,48 Z" fill="#4ade80" />
                </>
              )}
              {currentMap.mapType === "world" && (
                <>
                  {/* Americas */}
                  <path d="M12,18 L32,18 L28,45 L35,76 L24,82 L20,50 L12,34 Z" fill="#22c55e" />
                  {/* Europe & Africa */}
                  <path d="M44,18 L60,18 L60,36 L64,68 L48,72 L45,42 Z" fill="#16a34a" />
                  {/* Asia & Australia */}
                  <path d="M60,18 L90,20 L88,48 L64,48 Z" fill="#22c55e" />
                  <path d="M74,62 L90,62 L90,78 L74,78 Z" fill="#4ade80" />
                </>
              )}
            </svg>

            {/* >= 48px Touch Pins */}
            {currentMap.targets.map((pin, i) => (
              <button
                key={pin.id}
                type="button"
                aria-label={`พิกัดจุดที่ ${i + 1}`}
                onClick={() => handlePinTap(pin.id, pin.label)}
                style={{
                  left: `calc(${pin.xPercent}% - 24px)`,
                  top: `calc(${pin.yPercent}% - 24px)`,
                }}
                className="absolute w-12 h-12 rounded-none border-3 border-slate-950 bg-amber-400 hover:bg-red-500 hover:text-white text-slate-950 font-pixel text-xs flex items-center justify-center shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                📍{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   7. COIN CATCHER GAME (Catch the Falling Correct Answer Coin)
============================================================================ */
const CoinCatcherGame: React.FC<ArcadeGameProps> = ({
  questions,
  mode,
  skinId,
  onRecordAnswer,
  onComplete,
  onExit,
}) => {
  const [qIdx, setQIdx] = useState(0);
  const [heroLane, setHeroLane] = useState(1);
  const [dropY, setDropY] = useState(0); // 0..100
  const [correctCount, setCorrectCount] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];
  const choices = q ? q.choices.slice(0, 4) : [];

  useEffect(() => {
    if (done || banner || !q) return;
    const t = window.setInterval(() => {
      setDropY((y) => (y >= 100 ? 100 : y + 3));
    }, 150);
    return () => window.clearInterval(t);
  }, [done, banner, q, qIdx]);

  useEffect(() => {
    if (dropY >= 100 && !banner && !done && q) {
      const isCorrect = heroLane === q.answer;
      onRecordAnswer({
        questionId: q.id,
        topicId: q.topic,
        isCorrect,
        xpEarned: isCorrect ? 12 : 0,
        coinsEarned: isCorrect ? 10 : 0,
        loseHeartOnWrong: mode === "challenge",
      });
      if (isCorrect) {
        soundEngine.playCoin();
        setCorrectCount((c) => c + 1);
        setBanner(`🪙 รับเหรียญคำตอบที่ ${heroLane + 1} ถูกต้อง!`);
      } else {
        soundEngine.playWrong();
        setBanner(`❌ พลาด! คำตอบที่ถูกอยู่ในช่องที่ ${q.answer + 1}`);
      }
      setTimeout(() => {
        setBanner(null);
        setDropY(0);
        if (qIdx + 1 >= questions.length) {
          setDone(true);
          onComplete({
            gameId: "coin-catcher",
            score: (correctCount + (isCorrect ? 1 : 0)) * 100,
            correctCount: correctCount + (isCorrect ? 1 : 0),
            totalCount: questions.length,
            bonusXp: STAGE_CLEAR_XP,
            coinsCollected: (correctCount + (isCorrect ? 1 : 0)) * 10,
          });
        } else {
          setQIdx((i) => i + 1);
        }
      }, 1100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropY]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setHeroLane((l) => Math.max(0, l - 1));
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setHeroLane((l) => Math.min(3, l + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (done || !q) {
    return (
      <div className="max-w-lg mx-auto pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
        <div className="font-pixel text-lg text-amber-500">COIN CATCHER COMPLETE!</div>
        <p className="text-lg font-bold">
          รับเหรียญคำตอบถูก {correctCount} / {questions.length} ข้อ
        </p>
        <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
          กลับหน้าเลือกด่าน
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold">
          🪙 COIN CATCHER ({qIdx + 1}/{questions.length})
        </div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      <div className="pixel-box p-4 bg-[var(--px-surface)]">
        <h3 className="font-heading-th font-bold text-lg text-center mb-3">
          {q.question_short || q.question}
        </h3>

        {banner && (
          <div className="p-2 mb-2 bg-amber-300 text-slate-950 font-bold text-center">
            {banner}
          </div>
        )}

        <div className="relative h-72 bg-sky-950 border-4 border-[var(--px-border)] p-2 grid grid-cols-4 gap-2 overflow-hidden">
          {choices.map((choice, laneIdx) => (
            <div
              key={laneIdx}
              onClick={() => setHeroLane(laneIdx)}
              className="relative h-full border-x border-slate-800 flex flex-col justify-between items-center cursor-pointer"
            >
              {/* Falling Coin */}
              <div
                style={{ top: `${Math.min(72, dropY * 0.72)}%` }}
                className="absolute w-full px-1 flex flex-col items-center text-center transition-all"
              >
                <PixelCoin size={28} />
                <span className="mt-1 p-1 bg-amber-300 text-slate-950 text-[11px] font-bold leading-tight border border-slate-950 line-clamp-3">
                  {choice}
                </span>
              </div>

              {/* Hero Catcher at Bottom */}
              <div className="mt-auto pb-1">
                {heroLane === laneIdx && <TiwHeroSprite skinId={skinId} size={40} />}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-3">
          <button type="button" onClick={() => setHeroLane((l) => Math.max(0, l - 1))} className="pixel-btn bg-slate-700 text-white px-6">
            ◀ เลื่อนซ้าย
          </button>
          <button type="button" onClick={() => setHeroLane((l) => Math.min(3, l + 1))} className="pixel-btn bg-slate-700 text-white px-6">
            เลื่อนขวา ▶
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   8. SPEED RUSH GAME (60-Second Rapid-Fire Combo Quiz)
============================================================================ */
const SpeedRushGame: React.FC<ArcadeGameProps> = ({
  questions,
  mode,
  onRecordAnswer,
  onComplete,
  onExit,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [idx, setIdx] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx % Math.max(1, questions.length)];

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [done]);

  useEffect(() => {
    if (done) {
      soundEngine.playStageClear();
      onComplete({
        gameId: "speed-rush",
        score,
        correctCount,
        totalCount: idx,
        bonusXp: STAGE_CLEAR_XP,
        coinsCollected: correctCount * 8,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const handleAnswer = (choiceIdx: number) => {
    if (done || !q) return;
    const isCorrect = choiceIdx === q.answer;
    const nextCombo = isCorrect ? combo + 1 : 0;
    const mult = Math.min(4, 1 + Math.floor(nextCombo / 3));

    onRecordAnswer({
      questionId: q.id,
      topicId: q.topic,
      isCorrect,
      xpEarned: isCorrect ? 10 * mult : 0,
      coinsEarned: isCorrect ? 5 * mult : 0,
      loseHeartOnWrong: mode === "challenge",
    });

    if (isCorrect) {
      soundEngine.playCorrect();
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      setScore((s) => s + 100 * mult);
    } else {
      soundEngine.playWrong();
      setCombo(0);
    }
    setIdx((i) => i + 1);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
        <div className="font-pixel text-lg text-amber-500">TIME UP! SPEED RUSH</div>
        <div className="font-pixel text-2xl text-emerald-500">{score} PTS</div>
        <p className="text-base">ตอบถูกทั้งหมด {correctCount} ข้อภายใน 60 วินาที!</p>
        <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
          กลับหน้าเลือกด่าน
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-pixel text-xs text-red-500">⏱ {timeLeft}s</div>
        <div className="font-pixel text-xs text-amber-500">COMBO x{Math.min(4, 1 + Math.floor(combo / 3))}</div>
        <div className="font-pixel text-xs text-emerald-500">SCORE {score}</div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[36px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      {q && (
        <div className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
          <h3 className="font-heading-th font-bold text-lg sm:text-xl">
            {q.question_short || q.question}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.choices.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(i)}
                className="pixel-btn justify-start text-left bg-[var(--px-surface-alt)] hover:bg-amber-300 hover:text-slate-950"
              >
                <span className="font-pixel text-xs px-2 py-1 bg-slate-900 text-amber-300">{i + 1}</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   9. WORD QUEST GAME (Custom Built-in Pixel Thai Keyboard Vocabulary Guesser)
============================================================================ */
const WordQuestGame: React.FC<ArcadeGameProps> = ({
  questions,
  onComplete,
  onExit,
}) => {
  const pool = useMemo(() => {
    const strand = questions[0]?.strand;
    const filtered = WORD_QUEST_ITEMS.filter((w) => w.strand === strand);
    return filtered.length >= 2 ? filtered : WORD_QUEST_ITEMS.slice(0, 5);
  }, [questions]);

  const [itemIdx, setItemIdx] = useState(0);
  const current = pool[itemIdx % pool.length];
  const [guessedChars, setGuessedChars] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const uniqueChars = useMemo(() => Array.from(new Set(current.word.split(""))), [current]);

  const keyboardChars = useMemo(() => {
    const distractors = ["ก", "ข", "ค", "ง", "จ", "ช", "ด", "ต", "ท", "น", "บ", "ป", "ผ", "พ", "ม", "ย", "ร", "ล", "ว", "ส", "ห", "อ", "า", "ิ", "ี", "ุ", "ู", "เ", "แ", "โ", "ไ", "ั", "์"];
    const set = new Set<string>(uniqueChars);
    for (const d of distractors) {
      if (set.size >= 18) break;
      set.add(d);
    }
    return Array.from(set).sort();
  }, [uniqueChars]);

  const isWordSolved = uniqueChars.every((ch) => guessedChars.includes(ch));
  const isWordFailed = wrongAttempts >= 6;

  const handleGuessChar = (ch: string) => {
    if (guessedChars.includes(ch) || isWordSolved || isWordFailed) return;
    setGuessedChars((prev) => [...prev, ch]);
    if (uniqueChars.includes(ch)) {
      soundEngine.playCoin();
    } else {
      soundEngine.playWrong();
      setWrongAttempts((w) => w + 1);
    }
  };

  const handleNextWord = () => {
    const nextSolved = isWordSolved ? solvedCount + 1 : solvedCount;
    setSolvedCount(nextSolved);
    if (itemIdx + 1 >= Math.min(4, pool.length)) {
      setFinished(true);
      onComplete({
        gameId: "word-quest",
        score: nextSolved * 150,
        correctCount: nextSolved,
        totalCount: Math.min(4, pool.length),
        bonusXp: STAGE_CLEAR_XP,
        coinsCollected: nextSolved * 15,
      });
    } else {
      setItemIdx((i) => i + 1);
      setGuessedChars([]);
      setWrongAttempts(0);
    }
  };

  if (finished) {
    return (
      <div className="max-w-lg mx-auto pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
        <div className="font-pixel text-lg text-amber-500">WORD QUEST CLEAR!</div>
        <p className="text-lg font-bold">
          ทายคำศัพท์สังคมศึกษาสำเร็จ {solvedCount} / {Math.min(4, pool.length)} คำ
        </p>
        <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
          กลับหน้าเลือกด่าน
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold">
          🔤 WORD QUEST • ทายคำศัพท์สำคัญ ({itemIdx + 1}/{Math.min(4, pool.length)})
        </div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      <div className="pixel-box p-5 bg-[var(--px-surface)] space-y-4 text-center">
        <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
          หมวด: {current.categoryHint} | โอกาสพลาดเหลือ {6 - wrongAttempts} ครั้ง
        </div>
        <p className="text-lg font-heading-th font-semibold">{current.clue}</p>

        {/* Character Slots */}
        <div className="flex flex-wrap justify-center gap-2 py-3">
          {current.word.split("").map((ch, idx) => {
            const revealed = guessedChars.includes(ch) || isWordSolved || isWordFailed;
            return (
              <div
                key={idx}
                className="w-11 h-12 border-3 border-[var(--px-border)] bg-[var(--px-surface-alt)] flex items-center justify-center font-heading-th font-bold text-xl"
              >
                {revealed ? ch : "_"}
              </div>
            );
          })}
        </div>

        {(isWordSolved || isWordFailed) && (
          <div className="p-3 bg-amber-200 dark:bg-amber-950 border-2 border-[var(--px-border)] space-y-2">
            <div className="font-bold">
              {isWordSolved
                ? `🎉 ยอดเยี่ยม! คำตอบคือ "${current.word}"`
                : `💡 เฉลยคำศัพท์คือ "${current.word}"`}
            </div>
            <button type="button" onClick={handleNextWord} className="pixel-btn bg-emerald-500 text-slate-950 font-bold">
              คำถัดไป ▶
            </button>
          </div>
        )}

        {/* Custom Built-in Pixel Keypad */}
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 pt-2">
          {keyboardChars.map((ch) => {
            const used = guessedChars.includes(ch);
            const hit = used && uniqueChars.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                disabled={used || isWordSolved || isWordFailed}
                onClick={() => handleGuessChar(ch)}
                className={`min-h-[46px] border-2 border-[var(--px-border)] font-heading-th font-bold text-lg cursor-pointer ${
                  hit
                    ? "bg-emerald-600 text-white"
                    : used
                    ? "bg-slate-400 text-slate-700 opacity-50"
                    : "bg-[var(--px-surface-alt)] hover:bg-amber-300 hover:text-slate-950"
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   10. SPACE SHOOTER GAME (Blast the UFO Carrying the Correct Answer!)
============================================================================ */
const SpaceShooterGame: React.FC<ArcadeGameProps> = ({
  questions,
  mode,
  onRecordAnswer,
  onComplete,
  onExit,
}) => {
  const [qIdx, setQIdx] = useState(0);
  const [shipLane, setShipLane] = useState(1);
  const [laserLane, setLaserLane] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];
  const choices = q ? q.choices.slice(0, 4) : [];

  const fireLaser = (targetLane: number = shipLane) => {
    if (laserLane !== null || feedback || done || !q) return;
    setShipLane(targetLane);
    setLaserLane(targetLane);
    soundEngine.playJump();

    const isCorrect = targetLane === q.answer;
    onRecordAnswer({
      questionId: q.id,
      topicId: q.topic,
      isCorrect,
      xpEarned: isCorrect ? 12 : 0,
      coinsEarned: isCorrect ? 10 : 0,
      loseHeartOnWrong: mode === "challenge",
    });

    setTimeout(() => {
      setLaserLane(null);
      if (isCorrect) {
        soundEngine.playBossHit();
        setCorrectCount((c) => c + 1);
        setFeedback(`💥 ยิงโดนยานคำตอบที่ ${targetLane + 1} ถูกต้อง!`);
      } else {
        soundEngine.playWrong();
        setFeedback(`⚠️ ยิงพลาด! คำตอบที่ถูกคือยานหมายเลข ${q.answer + 1}`);
      }

      setTimeout(() => {
        setFeedback(null);
        if (qIdx + 1 >= questions.length) {
          setDone(true);
          onComplete({
            gameId: "space-shooter",
            score: (correctCount + (isCorrect ? 1 : 0)) * 120,
            correctCount: correctCount + (isCorrect ? 1 : 0),
            totalCount: questions.length,
            bonusXp: STAGE_CLEAR_XP,
            coinsCollected: (correctCount + (isCorrect ? 1 : 0)) * 10,
          });
        } else {
          setQIdx((i) => i + 1);
        }
      }, 1000);
    }, 280);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setShipLane((l) => Math.max(0, l - 1));
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setShipLane((l) => Math.min(3, l + 1));
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        fireLaser(shipLane);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done || !q) {
    return (
      <div className="max-w-lg mx-auto pixel-box p-6 bg-[var(--px-surface)] text-center space-y-4">
        <div className="font-pixel text-lg text-amber-500">GALAXY DEFENDED!</div>
        <p className="text-lg font-bold">
          ทำลายยานคำตอบถูก {correctCount} / {questions.length} ลำ
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <PixelStar key={s} filled={s <= Math.max(1, Math.round((correctCount / Math.max(1, questions.length)) * 3))} size={28} />
          ))}
        </div>
        <button type="button" onClick={onExit} className="pixel-btn bg-amber-400 text-slate-950">
          กลับหน้าเลือกด่าน
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="pixel-box-sm p-3 bg-[var(--px-surface)] flex items-center justify-between">
        <div className="font-heading-th font-bold">
          🚀 SPACE SHOOTER ({qIdx + 1}/{questions.length}) • ยิงยานคำตอบที่ถูกต้อง!
        </div>
        <button type="button" onClick={onExit} className="pixel-btn !min-h-[38px] bg-red-600 text-white text-xs">
          ออก
        </button>
      </div>

      <div className="pixel-box p-4 bg-slate-950 text-white space-y-4">
        <h3 className="font-heading-th font-bold text-lg text-center text-amber-300">
          {q.question_short || q.question}
        </h3>

        {feedback && (
          <div className="p-2 bg-amber-400 text-slate-950 font-bold text-center">
            {feedback}
          </div>
        )}

        {/* 4 Alien Target Lanes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {choices.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => fireLaser(idx)}
              className={`p-3 min-h-[125px] border-3 flex flex-col justify-between text-left cursor-pointer ${
                shipLane === idx
                  ? "border-amber-400 bg-indigo-900/90"
                  : "border-slate-600 bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-pixel text-xs text-amber-300">UFO #{idx + 1}</span>
                <span>👾</span>
              </div>
              <span className="text-sm leading-snug mt-2">{c}</span>
            </button>
          ))}
        </div>

        {/* Laser & Pixel Starship Row */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800">
          {[0, 1, 2, 3].map((l) => (
            <div key={l} className="flex flex-col items-center justify-end h-20 relative">
              {laserLane === l && (
                <div className="w-2 h-14 bg-emerald-400 shadow-[0_0_8px_#4ade80] mb-1" />
              )}
              {shipLane === l ? (
                <div className="text-2xl select-none" aria-label="ยานอวกาศติวแลนด์">
                  🚀
                </div>
              ) : (
                <span className="font-pixel text-[9px] text-slate-600">[{l + 1}]</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setShipLane((l) => Math.max(0, l - 1))} className="pixel-btn bg-slate-800 text-white px-5">
            ◀ ซ้าย
          </button>
          <button type="button" onClick={() => fireLaser(shipLane)} className="pixel-btn bg-red-600 text-white font-pixel text-xs px-6">
            🔥 FIRE!
          </button>
          <button type="button" onClick={() => setShipLane((l) => Math.min(3, l + 1))} className="pixel-btn bg-slate-800 text-white px-5">
            ขวา ▶
          </button>
        </div>
      </div>
    </div>
  );
};
