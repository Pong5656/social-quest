export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000; // 30 minutes per heart
export const STAGE_CLEAR_XP = 50;
export const BOSS_CLEAR_XP = 100;
export const MIN_GENUINE_RESPONSE_MS = 1200; // Anti-spam fast-guess threshold

export interface AnswerXpResult {
  xpEarned: number;
  coinsEarned: number;
  antiSpamTriggered: boolean;
}

export function calculateAnswerReward(
  difficulty: 1 | 2 | 3,
  combo: number,
  responseTimeMs: number
): AnswerXpResult {
  const baseXp = difficulty === 3 ? 20 : 10;
  const baseCoins = difficulty === 3 ? 15 : 10;

  if (responseTimeMs < MIN_GENUINE_RESPONSE_MS) {
    return {
      xpEarned: baseXp,
      coinsEarned: Math.floor(baseCoins / 2),
      antiSpamTriggered: true,
    };
  }

  const comboBonus = Math.min(Math.max(0, combo - 1) * 2, 10);
  return {
    xpEarned: baseXp + comboBonus,
    coinsEarned: baseCoins + Math.min(combo, 5) * 2,
    antiSpamTriggered: false,
  };
}

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const RANK_TITLES = [
  "นักเดินทางฝึกหัด",
  "ผู้พิชิตด่านความรู้",
  "จอมยุทธ์สังคมศึกษา",
  "นักปราชญ์ 8-Bit",
  "เซียนข้อสอบ A-Level",
  "ปรมาจารย์แห่งติวแลนด์",
];

export function computeLevelFromXp(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));
  const xpPerLevel = 150;
  const level = Math.floor(safeXp / xpPerLevel) + 1;
  const currentLevelXp = safeXp % xpPerLevel;
  const titleIdx = Math.min(Math.floor((level - 1) / 2), RANK_TITLES.length - 1);

  return {
    level,
    title: RANK_TITLES[titleIdx],
    currentLevelXp,
    nextLevelXp: xpPerLevel,
    progressPercent: Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100)),
  };
}

export function computeRegeneratedHearts(
  currentHearts: number,
  lastRegenAt: number,
  nowMs: number = Date.now()
): { hearts: number; lastRegenAt: number; msUntilNextHeart: number } {
  if (currentHearts >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, lastRegenAt: nowMs, msUntilNextHeart: 0 };
  }

  const elapsed = Math.max(0, nowMs - lastRegenAt);
  const gained = Math.floor(elapsed / HEART_REGEN_MS);

  if (gained > 0) {
    const updatedHearts = Math.min(MAX_HEARTS, currentHearts + gained);
    const updatedLastRegen =
      updatedHearts >= MAX_HEARTS ? nowMs : lastRegenAt + gained * HEART_REGEN_MS;
    const msUntilNext =
      updatedHearts >= MAX_HEARTS ? 0 : HEART_REGEN_MS - (nowMs - updatedLastRegen);

    return {
      hearts: updatedHearts,
      lastRegenAt: updatedLastRegen,
      msUntilNextHeart: Math.max(0, msUntilNext),
    };
  }

  return {
    hearts: currentHearts,
    lastRegenAt,
    msUntilNextHeart: Math.max(0, HEART_REGEN_MS - elapsed),
  };
}

export function getBangkokDateString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function computeBangkokStreak(
  lastActiveBangkokDate: string | null,
  currentStreak: number,
  streakFreezes: number,
  now: Date = new Date()
): {
  streak: number;
  lastActiveBangkokDate: string;
  streakFreezes: number;
  freezeUsed: boolean;
} {
  const today = getBangkokDateString(now);
  if (!lastActiveBangkokDate) {
    return {
      streak: Math.max(1, currentStreak),
      lastActiveBangkokDate: today,
      streakFreezes,
      freezeUsed: false,
    };
  }

  if (lastActiveBangkokDate === today) {
    return {
      streak: Math.max(1, currentStreak),
      lastActiveBangkokDate: today,
      streakFreezes,
      freezeUsed: false,
    };
  }

  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const lastMs = Date.parse(`${lastActiveBangkokDate}T00:00:00Z`);
  const diffDays = Math.round((todayMs - lastMs) / (24 * 60 * 60 * 1000));

  if (diffDays === 1) {
    return {
      streak: currentStreak + 1,
      lastActiveBangkokDate: today,
      streakFreezes,
      freezeUsed: false,
    };
  }

  if (diffDays === 2 && streakFreezes > 0) {
    return {
      streak: currentStreak + 1,
      lastActiveBangkokDate: today,
      streakFreezes: streakFreezes - 1,
      freezeUsed: true,
    };
  }

  return {
    streak: 1,
    lastActiveBangkokDate: today,
    streakFreezes,
    freezeUsed: false,
  };
}

export interface ShopItem {
  id: string;
  type: "skin" | "consumable";
  name: string;
  description: string;
  cost: number;
  accentColor: string;
  hatColor: string;
  shirtColor: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "skin-default",
    type: "skin",
    name: "น้องติว ชุดนักผจญภัยคลาสสิก",
    description: "ชุดมาตรฐานแห่งติวแลนด์ หมวกแดง-เสื้อน้ำเงิน",
    cost: 0,
    accentColor: "#ef4444",
    hatColor: "#dc2626",
    shirtColor: "#2563eb",
  },
  {
    id: "skin-scholar-gold",
    type: "skin",
    name: "ชุดบัณฑิตเหรียญทอง",
    description: "ชุดเกียรติยศสีทองอร่าม สำหรับผู้พิชิตโจทย์เศรษฐศาสตร์",
    cost: 120,
    accentColor: "#f59e0b",
    hatColor: "#d97706",
    shirtColor: "#fef08a",
  },
  {
    id: "skin-dharma-violet",
    type: "skin",
    name: "ชุดจอมปราชญ์วิหารม่วง",
    description: "ผ้าคลุมนักปราชญ์สีม่วงแห่งปัญญาและสมาธิ",
    cost: 150,
    accentColor: "#8b5cf6",
    hatColor: "#6d28d9",
    shirtColor: "#c4b5fd",
  },
  {
    id: "skin-ranger-emerald",
    type: "skin",
    name: "ชุดนักสำรวจแผนที่มรกต",
    description: "ชุดนักภูมิศาสตร์พร้อมเข็มทิศพิกเซล",
    cost: 180,
    accentColor: "#10b981",
    hatColor: "#047857",
    shirtColor: "#6ee7b7",
  },
  {
    id: "skin-cyber-neon",
    type: "skin",
    name: "ชุดพลเมืองดิจิทัลไซเบอร์",
    description: "ชุดเกราะนีออนแห่งโลกอนาคต",
    cost: 250,
    accentColor: "#06b6d4",
    hatColor: "#0e7490",
    shirtColor: "#67e8f9",
  },
  {
    id: "item-streak-freeze",
    type: "consumable",
    name: "โล่น้ำแข็งรักษาสตรีค (Streak Freeze)",
    description: "ป้องกันสตรีคขาดอัตโนมัติหากลืมเข้าเล่น 1 วัน",
    cost: 80,
    accentColor: "#38bdf8",
    hatColor: "#0284c7",
    shirtColor: "#bae6fd",
  },
  {
    id: "item-heart-refill",
    type: "consumable",
    name: "โพชันฟื้นพลังหัวใจเต็ม 5 ดวง",
    description: "เติมพลังหัวใจให้เต็มทันทีเพื่อลุยโหมดท้าทายต่อ",
    cost: 60,
    accentColor: "#f43f5e",
    hatColor: "#e11d48",
    shirtColor: "#fecdd3",
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: {
    totalAnswered: number;
    totalCorrect: number;
    stagesCleared: number;
    bossesDefeated: number;
    streak: number;
    mockExamsCompleted: number;
  }) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "ach-first-step",
    title: "ก้าวแรกสู่ติวแลนด์",
    description: "ตอบคำถามครบ 5 ข้อแรก",
    icon: "star",
    check: (s) => s.totalAnswered >= 5,
  },
  {
    id: "ach-stage-clear",
    title: "ผู้พิชิตด่านธงชัย",
    description: "ผ่านด่าน Question Block Runner สำเร็จครั้งแรก",
    icon: "flag",
    check: (s) => s.stagesCleared >= 1,
  },
  {
    id: "ach-boss-slayer",
    title: "ผู้ปราบบอสประจำสาระ",
    description: "เอาชนะบอสประจำสาระได้สำเร็จ 1 ตัว",
    icon: "boss",
    check: (s) => s.bossesDefeated >= 1,
  },
  {
    id: "ach-streak-3",
    title: "นักติวไฟแรง 3 วันติด",
    description: "รักษาสตรีคการเรียนต่อเนื่อง 3 วัน",
    icon: "flame",
    check: (s) => s.streak >= 3,
  },
  {
    id: "ach-accuracy-50",
    title: "คลังความรู้เคลื่อนที่",
    description: "ตอบคำถามถูกต้องสะสมครบ 50 ข้อ",
    icon: "trophy",
    check: (s) => s.totalCorrect >= 50,
  },
  {
    id: "ach-mock-hero",
    title: "พร้อมลงสนาม A-Level 70",
    description: "ทำข้อสอบจำลอง Mock Exam จบครบชุด",
    icon: "crown",
    check: (s) => s.mockExamsCompleted >= 1,
  },
];
