import React, { useMemo, useState } from "react";
import { ALL_QUESTIONS } from "../../content/questions";
import { getStrandById, getTopicById } from "../../content/strands";
import { soundEngine } from "../../lib/audio";
import { calculateAnswerReward } from "../../lib/gamification";
import { prepareQuestionChoices } from "../../lib/questionSelector";
import { getDueReviewIds } from "../../lib/spacedRepetition";
import { PlayerProgressState } from "../../lib/storage";
import { AppRoute } from "../HudBar";

interface ReviewPageProps {
  state: PlayerProgressState;
  onNavigate: (route: AppRoute) => void;
  onRecordAnswer: (params: {
    questionId: string;
    topicId: string;
    isCorrect: boolean;
    xpEarned: number;
    coinsEarned: number;
    loseHeartOnWrong: boolean;
  }) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  state,
  onNavigate,
  onRecordAnswer,
}) => {
  const dueIds = useMemo(() => getDueReviewIds(state.reviewQueue), [state.reviewQueue]);

  const dueQuestions = useMemo(() => {
    return dueIds
      .map((id) => ALL_QUESTIONS.find((q) => q.id === id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q) => prepareQuestionChoices(q, 4));
  }, [dueIds]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const currentQ = dueQuestions[idx];

  const handleAnswer = (cIdx: number) => {
    if (selected !== null || !currentQ) return;
    setSelected(cIdx);
    const isOk = cIdx === currentQ.answer;
    if (isOk) soundEngine.playCorrect();
    else soundEngine.playWrong();

    const reward = isOk
      ? calculateAnswerReward(currentQ.difficulty, 1, 3000)
      : { xpEarned: 0, coinsEarned: 0, antiSpamTriggered: false };

    onRecordAnswer({
      questionId: currentQ.id,
      topicId: currentQ.topic,
      isCorrect: isOk,
      xpEarned: reward.xpEarned,
      coinsEarned: reward.coinsEarned,
      loseHeartOnWrong: false,
    });
  };

  const handleNext = () => {
    setSelected(null);
    setIdx((i) => i + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      <div className="pixel-box p-5 bg-[var(--px-surface)] space-y-2">
        <div className="font-pixel text-xs text-purple-600 dark:text-purple-400">
          SPACED REPETITION DOJO
        </div>
        <h1 className="font-heading-th font-bold text-2xl sm:text-3xl">
          🔁 สำนักทบทวนข้อที่เคยผิด (Spaced Repetition)
        </h1>
        <p className="text-sm sm:text-base text-[var(--px-text-muted)]">
          ข้อคำถามที่คุณเคยตอบผิดจะถูกจัดเข้าคิวทบทวนอัตโนมัติ (Box 1 → Box 2 → Box 3 → Mastered) เมื่อตอบถูกซ้ำตามรอบ ระบบจะเลื่อนระดับความจำให้ทันที!
        </p>
      </div>

      {dueQuestions.length === 0 || !currentQ ? (
        <div className="pixel-box p-8 bg-[var(--px-surface)] text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h2 className="font-heading-th font-bold text-xl">
            ยอดเยี่ยม! ไม่มีข้อผิดค้างทบทวนในรอบนี้แล้ว
          </h2>
          <p className="text-sm text-[var(--px-text-muted)]">
            ออกไปผจญภัยเก็บดาวในด่านใหม่ ๆ หรือลองทำข้อสอบจำลอง A-Level ต่อได้เลย!
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ page: "topics" })}
              className="pixel-btn bg-amber-400 text-slate-950 font-bold"
            >
              🗺️ ไปแผนที่ด่าน
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ page: "mock-exam" })}
              className="pixel-btn bg-sky-400 text-slate-950 font-bold"
            >
              📝 ลองทำ Mock Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--px-border)] pb-2 text-xs">
            <span className="font-bold">
              ข้อที่รอทบทวน: {idx + 1} / {dueQuestions.length} •{" "}
              {getStrandById(currentQ.strand).shortNameTh} (
              {getTopicById(currentQ.topic)?.shortTitle})
            </span>
            <span className="px-2 py-0.5 bg-purple-600 text-white font-pixel text-[10px]">
              BOX {state.reviewQueue[currentQ.id]?.box || 1} / 4
            </span>
          </div>

          {currentQ.stimulus.type !== "none" && currentQ.stimulus.content && (
            <div className="p-3 bg-[var(--px-surface-alt)] border border-[var(--px-border)] text-base whitespace-pre-line">
              {currentQ.stimulus.content}
            </div>
          )}

          <h2 className="font-heading-th font-bold text-lg sm:text-xl">
            {currentQ.question}
          </h2>

          <div className="space-y-2.5">
            {currentQ.choices.map((c, i) => {
              let style =
                "bg-[var(--px-surface-alt)] hover:bg-amber-100 dark:hover:bg-slate-800";
              if (selected !== null) {
                if (i === currentQ.answer) style = "bg-emerald-600 text-white";
                else if (i === selected) style = "bg-red-600 text-white";
                else style = "opacity-60 bg-[var(--px-surface)]";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left p-3.5 min-h-[52px] border-3 border-[var(--px-border)] flex items-start gap-3 cursor-pointer ${style}`}
                >
                  <span className="font-pixel text-xs px-2 py-1 bg-slate-900 text-amber-300">
                    {i + 1}
                  </span>
                  <span className="text-[16px]">{c}</span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="p-4 bg-amber-50 dark:bg-slate-800 border-2 border-[var(--px-border)] space-y-3">
              <p className="text-base">
                <strong>เฉลยละเอียด:</strong> {currentQ.explanation}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="pixel-btn bg-amber-400 text-slate-950 font-bold"
                >
                  ข้อถัดไป ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
