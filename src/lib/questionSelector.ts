import { MockExamBlueprintConfig } from "../content/examConfig";
import { Question, StrandId } from "./schema";

export interface QuestionQueryOptions {
  topicIds?: string[]; // empty or ['all'] = all topics
  strandId?: StrandId;
  difficulty?: "all" | 1 | 2 | 3;
  count?: number;
  mode?: "practice" | "challenge" | "wrong-only";
  shortOnly?: boolean;
  choiceCount?: 4 | 5;
  devMode?: boolean;
  approvedIds?: string[];
  wrongIds?: string[];
  recentIds?: string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function prepareQuestionChoices(
  question: Question,
  targetChoiceCount: 4 | 5 = 4
): Question {
  const correctChoiceText = question.choices[question.answer];
  let indexed = question.choices.map((text, idx) => ({ text, origIdx: idx }));

  if (targetChoiceCount === 4 && indexed.length > 4) {
    // Keep the correct answer + 3 random distractors
    const correctItem = indexed.find((i) => i.origIdx === question.answer)!;
    const distractors = shuffleArray(indexed.filter((i) => i.origIdx !== question.answer)).slice(0, 3);
    indexed = [correctItem, ...distractors];
  }

  const shuffled = shuffleArray(indexed);
  const newAnswerIndex = shuffled.findIndex((item) => item.text === correctChoiceText);

  const remappedNotes: Record<string, string> = {};
  shuffled.forEach((item, newIdx) => {
    const note = question.wrong_choice_notes[String(item.origIdx)];
    if (note) {
      remappedNotes[String(newIdx)] = note;
    }
  });

  return {
    ...question,
    choices: shuffled.map((s) => s.text),
    answer: newAnswerIndex >= 0 ? newAnswerIndex : 0,
    wrong_choice_notes: remappedNotes,
  };
}

export function selectQuestions(
  allQuestions: Question[],
  options: QuestionQueryOptions = {}
): Question[] {
  const {
    topicIds = [],
    strandId,
    difficulty = "all",
    count = 10,
    mode = "practice",
    shortOnly = false,
    choiceCount = 4,
    devMode = true,
    approvedIds = [],
    wrongIds = [],
    recentIds = [],
  } = options;

  const approvedSet = new Set(approvedIds);

  // 1. Visibility filter (approved vs devMode)
  let pool = allQuestions.filter(
    (q) => devMode || q.status === "approved" || approvedSet.has(q.id)
  );

  // 2. Strand filter
  if (strandId) {
    pool = pool.filter((q) => q.strand === strandId);
  }

  // 3. Topic filter
  if (topicIds.length > 0 && !topicIds.includes("all")) {
    const topicSet = new Set(topicIds);
    pool = pool.filter((q) => topicSet.has(q.topic));
  }

  // 4. Mode filter ('wrong-only')
  if (mode === "wrong-only") {
    const wrongSet = new Set(wrongIds);
    const wrongPool = pool.filter((q) => wrongSet.has(q.id));
    if (wrongPool.length > 0) {
      pool = wrongPool;
    }
  }

  // 5. Short question filter (for fast arcade mini-games 3, 6-10)
  if (shortOnly) {
    const shortPool = pool.filter((q) => q.short === true || q.question.length <= 95);
    if (shortPool.length >= Math.min(4, count)) {
      pool = shortPool;
    }
  }

  // 6. Difficulty filter
  if (difficulty !== "all") {
    const diffPool = pool.filter((q) => q.difficulty === difficulty);
    if (diffPool.length > 0) {
      pool = diffPool;
    }
  }

  // 7. Prioritize questions not recently played
  const recentSet = new Set(recentIds);
  const freshPool = pool.filter((q) => !recentSet.has(q.id));
  const stalePool = pool.filter((q) => recentSet.has(q.id));

  const orderedCandidates = [...shuffleArray(freshPool), ...shuffleArray(stalePool)];
  const selected = orderedCandidates.slice(0, Math.min(count, orderedCandidates.length));

  return selected.map((q) => prepareQuestionChoices(q, choiceCount));
}

export function buildMockExamQuestions(
  allQuestions: Question[],
  config: MockExamBlueprintConfig,
  devMode: boolean = true,
  approvedIds: string[] = []
): Question[] {
  const strandOrder: StrandId[] = ["religion", "civic", "economics", "history", "geography"];
  const result: Question[] = [];

  for (const strand of strandOrder) {
    const quota = config.strandDistribution[strand] || 10;
    const strandQuestions = selectQuestions(allQuestions, {
      strandId: strand,
      count: quota,
      choiceCount: config.officialChoiceCount === 5 ? 5 : 4,
      devMode,
      approvedIds,
    });
    result.push(...strandQuestions);
  }

  return result;
}
