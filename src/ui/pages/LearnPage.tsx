import React, { useState } from "react";
import { getLessonByTopic } from "../../content/lessons";
import { getStrandById, getTopicById } from "../../content/strands";
import { StrandId } from "../../lib/schema";
import { AppRoute } from "../HudBar";
import { SageGuideSprite } from "../PixelIcons";

interface LearnPageProps {
  strandId: string;
  topicId: string;
  onNavigate: (route: AppRoute) => void;
  onPlayTopic: (topicId: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  strandId,
  topicId,
  onNavigate,
  onPlayTopic,
}) => {
  const strand = getStrandById(strandId as StrandId);
  const topicMeta = getTopicById(topicId);
  const lesson = getLessonByTopic(topicId);

  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center space-y-4">
        <p>ไม่พบบทเรียนที่ระบุ</p>
        <button
          type="button"
          onClick={() => onNavigate({ page: "topics" })}
          className="pixel-btn bg-amber-400 text-slate-950"
        >
          กลับหน้าเลือกหัวข้อ
        </button>
      </div>
    );
  }

  const currentCard = lesson.flashcards[cardIndex % lesson.flashcards.length];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Top Breadcrumb & Instant Play CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate({ page: "topics" })}
          className="pixel-btn !min-h-[40px] bg-[var(--px-surface)] text-sm"
        >
          ◀ กลับแผนที่ด่าน
        </button>

        <button
          type="button"
          onClick={() => onPlayTopic(lesson.topic)}
          className="pixel-btn bg-emerald-500 text-slate-950 font-bold text-base px-6"
        >
          🎮 เล่นเกมหัวข้อนี้ทันที!
        </button>
      </div>

      {/* Topic Switcher Strip within Same Strand */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {strand.topics.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setCardIndex(0);
              setCardFlipped(false);
              onNavigate({ page: "learn", strandId: strand.id, topicId: t.id });
            }}
            className={`px-3 py-1.5 border-2 border-[var(--px-border)] text-xs font-bold shrink-0 cursor-pointer ${
              t.id === lesson.topic
                ? strand.badgeBgClass
                : "bg-[var(--px-surface)] text-[var(--px-text)]"
            }`}
          >
            {t.code} {t.shortTitle}
          </button>
        ))}
      </div>

      {/* Lesson Hero Header */}
      <header className="pixel-box p-5 sm:p-6 bg-[var(--px-surface)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`px-2.5 py-1 text-xs font-bold ${strand.badgeBgClass}`}>
            {strand.nameTh} • หัวข้อ {topicMeta?.code}
          </span>
          {lesson.needs_review && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 border border-amber-600">
              ข้อมูลอัปเดต ณ {lesson.as_of} (ตรวจสอบเป็นระยะ)
            </span>
          )}
        </div>

        <h1 className="font-heading-th font-bold text-2xl sm:text-3xl leading-snug">
          {lesson.title}
        </h1>
        <p className="text-base text-[var(--px-text-muted)]">{lesson.subtitle}</p>

        {/* Guide Character Assistant Tip */}
        <div className="pixel-box-sm p-3 bg-[var(--px-surface-alt)] flex items-start gap-3">
          <SageGuideSprite size={42} />
          <div className="text-sm sm:text-base">
            <strong className="text-purple-700 dark:text-purple-300">
              เกร็ดจำจากอาจารย์ปราชญ์:
            </strong>{" "}
            {lesson.assistantTip}
          </div>
        </div>
      </header>

      {/* 1. Learning Objectives */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-2">
        <h2 className="font-heading-th font-bold text-xl">🎯 1. เป้าหมายการเรียนรู้</h2>
        <ul className="list-disc pl-6 space-y-1 text-[16px]">
          {lesson.objectives.map((obj, idx) => (
            <li key={idx}>{obj}</li>
          ))}
        </ul>
      </section>

      {/* 2. Detailed Structured Summary */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-5">
        <h2 className="font-heading-th font-bold text-xl">
          📚 2. สรุปเนื้อหาละเอียด (ฉบับเข้าใจง่ายตรงจุดออกสอบ A-Level)
        </h2>
        {lesson.sections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="font-heading-th font-bold text-lg text-amber-700 dark:text-amber-300">
              {sec.heading}
            </h3>
            <p className="text-[16px] leading-relaxed">{sec.body}</p>
            {sec.bulletPoints && sec.bulletPoints.length > 0 && (
              <ul className="list-disc pl-6 space-y-1.5 text-[16px] bg-[var(--px-surface-alt)] p-3.5 border-l-4 border-[var(--px-border)]">
                {sec.bulletPoints.map((bp, bIdx) => (
                  <li key={bIdx}>{bp}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* 3. Visual Table / Diagram / Timeline */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-3">
        <h2 className="font-heading-th font-bold text-xl">
          📊 3. {lesson.visualDiagram.title}
        </h2>
        {lesson.visualDiagram.headers && lesson.visualDiagram.rows && (
          <div className="overflow-x-auto border-2 border-[var(--px-border)]">
            <table className="w-full text-left border-collapse text-[15px]">
              <thead>
                <tr className="bg-slate-900 text-amber-300">
                  {lesson.visualDiagram.headers.map((h, i) => (
                    <th key={i} className="p-3 border border-slate-700 font-heading-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lesson.visualDiagram.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={
                      rIdx % 2 === 0
                        ? "bg-[var(--px-surface)]"
                        : "bg-[var(--px-surface-alt)]"
                    }
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="p-3 border border-[var(--px-border)] align-top"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lesson.visualDiagram.caption && (
          <p className="text-sm text-[var(--px-text-muted)] italic">
            * {lesson.visualDiagram.caption}
          </p>
        )}
      </section>

      {/* 4. Must-Remember Box + Original Mnemonic */}
      <section className="pixel-box p-5 bg-amber-50 dark:bg-amber-950/50 border-amber-600 space-y-3">
        <h2 className="font-heading-th font-bold text-xl text-amber-900 dark:text-amber-300">
          🧠 4. กล่อง “ต้องจำ!” & เทคนิคจำฉบับติวแลนด์
        </h2>
        {lesson.mustRemember.map((mr, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="font-bold text-base">{mr.title}</h3>
            <ul className="list-disc pl-6 space-y-1 text-[16px]">
              {mr.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="p-3 bg-amber-300 text-slate-950 font-heading-th font-bold text-base border-2 border-slate-950">
              💡 {mr.mnemonic}
            </div>
          </div>
        ))}
      </section>

      {/* 5. Glossary */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-3">
        <h2 className="font-heading-th font-bold text-xl">📖 5. คำศัพท์สำคัญ (Glossary)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lesson.glossary.map((g, idx) => (
            <div
              key={idx}
              className="pixel-box-sm p-3 bg-[var(--px-surface-alt)] space-y-1"
            >
              <div className="font-heading-th font-bold text-base text-indigo-700 dark:text-indigo-300">
                {g.term}
              </div>
              <p className="text-sm leading-relaxed">{g.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Worked A-Level Analytical Examples */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
        <h2 className="font-heading-th font-bold text-xl">
          ✍️ 6. ตัวอย่างสถานการณ์แนวข้อสอบ A-Level พร้อมวิธีคิดทีละขั้น
        </h2>
        {lesson.workedExamples.map((ex, idx) => (
          <div
            key={idx}
            className="pixel-box-sm p-4 bg-[var(--px-surface-alt)] space-y-2.5"
          >
            <div className="p-3 bg-[var(--px-surface)] border-l-4 border-indigo-500 text-[16px]">
              <strong>สถานการณ์:</strong> {ex.scenario}
            </div>
            <div className="font-heading-th font-bold text-base">
              คำถาม: {ex.question}
            </div>
            <div className="space-y-1 text-sm sm:text-base">
              {ex.steps.map((st, sIdx) => (
                <div key={sIdx}>• {st}</div>
              ))}
            </div>
            <div className="p-2.5 bg-emerald-600 text-white font-bold text-sm sm:text-base">
              ✅ คำตอบที่ถูกต้อง: {ex.answer}
            </div>
          </div>
        ))}
      </section>

      {/* 7. Common Mistakes & 8. Exam Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-3">
          <h2 className="font-heading-th font-bold text-lg text-red-600 dark:text-red-400">
            ⚠️ 7. จุดที่เข้าใจผิดบ่อย (ระวังโดนหลอก!)
          </h2>
          {lesson.commonMistakes.map((cm, idx) => (
            <div key={idx} className="space-y-1 text-sm sm:text-base border-b border-[var(--px-border)] pb-2 last:border-b-0">
              <div className="text-red-600 dark:text-red-400 font-semibold">
                ❌ ความเข้าใจผิด: {cm.myth}
              </div>
              <div className="text-emerald-700 dark:text-emerald-300">
                ✅ ข้อเท็จจริง: {cm.truth}
              </div>
            </div>
          ))}
        </section>

        <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-3">
          <h2 className="font-heading-th font-bold text-lg text-sky-700 dark:text-sky-300">
            🎯 8. เทคนิคทำข้อสอบหัวข้อนี้
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            {lesson.examTechniques.map((tech, idx) => (
              <li key={idx}>{tech}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* 9. Interactive Flashcards Deck (10 Cards) */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading-th font-bold text-xl">
            🃏 9. แฟลชการ์ดทบทวนความจำ ({cardIndex + 1} / {lesson.flashcards.length})
          </h2>
          <span className="text-xs text-[var(--px-text-muted)]">
            แตะที่การ์ดเพื่อพลิกดูคำตอบ
          </span>
        </div>

        <button
          type="button"
          onClick={() => setCardFlipped((f) => !f)}
          className={`w-full min-h-[170px] p-6 border-4 border-[var(--px-border)] shadow-[4px_4px_0px_var(--px-shadow)] flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            cardFlipped
              ? "bg-emerald-600 text-white"
              : "bg-indigo-900 text-amber-300"
          }`}
        >
          <span className="font-pixel text-[10px] mb-2 opacity-80">
            {cardFlipped ? "ANSWER (คำตอบ)" : "QUESTION (คำถาม — แตะเพื่อพลิก)"}
          </span>
          <span className="font-heading-th font-bold text-lg sm:text-xl max-w-2xl leading-relaxed">
            {cardFlipped ? currentCard.back : currentCard.front}
          </span>
        </button>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCardFlipped(false);
              setCardIndex((i) => (i - 1 + lesson.flashcards.length) % lesson.flashcards.length);
            }}
            className="pixel-btn bg-[var(--px-surface-alt)] text-sm"
          >
            ◀ ใบก่อนหน้า
          </button>
          <button
            type="button"
            onClick={() => setCardFlipped((f) => !f)}
            className="pixel-btn bg-amber-400 text-slate-950 font-bold text-sm"
          >
            🔄 พลิกการ์ด
          </button>
          <button
            type="button"
            onClick={() => {
              setCardFlipped(false);
              setCardIndex((i) => (i + 1) % lesson.flashcards.length);
            }}
            className="pixel-btn bg-[var(--px-surface-alt)] text-sm"
          >
            ใบถัดไป ▶
          </button>
        </div>
      </section>

      {/* Bottom Play CTA */}
      <div className="pixel-box p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-heading-th font-bold text-lg text-amber-300">
            อ่านสรุปจบแล้ว พร้อมลุยด่านเก็บดาวหรือยัง?
          </div>
          <p className="text-sm text-slate-300">
            ทดสอบความเข้าใจในหัวข้อนี้ผ่านเกม Question Block Runner หรือเกมโหมดอื่น ๆ ได้เลย!
          </p>
        </div>
        <button
          type="button"
          onClick={() => onPlayTopic(lesson.topic)}
          className="pixel-btn bg-emerald-500 text-slate-950 font-bold text-base px-6 py-3"
        >
          🎮 เล่นเกมหัวข้อนี้ทันที!
        </button>
      </div>
    </div>
  );
};
