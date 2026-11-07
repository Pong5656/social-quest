import { Question } from "../../lib/schema";
import { ALL_LESSONS } from "../lessons";
import { RELIGION_QUESTIONS } from "./religionQuestions";
import { CIVIC_QUESTIONS } from "./civicQuestions";
import { ECONOMICS_QUESTIONS } from "./economicsQuestions";
import { HISTORY_QUESTIONS } from "./historyQuestions";
import { GEOGRAPHY_QUESTIONS } from "./geographyQuestions";

export const HANDCRAFTED_QUESTIONS: Question[] = [
  ...RELIGION_QUESTIONS,
  ...CIVIC_QUESTIONS,
  ...ECONOMICS_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
];

/**
 * Generates additional structured concept-check questions from each lesson's
 * flashcards and common mistakes so every single one of the 31 subtopics has
 * a rich, playable pool of >= 12 questions (all strictly starting as status: "draft").
 */
function buildLessonDerivedQuestions(): Question[] {
  const derived: Question[] = [];

  for (const lesson of ALL_LESSONS) {
    const cards = lesson.flashcards;
    cards.forEach((card, idx) => {
      // Pick 4 distinct distractors from other flashcards in the same strand or across lessons
      const sameStrandBacks = ALL_LESSONS.filter((l) => l.strand === lesson.strand)
        .flatMap((l) => l.flashcards)
        .map((c) => c.back)
        .filter((b) => b !== card.back);

      const distractors: string[] = [];
      for (let i = 0; i < sameStrandBacks.length && distractors.length < 4; i++) {
        const candidate = sameStrandBacks[(idx * 3 + i * 7) % sameStrandBacks.length];
        if (candidate && candidate !== card.back && !distractors.includes(candidate)) {
          distractors.push(candidate);
        }
      }

      while (distractors.length < 4) {
        distractors.push(`ตัวเลือกที่ ${distractors.length + 1} (ไม่ตรงกับหลักการของ${lesson.title.split(":")[0]})`);
      }

      const choices = [card.back, ...distractors];
      const difficulty: 1 | 2 | 3 = idx % 3 === 0 ? 1 : idx % 3 === 1 ? 2 : 3;
      const skill = idx % 2 === 0 ? "understand" : "apply";

      derived.push({
        id: `soc-${lesson.strand.slice(0, 3)}-${lesson.topic}-fc${String(idx + 1).padStart(2, "0")}`,
        subject: "social-studies",
        strand: lesson.strand,
        topic: lesson.topic,
        type: "mcq",
        difficulty,
        skill,
        tags: [lesson.topic, "ทบทวนหลักสำคัญ"],
        stimulus: { type: "none", content: "" },
        question: card.front,
        question_short: card.front.length <= 75 ? card.front : card.front.slice(0, 72) + "...",
        short: true,
        choices,
        answer: 0,
        explanation: `คำตอบที่ถูกต้องคือ: ${card.back} — จากบทเรียนเรื่อง "${lesson.title}"`,
        wrong_choice_notes: {
          "1": "เป็นคำอธิบายของหัวข้ออื่นในสาระเดียวกัน โปรดทบทวนนิยามให้แม่นยำ",
          "2": "ไม่สอดคล้องกับเงื่อนไขหรือหลักเกณฑ์ที่โจทย์ถาม",
          "3": "เป็นความเข้าใจที่คลาดเคลื่อนจากหลักสูตร",
          "4": "ไม่ตรงกับสาระสำคัญของหัวข้อนี้",
        },
        hint: lesson.assistantTip,
        time_limit_sec: 35,
        as_of: lesson.as_of,
        needs_review: lesson.needs_review,
        status: "draft",
        source_note: "เขียนใหม่โดย AI (ชุดทบทวนหลักการสำคัญ)",
      });
    });
  }

  return derived;
}

export const ALL_QUESTIONS: Question[] = [
  ...HANDCRAFTED_QUESTIONS,
  ...buildLessonDerivedQuestions(),
];
