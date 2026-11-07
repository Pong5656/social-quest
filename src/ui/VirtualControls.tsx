import React, { useEffect, useState } from "react";
import { VirtualControlsConfig } from "../lib/storage";

export interface VirtualInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

interface VirtualControlsProps {
  config: VirtualControlsConfig;
  onInputChange: (next: VirtualInputState) => void;
  onUpdateConfig: (next: VirtualControlsConfig) => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  config,
  onInputChange,
  onUpdateConfig,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissedOrientation, setDismissedOrientation] = useState(false);

  const [inputState, setInputState] = useState<VirtualInputState>({
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });

  useEffect(() => {
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(hasTouch);

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const updateKey = (key: keyof VirtualInputState, pressed: boolean) => {
    setInputState((prev) => {
      if (prev[key] === pressed) return prev;
      const next = { ...prev, [key]: pressed };
      onInputChange(next);
      return next;
    });
  };

  const shouldRenderPad =
    config.mode === "show" || (config.mode === "auto" && isTouchDevice);

  const btnSize = Math.max(56, Math.min(84, config.sizePx || 64));

  const dpadCluster = (
    <div className="flex items-center gap-3 game-touch-area">
      <button
        type="button"
        aria-label="เดินซ้าย"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          updateKey("left", true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          updateKey("left", false);
        }}
        onPointerCancel={() => updateKey("left", false)}
        style={{ width: btnSize, height: btnSize }}
        className={`border-4 border-slate-950 font-pixel text-lg flex items-center justify-center shadow-[3px_3px_0px_#000] select-none ${
          inputState.left ? "bg-amber-400 text-slate-950 translate-y-0.5" : "bg-slate-800/90 text-white"
        }`}
      >
        ◀
      </button>
      <button
        type="button"
        aria-label="เดินขวา"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          updateKey("right", true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          updateKey("right", false);
        }}
        onPointerCancel={() => updateKey("right", false)}
        style={{ width: btnSize, height: btnSize }}
        className={`border-4 border-slate-950 font-pixel text-lg flex items-center justify-center shadow-[3px_3px_0px_#000] select-none ${
          inputState.right ? "bg-amber-400 text-slate-950 translate-y-0.5" : "bg-slate-800/90 text-white"
        }`}
      >
        ▶
      </button>
    </div>
  );

  const actionCluster = (
    <div className="flex items-center gap-3 game-touch-area">
      <button
        type="button"
        aria-label="ปุ่ม B วิ่งเร็ว"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          updateKey("sprint", true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          updateKey("sprint", false);
        }}
        onPointerCancel={() => updateKey("sprint", false)}
        style={{ width: btnSize, height: btnSize }}
        className={`border-4 border-slate-950 font-pixel text-sm flex flex-col items-center justify-center shadow-[3px_3px_0px_#000] select-none ${
          inputState.sprint ? "bg-sky-400 text-slate-950 translate-y-0.5" : "bg-blue-700/90 text-white"
        }`}
      >
        <span>B</span>
        <span className="font-thai text-[10px]">วิ่ง</span>
      </button>
      <button
        type="button"
        aria-label="ปุ่ม A กระโดด"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          updateKey("jump", true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          updateKey("jump", false);
        }}
        onPointerCancel={() => updateKey("jump", false)}
        style={{ width: btnSize + 6, height: btnSize + 6 }}
        className={`border-4 border-slate-950 font-pixel text-sm flex flex-col items-center justify-center shadow-[3px_3px_0px_#000] select-none ${
          inputState.jump ? "bg-amber-300 text-slate-950 translate-y-0.5" : "bg-red-600/90 text-white"
        }`}
      >
        <span>A</span>
        <span className="font-thai text-[10px]">โดด</span>
      </button>
    </div>
  );

  return (
    <div className="w-full mt-2">
      {/* Orientation Advice Banner for Portrait Mobile */}
      {isPortrait && !dismissedOrientation && (
        <div className="pixel-box-sm p-2.5 mb-2 bg-amber-100 dark:bg-amber-950/80 text-slate-900 dark:text-amber-100 flex items-center justify-between gap-2 text-sm">
          <span>📱 แนะนำหมุนหน้าจอเป็น <strong>แนวนอน (Landscape)</strong> เพื่อมุมมอง 16:9 เต็มตา</span>
          <button
            type="button"
            onClick={() => setDismissedOrientation(true)}
            className="px-2 py-1 border-2 border-[var(--px-border)] bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
          >
            รับทราบ
          </button>
        </div>
      )}

      {/* Control Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--px-text-muted)] mb-2">
        <div>
          🎮 คีย์บอร์ด: <strong>←/→ หรือ A/D</strong> เดิน | <strong>Space/W/↑</strong> กระโดด | <strong>Shift</strong> วิ่ง | <strong>Esc</strong> หยุด
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onUpdateConfig({
                ...config,
                mode: shouldRenderPad ? "hide" : "show",
              })
            }
            className="px-2.5 py-1 border-2 border-[var(--px-border)] bg-[var(--px-surface)] text-[var(--px-text)] font-semibold cursor-pointer"
          >
            {shouldRenderPad ? "ซ่อนจอยทัช" : "เปิดจอยทัช"}
          </button>
          <button
            type="button"
            onClick={() => setShowCustomizer((v) => !v)}
            className="px-2.5 py-1 border-2 border-[var(--px-border)] bg-[var(--px-surface)] text-[var(--px-text)] font-semibold cursor-pointer"
          >
            ⚙️ ปรับปุ่มทัช
          </button>
        </div>
      </div>

      {/* Customizer Drawer */}
      {showCustomizer && (
        <div className="pixel-box-sm p-3 mb-3 bg-[var(--px-surface)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">ขนาดปุ่ม ({btnSize}px)</span>
            <input
              type="range"
              min={56}
              max={84}
              value={btnSize}
              onChange={(e) =>
                onUpdateConfig({ ...config, sizePx: Number(e.target.value) })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">ความโปร่งใส ({Math.round(config.opacity * 100)}%)</span>
            <input
              type="range"
              min={40}
              max={100}
              value={Math.round(config.opacity * 100)}
              onChange={(e) =>
                onUpdateConfig({ ...config, opacity: Number(e.target.value) / 100 })
              }
            />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">สลับซ้าย-ขวา</span>
            <button
              type="button"
              onClick={() => onUpdateConfig({ ...config, swapHands: !config.swapHands })}
              className="pixel-btn !min-h-[40px] bg-amber-400 text-slate-950 text-xs"
            >
              {config.swapHands ? "ปุ่ม A/B ซ้าย" : "D-Pad ซ้าย (ปกติ)"}
            </button>
          </div>
        </div>
      )}

      {/* Multi-Touch Virtual Gamepad */}
      {shouldRenderPad && (
        <div
          style={{ opacity: config.opacity }}
          className="flex items-center justify-between px-2 py-2 bg-slate-900/15 dark:bg-slate-950/40 border-2 border-[var(--px-border)] game-touch-area"
        >
          {config.swapHands ? actionCluster : dpadCluster}
          <div className="hidden sm:block font-pixel text-[9px] text-[var(--px-text-muted)] text-center">
            MULTI-TOUCH PAD
          </div>
          {config.swapHands ? dpadCluster : actionCluster}
        </div>
      )}
    </div>
  );
};
