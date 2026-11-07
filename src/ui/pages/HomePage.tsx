import React from "react";
import { ALL_QUESTIONS } from "../../content/questions";
import { ALL_TOPICS, STRANDS } from "../../content/strands";
import { computeLevelFromXp } from "../../lib/gamification";
import { getDueReviewIds } from "../../lib/spacedRepetition";
import { getStrandMasteryPercent, PlayerProgressState } from "../../lib/storage";
import { AppRoute } from "../HudBar";
import {
  MonsterSprite,
  PixelCoin,
  PixelFlame,
  PixelQuestionBlock,
  SageGuideSprite,
  TiwHeroSprite,
} from "../PixelIcons";

interface HomePageProps {
  state: PlayerProgressState;
  onNavigate: (route: AppRoute) => void;
  onStartQuickPlay: (topicIds: string[], gameId?: string) => void;
  onClaimDailyQuest: (questId: string, rewardCoins: number, rewardXp: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  state,
  onNavigate,
  onStartQuickPlay,
  onClaimDailyQuest,
}) => {
  const levelInfo = computeLevelFromXp(state.xp);
  const dueReviews = getDueReviewIds(state.reviewQueue).length;
  const overallAccuracy =
    state.totalAnswered > 0
      ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
      : 0;

  const dailyQuests = [
    {
      id: "dq-answer-5",
      title: "พิชิตโจทย์วันนี้ครบ 5 ข้อ",
      current: Math.min(5, state.dailyQuest.questionsAnsweredToday),
      target: 5,
      rewardCoins: 25,
      rewardXp: 30,
    },
    {
      id: "dq-correct-3",
      title: "ตอบถูกต้องอย่างน้อย 3 ข้อ",
      current: Math.min(3, state.dailyQuest.correctToday),
      target: 3,
      rewardCoins: 30,
      rewardXp: 40,
    },
    {
      id: "dq-clear-1",
      title: "ผ่านด่านเกมใดก็ได้ 1 ด่าน",
      current: Math.min(1, state.dailyQuest.stagesClearedToday),
      target: 1,
      rewardCoins: 40,
      rewardXp: 50,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* 8-Bit Hero Overworld Banner */}
      <section className="pixel-box p-5 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 font-pixel text-[10px] sm:text-xs">
              <span>★ A-LEVEL 70 SOCIAL STUDIES</span>
              <span>•</span>
              <span>100% FREE & OFFLINE PWA</span>
            </div>

            <h1 className="font-heading-th font-bold text-2xl sm:text-4xl leading-tight text-amber-300">
              ติวแลนด์ สังคมศึกษา: ผจญภัย 8-Bit พิชิตข้อสอบ A-Level ครบ 5 สาระ!
            </h1>

            <p className="text-slate-200 text-base sm:text-lg max-w-2xl leading-relaxed">
              วิ่งกระโดดชนบล็อก <strong className="text-amber-300">“?”</strong> ปราบมอนสเตอร์{" "}
              <strong className="text-purple-300">“ตัวสับสน”</strong> ตะลุยด่านสรุปเนื้อหาละเอียด 31 หัวข้อ และจำลองสนามสอบจริง 50 ข้อ ไม่ต้องสมัครสมาชิก!
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate({ page: "topics" })}
                className="pixel-btn bg-amber-400 text-slate-950 font-bold text-base px-6 py-3"
              >
                🗺️ เลือกด่านอิสระ (5 สาระ / 31 หัวข้อ)
              </button>

              <button
                type="button"
                onClick={() =>
                  onStartQuickPlay(
                    state.lastGameConfig.topicIds,
                    state.lastGameConfig.gameId
                  )
                }
                className="pixel-btn bg-emerald-500 text-slate-950 font-bold text-base px-5 py-3"
              >
                ▶ เล่นต่อจากล่าสุด
              </button>

              <button
                type="button"
                onClick={() => onNavigate({ page: "mock-exam" })}
                className="pixel-btn bg-sky-400 text-slate-950 font-bold text-base px-5 py-3"
              >
                📝 จำลองสอบ A-Level 70 (50 ข้อ)
              </button>
            </div>
          </div>

          {/* Original 8-Bit Stage Diorama */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 border-3 border-amber-400/60">
            <div className="flex items-end gap-5 py-3">
              <div className="text-center">
                <TiwHeroSprite
                  skinId={state.equippedSkin}
                  size={64}
                  className="animate-pixel-bob"
                />
                <div className="font-pixel text-[9px] text-amber-300 mt-1">น้องติว</div>
              </div>
              <div className="mb-8">
                <PixelQuestionBlock size={40} />
              </div>
              <div className="text-center">
                <MonsterSprite variant="confusion" size={56} />
                <div className="font-pixel text-[9px] text-purple-300 mt-1">ตัวสับสน</div>
              </div>
            </div>
            <div className="w-full h-4 bg-amber-700 border-t-4 border-emerald-500" />
            <div className="mt-3 text-center text-xs text-slate-300">
              คลังบทเรียน <strong>31 หัวข้อ</strong> • คลังโจทย์{" "}
              <strong>{ALL_QUESTIONS.length} ข้อ</strong> • เกม <strong>11 โหมด</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Player Status & Daily Quests Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Personal Stats Summary */}
        <div className="lg:col-span-5 pixel-box p-4 bg-[var(--px-surface)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[var(--px-border)] pb-2">
            <div className="flex items-center gap-2.5">
              <TiwHeroSprite skinId={state.equippedSkin} size={40} />
              <div>
                <div className="font-heading-th font-bold text-lg">{state.nickname}</div>
                <div className="text-xs text-[var(--px-text-muted)]">
                  Lv.{levelInfo.level} • {levelInfo.title}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate({ page: "profile" })}
              className="px-2.5 py-1 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] text-xs font-bold cursor-pointer"
            >
              โปรไฟล์ / โอนย้ายเซฟ
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="pixel-box-sm p-2 bg-[var(--px-surface-alt)]">
              <div className="font-pixel text-xs text-emerald-600 dark:text-emerald-400">
                {state.xp}
              </div>
              <div className="text-xs mt-0.5">XP สะสม</div>
            </div>
            <div className="pixel-box-sm p-2 bg-[var(--px-surface-alt)]">
              <div className="font-pixel text-xs text-amber-600 dark:text-amber-400">
                {overallAccuracy}%
              </div>
              <div className="text-xs mt-0.5">ความแม่นยำ</div>
            </div>
            <div className="pixel-box-sm p-2 bg-[var(--px-surface-alt)]">
              <div className="font-pixel text-xs text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                <PixelFlame size={14} /> {state.streak}
              </div>
              <div className="text-xs mt-0.5">สตรีค (วัน)</div>
            </div>
            <div className="pixel-box-sm p-2 bg-[var(--px-surface-alt)]">
              <div className="font-pixel text-xs text-red-600 dark:text-red-400">
                {dueReviews}
              </div>
              <div className="text-xs mt-0.5">รอทบทวน</div>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-slate-800 border-l-4 border-amber-500 text-xs flex items-start gap-2">
            <SageGuideSprite size={32} />
            <div>
              <strong>คำแนะนำจากอาจารย์ปราชญ์:</strong> ข้อสอบ A-Level สังคมศึกษาออกเท่ากันทั้ง 5 สาระ (สาระละ 10 ข้อ) ลองเก็บด่านสาระที่ยังไม่ถนัดให้ครบก่อนสอบนะ!
            </div>
          </div>
        </div>

        {/* Daily Quests */}
        <div className="lg:col-span-7 pixel-box p-4 bg-[var(--px-surface)] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[var(--px-border)] pb-2">
            <h2 className="font-heading-th font-bold text-lg">
              📜 ภารกิจรายวัน (Daily Quests • รีเซ็ตเที่ยงคืนเวลาไทย)
            </h2>
            <span className="font-pixel text-[10px] text-[var(--px-text-muted)]">
              {state.dailyQuest.dateBangkok}
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyQuests.map((dq) => {
              const completed = dq.current >= dq.target;
              const claimed = state.dailyQuest.claimedIds.includes(dq.id);
              return (
                <div
                  key={dq.id}
                  className="pixel-box-sm p-3 bg-[var(--px-surface-alt)] flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="font-heading-th font-semibold text-base">
                      {dq.title}{" "}
                      <span className="font-pixel text-xs text-amber-600 dark:text-amber-400">
                        ({dq.current}/{dq.target})
                      </span>
                    </div>
                    <div className="text-xs text-[var(--px-text-muted)] flex items-center gap-2">
                      <span>รางวัล:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <PixelCoin size={13} /> +{dq.rewardCoins}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{dq.rewardXp} XP
                      </span>
                    </div>
                  </div>

                  {claimed ? (
                    <span className="px-3 py-1.5 bg-slate-300 dark:bg-slate-700 text-xs font-bold">
                      ✅ รับรางวัลแล้ว
                    </span>
                  ) : completed ? (
                    <button
                      type="button"
                      onClick={() => onClaimDailyQuest(dq.id, dq.rewardCoins, dq.rewardXp)}
                      className="pixel-btn !min-h-[40px] bg-amber-400 text-slate-950 font-bold text-xs animate-pixel-bob"
                    >
                      🎁 รับรางวัล!
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 border border-[var(--px-border)] text-xs text-[var(--px-text-muted)]">
                      กำลังดำเนินการ
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 Worlds (Strands) Overview */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading-th font-bold text-xl sm:text-2xl">
            🌍 แผนที่โลกทั้ง 5 สาระ (ปลดล็อกทุกด่านตั้งแต่เริ่ม!)
          </h2>
          <button
            type="button"
            onClick={() => onNavigate({ page: "topics" })}
            className="pixel-btn !min-h-[40px] bg-amber-400 text-slate-950 text-sm"
          >
            ดูครบทั้ง {ALL_TOPICS.length} ด่าน ▶
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRANDS.map((strand) => {
            const topicIds = strand.topics.map((t) => t.id);
            const mastery = getStrandMasteryPercent(strand.id, topicIds, state.topicProgress);
            return (
              <div
                key={strand.id}
                className="pixel-box p-4 bg-[var(--px-surface)] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 font-pixel text-[9px] ${strand.badgeBgClass}`}>
                      {strand.nameEn}
                    </span>
                    <span className="text-xs font-bold">
                      ข้อสอบจริง {strand.examQuota} ข้อ
                    </span>
                  </div>
                  <h3 className="font-heading-th font-bold text-lg leading-snug">
                    {strand.nameTh}
                  </h3>
                  <p className="text-xs text-[var(--px-text-muted)]">
                    หัวหน้าด่าน: <strong>{strand.bossName}</strong> ({strand.topics.length} ด่านย่อย)
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--px-border)]">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>ความเชี่ยวชาญสะสม</span>
                    <span>{mastery}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 border border-[var(--px-border)]">
                    <div
                      className="h-full"
                      style={{ width: `${mastery}%`, backgroundColor: strand.colorHex }}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate({
                          page: "learn",
                          strandId: strand.id,
                          topicId: strand.topics[0].id,
                        })
                      }
                      className="pixel-btn !min-h-[40px] flex-1 bg-[var(--px-surface-alt)] text-xs"
                    >
                      📖 อ่านสรุป
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartQuickPlay(topicIds, "runner")}
                      className={`pixel-btn !min-h-[40px] flex-1 text-xs ${strand.badgeBgClass}`}
                    >
                      ▶ ตะลุยด่าน
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
