import React, { useMemo, useState } from "react";
import { ALL_QUESTIONS } from "../../content/questions";
import { ALL_TOPICS, STRANDS } from "../../content/strands";
import { StrandId } from "../../lib/schema";
import { LastGameConfig, PlayerProgressState } from "../../lib/storage";
import { AppRoute } from "../HudBar";
import { PixelStar } from "../PixelIcons";

export const GAME_CATALOG: {
  id: string;
  name: string;
  badge: string;
  description: string;
}[] = [
  {
    id: "runner",
    name: "1. Question Block Runner (เกมหลัก)",
    badge: "PLATFORMER",
    description: "วิ่งกระโดดชนกล่อง “?” ปราบตัวสับสน เก็บเหรียญถึงเส้นชัย",
  },
  {
    id: "boss",
    name: "2. Boss Fight (สู้บอสประจำสาระ)",
    badge: "3 PHASES",
    description: "ตอบไวโจมตีคริติคอล ล้มบอสประจำสาระ 3 เฟส",
  },
  {
    id: "door-run",
    name: "3. Door Run (วิ่งเข้าประตูคำตอบ)",
    badge: "ARCADE",
    description: "อ่านโจทย์ด้านบนแล้วบังคับตัวละครวิ่งเข้าประตูเลขที่ถูก",
  },
  {
    id: "memory",
    name: "4. Memory Match (จับคู่แฟลชการ์ด)",
    badge: "MEMORY",
    description: "พลิกการ์ดจับคู่แนวคิด-นิยาม และเหตุการณ์สำคัญ",
  },
  {
    id: "timeline",
    name: "5. Timeline Builder (เรียงลำดับเหตุการณ์)",
    badge: "ORDER",
    description: "สลับเรียงลำดับเหตุการณ์ประวัติศาสตร์และขั้นตอนกฎหมาย",
  },
  {
    id: "map-quest",
    name: "6. Map Quest (ปักหมุดแผนที่พิกเซล)",
    badge: "GEO MAP",
    description: "แตะตำแหน่งภูมิภาคไทย อาเซียน และภูมิอากาศโลกบนแผนที่",
  },
  {
    id: "coin-catcher",
    name: "7. Coin Catcher (รับเหรียญคำตอบ)",
    badge: "CATCH",
    description: "เลื่อนซ้าย-ขวาคอยรับเหรียญทองคำตอบที่หล่นจากฟ้า",
  },
  {
    id: "speed-rush",
    name: "8. Speed Rush (ตอบเร็วคอมโบ 60 วิ)",
    badge: "COMBO",
    description: "แข่งกับเวลา 60 วินาที สะสมตัวคูณคอมโบสูงสุด 4 เท่า",
  },
  {
    id: "word-quest",
    name: "9. Word Quest (ทายคำศัพท์สังคมฯ)",
    badge: "VOCAB",
    description: "ทายคำศัพท์สำคัญจากคำใบ้ด้วยแป้นอักษรพิกเซลในเกม",
  },
  {
    id: "space-shooter",
    name: "10. Space Shooter (ยิงยานคำตอบ)",
    badge: "SHOOTER",
    description: "บังคับยานอวกาศยิงเลเซอร์ทำลายเป้าคำตอบที่ถูกต้อง",
  },
];

interface TopicsPageProps {
  state: PlayerProgressState;
  onNavigate: (route: AppRoute) => void;
  onLaunchGame: (config: LastGameConfig) => void;
  onUpdateEnemyDensity: (density: "normal" | "few" | "none") => void;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({
  state,
  onNavigate,
  onLaunchGame,
  onUpdateEnemyDensity,
}) => {
  const [selectedStrand, setSelectedStrand] = useState<StrandId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    state.lastGameConfig.topicIds.length > 0
      ? state.lastGameConfig.topicIds
      : ["buddhism-history"]
  );
  const [questionCount, setQuestionCount] = useState<number>(state.lastGameConfig.count || 10);
  const [difficulty, setDifficulty] = useState<"all" | 1 | 2 | 3>(
    state.lastGameConfig.difficulty || "all"
  );
  const [gameId, setGameId] = useState<string>(state.lastGameConfig.gameId || "runner");
  const [mode, setMode] = useState<"practice" | "challenge" | "wrong-only">(
    state.lastGameConfig.mode || "practice"
  );

  // Recommend weakest or unplayed topic
  const recommendedTopic = useMemo(() => {
    const scored = ALL_TOPICS.map((t) => {
      const p = state.topicProgress[t.id];
      const acc = p && p.answered > 0 ? p.correct / p.answered : -1;
      return { topic: t, acc };
    });
    scored.sort((a, b) => a.acc - b.acc);
    return scored[0]?.topic || ALL_TOPICS[0];
  }, [state.topicProgress]);

  const filteredStrands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return STRANDS.filter((s) => selectedStrand === "all" || s.id === selectedStrand)
      .map((s) => ({
        ...s,
        topics: s.topics.filter(
          (t) =>
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.code.includes(q)
        ),
      }))
      .filter((s) => s.topics.length > 0);
  }, [selectedStrand, searchQuery]);

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes("all")) return [topicId];
      if (prev.includes(topicId)) {
        const next = prev.filter((id) => id !== topicId);
        return next.length > 0 ? next : [topicId];
      }
      return [...prev, topicId];
    });
  };

  const handlePlayNow = (overrideTopics?: string[]) => {
    onLaunchGame({
      topicIds: overrideTopics || selectedTopicIds,
      count: questionCount,
      difficulty,
      gameId,
      mode,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Header & Smart Recommendation */}
      <div className="pixel-box p-4 sm:p-5 bg-[var(--px-surface)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading-th font-bold text-2xl sm:text-3xl">
            🗺️ แผนที่เลือกหัวข้อและโหมดเกม (ปลดล็อกครบ 31 ด่าน)
          </h1>
          <p className="text-sm text-[var(--px-text-muted)] mt-1">
            เลือกได้อิสระ 1 หัวข้อ, หลายหัวข้อพร้อมกัน หรือสุ่มรวมทุกสาระ แล้วเลือกเกมที่อยากเล่นได้ทันที
          </p>
        </div>

        {/* Weak-Topic Recommendation */}
        <div className="pixel-box-sm p-3 bg-amber-50 dark:bg-amber-950/60 border-amber-500 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-pixel text-[9px] text-amber-700 dark:text-amber-300">
              ★ RECOMMENDED NEXT STAGE
            </div>
            <div className="font-heading-th font-bold text-sm">
              แนะนำทบทวน: {recommendedTopic.code} {recommendedTopic.shortTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handlePlayNow([recommendedTopic.id])}
            className="pixel-btn !min-h-[40px] bg-amber-400 text-slate-950 font-bold text-xs"
          >
            ▶ เล่นด่านแนะนำ
          </button>
        </div>
      </div>

      {/* Game & Session Configuration Panel */}
      <section className="pixel-box p-4 sm:p-5 bg-[var(--px-surface)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--px-border)] pb-2">
          <h2 className="font-heading-th font-bold text-lg">
            ⚙️ ตั้งค่าภารกิจก่อนออกลุย (เลือกแล้ว{" "}
            <span className="text-amber-600 dark:text-amber-400">
              {selectedTopicIds.includes("all")
                ? "สุ่มทุกหัวข้อ (31 ด่าน)"
                : `${selectedTopicIds.length} หัวข้อ`}
            </span>
            )
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTopicIds(["all"])}
              className={`px-3 py-1.5 border-2 border-[var(--px-border)] text-xs font-bold cursor-pointer ${
                selectedTopicIds.includes("all")
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--px-surface-alt)]"
              }`}
            >
              🎲 สุ่มทุกหัวข้อรวม 5 สาระ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
          {/* Game Selector */}
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="font-bold">1. เลือกชนิดเกม (10 เกม)</span>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="p-2.5 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] font-semibold"
            >
              {GAME_CATALOG.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          {/* Count Selector */}
          <label className="flex flex-col gap-1">
            <span className="font-bold">2. จำนวนข้อ / กล่อง “?”</span>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="p-2.5 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] font-semibold"
            >
              <option value={5}>5 ข้อ (ด่านสั้น)</option>
              <option value={10}>10 ข้อ (มาตรฐาน)</option>
              <option value={20}>20 ข้อ (จัดเต็ม)</option>
              <option value={30}>30 ข้อ (มาราธอน)</option>
              <option value={999}>ทั้งหมดในหัวข้อที่เลือก</option>
            </select>
          </label>

          {/* Difficulty Selector */}
          <label className="flex flex-col gap-1">
            <span className="font-bold">3. ระดับความยาก</span>
            <select
              value={String(difficulty)}
              onChange={(e) => {
                const v = e.target.value;
                setDifficulty(v === "all" ? "all" : (Number(v) as 1 | 2 | 3));
              }}
              className="p-2.5 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] font-semibold"
            >
              <option value="all">ผสมทุกระดับ (ง่าย-กลาง-ยาก)</option>
              <option value="1">ระดับง่าย (พื้นฐาน)</option>
              <option value="2">ระดับปานกลาง</option>
              <option value="3">ระดับยาก (วิเคราะห์ A-Level)</option>
            </select>
          </label>

          {/* Play Mode */}
          <label className="flex flex-col gap-1">
            <span className="font-bold">4. โหมดการเล่น</span>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "practice" | "challenge" | "wrong-only")
              }
              className="p-2.5 border-2 border-[var(--px-border)] bg-[var(--px-surface-alt)] font-semibold"
            >
              <option value="practice">โหมดฝึกฝน (ไม่เสียหัวใจ)</option>
              <option value="challenge">โหมดท้าทาย (เสียหัวใจเมื่อผิด)</option>
              <option value="wrong-only">เล่นเฉพาะข้อที่เคยผิด</option>
            </select>
          </label>
        </div>

        {/* Enemy Density Option (for Runner) & Launch CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--px-border)]">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold">ความหนาแน่นศัตรู (เกมวิ่ง):</span>
            {(
              [
                { id: "normal", label: "ปกติ" },
                { id: "few", label: "ศัตรูน้อย" },
                { id: "none", label: "ไม่มีศัตรู (เน้นตอบคำถาม)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateEnemyDensity(opt.id)}
                className={`px-2.5 py-1 border-2 border-[var(--px-border)] cursor-pointer font-semibold ${
                  state.settings.enemyDensity === opt.id
                    ? "bg-amber-400 text-slate-950"
                    : "bg-[var(--px-surface-alt)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handlePlayNow()}
            className="pixel-btn bg-emerald-500 text-slate-950 font-bold text-base px-8 py-3"
          >
            🚀 เริ่มเล่นเกมที่เลือกทันที!
          </button>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedStrand("all")}
            className={`px-3 py-1.5 border-2 border-[var(--px-border)] text-xs font-bold cursor-pointer ${
              selectedStrand === "all"
                ? "bg-slate-900 text-amber-300"
                : "bg-[var(--px-surface)]"
            }`}
          >
            ทุกสาระ (5)
          </button>
          {STRANDS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStrand(s.id)}
              className={`px-3 py-1.5 border-2 border-[var(--px-border)] text-xs font-bold cursor-pointer ${
                selectedStrand === s.id ? s.badgeBgClass : "bg-[var(--px-surface)]"
              }`}
            >
              สาระ {s.number}: {s.shortNameTh}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 ค้นหาหัวข้อ เช่น อริยสัจ, กฎหมาย, GDP, เบาว์ริง, GIS..."
          className="px-3 py-2 border-2 border-[var(--px-border)] bg-[var(--px-surface)] text-sm w-full sm:w-80"
        />
      </div>

      {/* Topic Cards Grouped by Strand */}
      <div className="space-y-8">
        {filteredStrands.map((strand) => (
          <div key={strand.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 font-pixel text-xs ${strand.badgeBgClass}`}>
                WORLD {strand.number}
              </span>
              <h3 className="font-heading-th font-bold text-xl">{strand.nameTh}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strand.topics.map((topic) => {
                const isSelected =
                  selectedTopicIds.includes("all") || selectedTopicIds.includes(topic.id);
                const prog = state.topicProgress[topic.id];
                const acc =
                  prog && prog.answered > 0
                    ? Math.round((prog.correct / prog.answered) * 100)
                    : null;
                const needsReviewAlert = acc !== null && acc < 65;
                const qCountInTopic = ALL_QUESTIONS.filter(
                  (q) => q.topic === topic.id
                ).length;

                return (
                  <div
                    key={topic.id}
                    className={`pixel-box p-4 flex flex-col justify-between space-y-3 transition-colors ${
                      needsReviewAlert
                        ? "border-red-600 bg-red-50/40 dark:bg-red-950/20"
                        : isSelected
                        ? "bg-[var(--px-surface-alt)] border-amber-500"
                        : "bg-[var(--px-surface)]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer font-pixel text-xs">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTopicSelection(topic.id)}
                            className="w-4 h-4 accent-amber-500"
                          />
                          <span>STAGE {topic.code}</span>
                        </label>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <PixelStar
                              key={s}
                              filled={s <= (prog?.stars || 0)}
                              size={15}
                            />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-heading-th font-bold text-base leading-snug">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-[var(--px-text-muted)] line-clamp-2">
                        {topic.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--px-border)]">
                      <div className="flex items-center justify-between text-xs">
                        <span>คลังโจทย์: {qCountInTopic} ข้อ</span>
                        {acc !== null ? (
                          <span
                            className={`font-bold ${
                              needsReviewAlert
                                ? "text-red-600 dark:text-red-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            แม่นยำ {acc}% {needsReviewAlert ? "⚠️ ควรทบทวน" : ""}
                          </span>
                        ) : (
                          <span className="text-[var(--px-text-muted)]">ยังไม่เคยเล่น</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate({
                              page: "learn",
                              strandId: strand.id,
                              topicId: topic.id,
                            })
                          }
                          className="pixel-btn !min-h-[40px] flex-1 bg-[var(--px-surface)] text-xs"
                        >
                          📖 สรุปเนื้อหา
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlayNow([topic.id])}
                          className={`pixel-btn !min-h-[40px] flex-1 text-xs ${strand.badgeBgClass}`}
                        >
                          ▶ เล่นด่านนี้
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
