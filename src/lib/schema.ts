import { z } from "zod";

export const StrandIdSchema = z.enum([
  "religion",
  "civic",
  "economics",
  "history",
  "geography",
]);

export type StrandId = z.infer<typeof StrandIdSchema>;

export const StimulusSchema = z.object({
  type: z.enum(["text", "table", "chart", "map", "image", "none"]),
  content: z.string(),
  caption: z.string().optional(),
});

export const QuestionSchema = z.object({
  id: z.string().min(4),
  subject: z.literal("social-studies"),
  strand: StrandIdSchema,
  topic: z.string().min(2),
  type: z.enum(["mcq", "truefalse", "match", "order", "fill", "maptap"]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  skill: z.enum(["remember", "understand", "apply", "analyze"]),
  tags: z.array(z.string()),
  stimulus: StimulusSchema,
  question: z.string().min(5),
  question_short: z.string().nullable(),
  short: z.boolean().optional(),
  choices: z.array(z.string()).min(2).max(5),
  answer: z.number().int().min(0).max(4),
  explanation: z.string().min(5),
  wrong_choice_notes: z.record(z.string(), z.string()),
  hint: z.string().min(3),
  time_limit_sec: z.number().int().min(10).max(180),
  as_of: z.string().nullable(),
  needs_review: z.boolean(),
  status: z.enum(["draft", "approved"]),
  source_note: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  strand: StrandIdSchema,
  topic: z.string(),
  title: z.string(),
  subtitle: z.string(),
  objectives: z.array(z.string()).min(3).max(6),
  sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      bulletPoints: z.array(z.string()).optional(),
    })
  ),
  glossary: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    })
  ),
  visualDiagram: z.object({
    type: z.enum(["timeline", "table", "supply-demand", "power-chart", "geo-diagram"]),
    title: z.string(),
    headers: z.array(z.string()).optional(),
    rows: z.array(z.array(z.string())).optional(),
    caption: z.string().optional(),
  }),
  mustRemember: z.array(
    z.object({
      title: z.string(),
      items: z.array(z.string()),
      mnemonic: z.string(),
    })
  ),
  workedExamples: z.array(
    z.object({
      scenario: z.string(),
      question: z.string(),
      steps: z.array(z.string()),
      answer: z.string(),
    })
  ),
  commonMistakes: z.array(
    z.object({
      myth: z.string(),
      truth: z.string(),
    })
  ),
  examTechniques: z.array(z.string()),
  flashcards: z.array(
    z.object({
      id: z.string(),
      front: z.string(),
      back: z.string(),
    })
  ),
  assistantTip: z.string(),
  as_of: z.string().nullable(),
  needs_review: z.boolean(),
});

export type Lesson = z.infer<typeof LessonSchema>;
