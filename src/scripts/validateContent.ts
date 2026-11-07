import { ALL_LESSONS } from "../content/lessons";
import { ALL_QUESTIONS } from "../content/questions";
import { LessonSchema, QuestionSchema, StrandId } from "../lib/schema";

export interface ContentValidationReport {
  valid: boolean;
  totalLessons: number;
  validLessons: number;
  totalQuestions: number;
  validQuestions: number;
  draftCount: number;
  approvedInSourceCount: number;
  shortQuestionCount: number;
  needsReviewCount: number;
  byStrand: Record<StrandId, { lessons: number; questions: number; needsReview: number }>;
  byDifficulty: { easy: number; medium: number; hard: number };
  bySkill: { remember: number; understand: number; apply: number; analyze: number };
  errors: string[];
}

export function validateAllContent(): ContentValidationReport {
  const errors: string[] = [];
  let validLessons = 0;
  let validQuestions = 0;
  let draftCount = 0;
  let approvedInSourceCount = 0;
  let shortQuestionCount = 0;
  let needsReviewCount = 0;

  const byStrand: Record<StrandId, { lessons: number; questions: number; needsReview: number }> = {
    religion: { lessons: 0, questions: 0, needsReview: 0 },
    civic: { lessons: 0, questions: 0, needsReview: 0 },
    economics: { lessons: 0, questions: 0, needsReview: 0 },
    history: { lessons: 0, questions: 0, needsReview: 0 },
    geography: { lessons: 0, questions: 0, needsReview: 0 },
  };

  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const bySkill = { remember: 0, understand: 0, apply: 0, analyze: 0 };

  for (const lesson of ALL_LESSONS) {
    const res = LessonSchema.safeParse(lesson);
    if (res.success) {
      validLessons++;
      byStrand[lesson.strand].lessons++;
    } else {
      errors.push(`Lesson ${lesson.id}: ${res.error.issues.map((i) => i.message).join(", ")}`);
    }
  }

  const seenIds = new Set<string>();
  for (const q of ALL_QUESTIONS) {
    if (seenIds.has(q.id)) {
      errors.push(`Duplicate Question ID: ${q.id}`);
    }
    seenIds.add(q.id);

    const res = QuestionSchema.safeParse(q);
    if (res.success) {
      validQuestions++;
      byStrand[q.strand].questions++;
      if (q.status === "draft") draftCount++;
      if (q.status === "approved") approvedInSourceCount++;
      if (q.short) shortQuestionCount++;
      if (q.needs_review) {
        needsReviewCount++;
        byStrand[q.strand].needsReview++;
      }
      if (q.difficulty === 1) byDifficulty.easy++;
      if (q.difficulty === 2) byDifficulty.medium++;
      if (q.difficulty === 3) byDifficulty.hard++;
      bySkill[q.skill]++;
    } else {
      errors.push(`Question ${q.id}: ${res.error.issues.map((i) => i.message).join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    totalLessons: ALL_LESSONS.length,
    validLessons,
    totalQuestions: ALL_QUESTIONS.length,
    validQuestions,
    draftCount,
    approvedInSourceCount,
    shortQuestionCount,
    needsReviewCount,
    byStrand,
    byDifficulty,
    bySkill,
    errors,
  };
}
