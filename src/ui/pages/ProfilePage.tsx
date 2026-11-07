import React, { useState } from "react";
import {
  ACHIEVEMENTS,
  computeLevelFromXp,
  SHOP_ITEMS,
  ShopItem,
} from "../../lib/gamification";
import {
  exportProgressJson,
  exportProgressShortCode,
  importProgressData,
  PlayerProgressState,
} from "../../lib/storage";
import { PixelCoin, TiwHeroSprite } from "../PixelIcons";

interface ProfilePageProps {
  state: PlayerProgressState;
  onUpdateNickname: (name: string) => void;
  onBuyOrEquipItem: (item: ShopItem) => void;
  onImportState: (nextState: PlayerProgressState) => void;
  onResetProgress: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  state,
  onUpdateNickname,
  onBuyOrEquipItem,
  onImportState,
  onResetProgress,
}) => {
  const [nameInput, setNameInput] = useState(state.nickname);
  const [importText, setImportText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [exportedCode, setExportedCode] = useState<string>("");

  const levelInfo = computeLevelFromXp(state.xp);
  const overallAcc =
    state.totalAnswered > 0
      ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
      : 0;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateNickname(nameInput.trim());
      setStatusMessage("✅ บันทึกชื่อเล่นเรียบร้อยแล้ว!");
    }
  };

  const handleDownloadJson = () => {
    const json = exportProgressJson(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiwland-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage("📥 ดาวน์โหลดไฟล์เซฟ JSON เรียบร้อยแล้ว!");
  };

  const handleGenerateCode = () => {
    const code = exportProgressShortCode(state);
    setExportedCode(code);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setStatusMessage("📋 สร้างโค้ดย้ายเครื่องและคัดลอกลงคลิปบอร์ดแล้ว!");
  };

  const handleImportSubmit = () => {
    const res = importProgressData(importText, state);
    if (res.ok) {
      onImportState(res.state);
      setImportText("");
      setStatusMessage("✅ นำเข้าข้อมูลความคืบหน้าสำเร็จ!");
    } else {
      setStatusMessage(`❌ ${res.error}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      const res = importProgressData(content, state);
      if (res.ok) {
        onImportState(res.state);
        setStatusMessage("✅ กู้คืนข้อมูลจากไฟล์ JSON สำเร็จ!");
      } else {
        setStatusMessage(`❌ ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {statusMessage && (
        <div className="pixel-box-sm p-3 bg-amber-300 text-slate-950 font-bold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="px-2 py-0.5 border border-slate-950 text-xs cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Personal Profile & High Scores (Local Only — No Online Leaderboard) */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 flex items-center gap-4">
          <div className="p-3 bg-[var(--px-surface-alt)] border-3 border-[var(--px-border)]">
            <TiwHeroSprite skinId={state.equippedSkin} size={64} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="font-pixel text-[10px] text-amber-600 dark:text-amber-400">
              LV.{levelInfo.level} • {levelInfo.title}
            </div>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                maxLength={24}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                aria-label="ชื่อเล่นผู้เล่น"
                className="px-2.5 py-1.5 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] font-heading-th font-bold text-base w-full"
              />
              <button
                type="submit"
                className="pixel-btn !min-h-[38px] bg-amber-400 text-slate-950 text-xs"
              >
                บันทึก
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="pixel-box-sm p-3 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-emerald-600 dark:text-emerald-400">
              {state.xp}
            </div>
            <div className="text-xs mt-1">XP สะสมทั้งหมด</div>
          </div>
          <div className="pixel-box-sm p-3 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-amber-600 dark:text-amber-400">
              {overallAcc}%
            </div>
            <div className="text-xs mt-1">
              ความแม่นยำ ({state.totalCorrect}/{state.totalAnswered})
            </div>
          </div>
          <div className="pixel-box-sm p-3 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-sky-600 dark:text-sky-400">
              {state.bestMockScore}/100
            </div>
            <div className="text-xs mt-1">สถิติสูงสุด Mock Exam</div>
          </div>
          <div className="pixel-box-sm p-3 bg-[var(--px-surface-alt)]">
            <div className="font-pixel text-sm text-purple-600 dark:text-purple-400">
              {state.stagesCleared}
            </div>
            <div className="text-xs mt-1">ด่านที่พิชิตสำเร็จ</div>
          </div>
        </div>
      </section>

      {/* Cosmetic 8-Bit Coin Shop */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--px-border)] pb-2">
          <div>
            <h2 className="font-heading-th font-bold text-xl">
              🏪 ร้านค้าเหรียญรางวัล (ชุดตกแต่ง & ไอเทมช่วยเหลือ)
            </h2>
            <p className="text-xs text-[var(--px-text-muted)]">
              ใช้เหรียญที่เก็บได้จากการตอบคำถามแลกชุดสกินตัวละคร “น้องติว” (ไม่มีระบบเติมเงินและไม่มีไอเทมโกงคะแนน)
            </p>
          </div>
          <div className="px-3 py-1.5 bg-amber-300 text-slate-950 font-pixel text-xs flex items-center gap-1.5">
            <PixelCoin size={16} /> เหรียญของคุณ: {state.coins}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOP_ITEMS.map((item) => {
            const owned =
              item.type === "skin" && state.ownedSkins.includes(item.id);
            const equipped =
              item.type === "skin" && state.equippedSkin === item.id;
            const canAfford = state.coins >= item.cost;

            return (
              <div
                key={item.id}
                className="pixel-box-sm p-4 bg-[var(--px-surface-alt)] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  {item.type === "skin" ? (
                    <TiwHeroSprite skinId={item.id} size={46} />
                  ) : (
                    <div className="text-3xl">
                      {item.id === "item-streak-freeze" ? "🧊" : "❤️"}
                    </div>
                  )}
                  <div>
                    <div className="font-heading-th font-bold text-base">
                      {item.name}
                    </div>
                    <p className="text-xs text-[var(--px-text-muted)] mt-0.5">
                      {item.description}
                    </p>
                    {item.id === "item-streak-freeze" && (
                      <div className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1">
                        มีในกระเป๋า: {state.streakFreezes} ชิ้น
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {equipped ? (
                    <span className="block text-center py-2 bg-emerald-600 text-white font-bold text-xs">
                      ✅ สวมใส่อยู่
                    </span>
                  ) : owned ? (
                    <button
                      type="button"
                      onClick={() => onBuyOrEquipItem(item)}
                      className="pixel-btn !min-h-[40px] w-full bg-sky-400 text-slate-950 text-xs"
                    >
                      สวมใส่ชุดนี้
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyOrEquipItem(item)}
                      className="pixel-btn !min-h-[40px] w-full bg-amber-400 text-slate-950 text-xs"
                    >
                      <PixelCoin size={14} /> แลกด้วย {item.cost} เหรียญ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-3">
        <h2 className="font-heading-th font-bold text-xl">
          🏆 เหรียญตราความสำเร็จ (Achievements)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = ach.check({
              totalAnswered: state.totalAnswered,
              totalCorrect: state.totalCorrect,
              stagesCleared: state.stagesCleared,
              bossesDefeated: state.bossesDefeated,
              streak: state.streak,
              mockExamsCompleted: state.mockExamsCompleted,
            });
            return (
              <div
                key={ach.id}
                className={`pixel-box-sm p-3 flex items-center gap-3 ${
                  unlocked
                    ? "bg-amber-50 dark:bg-amber-950/50 border-amber-500"
                    : "opacity-55 bg-[var(--px-surface-alt)]"
                }`}
              >
                <div className="text-2xl">{unlocked ? "🏅" : "🔒"}</div>
                <div>
                  <div className="font-heading-th font-bold text-sm">{ach.title}</div>
                  <div className="text-xs text-[var(--px-text-muted)]">
                    {ach.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Local Save Backup / Export / Import */}
      <section className="pixel-box p-5 bg-[var(--px-surface)] space-y-4">
        <h2 className="font-heading-th font-bold text-xl">
          💾 ส่งออก / นำเข้าความคืบหน้า (สำรองข้อมูลย้ายเครื่อง)
        </h2>

        <div className="p-3 bg-red-50 dark:bg-red-950/60 border-l-4 border-red-600 text-sm">
          <strong>⚠️ คำเตือนสำคัญ:</strong> เว็บไซต์นี้ไม่มีระบบบัญชีออนไลน์ ข้อมูล XP ดาว และสถิติทั้งหมดถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น{" "}
          <strong>หากล้างข้อมูลเบราว์เซอร์ (Clear Site Data) ความคืบหน้าจะหายไป</strong> กรุณาส่งออกไฟล์ JSON หรือคัดลอกโค้ดสั้นเก็บไว้เป็นระยะ
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="pixel-box-sm p-4 bg-[var(--px-surface-alt)] space-y-3">
            <h3 className="font-heading-th font-bold text-base">
              1. ส่งออกข้อมูล (Export)
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="pixel-btn !min-h-[40px] bg-emerald-500 text-slate-950 text-xs"
              >
                📥 ดาวน์โหลดไฟล์ .JSON
              </button>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="pixel-btn !min-h-[40px] bg-amber-400 text-slate-950 text-xs"
              >
                📋 สร้างโค้ดสั้นย้ายเครื่อง
              </button>
            </div>
            {exportedCode && (
              <textarea
                readOnly
                rows={3}
                value={exportedCode}
                className="w-full p-2 border border-[var(--px-border)] bg-[var(--px-surface)] font-mono text-xs"
              />
            )}
          </div>

          {/* Import */}
          <div className="pixel-box-sm p-4 bg-[var(--px-surface-alt)] space-y-3">
            <h3 className="font-heading-th font-bold text-base">
              2. นำเข้าข้อมูล (Import)
            </h3>
            <div>
              <label className="block text-xs font-bold mb-1">
                เลือกไฟล์ .JSON ที่สำรองไว้:
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <textarea
                rows={2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="หรือวางโค้ดสั้น TIW1:... / ข้อความ JSON ที่นี่"
                className="w-full p-2 border border-[var(--px-border)] bg-[var(--px-surface)] font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleImportSubmit}
                className="pixel-btn !min-h-[40px] bg-sky-400 text-slate-950 text-xs"
              >
                📤 กู้คืนความคืบหน้า
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--px-border)] flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("ยืนยันการรีเซ็ตข้อมูลความคืบหน้าทั้งหมดในเครื่องนี้?")) {
                onResetProgress();
                setStatusMessage("รีเซ็ตข้อมูลเริ่มต้นใหม่เรียบร้อยแล้ว");
              }
            }}
            className="px-3 py-1.5 border border-red-600 text-red-600 text-xs font-bold cursor-pointer"
          >
            ล้างข้อมูลเริ่มต้นใหม่ทั้งหมด
          </button>
        </div>
      </section>
    </div>
  );
};
