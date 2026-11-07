export interface SpacedRepetitionItem {
  questionId: string;
  box: number; // 1 = review immediately, 2 = 1 day, 3 = 3 days, 4 = mastered
  wrongCount: number;
  correctStreak: number;
  lastReviewedAt: number;
  nextReviewAt: number;
}

const BOX_INTERVALS_MS: Record<number, number> = {
  1: 0, // Due immediately
  2: 12 * 60 * 60 * 1000, // 12 hours
  3: 3 * 24 * 60 * 60 * 1000, // 3 days
  4: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function recordReviewOutcome(
  existing: SpacedRepetitionItem | undefined,
  questionId: string,
  isCorrect: boolean,
  nowMs: number = Date.now()
): SpacedRepetitionItem {
  if (!isCorrect) {
    return {
      questionId,
      box: 1,
      wrongCount: (existing?.wrongCount || 0) + 1,
      correctStreak: 0,
      lastReviewedAt: nowMs,
      nextReviewAt: nowMs,
    };
  }

  const nextBox = Math.min(4, (existing?.box || 1) + 1);
  return {
    questionId,
    box: nextBox,
    wrongCount: existing?.wrongCount || 0,
    correctStreak: (existing?.correctStreak || 0) + 1,
    lastReviewedAt: nowMs,
    nextReviewAt: nowMs + (BOX_INTERVALS_MS[nextBox] || 0),
  };
}

export function getDueReviewIds(
  items: Record<string, SpacedRepetitionItem>,
  nowMs: number = Date.now()
): string[] {
  return Object.values(items)
    .filter((item) => item.box < 4 && item.nextReviewAt <= nowMs)
    .sort((a, b) => a.box - b.box || a.nextReviewAt - b.nextReviewAt)
    .map((item) => item.questionId);
}
