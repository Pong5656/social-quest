import React, { useEffect, useRef, useState } from "react";
import { getStrandById, getTopicById } from "../content/strands";
import { Question } from "../lib/schema";
import { PixelCoin, PixelHeart, PixelQuestionBlock } from "./PixelIcons";

interface QuestionModalProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  loseHeartOnWrong: boolean;
  onSubmitAnswer: (params: {
    selectedIndex: number;
    isCorrect: boolean;
    responseTimeMs: number;
  }) => { xpEarned: number; coinsEarned: number; antiSpamTriggered: boolean };
  onContinue: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  questionNumber,
  totalQuestions,
  loseHeartOnWrong,
  onSubmitAnswer,
  onContinue,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{
    xpEarned: number;
    coinsEarned: number;
    antiSpamTriggered: boolean;
  } | null>(null);

  const openedAtRef = useRef<number>(Date.now());
  const strand = getStrandById(question.strand);
  const topic = getTopicById(question.topic);

  useEffect(() => {
    openedAtRef.current = Date.now();
    setSelectedIndex(null);
    setAnswered(false);
    setShowHint(false);
    setRewardInfo(null);
  }, [question.id]);

  const handleSelect = (idx: number) => {
    if (answered) return;
    const elapsed = Date.now() - openedAtRef.current;
    const isCorrect = idx === question.answer;
    setSelectedIndex(idx);
    setAnswered(true);
    const reward = onSubmitAnswer({
      selectedIndex: idx,
      isCorrect,
      responseTimeMs: elapsed,
    });
    setRewardInfo(reward);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!answered) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= question.choices.length) {
          e.preventDefault();
          handleSelect(num - 1);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const isCorrect = selectedIndex === question.answer;
  const diffLabel =
    question.difficulty === 1 ? "ง่าย" : question.difficulty === 2 ? "ปานกลาง" : "ยาก (A-Level)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="pixel-box w-full max-w-2xl bg-[var(--px-surface)] text-[var(--px-text)] p-4 sm:p-6 my-auto max-h-[94dvh] overflow-y-auto">
        {/* Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-[var(--px-border)]">
          <div className="flex items-center gap-2">
            <PixelQuestionBlock size={26} />
            <span className={`px-2 py-0.5 text-xs font-bold ${strand.badgeBgClass}`}>
              {strand.shortNameTh}
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold border border-[var(--px-border)] bg-[var(--px-surface-alt)]">
              ระดับ: {diffLabel}
            </span>
          </div>
          <div className="font-pixel text-xs">
            BLOCK {questionNumber}/{totalQuestions}
          </div>
        </div>

        {/* Topic & Dynamic Data Notice */}
        <div className="text-xs text-[var(--px-text-muted)] mb-2 flex flex-wrap items-center justify-between gap-1">
          <span>หัวข้อ: {topic?.shortTitle || question.topic}</span>
          {question.needs_review && (
            <span className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 border border-amber-600">
              ข้อมูล ณ {question.as_of || "2568"}
            </span>
          )}
        </div>

        {/* Stimulus (Scenario / Table / Chart) */}
        {question.stimulus.type !== "none" && question.stimulus.content && (
          <div className="pixel-box-sm p-3 mb-3 bg-[var(--px-surface-alt)] text-[16px] leading-relaxed whitespace-pre-line">
            {question.stimulus.content}
          </div>
        )}

        {/* Question Prompt */}
        <h2
          id="question-modal-title"
          className="font-heading-th font-bold text-lg sm:text-xl leading-snug mb-4"
        >
          {question.question}
        </h2>

        {/* Hint Button */}
        {!answered && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="px-3 py-1.5 text-sm font-semibold border-2 border-[var(--px-border)] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 cursor-pointer"
            >
              💡 {showHint ? "ซ่อนคำใบ้" : "ขอคำใบ้จากน้องติว"}
            </button>
            {showHint && (
              <p className="mt-2 p-2.5 text-sm border-l-4 border-amber-500 bg-amber-50 dark:bg-slate-800">
                <strong>คำใบ้:</strong> {question.hint}
              </p>
            )}
          </div>
        )}

        {/* Choices */}
        <div className="space-y-2.5">
          {question.choices.map((choice, idx) => {
            let btnStyle =
              "bg-[var(--px-surface)] hover:bg-amber-100 dark:hover:bg-slate-800 text-[var(--px-text)]";
            if (answered) {
              if (idx === question.answer) {
                btnStyle = "bg-emerald-600 text-white border-emerald-950";
              } else if (idx === selectedIndex) {
                btnStyle = "bg-red-600 text-white border-red-950";
              } else {
                btnStyle = "opacity-65 bg-[var(--px-surface)]";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-3.5 min-h-[54px] border-3 border-[var(--px-border)] shadow-[3px_3px_0px_var(--px-shadow)] flex items-start gap-3 text-[16px] leading-snug cursor-pointer transition-colors ${btnStyle}`}
              >
                <span className="font-pixel text-xs px-2 py-1 bg-slate-900 text-amber-300 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-thai font-medium">{choice}</span>
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Detailed Explanation */}
        {answered && (
          <div
            className={`mt-4 p-4 border-3 border-[var(--px-border)] ${
              isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/60"
                : "bg-red-50 dark:bg-red-950/60"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="font-heading-th font-bold text-lg flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✅ ถูกต้อง! ยอดเยี่ยมมาก!
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    ❌ ยังไม่ถูกนะ ลองดูเฉลยกัน!
                  </span>
                )}
              </div>

              {isCorrect && rewardInfo ? (
                <div className="flex items-center gap-2 font-pixel text-xs">
                  <span className="px-2 py-1 bg-emerald-600 text-white">
                    +{rewardInfo.xpEarned} XP
                  </span>
                  <span className="px-2 py-1 bg-amber-400 text-slate-950 flex items-center gap-1">
                    <PixelCoin size={14} /> +{rewardInfo.coinsEarned}
                  </span>
                </div>
              ) : (
                !isCorrect &&
                loseHeartOnWrong && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-sm">
                    <PixelHeart filled={false} size={18} /> เสียพลังหัวใจ 1 ดวง
                  </div>
                )
              )}
            </div>

            {rewardInfo?.antiSpamTriggered && isCorrect && (
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                ⚠️ ตอบเร็วเกิน 1.2 วินาที ระบบงดโบนัสคอมโบเพื่อป้องกันการกดสุ่ม
              </p>
            )}

            <p className="text-[16px] leading-relaxed mb-2">
              <strong>เฉลยละเอียด:</strong> {question.explanation}
            </p>

            {!isCorrect &&
              selectedIndex !== null &&
              question.wrong_choice_notes[String(selectedIndex)] && (
                <p className="text-sm text-red-800 dark:text-red-200 bg-white/70 dark:bg-slate-900/60 p-2 border-l-4 border-red-500 mb-3">
                  <strong>ทำไมตัวเลือกที่คุณเลือกจึงผิด:</strong>{" "}
                  {question.wrong_choice_notes[String(selectedIndex)]}
                </p>
              )}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onContinue}
                className="pixel-btn bg-amber-400 text-slate-950 font-bold text-base px-6"
              >
                ลุยด่านต่อ (Enter) ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
