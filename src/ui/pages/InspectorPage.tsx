import React, { useMemo, useState } from "react";
import { ALL_QUESTIONS } from "../../content/questions";
import { getStrandById, STRANDS } from "../../content/strands";
import { runCoreSelfTests } from "../../lib/__tests__/core.test";
import { StrandId } from "../../lib/schema";
import { validateAllContent } from "../../scripts/validateContent";

interface InspectorPageProps {
  devMode: boolean;
  approvedIds: string[];
  onToggleDevMode: () => void;
  onToggleApproveQuestion: (questionId: string) => void;
  onApproveAllDrafts: () => void;
}

export const InspectorPage: React.FC<InspectorPageProps> = ({
  devMode,
  approvedIds,
  onToggleDevMode,
  onToggleApproveQuestion,
  onApproveAllDrafts,
}) => {
  const report = useMemo(() => validateAllContent(), []);
  const unitTestReport = useMemo(() => runCoreSelfTests(), []);
  const [strandFilter, setStrandFilter] = useState<StrandId | "all">("all");
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(false);

  const approvedSet = useMemo(() => new Set(approvedIds), [approvedIds]);

  const filteredQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      if (strandFilter !== "all" && q.strand !== strandFilter) return false;
      if (onlyNeedsReview && !q.needs_review) return false;
      return true;
    }).slice(0, 60);
  }, [strandFilter, onlyNeedsReview]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Zod Build Validation Report */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--px-border)] pb-2">
          <div>
            <div className="font-pixel text-[10px] text-emerald-600 dark:text-emerald-400">
              ZOD SCHEMA VALIDATION & CONTENT AUDIT
            </div>
            <h1 className="font-heading-th font-bold text-2xl">
              🔍 ตรวจสอบคุณภาพคลังเนื้อหา โจทย์ Draft และความเป็นส่วนตัว
            </h1>
          </div>
          <span
            className={`px-3 py-1 font-pixel text-xs ${
              report.valid ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {report.valid ? "SCHEMA PASS 100%" : `ERRORS: ${report.errors.length}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
          <div className="pixel-box-sm p-2.5 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm">{report.validLessons}/{report.totalLessons}</div>
            <div className="text-xs mt-1">บทเรียนผ่านเกณฑ์</div>
          </div>
          <div className="pixel-box-sm p-2.5 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm">{report.validQuestions}</div>
            <div className="text-xs mt-1">โจทย์ทั้งหมด</div>
          </div>
          <div className="pixel-box-sm p-2.5 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-amber-600">{report.draftCount}</div>
            <div className="text-xs mt-1">เริ่มต้นที่ Draft</div>
          </div>
          <div className="pixel-box-sm p-2.5 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-emerald-600">{approvedIds.length}</div>
            <div className="text-xs mt-1">อนุมัติแล้วโดยผู้ตรวจ</div>
          </div>
          <div className="pixel-box-sm p-2.5 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-sky-600">{report.shortQuestionCount}</div>
            <div className="text-xs mt-1">ข้อสั้น (Arcade)</div>
          </div>
          <div className="pixel-box-sm p-2.5 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-red-600">{report.needsReviewCount}</div>
            <div className="text-xs mt-1">ติดธง needs_review</div>
          </div>
        </div>

        {/* Difficulty & Skill Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-[var(--px-surface-alt)] border border-[var(--px-border)]">
            <strong>สัดส่วนระดับความยาก:</strong> ง่าย {report.byDifficulty.easy} ข้อ | กลาง{" "}
            {report.byDifficulty.medium} ข้อ | ยาก {report.byDifficulty.hard} ข้อ
          </div>
          <div className="p-3 bg-[var(--px-surface-alt)] border border-[var(--px-border)]">
            <strong>สัดส่วนทักษะการคิด:</strong> จำ {report.bySkill.remember} | เข้าใจ{" "}
            {report.bySkill.understand} | ประยุกต์ {report.bySkill.apply} | วิเคราะห์{" "}
            {report.bySkill.analyze}
          </div>
        </div>

        {/* Live Unit Test Suite Results */}
        <div className="p-3 bg-slate-900 text-emerald-300 border-2 border-[var(--px-border)] text-xs font-mono space-y-1">
          <div className="font-bold text-amber-300">
            🧪 CORE UNIT TESTS: {unitTestReport.passed} PASSED / {unitTestReport.failed} FAILED
          </div>
          {unitTestReport.details.map((d, i) => (
            <div key={i}>• {d}</div>
          ))}
        </div>
      </section>

      {/* Reviewer Approval Controls */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading-th font-bold text-xl">
              🛡️ ระบบตรวจอนุมัติโจทย์ (Draft → Approved)
            </h2>
            <p className="text-xs text-[var(--px-text-muted)]">
              โจทย์ทุกข้อในไฟล์ต้นฉบับเริ่มต้นที่ status: &quot;draft&quot; คุณสามารถเปิด/ปิด Dev Mode หรือกดอนุมัติรายข้อได้ด้านล่าง
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleDevMode}
              className="pixel-btn !min-h-[40px] bg-amber-400 text-slate-950 text-xs"
            >
              Dev Mode: {devMode ? "เปิดอยู่ (เห็น Draft)" : "ปิดอยู่ (เห็นเฉพาะ Approved)"}
            </button>
            <button
              type="button"
              onClick={onApproveAllDrafts}
              className="pixel-btn !min-h-[40px] bg-emerald-500 text-slate-950 text-xs"
            >
              ✅ อนุมัติทั้งหมด ({ALL_QUESTIONS.length} ข้อ)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value as StrandId | "all")}
            className="p-2 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] text-xs font-bold"
          >
            <option value="all">ทุกสาระ</option>
            {STRANDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameTh}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer px-3 py-2 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)]">
            <input
              type="checkbox"
              checked={onlyNeedsReview}
              onChange={(e) => setOnlyNeedsReview(e.target.checked)}
            />
            <span>แสดงเฉพาะข้อที่ติดธง needs_review: true (กฎหมาย/สถิติ/ข้อมูลเปลี่ยนแปลงได้)</span>
          </label>
        </div>

        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredQuestions.map((q) => {
            const isApproved = q.status === "approved" || approvedSet.has(q.id);
            return (
              <div
                key={q.id}
                className="pixel-box-sm p-3 bg-[var(--px-surface-alt)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-mono font-bold">{q.id}</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-white">
                      {getStrandById(q.strand).shortNameTh}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 font-bold ${
                        isApproved
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-300 text-slate-950"
                      }`}
                    >
                      {isApproved ? "APPROVED" : "DRAFT"}
                    </span>
                    {q.needs_review && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold">
                        NEEDS_REVIEW ({q.as_of})
                      </span>
                    )}
                  </div>
                  <div className="font-semibold">{q.question}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">
                    เฉลย: {q.choices[q.answer]}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleApproveQuestion(q.id)}
                  className={`pixel-btn !min-h-[38px] text-xs shrink-0 ${
                    isApproved
                      ? "bg-slate-300 dark:bg-slate-700"
                      : "bg-emerald-500 text-slate-950"
                  }`}
                >
                  {isApproved ? "ยกเลิกอนุมัติ" : "อนุมัติข้อนี้"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy, Terms & Credits Summary */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-2 text-sm">
        <h2 className="font-heading-th font-bold text-lg">
          🔒 นโยบายความเป็นส่วนตัว ข้อตกลงการใช้งาน และลิขสิทธิ์ (Privacy / Terms / Credits)
        </h2>
        <p>
          • <strong>ความเป็นส่วนตัว 100% ในเครื่องผู้ใช้:</strong> ติวแลนด์ สังคมศึกษา ไม่มีการสมัครสมาชิก ไม่เก็บข้อมูลส่วนบุคคลบนเซิร์ฟเวอร์ ไม่มีคุกกี้ติดตามโฆษณา (Zero Tracking / Zero Ads) ข้อมูลความคืบหน้าทั้งหมดจัดเก็บใน localStorage ของเบราว์เซอร์คุณเท่านั้น
        </p>
        <p>
          • <strong>ความถูกต้องทางวิชาการและทรัพย์สินทางปัญญา:</strong> เนื้อหาและโจทย์ทุกข้อเขียนขึ้นใหม่ทั้งหมดเพื่อการศึกษา ตัวละคร สไปรต์ และดนตรี 8-Bit เป็นผลงานต้นฉบับของโครงการ (รายละเอียดใน <code>CREDITS.md</code> และ <code>PLAN.md</code>)
        </p>
      </section>
    </div>
  );
};
