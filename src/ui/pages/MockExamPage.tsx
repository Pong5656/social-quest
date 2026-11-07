import React, { useEffect, useMemo, useState } from "react";
import {
  A_LEVEL_SOCIAL_CONFIG,
  MINI_MOCK_CONFIG,
  MockExamBlueprintConfig,
} from "../../content/examConfig";
import { ALL_QUESTIONS } from "../../content/questions";
import { getStrandById, getTopicById, STRANDS } from "../../content/strands";
import { soundEngine } from "../../lib/audio";
import { buildMockExamQuestions } from "../../lib/questionSelector";
import { Question, StrandId } from "../../lib/schema";
import { PlayerProgressState } from "../../lib/storage";
import { AppRoute } from "../HudBar";

interface MockExamPageProps {
  state: PlayerProgressState;
  onNavigate: (route: AppRoute) => void;
  onRecordExamComplete: (params: {
    scoreOutOf100: number;
    results: { question: Question; isCorrect: boolean }[];
  }) => void;
  onLaunchRunnerMock: (questions: Question[]) => void;
}

export const MockExamPage: React.FC<MockExamPageProps> = ({
  state,
  onNavigate,
  onRecordExamComplete,
  onLaunchRunnerMock,
}) => {
  const [selectedConfig, setSelectedConfig] = useState<MockExamBlueprintConfig | null>(
    null
  );
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const startExam = (cfg: MockExamBlueprintConfig, asRunner: boolean = false) => {
    const qs = buildMockExamQuestions(
      ALL_QUESTIONS,
      cfg,
      state.settings.devMode,
      state.approvedQuestionIds
    );
    if (asRunner) {
      onLaunchRunnerMock(qs);
      return;
    }
    setSelectedConfig(cfg);
    setExamQuestions(qs);
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    setSecondsLeft(cfg.durationMinutes * 60);
    setSubmitted(false);
  };

  useEffect(() => {
    if (!selectedConfig || submitted) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleSubmitExam();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfig, submitted]);

  const handleSubmitExam = () => {
    if (!selectedConfig || submitted) return;
    setSubmitted(true);
    soundEngine.playStageClear();

    let correct = 0;
    const outcomes = examQuestions.map((q, i) => {
      const ok = answers[i] === q.answer;
      if (ok) correct++;
      return { question: q, isCorrect: ok };
    });

    const score100 = Math.round(
      (correct / Math.max(1, examQuestions.length)) * selectedConfig.maxScore
    );
    onRecordExamComplete({ scoreOutOf100: score100, results: outcomes });
  };

  // Diagnostic Report Breakdown
  const report = useMemo(() => {
    if (!submitted || !selectedConfig) return null;
    const byStrand: Record<
      StrandId,
      { correct: number; total: number; score20: number }
    > = {
      religion: { correct: 0, total: 0, score20: 0 },
      civic: { correct: 0, total: 0, score20: 0 },
      economics: { correct: 0, total: 0, score20: 0 },
      history: { correct: 0, total: 0, score20: 0 },
      geography: { correct: 0, total: 0, score20: 0 },
    };

    const weakTopicIds = new Set<string>();
    let totalCorrect = 0;

    examQuestions.forEach((q, idx) => {
      const ok = answers[idx] === q.answer;
      byStrand[q.strand].total++;
      if (ok) {
        totalCorrect++;
        byStrand[q.strand].correct++;
      } else {
        weakTopicIds.add(q.topic);
      }
    });

    (Object.keys(byStrand) as StrandId[]).forEach((sid) => {
      const item = byStrand[sid];
      item.score20 =
        item.total > 0 ? Math.round((item.correct / item.total) * 20) : 0;
    });

    const totalScore100 = Math.round(
      (totalCorrect / Math.max(1, examQuestions.length)) * 100
    );

    const sortedStrands = [...STRANDS].sort(
      (a, b) => byStrand[b.id].score20 - byStrand[a.id].score20
    );

    return {
      totalCorrect,
      totalQuestions: examQuestions.length,
      totalScore100,
      byStrand,
      strongestStrand: sortedStrands[0],
      weakestStrand: sortedStrands[sortedStrands.length - 1],
      weakTopicIds: Array.from(weakTopicIds).slice(0, 6),
    };
  }, [submitted, selectedConfig, examQuestions, answers]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Landing Selection Screen
  if (!selectedConfig) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        <div className="pixel-box p-5 sm:p-6 bg-[var(--px-surface)] space-y-3">
          <div className="inline-block px-2.5 py-1 bg-amber-400 text-slate-950 font-pixel text-[10px]">
            OFFICIAL BLUEPRINT ALIGNED • {A_LEVEL_SOCIAL_CONFIG.sourceReference}
          </div>
          <h1 className="font-heading-th font-bold text-2xl sm:text-3xl">
            📝 สนามจำลองข้อสอบ A-Level 70 สังคมศึกษา (Mock Exam)
          </h1>
          <p className="text-base text-[var(--px-text-muted)]">
            จำลองโครงสร้างข้อสอบจริงตามประกาศ ทปอ.: <strong>ปรนัย 5 ตัวเลือก รวม 50 ข้อ (100 คะแนน) เวลา 90 นาที</strong> แบ่ง 5 สาระเท่ากัน (สาระละ 10 ข้อ / 20 คะแนน) จับเวลารวม ไม่เฉลยระหว่างทำ และวิเคราะห์จุดแข็ง-จุดอ่อนรายสาระเมื่อส่งกระดาษคำตอบ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full 50-Question Exam */}
          <div className="pixel-box p-5 bg-[var(--px-surface)] flex flex-col justify-between space-y-4 border-amber-500">
            <div className="space-y-2">
              <span className="px-2 py-0.5 bg-red-600 text-white font-pixel text-[10px]">
                FULL SIMULATION
              </span>
              <h2 className="font-heading-th font-bold text-xl">
                {A_LEVEL_SOCIAL_CONFIG.examNameTh} — ชุดเต็ม 50 ข้อ
              </h2>
              <ul className="text-sm space-y-1 text-[var(--px-text-muted)]">
                <li>• จำนวนข้อ: <strong>50 ข้อ</strong> (สาระละ 10 ข้อ × 5 สาระ, 5 ตัวเลือก)</li>
                <li>• เวลาทำข้อสอบ: <strong>90 นาที</strong> (จับเวลาจริง)</li>
                <li>• คะแนนเต็ม: <strong>100 คะแนน</strong> (ข้อละ 2 คะแนน)</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => startExam(A_LEVEL_SOCIAL_CONFIG, false)}
                className="pixel-btn bg-amber-400 text-slate-950 font-bold flex-1"
              >
                📄 เริ่มทำแบบกระดาษข้อสอบ
              </button>
              <button
                type="button"
                onClick={() => startExam(A_LEVEL_SOCIAL_CONFIG, true)}
                className="pixel-btn bg-emerald-500 text-slate-950 font-bold flex-1"
              >
                🎮 ลุยผ่านเกมวิ่ง (50 บล็อก)
              </button>
            </div>
          </div>

          {/* Mini 10-Question Drill */}
          <div className="pixel-box p-5 bg-[var(--px-surface)] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="px-2 py-0.5 bg-sky-600 text-white font-pixel text-[10px]">
                QUICK DRILL
              </span>
              <h2 className="font-heading-th font-bold text-xl">
                {MINI_MOCK_CONFIG.examNameTh}
              </h2>
              <ul className="text-sm space-y-1 text-[var(--px-text-muted)]">
                <li>• จำนวนข้อ: <strong>10 ข้อ</strong> (สาระละ 2 ข้อ × 5 สาระ, 5 ตัวเลือก)</li>
                <li>• เวลาทำข้อสอบ: <strong>18 นาที</strong></li>
                <li>• เหมาะสำหรับฝึกจับเวลาสั้น ๆ บนมือถือ</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => startExam(MINI_MOCK_CONFIG, false)}
                className="pixel-btn bg-sky-400 text-slate-950 font-bold flex-1"
              >
                📄 เริ่มทำมินิ Mock (10 ข้อ)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post-Exam Results & Diagnostic Screen
  if (submitted && report) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        <div className="pixel-box p-6 bg-[var(--px-surface)] text-center space-y-3">
          <div className="font-pixel text-xs text-amber-600 dark:text-amber-400">
            A-LEVEL 70 SOCIAL STUDIES DIAGNOSTIC REPORT
          </div>
          <h1 className="font-heading-th font-bold text-2xl sm:text-3xl">
            ผลการสอบจำลอง: {selectedConfig.examNameTh}
          </h1>
          <div className="font-pixel text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 py-2">
            {report.totalScore100} / 100 คะแนน
          </div>
          <p className="text-base">
            ตอบถูกต้อง <strong>{report.totalCorrect}</strong> จาก{" "}
            <strong>{report.totalQuestions}</strong> ข้อ
          </p>
        </div>

        {/* Per-Strand Score Breakdown */}
        <div className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
          <h2 className="font-heading-th font-bold text-xl">
            📊 คะแนนแยกตาม 5 สาระการเรียนรู้ (สาระละ 20 คะแนน)
          </h2>
          <div className="space-y-3">
            {STRANDS.map((s) => {
              const stat = report.byStrand[s.id];
              const pct = Math.round((stat.score20 / 20) * 100);
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{s.nameTh}</span>
                    <span>
                      {stat.score20} / 20 คะแนน ({stat.correct}/{stat.total} ข้อ)
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 border-2 border-[var(--px-border)]">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, backgroundColor: s.colorHex }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-600 text-sm">
              <strong>💪 จุดแข็งของคุณ:</strong> {report.strongestStrand.nameTh} (
              {report.byStrand[report.strongestStrand.id].score20}/20 คะแนน)
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border-2 border-red-600 text-sm">
              <strong>⚠️ สาระที่ควรเร่งเสริม:</strong> {report.weakestStrand.nameTh} (
              {report.byStrand[report.weakestStrand.id].score20}/20 คะแนน)
            </div>
          </div>

          {report.weakTopicIds.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="font-bold text-sm">🎯 หัวข้อย่อยแนะนำให้กลับไปทบทวน:</div>
              <div className="flex flex-wrap gap-2">
                {report.weakTopicIds.map((tid) => {
                  const tm = getTopicById(tid);
                  if (!tm) return null;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() =>
                        onNavigate({
                          page: "learn",
                          strandId: tm.strand,
                          topicId: tm.id,
                        })
                      }
                      className="px-3 py-1.5 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] text-xs font-bold cursor-pointer hover:bg-amber-300 hover:text-slate-950"
                    >
                      📖 อ่านสรุป {tm.code} {tm.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Full Answer Key & Detailed Solutions */}
        <div className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-th font-bold text-xl">
              🔍 เฉลยละเอียดครบทุกข้อ ({examQuestions.length} ข้อ)
            </h2>
            <button
              type="button"
              onClick={() => setSelectedConfig(null)}
              className="pixel-btn bg-amber-400 text-slate-950 text-sm"
            >
              ทำข้อสอบชุดใหม่
            </button>
          </div>

          <div className="space-y-4">
            {examQuestions.map((q, idx) => {
              const userChoice = answers[idx];
              const isOk = userChoice === q.answer;
              const sMeta = getStrandById(q.strand);
              return (
                <div
                  key={q.id}
                  className={`p-4 border-2 border-[var(--px-border)] ${
                    isOk
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30"
                      : "bg-red-50/60 dark:bg-red-950/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1 text-xs">
                    <span className="font-bold">
                      ข้อที่ {idx + 1} • {sMeta.shortNameTh}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-bold ${
                        isOk ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {isOk
                        ? "✅ ตอบถูก"
                        : userChoice === undefined
                        ? "⚪ ไม่ได้ตอบ"
                        : "❌ ตอบผิด"}
                    </span>
                  </div>
                  <p className="font-heading-th font-bold text-base mb-2">{q.question}</p>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>คำตอบที่ถูกต้อง:</strong> ({q.answer + 1}){" "}
                      {q.choices[q.answer]}
                    </div>
                    {userChoice !== undefined && !isOk && (
                      <div className="text-red-700 dark:text-red-300">
                        <strong>คำตอบที่คุณเลือก:</strong> ({userChoice + 1}){" "}
                        {q.choices[userChoice]}
                      </div>
                    )}
                    <div className="pt-1 text-[var(--px-text-muted)]">
                      <strong>เหตุผล:</strong> {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam Paper View
  const currentQ = examQuestions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Exam Timer Bar */}
      <div className="pixel-box-sm p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-heading-th font-bold text-base text-amber-300">
            {selectedConfig.examNameTh}
          </div>
          <div className="text-xs text-slate-300">
            ทำแล้ว {answeredCount} / {examQuestions.length} ข้อ (ไม่มีเฉลยระหว่างสอบ)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-red-600 font-pixel text-xs sm:text-sm">
            ⏱ {formatTime(secondsLeft)}
          </div>
          <button
            type="button"
            onClick={handleSubmitExam}
            className="pixel-btn !min-h-[40px] bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm"
          >
            ส่งกระดาษคำตอบ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Question Area */}
        <div className="lg:col-span-8 pixel-box p-4 sm:p-6 bg-[var(--px-surface)] space-y-4">
          {currentQ && (
            <>
              <div className="flex items-center justify-between border-b-2 border-[var(--px-border)] pb-2">
                <span className="font-heading-th font-bold text-base">
                  ข้อที่ {currentIdx + 1} / {examQuestions.length} (
                  {getStrandById(currentQ.strand).shortNameTh})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFlagged((f) => ({ ...f, [currentIdx]: !f[currentIdx] }))
                  }
                  className={`px-3 py-1 border-2 border-[var(--px-border)] text-xs font-bold cursor-pointer ${
                    flagged[currentIdx]
                      ? "bg-amber-400 text-slate-950"
                      : "bg-[var(--px-surface-alt)]"
                  }`}
                >
                  {flagged[currentIdx] ? "🚩 ทำเครื่องหมายทบทวนแล้ว" : "🏳️ ทำเครื่องหมายทบทวน"}
                </button>
              </div>

              {currentQ.stimulus.type !== "none" && currentQ.stimulus.content && (
                <div className="p-3.5 bg-[var(--px-surface-alt)] border-2 border-[var(--px-border)] text-[16px] whitespace-pre-line">
                  {currentQ.stimulus.content}
                </div>
              )}

              <h2 className="font-heading-th font-bold text-lg sm:text-xl leading-snug">
                {currentQ.question}
              </h2>

              <div className="space-y-2.5">
                {currentQ.choices.map((c, cIdx) => {
                  const isPicked = answers[currentIdx] === cIdx;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [currentIdx]: cIdx }))
                      }
                      className={`w-full text-left p-3.5 min-h-[52px] border-3 border-[var(--px-border)] flex items-start gap-3 cursor-pointer ${
                        isPicked
                          ? "bg-indigo-700 text-white shadow-[3px_3px_0px_#000]"
                          : "bg-[var(--px-surface-alt)] hover:bg-amber-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="font-pixel text-xs px-2 py-1 bg-slate-900 text-amber-300 shrink-0">
                        {cIdx + 1}
                      </span>
                      <span className="text-[16px] leading-snug">{c}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="pixel-btn bg-[var(--px-surface-alt)] text-sm"
                >
                  ◀ ข้อก่อนหน้า
                </button>
                <button
                  type="button"
                  disabled={currentIdx >= examQuestions.length - 1}
                  onClick={() =>
                    setCurrentIdx((i) => Math.min(examQuestions.length - 1, i + 1))
                  }
                  className="pixel-btn bg-amber-400 text-slate-950 font-bold text-sm"
                >
                  ข้อถัดไป ▶
                </button>
              </div>
            </>
          )}
        </div>

        {/* Question Grid Navigator */}
        <div className="lg:col-span-4 pixel-box p-4 bg-[var(--px-surface)] space-y-3 h-fit">
          <div className="font-heading-th font-bold text-base">
            🗂️ แผนผังกระดาษคำตอบ (ข้ามข้อได้อิสระ)
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {examQuestions.map((_, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = answers[idx] !== undefined;
              const isFlagged = Boolean(flagged[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 border-2 border-[var(--px-border)] font-pixel text-[10px] relative cursor-pointer ${
                    isCurrent
                      ? "bg-amber-400 text-slate-950"
                      : isAnswered
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--px-surface-alt)]"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 text-[10px]">🚩</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-[var(--px-text-muted)] space-y-1 pt-2 border-t border-[var(--px-border)]">
            <div>🟩 สีเขียว = ฝนคำตอบแล้ว | 🟨 สีเหลือง = ข้อปัจจุบัน</div>
            <div>🚩 ธงแดง = ทำเครื่องหมายกลับมาทบทวน</div>
          </div>
        </div>
      </div>
    </div>
  );
};
