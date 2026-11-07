import React from "react";
import { computeLevelFromXp, MAX_HEARTS } from "../lib/gamification";
import { getDueReviewIds } from "../lib/spacedRepetition";
import { PlayerProgressState } from "../lib/storage";
import {
  PixelCoin,
  PixelFlame,
  PixelHeart,
  PixelQuestionBlock,
  TiwHeroSprite,
} from "./PixelIcons";

export type AppRoute =
  | { page: "home" }
  | { page: "topics" }
  | { page: "learn"; strandId: string; topicId: string }
  | { page: "play"; gameId: string }
  | { page: "review" }
  | { page: "mock-exam" }
  | { page: "profile" }
  | { page: "past-papers" }
  | { page: "inspector" };

interface HudBarProps {
  state: PlayerProgressState;
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onToggleSound: () => void;
  onToggleDarkMode: () => void;
  onToggleDevMode: () => void;
}

export const HudBar: React.FC<HudBarProps> = ({
  state,
  route,
  onNavigate,
  onToggleSound,
  onToggleDarkMode,
  onToggleDevMode,
}) => {
  const levelInfo = computeLevelFromXp(state.xp);
  const dueReviewCount = getDueReviewIds(state.reviewQueue).length;

  const navItems: { label: string; target: AppRoute; active: boolean; badge?: number }[] = [
    { label: "หน้าหลัก", target: { page: "home" }, active: route.page === "home" },
    { label: "แผนที่ด่าน", target: { page: "topics" }, active: route.page === "topics" || route.page === "learn" },
    { label: "Mock A-Level", target: { page: "mock-exam" }, active: route.page === "mock-exam" },
    {
      label: "ทบทวนข้อผิด",
      target: { page: "review" },
      active: route.page === "review",
      badge: dueReviewCount > 0 ? dueReviewCount : undefined,
    },
    { label: "สถิติ & ร้านค้า", target: { page: "profile" }, active: route.page === "profile" },
    { label: "คลังข้อสอบทางการ", target: { page: "past-papers" }, active: route.page === "past-papers" },
    { label: "ตรวจคลังโจทย์", target: { page: "inspector" }, active: route.page === "inspector" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-4 border-[var(--px-border)] bg-[var(--px-surface)] shadow-md">
      {/* Top Status Strip */}
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate({ page: "home" })}
          className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
        >
          <PixelQuestionBlock size={32} />
          <div>
            <div className="font-heading-th font-bold text-base sm:text-lg leading-tight text-[var(--px-text)] group-hover:text-amber-500">
              ติวแลนด์ สังคมศึกษา
            </div>
            <div className="font-pixel text-[9px] text-[var(--px-text-muted)]">
              A-LEVEL 70 • 8-BIT QUEST
            </div>
          </div>
        </button>

        {/* Core 8-Bit HUD Metrics */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Hearts */}
          <div
            className="pixel-box-sm px-2 py-1 flex items-center gap-1 bg-[var(--px-surface-alt)]"
            title={`พลังหัวใจ ${state.hearts}/${MAX_HEARTS} (ฟื้น 1 ดวงทุก 30 นาที)`}
          >
            {Array.from({ length: MAX_HEARTS }).map((_, idx) => (
              <PixelHeart key={idx} filled={idx < state.hearts} size={16} />
            ))}
          </div>

          {/* Coins */}
          <div className="pixel-box-sm px-2.5 py-1 flex items-center gap-1.5 bg-[var(--px-surface-alt)]">
            <PixelCoin size={16} className="animate-pixel-coin" />
            <span className="font-pixel text-xs text-amber-600 dark:text-amber-400">
              {state.coins}
            </span>
          </div>

          {/* Streak */}
          <div
            className="pixel-box-sm px-2.5 py-1 flex items-center gap-1 bg-[var(--px-surface-alt)]"
            title="สตรีคเรียนต่อเนื่อง (เวลาไทย Asia/Bangkok)"
          >
            <PixelFlame size={16} />
            <span className="font-pixel text-xs text-orange-600 dark:text-orange-400">
              {state.streak}D
            </span>
          </div>

          {/* Level & XP Bar */}
          <button
            type="button"
            onClick={() => onNavigate({ page: "profile" })}
            className="pixel-box-sm px-2.5 py-1 flex items-center gap-2 bg-[var(--px-surface-alt)] cursor-pointer hover:brightness-95"
            title={`${state.nickname} — ${levelInfo.title}`}
          >
            <TiwHeroSprite skinId={state.equippedSkin} size={22} />
            <div className="text-left">
              <div className="font-pixel text-[10px] leading-none">
                LV.{levelInfo.level}
              </div>
              <div className="w-16 h-2 bg-slate-300 dark:bg-slate-700 mt-1 border border-[var(--px-border)]">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Controls: Sound, Dark Mode, Dev Mode */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={state.settings.soundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
              className={`pixel-btn !min-h-[38px] !min-w-[38px] !px-2 !py-1 text-xs ${
                state.settings.soundEnabled
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-[var(--px-text)]"
              }`}
              title={state.settings.soundEnabled ? "เสียง: เปิดอยู่" : "เสียง: ปิดอยู่ (ค่าเริ่มต้น)"}
            >
              {state.settings.soundEnabled ? "🔊" : "🔇"}
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={state.settings.darkMode ? "สลับเป็นโลกกลางวัน" : "สลับเป็นด่านกลางคืน"}
              className="pixel-btn !min-h-[38px] !min-w-[38px] !px-2 !py-1 text-xs bg-indigo-600 text-white"
              title={state.settings.darkMode ? "ด่านกลางคืน (Dark)" : "โลกกลางวัน (Light)"}
            >
              {state.settings.darkMode ? "🌙" : "☀️"}
            </button>

            <button
              type="button"
              onClick={onToggleDevMode}
              className={`pixel-btn !min-h-[38px] !px-2 !py-1 font-pixel text-[9px] ${
                state.settings.devMode
                  ? "bg-amber-400 text-slate-950"
                  : "bg-slate-200 dark:bg-slate-700 text-[var(--px-text)]"
              }`}
              title="สวิตช์ Dev Mode: เปิดดูโจทย์สถานะ draft ทั้งหมด หรือแสดงเฉพาะข้อที่อนุมัติแล้ว"
            >
              {state.settings.devMode ? "DEV:DRAFT" : "APPROVED"}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        aria-label="เมนูหลัก"
        className="bg-[var(--px-surface-alt)] border-t-2 border-[var(--px-border)] overflow-x-auto"
      >
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center gap-1.5 min-w-max">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(item.target)}
              className={`px-3 py-1.5 font-heading-th text-sm font-semibold border-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                item.active
                  ? "bg-amber-400 text-slate-950 border-[var(--px-border)] shadow-[2px_2px_0px_var(--px-shadow)]"
                  : "bg-transparent border-transparent hover:border-[var(--px-border)] text-[var(--px-text)]"
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-pixel bg-red-600 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};
