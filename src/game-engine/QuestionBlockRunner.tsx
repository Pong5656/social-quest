import React, { useEffect, useRef, useState } from "react";
import { getStrandById } from "../content/strands";
import { soundEngine } from "../lib/audio";
import {
  BOSS_CLEAR_XP,
  calculateAnswerReward,
  SHOP_ITEMS,
  STAGE_CLEAR_XP,
} from "../lib/gamification";
import { Question } from "../lib/schema";
import { VirtualControlsConfig } from "../lib/storage";
import { PixelCoin, PixelHeart, PixelStar, TiwHeroSprite } from "../ui/PixelIcons";
import { QuestionModal } from "../ui/QuestionModal";
import { VirtualControls, VirtualInputState } from "../ui/VirtualControls";

export interface RunnerGameProps {
  questions: Question[];
  mode: "practice" | "challenge" | "wrong-only";
  enemyDensity: "normal" | "few" | "none";
  skinId: string;
  hearts: number;
  virtualControlsConfig: VirtualControlsConfig;
  onUpdateVirtualConfig: (next: VirtualControlsConfig) => void;
  onRecordAnswer: (params: {
    questionId: string;
    topicId: string;
    isCorrect: boolean;
    xpEarned: number;
    coinsEarned: number;
    loseHeartOnWrong: boolean;
  }) => void;
  onStageComplete: (summary: {
    correctCount: number;
    totalQuestions: number;
    stars: number;
    bonusXp: number;
    coinsCollected: number;
  }) => void;
  onExit: () => void;
}

export const QuestionBlockRunner: React.FC<RunnerGameProps> = ({
  questions,
  mode,
  enemyDensity,
  skinId,
  hearts,
  virtualControlsConfig,
  onUpdateVirtualConfig,
  onRecordAnswer,
  onStageComplete,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const phaserGameRef = useRef<import("phaser").Game | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);
  const [stageFinished, setStageFinished] = useState(false);
  const [outOfHearts, setOutOfHearts] = useState(false);

  const [sessionStats, setSessionStats] = useState({
    answeredCount: 0,
    correctCount: 0,
    combo: 0,
    stageCoins: 0,
    stageXp: 0,
    monstersStomped: 0,
  });

  // Shared mutable input state read at 60fps inside Phaser update()
  const virtualInputRef = useRef<VirtualInputState>({
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });

  const modalOpenRef = useRef(false);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    modalOpenRef.current = activeQuestionIdx !== null;
  }, [activeQuestionIdx]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    finishedRef.current = stageFinished || outOfHearts;
  }, [stageFinished, outOfHearts]);

  // Wake Lock & Auto-pause on tab switch
  useEffect(() => {
    let wakeLock: { release?: () => Promise<void> } | null = null;
    if ("wakeLock" in navigator) {
      (navigator as unknown as { wakeLock: { request: (t: string) => Promise<{ release: () => Promise<void> }> } })
        .wakeLock.request("screen")
        .then((wl) => {
          wakeLock = wl;
        })
        .catch(() => {});
    }

    const handleVisibility = () => {
      if (document.hidden && !finishedRef.current && !modalOpenRef.current) {
        setIsPaused(true);
      }
    };
    const handleKeyEsc = (e: KeyboardEvent) => {
      if ((e.key === "Escape" || e.key === "p" || e.key === "P") && !modalOpenRef.current && !finishedRef.current) {
        setIsPaused((p) => !p);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("keydown", handleKeyEsc);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("keydown", handleKeyEsc);
      if (wakeLock && wakeLock.release) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Dynamically import Phaser 3 and build the 8-bit Platformer Scene
  useEffect(() => {
    let destroyed = false;

    async function initPhaser() {
      const Phaser = await import("phaser");
      if (destroyed || !containerRef.current) return;

      const skin = SHOP_ITEMS.find((s) => s.id === skinId) || SHOP_ITEMS[0];
      const primaryStrand = questions[0] ? getStrandById(questions[0].strand) : getStrandById("religion");
      const blockCount = Math.max(1, questions.length);
      const levelWidth = Math.max(2400, 700 + blockCount * 360 + 550);
      const levelHeight = 540;

      class PlatformerScene extends Phaser.Scene {
        private player!: Phaser.Physics.Arcade.Sprite;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private keysWASD!: {
          W: Phaser.Input.Keyboard.Key;
          A: Phaser.Input.Keyboard.Key;
          S: Phaser.Input.Keyboard.Key;
          D: Phaser.Input.Keyboard.Key;
          SPACE: Phaser.Input.Keyboard.Key;
          SHIFT: Phaser.Input.Keyboard.Key;
        };
        private qBlocks!: Phaser.Physics.Arcade.StaticGroup;
        private coinsGroup!: Phaser.Physics.Arcade.Group;
        private enemiesGroup!: Phaser.Physics.Arcade.Group;
        private goalZone!: Phaser.GameObjects.Zone;
        private lastSafeX = 120;
        private invulnUntil = 0;
        private goalReached = false;

        constructor() {
          super({ key: "PlatformerScene" });
        }

        preload() {
          this.generatePixelTextures();
        }

        private generatePixelTextures() {
          // 1. Hero texture ("น้องติว") 36x44
          const heroGfx = this.make.graphics({ x: 0, y: 0 });
          heroGfx.fillStyle(Phaser.Display.Color.HexStringToColor(skin.hatColor).color, 1);
          heroGfx.fillRect(8, 2, 20, 6);
          heroGfx.fillRect(6, 8, 26, 3);
          heroGfx.fillStyle(0xfbbf24, 1);
          heroGfx.fillRect(14, 4, 5, 3);
          // Face
          heroGfx.fillStyle(0xfde68a, 1);
          heroGfx.fillRect(8, 11, 20, 12);
          heroGfx.fillStyle(0x111827, 1);
          heroGfx.fillRect(21, 14, 3, 4);
          heroGfx.fillRect(14, 14, 3, 4);
          // Shirt
          heroGfx.fillStyle(Phaser.Display.Color.HexStringToColor(skin.shirtColor).color, 1);
          heroGfx.fillRect(8, 23, 20, 11);
          // Backpack
          heroGfx.fillStyle(0x92400e, 1);
          heroGfx.fillRect(3, 23, 5, 11);
          // Legs & Boots
          heroGfx.fillStyle(0x1e293b, 1);
          heroGfx.fillRect(9, 34, 7, 6);
          heroGfx.fillRect(20, 34, 7, 6);
          heroGfx.fillStyle(0x78350f, 1);
          heroGfx.fillRect(7, 40, 10, 4);
          heroGfx.fillRect(19, 40, 10, 4);
          heroGfx.generateTexture("tiw_hero", 36, 44);
          heroGfx.destroy();

          // 2. Ground Brick Tile 48x48
          const groundGfx = this.make.graphics({ x: 0, y: 0 });
          const strandColor = Phaser.Display.Color.HexStringToColor(primaryStrand.colorHex).color;
          groundGfx.fillStyle(0x78350f, 1);
          groundGfx.fillRect(0, 0, 48, 48);
          groundGfx.fillStyle(strandColor, 1);
          groundGfx.fillRect(0, 0, 48, 10);
          groundGfx.lineStyle(2, 0x451a03, 1);
          groundGfx.strokeRect(1, 1, 46, 46);
          groundGfx.lineBetween(0, 28, 48, 28);
          groundGfx.lineBetween(24, 10, 24, 28);
          groundGfx.lineBetween(12, 28, 12, 48);
          groundGfx.generateTexture("ground_tile", 48, 48);
          groundGfx.destroy();

          // 3. Question Block Active 44x44
          const qbGfx = this.make.graphics({ x: 0, y: 0 });
          qbGfx.fillStyle(0x92400e, 1);
          qbGfx.fillRect(0, 0, 44, 44);
          qbGfx.fillStyle(0xfbbf24, 1);
          qbGfx.fillRect(3, 3, 38, 38);
          qbGfx.fillStyle(0xf59e0b, 1);
          qbGfx.fillRect(6, 6, 32, 32);
          // Pixel "?"
          qbGfx.fillStyle(0xffffff, 1);
          qbGfx.fillRect(16, 10, 12, 4);
          qbGfx.fillRect(24, 14, 4, 6);
          qbGfx.fillRect(19, 20, 9, 4);
          qbGfx.fillRect(19, 24, 4, 4);
          qbGfx.fillRect(19, 31, 4, 4);
          qbGfx.generateTexture("qblock_active", 44, 44);
          qbGfx.destroy();

          // 4. Question Block Used 44x44
          const usedGfx = this.make.graphics({ x: 0, y: 0 });
          usedGfx.fillStyle(0x334155, 1);
          usedGfx.fillRect(0, 0, 44, 44);
          usedGfx.fillStyle(0x64748b, 1);
          usedGfx.fillRect(4, 4, 36, 36);
          usedGfx.generateTexture("qblock_used", 44, 44);
          usedGfx.destroy();

          // 5. Gold Coin 22x22
          const coinGfx = this.make.graphics({ x: 0, y: 0 });
          coinGfx.fillStyle(0xd97706, 1);
          coinGfx.fillRect(4, 1, 14, 20);
          coinGfx.fillStyle(0xfbbf24, 1);
          coinGfx.fillRect(2, 4, 18, 14);
          coinGfx.fillStyle(0xfef08a, 1);
          coinGfx.fillRect(9, 4, 4, 14);
          coinGfx.generateTexture("gold_coin", 22, 22);
          coinGfx.destroy();

          // 6. Monster ("ตัวสับสน") 36x34
          const monGfx = this.make.graphics({ x: 0, y: 0 });
          monGfx.fillStyle(0x7c3aed, 1);
          monGfx.fillRect(8, 2, 20, 6);
          monGfx.fillRect(4, 8, 28, 18);
          monGfx.fillStyle(0xfef08a, 1);
          monGfx.fillRect(8, 12, 6, 6);
          monGfx.fillRect(22, 12, 6, 6);
          monGfx.fillStyle(0x111827, 1);
          monGfx.fillRect(10, 14, 3, 3);
          monGfx.fillRect(24, 14, 3, 3);
          monGfx.fillRect(6, 26, 8, 8);
          monGfx.fillRect(22, 26, 8, 8);
          monGfx.generateTexture("monster_confusion", 36, 34);
          monGfx.destroy();
        }

        create() {
          this.physics.world.setBounds(0, 0, levelWidth, levelHeight + 120);

          // Sky & Decorative Pixel Clouds / Hills
          this.cameras.main.setBackgroundColor("#bae6fd");
          for (let cx = 140; cx < levelWidth; cx += 420) {
            const cloud = this.add.graphics();
            cloud.fillStyle(0xffffff, 0.85);
            cloud.fillRect(cx, 70, 96, 26);
            cloud.fillRect(cx + 18, 52, 60, 20);
            cloud.setScrollFactor(0.45);
          }

          const platforms = this.physics.add.staticGroup();
          this.qBlocks = this.physics.add.staticGroup();
          this.coinsGroup = this.physics.add.group({ allowGravity: false });
          this.enemiesGroup = this.physics.add.group();

          // Build Ground with periodic jumpable gaps
          const tileW = 48;
          const totalTiles = Math.ceil(levelWidth / tileW);
          for (let i = 0; i < totalTiles; i++) {
            // Create safe start (i < 12) and safe finish (i > totalTiles - 12), with gaps every ~16 tiles
            const isGap =
              i > 12 &&
              i < totalTiles - 12 &&
              (i % 17 === 0 || i % 17 === 1);

            if (!isGap) {
              const tx = i * tileW + tileW / 2;
              const tile = platforms.create(tx, levelHeight - 24, "ground_tile") as Phaser.Physics.Arcade.Sprite;
              tile.refreshBody();
            }
          }

          // Place Question Blocks & Elevated Platforms for each Question
          questions.forEach((_, idx) => {
            const bx = 460 + idx * 360;
            const by = idx % 2 === 0 ? 320 : 285;

            // Helper stepping platform if block is higher
            if (idx % 2 === 1) {
              const step = platforms.create(bx - 96, 390, "ground_tile") as Phaser.Physics.Arcade.Sprite;
              step.refreshBody();
            }

            const qBlock = this.qBlocks.create(bx, by, "qblock_active") as Phaser.Physics.Arcade.Sprite;
            qBlock.setData("qIndex", idx);
            qBlock.setData("used", false);
            qBlock.refreshBody();

            // Block number label above block
            this.add
              .text(bx, by - 36, `#${idx + 1}`, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "11px",
                color: "#1e1b4b",
                backgroundColor: "#fef08a",
                padding: { x: 4, y: 2 },
              })
              .setOrigin(0.5);

            // Floating coins between blocks
            for (let c = 0; c < 3; c++) {
              const coin = this.coinsGroup.create(bx + 90 + c * 42, 370 - (c % 2) * 24, "gold_coin");
              coin.setData("collected", false);
            }

            // Spawn Patrol Monster ("ตัวสับสน") based on enemyDensity
            const shouldSpawnMonster =
              enemyDensity === "normal" || (enemyDensity === "few" && idx % 2 === 0);

            if (shouldSpawnMonster) {
              const mx = bx + 150;
              const monster = this.enemiesGroup.create(mx, levelHeight - 80, "monster_confusion") as Phaser.Physics.Arcade.Sprite;
              monster.setCollideWorldBounds(false);
              monster.setBounce(1, 0);
              monster.setVelocityX(-75);
              monster.setData("minX", bx + 60);
              monster.setData("maxX", bx + 260);
            }
          });

          // End-of-Stage Goal Flagpole & Pixel Castle
          const goalX = levelWidth - 220;
          const pole = this.add.graphics();
          pole.fillStyle(0xf8fafc, 1);
          pole.fillRect(goalX, levelHeight - 250, 8, 202);
          pole.fillStyle(0xfbbf24, 1);
          pole.fillRect(goalX - 4, levelHeight - 262, 16, 14);
          // Flag banner
          pole.fillStyle(0x16a34a, 1);
          pole.fillRect(goalX + 8, levelHeight - 246, 68, 40);

          this.add
            .text(goalX + 42, levelHeight - 226, "GOAL", {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "11px",
              color: "#ffffff",
            })
            .setOrigin(0.5);

          this.goalZone = this.add.zone(goalX + 16, levelHeight - 140, 48, 200);
          this.physics.add.existing(this.goalZone, true);

          // Spawn Hero ("น้องติว")
          this.player = this.physics.add.sprite(120, levelHeight - 110, "tiw_hero");
          this.player.setCollideWorldBounds(false);
          this.player.setMaxVelocity(380, 750);

          // Camera follows hero smoothly in 16:9
          this.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
          this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

          // Physics Collisions
          this.physics.add.collider(this.player, platforms, () => {
            if (this.player.body?.touching.down) {
              this.lastSafeX = Math.max(100, this.player.x - 24);
            }
          });
          this.physics.add.collider(this.enemiesGroup, platforms);

          // Player bumps "?" Block from underneath!
          this.physics.add.collider(this.player, this.qBlocks, (playerObj, blockObj) => {
            const p = playerObj as Phaser.Physics.Arcade.Sprite;
            const b = blockObj as Phaser.Physics.Arcade.Sprite;
            if (p.body?.touching.up && b.body?.touching.down && !b.getData("used")) {
              b.setData("used", true);
              b.setTexture("qblock_used");
              soundEngine.playBlockHit();

              // Pop-up celebratory coin animation
              const popCoin = this.add.sprite(b.x, b.y - 28, "gold_coin");
              this.tweens.add({
                targets: popCoin,
                y: b.y - 76,
                alpha: 0,
                duration: 450,
                onComplete: () => popCoin.destroy(),
              });

              const qIndex = Number(b.getData("qIndex"));
              setActiveQuestionIdx(qIndex);
            }
          });

          // Collect floating coins
          this.physics.add.overlap(this.player, this.coinsGroup, (_, coinObj) => {
            const coin = coinObj as Phaser.Physics.Arcade.Sprite;
            if (!coin.getData("collected")) {
              coin.setData("collected", true);
              coin.destroy();
              soundEngine.playCoin();
              setSessionStats((prev) => ({
                ...prev,
                stageCoins: prev.stageCoins + 2,
              }));
            }
          });

          // Monster interaction: Stomp from above OR side hit
          this.physics.add.overlap(this.player, this.enemiesGroup, (_, enemyObj) => {
            const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
            if (!enemy.active) return;

            const isStomping =
              (this.player.body?.velocity.y || 0) > 60 &&
              this.player.y < enemy.y - 10;

            if (isStomping) {
              enemy.destroy();
              this.player.setVelocityY(-340);
              soundEngine.playBossHit();
              setSessionStats((prev) => ({
                ...prev,
                monstersStomped: prev.monstersStomped + 1,
                stageCoins: prev.stageCoins + 5,
                stageXp: prev.stageXp + 15,
              }));
            } else if (this.time.now > this.invulnUntil) {
              this.invulnUntil = this.time.now + 1500;
              soundEngine.playWrong();
              this.player.setVelocityY(-240);
              this.tweens.add({
                targets: this.player,
                alpha: 0.3,
                yoyo: true,
                repeat: 5,
                duration: 120,
                onComplete: () => this.player.setAlpha(1),
              });
              if (mode === "challenge") {
                onRecordAnswer({
                  questionId: "hazard-monster",
                  topicId: questions[0]?.topic || "general",
                  isCorrect: false,
                  xpEarned: 0,
                  coinsEarned: 0,
                  loseHeartOnWrong: true,
                });
              }
            }
          });

          // Reach Goal Flagpole!
          this.physics.add.overlap(this.player, this.goalZone, () => {
            if (this.goalReached) return;
            this.goalReached = true;
            soundEngine.playStageClear();
            setStageFinished(true);
          });

          // Keyboard Bindings
          if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keysWASD = {
              W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
              A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
              S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
              D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
              SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
              SHIFT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            };
          }

          setIsLoading(false);
        }

        update() {
          if (modalOpenRef.current || pausedRef.current || finishedRef.current) {
            this.physics.world.pause();
            return;
          }
          if (this.physics.world.isPaused) {
            this.physics.world.resume();
          }

          // Patrol monsters back and forth
          this.enemiesGroup.getChildren().forEach((child) => {
            const m = child as Phaser.Physics.Arcade.Sprite;
            const minX = Number(m.getData("minX"));
            const maxX = Number(m.getData("maxX"));
            if (m.x <= minX) m.setVelocityX(75);
            if (m.x >= maxX) m.setVelocityX(-75);
          });

          // Read Gamepad API if connected
          let gpLeft = false;
          let gpRight = false;
          let gpJump = false;
          let gpSprint = false;
          const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
          const gp = gamepads[0];
          if (gp) {
            gpLeft = gp.axes[0] < -0.3 || gp.buttons[14]?.pressed;
            gpRight = gp.axes[0] > 0.3 || gp.buttons[15]?.pressed;
            gpJump = gp.buttons[0]?.pressed || gp.buttons[1]?.pressed;
            gpSprint = gp.buttons[2]?.pressed || gp.buttons[7]?.pressed;
          }

          const v = virtualInputRef.current;
          const moveLeft = Boolean(this.cursors?.left?.isDown || this.keysWASD?.A?.isDown || v.left || gpLeft);
          const moveRight = Boolean(this.cursors?.right?.isDown || this.keysWASD?.D?.isDown || v.right || gpRight);
          const wantJump = Boolean(
            this.cursors?.up?.isDown ||
              this.keysWASD?.W?.isDown ||
              this.keysWASD?.SPACE?.isDown ||
              v.jump ||
              gpJump
          );
          const isSprinting = Boolean(this.keysWASD?.SHIFT?.isDown || v.sprint || gpSprint);

          const speed = isSprinting ? 310 : 220;

          if (moveLeft && !moveRight) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
          } else if (moveRight && !moveLeft) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
          } else {
            this.player.setVelocityX(0);
          }

          if (wantJump && this.player.body?.touching.down) {
            this.player.setVelocityY(-515);
            soundEngine.playJump();
          }

          // Pitfall check -> respawn safely on last solid platform
          if (this.player.y > levelHeight + 40) {
            this.player.setPosition(this.lastSafeX, 260);
            this.player.setVelocity(0, 0);
            soundEngine.playWrong();
          }
        }
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 960,
        height: 540,
        pixelArt: true,
        roundPixels: true,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 980 },
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [PlatformerScene],
      });

      phaserGameRef.current = game;
    }

    initPhaser();

    return () => {
      destroyed = true;
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [questions, enemyDensity, skinId, mode]);

  // Monitor Challenge mode hearts depletion
  useEffect(() => {
    if (mode === "challenge" && hearts <= 0 && !stageFinished) {
      setOutOfHearts(true);
    }
  }, [hearts, mode, stageFinished]);

  // Notify parent when Stage Finished
  useEffect(() => {
    if (stageFinished) {
      const total = Math.max(1, questions.length);
      const acc = Math.round((sessionStats.correctCount / total) * 100);
      const stars = acc >= 85 ? 3 : acc >= 55 ? 2 : 1;
      onStageComplete({
        correctCount: sessionStats.correctCount,
        totalQuestions: total,
        stars,
        bonusXp: STAGE_CLEAR_XP,
        coinsCollected: sessionStats.stageCoins,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFinished]);

  const handleModalAnswer = ({
    isCorrect,
    responseTimeMs,
  }: {
    selectedIndex: number;
    isCorrect: boolean;
    responseTimeMs: number;
  }) => {
    const q = questions[activeQuestionIdx ?? 0];
    const nextCombo = isCorrect ? sessionStats.combo + 1 : 0;
    const reward = isCorrect
      ? calculateAnswerReward(q.difficulty, nextCombo, responseTimeMs)
      : { xpEarned: 0, coinsEarned: 0, antiSpamTriggered: false };

    if (isCorrect) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }

    setSessionStats((prev) => ({
      ...prev,
      answeredCount: prev.answeredCount + 1,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      combo: nextCombo,
      stageCoins: prev.stageCoins + reward.coinsEarned,
      stageXp: prev.stageXp + reward.xpEarned,
    }));

    onRecordAnswer({
      questionId: q.id,
      topicId: q.topic,
      isCorrect,
      xpEarned: reward.xpEarned,
      coinsEarned: reward.coinsEarned,
      loseHeartOnWrong: mode === "challenge",
    });

    return reward;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Top Stage Telemetry Bar */}
      <div className="pixel-box-sm p-2.5 mb-2 bg-[var(--px-surface)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <TiwHeroSprite skinId={skinId} size={28} />
          <div>
            <div className="font-heading-th font-bold text-sm sm:text-base">
              Question Block Runner • วิ่งกระโดดชนบล็อก “?”
            </div>
            <div className="text-xs text-[var(--px-text-muted)]">
              โหมด: <strong>{mode === "challenge" ? "ท้าทาย (เสียหัวใจ)" : "ฝึกฝน (ไม่เสียหัวใจ)"}</strong> • ตอบแล้ว{" "}
              <strong>
                {sessionStats.answeredCount}/{questions.length}
              </strong>{" "}
              บล็อก
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-amber-300 text-slate-950 font-pixel text-[10px] flex items-center gap-1">
            <PixelCoin size={14} /> +{sessionStats.stageCoins}
          </span>
          <span className="px-2 py-1 bg-emerald-600 text-white font-pixel text-[10px]">
            +{sessionStats.stageXp} XP
          </span>
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="pixel-btn !min-h-[38px] !px-3 !py-1 bg-slate-200 dark:bg-slate-700 text-xs"
          >
            {isPaused ? "▶ เล่นต่อ" : "⏸ หยุด"}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="pixel-btn !min-h-[38px] !px-3 !py-1 bg-red-600 text-white text-xs"
          >
            ออก
          </button>
        </div>
      </div>

      {/* 16:9 Phaser Game Canvas Container */}
      <div className="relative w-full aspect-video border-4 border-[var(--px-border)] shadow-[6px_6px_0px_var(--px-shadow)] bg-sky-200 overflow-hidden game-touch-area">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-amber-300 font-pixel text-xs gap-3 z-10">
            <div className="animate-pixel-bob">LOADING 8-BIT WORLD...</div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />

        {/* Pause Overlay */}
        {isPaused && !stageFinished && !outOfHearts && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 z-20 text-white">
            <div className="pixel-box bg-slate-900 border-amber-400 p-6 max-w-sm w-full text-center space-y-4">
              <div className="font-pixel text-lg text-amber-400">GAME PAUSED</div>
              <p className="text-sm text-slate-300">
                กระโดดชนกล่อง “?” จากด้านล่างเพื่อเปิดโจทย์สังคมศึกษา หรือเหยียบมอนสเตอร์ “ตัวสับสน” จากด้านบน!
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="pixel-btn bg-emerald-500 text-slate-950 w-full"
                >
                  ▶ เล่นต่อ (Resume)
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="pixel-btn bg-red-600 text-white w-full"
                >
                  ออกจากด่าน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage Clear Overlay */}
        {stageFinished && (
          <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-30">
            <div className="pixel-box bg-[var(--px-surface)] text-[var(--px-text)] p-6 max-w-md w-full text-center space-y-4">
              <div className="font-pixel text-base sm:text-xl text-amber-500">
                STAGE CLEAR!
              </div>
              <h3 className="font-heading-th font-bold text-xl">
                พิชิตเส้นชัยสำเร็จ! ยอดเยี่ยมมาก {BOSS_CLEAR_XP > 0 ? "" : ""}
              </h3>

              {/* Stars */}
              <div className="flex justify-center gap-3 py-1">
                {[1, 2, 3].map((s) => {
                  const acc = Math.round(
                    (sessionStats.correctCount / Math.max(1, questions.length)) * 100
                  );
                  const earnedStars = acc >= 85 ? 3 : acc >= 55 ? 2 : 1;
                  return <PixelStar key={s} filled={s <= earnedStars} size={32} />;
                })}
              </div>

              <div className="pixel-box-sm p-3 bg-[var(--px-surface-alt)] text-sm space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span>ตอบคำถามถูกต้อง:</span>
                  <strong>
                    {sessionStats.correctCount} / {questions.length} ข้อ
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>ปราบตัวสับสน:</span>
                  <strong>{sessionStats.monstersStomped} ตัว</strong>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>โบนัสผ่านด่าน:</span>
                  <strong>+{STAGE_CLEAR_XP} XP</strong>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>เหรียญที่เก็บได้รวม:</span>
                  <strong>+{sessionStats.stageCoins} เหรียญ</strong>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={onExit}
                  className="pixel-btn bg-amber-400 text-slate-950 font-bold flex-1"
                >
                  กลับหน้าเลือกด่าน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Out of Hearts Overlay (Challenge Mode) */}
        {outOfHearts && (
          <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-30">
            <div className="pixel-box bg-[var(--px-surface)] text-[var(--px-text)] p-6 max-w-md w-full text-center space-y-4">
              <div className="flex justify-center gap-1">
                <PixelHeart filled={false} size={28} />
                <PixelHeart filled={false} size={28} />
                <PixelHeart filled={false} size={28} />
              </div>
              <div className="font-pixel text-base text-red-500">OUT OF HEARTS!</div>
              <p className="text-sm text-[var(--px-text-muted)]">
                หัวใจหมดในโหมดท้าทาย! สามารถเปลี่ยนเป็น <strong>“โหมดฝึกฝน”</strong> (ไม่เสียหัวใจ) หรือแลกโพชันฟื้นหัวใจในร้านค้าได้
              </p>
              <button
                type="button"
                onClick={onExit}
                className="pixel-btn bg-amber-400 text-slate-950 font-bold w-full"
              >
                กลับหน้าเลือกด่าน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Touch Virtual Gamepad & Controls */}
      <VirtualControls
        config={virtualControlsConfig}
        onInputChange={(next) => {
          virtualInputRef.current = next;
        }}
        onUpdateConfig={onUpdateVirtualConfig}
      />

      {/* Question Modal Popup when bumping a "?" Block */}
      {activeQuestionIdx !== null && questions[activeQuestionIdx] && (
        <QuestionModal
          question={questions[activeQuestionIdx]}
          questionNumber={activeQuestionIdx + 1}
          totalQuestions={questions.length}
          loseHeartOnWrong={mode === "challenge"}
          onSubmitAnswer={handleModalAnswer}
          onContinue={() => setActiveQuestionIdx(null)}
        />
      )}
    </div>
  );
};
