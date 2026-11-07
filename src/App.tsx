import { useEffect, useState } from "react";
import { ALL_QUESTIONS } from "./content/questions";
import { MiniGameArena } from "./game-engine/MiniGames";
import { QuestionBlockRunner } from "./game-engine/QuestionBlockRunner";
import { soundEngine } from "./lib/audio";
import { MAX_HEARTS, ShopItem } from "./lib/gamification";
import { selectQuestions } from "./lib/questionSelector";
import { Question } from "./lib/schema";
import {
  applyQuestionResultToState,
  createDefaultState,
  LastGameConfig,
  loadProgress,
  PlayerProgressState,
  saveProgress,
} from "./lib/storage";
import { AppRoute, HudBar } from "./ui/HudBar";
import { HomePage } from "./ui/pages/HomePage";
import { InspectorPage } from "./ui/pages/InspectorPage";
import { LearnPage } from "./ui/pages/LearnPage";
import { MockExamPage } from "./ui/pages/MockExamPage";
import { PastPapersPage } from "./ui/pages/PastPapersPage";
import { ProfilePage } from "./ui/pages/ProfilePage";
import { ReviewPage } from "./ui/pages/ReviewPage";
import { TopicsPage } from "./ui/pages/TopicsPage";

const SHORT_ONLY_GAMES = new Set([
  "door-run",
  "coin-catcher",
  "speed-rush",
  "space-shooter",
]);

export function App() {
  const [state, setState] = useState<PlayerProgressState>(() => loadProgress());
  const [route, setRoute] = useState<AppRoute>({ page: "home" });
  const [activeGameQuestions, setActiveGameQuestions] = useState<Question[]>([]);
  const [activeGameConfig, setActiveGameConfig] = useState<LastGameConfig>(
    () => loadProgress().lastGameConfig
  );

  // Persist every state change to localStorage
  useEffect(() => {
    saveProgress(state);
  }, [state]);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [state.settings.darkMode]);

  // Sync Audio muted/unmuted state
  useEffect(() => {
    soundEngine.setEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  const handleToggleSound = () => {
    setState((prev) => {
      const nextSound = !prev.settings.soundEnabled;
      soundEngine.setEnabled(nextSound);
      if (nextSound) {
        soundEngine.playCoin();
      }
      return {
        ...prev,
        settings: { ...prev.settings, soundEnabled: nextSound },
      };
    });
  };

  const handleToggleDarkMode = () => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode },
    }));
  };

  const handleToggleDevMode = () => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, devMode: !prev.settings.devMode },
    }));
  };

  const handleLaunchGame = (cfg: LastGameConfig) => {
    const wrongIds = Object.values(state.reviewQueue)
      .filter((item) => item.box < 4)
      .map((item) => item.questionId);

    const qs = selectQuestions(ALL_QUESTIONS, {
      topicIds: cfg.topicIds,
      difficulty: cfg.difficulty,
      count: cfg.count,
      mode: cfg.mode,
      shortOnly: SHORT_ONLY_GAMES.has(cfg.gameId),
      choiceCount: 4,
      devMode: state.settings.devMode,
      approvedIds: state.approvedQuestionIds,
      wrongIds,
      recentIds: state.recentQuestionIds,
    });

    const fallbackQs =
      qs.length > 0
        ? qs
        : selectQuestions(ALL_QUESTIONS, {
            topicIds: ["all"],
            count: Math.min(10, cfg.count),
            choiceCount: 4,
            devMode: true,
          });

    setActiveGameConfig(cfg);
    setActiveGameQuestions(fallbackQs);
    setState((prev) => ({
      ...prev,
      lastGameConfig: cfg,
    }));
    setRoute({ page: "play", gameId: cfg.gameId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRecordAnswer = (params: {
    questionId: string;
    topicId: string;
    isCorrect: boolean;
    xpEarned: number;
    coinsEarned: number;
    loseHeartOnWrong: boolean;
  }) => {
    setState((prev) => applyQuestionResultToState(prev, params));
  };

  const handleStageComplete = (summary: {
    correctCount: number;
    totalQuestions: number;
    stars: number;
    bonusXp: number;
    coinsCollected: number;
  }) => {
    setState((prev) => ({
      ...prev,
      xp: prev.xp + summary.bonusXp,
      coins: prev.coins + summary.coinsCollected,
      stagesCleared: prev.stagesCleared + 1,
      dailyQuest: {
        ...prev.dailyQuest,
        stagesClearedToday: prev.dailyQuest.stagesClearedToday + 1,
      },
    }));
  };

  const handleMiniGameComplete = (summary: {
    gameId: string;
    score: number;
    correctCount: number;
    totalCount: number;
    bonusXp: number;
    coinsCollected: number;
    isBoss?: boolean;
  }) => {
    setState((prev) => ({
      ...prev,
      xp: prev.xp + summary.bonusXp,
      coins: prev.coins + summary.coinsCollected,
      stagesCleared: prev.stagesCleared + 1,
      bossesDefeated: prev.bossesDefeated + (summary.isBoss ? 1 : 0),
      highScoresByGame: {
        ...prev.highScoresByGame,
        [summary.gameId]: Math.max(
          prev.highScoresByGame[summary.gameId] || 0,
          summary.score
        ),
      },
      dailyQuest: {
        ...prev.dailyQuest,
        stagesClearedToday: prev.dailyQuest.stagesClearedToday + 1,
      },
    }));
  };

  const handleClaimDailyQuest = (
    questId: string,
    rewardCoins: number,
    rewardXp: number
  ) => {
    setState((prev) => {
      if (prev.dailyQuest.claimedIds.includes(questId)) return prev;
      soundEngine.playStageClear();
      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        xp: prev.xp + rewardXp,
        dailyQuest: {
          ...prev.dailyQuest,
          claimedIds: [...prev.dailyQuest.claimedIds, questId],
        },
      };
    });
  };

  const handleBuyOrEquipItem = (item: ShopItem) => {
    setState((prev) => {
      if (item.type === "skin") {
        if (prev.ownedSkins.includes(item.id)) {
          return { ...prev, equippedSkin: item.id };
        }
        if (prev.coins < item.cost) return prev;
        soundEngine.playCoin();
        return {
          ...prev,
          coins: prev.coins - item.cost,
          ownedSkins: [...prev.ownedSkins, item.id],
          equippedSkin: item.id,
        };
      }

      if (prev.coins < item.cost) return prev;
      soundEngine.playCoin();
      if (item.id === "item-streak-freeze") {
        return {
          ...prev,
          coins: prev.coins - item.cost,
          streakFreezes: prev.streakFreezes + 1,
        };
      }
      if (item.id === "item-heart-refill") {
        return {
          ...prev,
          coins: prev.coins - item.cost,
          hearts: MAX_HEARTS,
          lastHeartRegenAt: Date.now(),
        };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--px-bg)] text-[var(--px-text)] bg-pixel-grid">
      <HudBar
        state={state}
        route={route}
        onNavigate={(nextRoute) => {
          setRoute(nextRoute);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onToggleSound={handleToggleSound}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleDevMode={handleToggleDevMode}
      />

      <main className="flex-1">
        {route.page === "home" && (
          <HomePage
            state={state}
            onNavigate={setRoute}
            onStartQuickPlay={(topicIds, gameId = "runner") =>
              handleLaunchGame({
                ...state.lastGameConfig,
                topicIds,
                gameId,
              })
            }
            onClaimDailyQuest={handleClaimDailyQuest}
          />
        )}

        {route.page === "topics" && (
          <TopicsPage
            state={state}
            onNavigate={setRoute}
            onLaunchGame={handleLaunchGame}
            onUpdateEnemyDensity={(enemyDensity) =>
              setState((prev) => ({
                ...prev,
                settings: { ...prev.settings, enemyDensity },
              }))
            }
          />
        )}

        {route.page === "learn" && (
          <LearnPage
            strandId={route.strandId}
            topicId={route.topicId}
            onNavigate={setRoute}
            onPlayTopic={(topicId) =>
              handleLaunchGame({
                ...state.lastGameConfig,
                topicIds: [topicId],
                gameId: "runner",
              })
            }
          />
        )}

        {route.page === "play" && (
          <div className="px-2 sm:px-4 py-4">
            {route.gameId === "runner" ? (
              <QuestionBlockRunner
                questions={activeGameQuestions}
                mode={activeGameConfig.mode}
                enemyDensity={state.settings.enemyDensity}
                skinId={state.equippedSkin}
                hearts={state.hearts}
                virtualControlsConfig={state.settings.virtualControls}
                onUpdateVirtualConfig={(virtualControls) =>
                  setState((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, virtualControls },
                  }))
                }
                onRecordAnswer={handleRecordAnswer}
                onStageComplete={handleStageComplete}
                onExit={() => setRoute({ page: "topics" })}
              />
            ) : (
              <MiniGameArena
                gameId={route.gameId}
                questions={activeGameQuestions}
                topicIds={activeGameConfig.topicIds}
                mode={activeGameConfig.mode}
                skinId={state.equippedSkin}
                onRecordAnswer={handleRecordAnswer}
                onComplete={handleMiniGameComplete}
                onExit={() => setRoute({ page: "topics" })}
              />
            )}
          </div>
        )}

        {route.page === "mock-exam" && (
          <MockExamPage
            state={state}
            onNavigate={setRoute}
            onRecordExamComplete={({ scoreOutOf100, results }) => {
              setState((prev) => {
                let next = {
                  ...prev,
                  mockExamsCompleted: prev.mockExamsCompleted + 1,
                  bestMockScore: Math.max(prev.bestMockScore, scoreOutOf100),
                  xp: prev.xp + 80,
                  coins: prev.coins + 50,
                };
                for (const r of results) {
                  next = applyQuestionResultToState(next, {
                    questionId: r.question.id,
                    topicId: r.question.topic,
                    isCorrect: r.isCorrect,
                    xpEarned: r.isCorrect ? 5 : 0,
                    coinsEarned: r.isCorrect ? 3 : 0,
                    loseHeartOnWrong: false,
                  });
                }
                return next;
              });
            }}
            onLaunchRunnerMock={(qs) => {
              setActiveGameConfig({
                topicIds: ["all"],
                count: qs.length,
                difficulty: "all",
                gameId: "runner",
                mode: "practice",
              });
              setActiveGameQuestions(qs);
              setRoute({ page: "play", gameId: "runner" });
            }}
          />
        )}

        {route.page === "review" && (
          <ReviewPage
            state={state}
            onNavigate={setRoute}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {route.page === "profile" && (
          <ProfilePage
            state={state}
            onUpdateNickname={(nickname) =>
              setState((prev) => ({ ...prev, nickname }))
            }
            onBuyOrEquipItem={handleBuyOrEquipItem}
            onImportState={(nextState) => setState(nextState)}
            onResetProgress={() => setState(createDefaultState())}
          />
        )}

        {route.page === "past-papers" && <PastPapersPage />}

        {route.page === "inspector" && (
          <InspectorPage
            devMode={state.settings.devMode}
            approvedIds={state.approvedQuestionIds}
            onToggleDevMode={handleToggleDevMode}
            onToggleApproveQuestion={(qId) =>
              setState((prev) => {
                const exists = prev.approvedQuestionIds.includes(qId);
                return {
                  ...prev,
                  approvedQuestionIds: exists
                    ? prev.approvedQuestionIds.filter((id) => id !== qId)
                    : [...prev.approvedQuestionIds, qId],
                };
              })
            }
            onApproveAllDrafts={() =>
              setState((prev) => ({
                ...prev,
                approvedQuestionIds: ALL_QUESTIONS.map((q) => q.id),
              }))
            }
          />
        )}
      </main>

      {/* 8-Bit Footer */}
      <footer className="border-t-4 border-[var(--px-border)] bg-[var(--px-surface)] mt-8 py-4 px-4 text-xs text-[var(--px-text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong>ติวแลนด์ สังคมศึกษา (TIWLAND 8-Bit Quest)</strong> • สื่อการเรียนรู้เพื่อเตรียมสอบ A-Level 70 สังคมศึกษา • บันทึกข้อมูลในเครื่อง 100% ไม่มีโฆษณาหรือติดตามผู้ใช้
          </div>
          <div className="flex flex-wrap gap-3 font-bold">
            <button
              type="button"
              onClick={() => setRoute({ page: "past-papers" })}
              className="underline cursor-pointer"
            >
              ข้อสอบทางการ (ทปอ./สทศ.)
            </button>
            <button
              type="button"
              onClick={() => setRoute({ page: "inspector" })}
              className="underline cursor-pointer"
            >
              Privacy / Terms / Credits & Schema Audit
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
