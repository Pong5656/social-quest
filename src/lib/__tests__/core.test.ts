import { ALL_QUESTIONS } from "../../content/questions";
import { validateAllContent } from "../../scripts/validateContent";
import {
  calculateAnswerReward,
  computeBangkokStreak,
  computeLevelFromXp,
  computeRegeneratedHearts,
  HEART_REGEN_MS,
  MAX_HEARTS,
} from "../gamification";
import { selectQuestions } from "../questionSelector";
import { getDueReviewIds, recordReviewOutcome } from "../spacedRepetition";

export function runCoreSelfTests(): { passed: number; failed: number; details: string[] } {
  const details: string[] = [];
  let passed = 0;
  let failed = 0;

  const assert = (cond: boolean, name: string) => {
    if (cond) {
      passed++;
      details.push(`PASS: ${name}`);
    } else {
      failed++;
      details.push(`FAIL: ${name}`);
    }
  };

  // 1. XP & Anti-Spam Test
  const normalReward = calculateAnswerReward(3, 3, 4500);
  assert(normalReward.xpEarned === 24 && !normalReward.antiSpamTriggered, "Hard question with combo awards 24 XP");
  const spamReward = calculateAnswerReward(3, 4, 500);
  assert(spamReward.antiSpamTriggered && spamReward.xpEarned === 20, "Fast spam guess (<1.2s) suppresses combo bonus");

  // 2. Level Calculation
  const lv = computeLevelFromXp(320);
  assert(lv.level === 3 && lv.currentLevelXp === 20, "320 XP computes Level 3 with 20 remainder XP");

  // 3. Heart Regeneration (1 heart per 30 min)
  const now = 1_000_000_000;
  const regen = computeRegeneratedHearts(2, now - HEART_REGEN_MS * 2, now);
  assert(regen.hearts === 4, "2 hearts regenerate +2 after 60 minutes");
  const capRegen = computeRegeneratedHearts(4, now - HEART_REGEN_MS * 5, now);
  assert(capRegen.hearts === MAX_HEARTS, "Hearts cap at MAX_HEARTS (5)");

  // 4. Bangkok Streak + Streak Freeze
  const sNext = computeBangkokStreak("2025-05-10", 4, 1, new Date("2025-05-11T10:00:00+07:00"));
  assert(sNext.streak === 5, "Consecutive day in Asia/Bangkok increments streak");
  const sFreeze = computeBangkokStreak("2025-05-10", 4, 1, new Date("2025-05-12T10:00:00+07:00"));
  assert(sFreeze.streak === 5 && sFreeze.freezeUsed && sFreeze.streakFreezes === 0, "1 missed day consumes Streak Freeze and preserves streak");

  // 5. Question Selector & Choice Shuffling
  const picked = selectQuestions(ALL_QUESTIONS, {
    topicIds: ["demand-supply"],
    count: 5,
    choiceCount: 4,
    devMode: true,
  });
  assert(picked.length === 5 && picked.every((q) => q.choices.length === 4), "Question selector returns 5 4-choice questions for demand-supply");

  // 6. Spaced Repetition Queue
  const item1 = recordReviewOutcome(undefined, "q-test", false, 1000);
  const due1 = getDueReviewIds({ "q-test": item1 }, 1500);
  assert(due1.includes("q-test"), "Wrong answer enters Spaced Repetition Box 1 due immediately");

  // 7. Full Content Schema Validation
  const audit = validateAllContent();
  assert(audit.valid && audit.totalLessons === 31 && audit.totalQuestions >= 330, `Zod content validation passed (${audit.totalLessons} lessons, ${audit.totalQuestions} questions)`);

  return { passed, failed, details };
}
