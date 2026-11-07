import { Lesson, StrandId } from "../../lib/schema";
import { RELIGION_LESSONS } from "./religionLessons";
import { CIVIC_LESSONS } from "./civicLessons";
import { ECONOMICS_LESSONS } from "./economicsLessons";
import { HISTORY_LESSONS } from "./historyLessons";
import { GEOGRAPHY_LESSONS } from "./geographyLessons";

export const ALL_LESSONS: Lesson[] = [
  ...RELIGION_LESSONS,
  ...CIVIC_LESSONS,
  ...ECONOMICS_LESSONS,
  ...HISTORY_LESSONS,
  ...GEOGRAPHY_LESSONS,
];

export function getLessonByTopic(topicId: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.topic === topicId);
}

export function getLessonsByStrand(strandId: StrandId): Lesson[] {
  return ALL_LESSONS.filter((l) => l.strand === strandId);
}
