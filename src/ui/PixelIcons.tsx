import { SHOP_ITEMS } from "../lib/gamification";

export function TiwHeroSprite({
  skinId = "skin-default",
  size = 48,
  className = "",
}: {
  skinId?: string;
  size?: number;
  className?: string;
}) {
  const skin = SHOP_ITEMS.find((s) => s.id === skinId) || SHOP_ITEMS[0];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`pixelated inline-block ${className}`}
      aria-label="ตัวละครน้องติว"
    >
      {/* Explorer Cap */}
      <rect x="4" y="1" width="8" height="2" fill={skin.hatColor} />
      <rect x="3" y="3" width="11" height="1" fill={skin.hatColor} />
      <rect x="6" y="2" width="2" height="1" fill="#fbbf24" />
      {/* Face & Hair */}
      <rect x="4" y="4" width="8" height="5" fill="#fde68a" />
      <rect x="3" y="4" width="1" height="3" fill="#451a03" />
      {/* Eyes */}
      <rect x="9" y="5" width="1" height="2" fill="#111827" />
      <rect x="6" y="5" width="1" height="2" fill="#111827" />
      {/* Smile */}
      <rect x="7" y="8" width="3" height="1" fill="#b45309" />
      {/* Tunic / Shirt */}
      <rect x="4" y="9" width="8" height="4" fill={skin.shirtColor} />
      {/* Backpack */}
      <rect x="2" y="9" width="2" height="4" fill="#92400e" />
      {/* Arms */}
      <rect x="12" y="9" width="2" height="3" fill="#fde68a" />
      {/* Pants & Boots */}
      <rect x="4" y="13" width="3" height="2" fill="#1e293b" />
      <rect x="9" y="13" width="3" height="2" fill="#1e293b" />
      <rect x="3" y="15" width="4" height="1" fill="#78350f" />
      <rect x="9" y="15" width="4" height="1" fill="#78350f" />
    </svg>
  );
}

export function SageGuideSprite({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className="pixelated inline-block shrink-0"
      aria-label="อาจารย์ปราชญ์"
    >
      {/* Scholar Hat */}
      <rect x="2" y="2" width="12" height="1" fill="#4338ca" />
      <rect x="4" y="1" width="8" height="1" fill="#4338ca" />
      <rect x="12" y="3" width="1" height="2" fill="#fbbf24" />
      {/* Head & Beard */}
      <rect x="4" y="3" width="8" height="5" fill="#fed7aa" />
      <rect x="6" y="5" width="1" height="1" fill="#1e1b4b" />
      <rect x="9" y="5" width="1" height="1" fill="#1e1b4b" />
      <rect x="5" y="7" width="6" height="3" fill="#f8fafc" />
      {/* Robe */}
      <rect x="3" y="10" width="10" height="5" fill="#6d28d9" />
      <rect x="7" y="10" width="2" height="5" fill="#fbbf24" />
    </svg>
  );
}

export function MonsterSprite({
  variant = "confusion",
  size = 40,
}: {
  variant?: "confusion" | "misread" | "boss";
  size?: number;
}) {
  const bodyColor =
    variant === "boss" ? "#dc2626" : variant === "misread" ? "#ea580c" : "#7c3aed";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className="pixelated inline-block"
      aria-label="มอนสเตอร์ตัวสับสน"
    >
      <rect x="5" y="1" width="6" height="2" fill={bodyColor} />
      <rect x="3" y="3" width="10" height="8" fill={bodyColor} />
      <rect x="2" y="5" width="12" height="5" fill={bodyColor} />
      {/* Angry Eyes */}
      <rect x="4" y="5" width="2" height="2" fill="#fef08a" />
      <rect x="10" y="5" width="2" height="2" fill="#fef08a" />
      <rect x="5" y="6" width="1" height="1" fill="#111827" />
      <rect x="10" y="6" width="1" height="1" fill="#111827" />
      {/* Zigzag Mouth */}
      <rect x="5" y="9" width="6" height="1" fill="#111827" />
      <rect x="6" y="8" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="8" width="1" height="1" fill="#ffffff" />
      {/* Feet */}
      <rect x="3" y="12" width="3" height="3" fill="#1e1b4b" />
      <rect x="10" y="12" width="3" height="3" fill="#1e1b4b" />
    </svg>
  );
}

export function PixelHeart({ filled = true, size = 20 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className="pixelated inline-block">
      <rect x="2" y="1" width="3" height="1" fill={filled ? "#ef4444" : "#64748b"} />
      <rect x="7" y="1" width="3" height="1" fill={filled ? "#ef4444" : "#64748b"} />
      <rect x="1" y="2" width="10" height="3" fill={filled ? "#ef4444" : "#64748b"} />
      <rect x="2" y="2" width="1" height="1" fill={filled ? "#fca5a5" : "#94a3b8"} />
      <rect x="2" y="5" width="8" height="2" fill={filled ? "#dc2626" : "#475569"} />
      <rect x="3" y="7" width="6" height="2" fill={filled ? "#dc2626" : "#475569"} />
      <rect x="5" y="9" width="2" height="2" fill={filled ? "#b91c1c" : "#334155"} />
    </svg>
  );
}

export function PixelCoin({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={`pixelated inline-block ${className}`}>
      <rect x="4" y="1" width="4" height="10" fill="#f59e0b" />
      <rect x="3" y="2" width="6" height="8" fill="#fbbf24" />
      <rect x="2" y="3" width="8" height="6" fill="#fbbf24" />
      <rect x="5" y="3" width="2" height="6" fill="#fef08a" />
    </svg>
  );
}

export function PixelFlame({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className="pixelated inline-block">
      <rect x="5" y="1" width="2" height="2" fill="#f97316" />
      <rect x="4" y="3" width="4" height="2" fill="#fb923c" />
      <rect x="3" y="5" width="6" height="4" fill="#ea580c" />
      <rect x="5" y="6" width="2" height="3" fill="#fef08a" />
      <rect x="4" y="9" width="4" height="2" fill="#c2410c" />
    </svg>
  );
}

export function PixelStar({ filled = true, size = 18 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className="pixelated inline-block">
      <rect x="5" y="1" width="2" height="10" fill={filled ? "#fbbf24" : "#64748b"} />
      <rect x="1" y="4" width="10" height="2" fill={filled ? "#fbbf24" : "#64748b"} />
      <rect x="3" y="3" width="6" height="5" fill={filled ? "#f59e0b" : "#475569"} />
      <rect x="2" y="8" width="2" height="2" fill={filled ? "#f59e0b" : "#475569"} />
      <rect x="8" y="8" width="2" height="2" fill={filled ? "#f59e0b" : "#475569"} />
    </svg>
  );
}

export function PixelQuestionBlock({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixelated inline-block">
      <rect x="0" y="0" width="16" height="16" fill="#92400e" />
      <rect x="1" y="1" width="14" height="14" fill="#f59e0b" />
      <rect x="2" y="2" width="12" height="12" fill="#fbbf24" />
      {/* Corner rivets */}
      <rect x="2" y="2" width="1" height="1" fill="#78350f" />
      <rect x="13" y="2" width="1" height="1" fill="#78350f" />
      <rect x="2" y="13" width="1" height="1" fill="#78350f" />
      <rect x="13" y="13" width="1" height="1" fill="#78350f" />
      {/* Question mark */}
      <rect x="6" y="4" width="4" height="1" fill="#ffffff" />
      <rect x="9" y="5" width="2" height="2" fill="#ffffff" />
      <rect x="7" y="7" width="3" height="1" fill="#ffffff" />
      <rect x="7" y="8" width="2" height="2" fill="#ffffff" />
      <rect x="7" y="11" width="2" height="2" fill="#ffffff" />
    </svg>
  );
}
