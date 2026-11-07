# 🏯 ติวแลนด์ สังคมศึกษา — A-Level 70 8-Bit Quest

เกมติว**สังคมศึกษา A-Level 70** สไตล์ 8-Bit Platformer — ครบทั้ง **5 สาระ** เรียนบทเรียน → เล่นมินิเกม → สู้บอส → ตะลุยข้อสอบจำลอง 50 ข้อ 90 นาที
**เล่นฟรี ไม่ต้องล็อกอิน ไม่ต้องตั้งค่า** ความคืบหน้าเก็บในเครื่อง (localStorage) และเล่นออฟไลน์ได้ (PWA)

## ▶️ เล่นเลย

### **https://pong5656.github.io/social-quest/**

> เวอร์ชันออนไลน์พร้อมเล่นทันที (GitHub Pages) — ถ้าอยากได้โดเมน Vercel ก็กดปุ่ม Deploy ด้านล่างได้

## 🗺️ 5 โลก / 5 สาระ (ตามโครงสร้างข้อสอบ ทปอ. A-Level 70)

| World | สาระ | บอส |
|---|---|---|
| 1 | ศาสนา ศีลธรรม จริยธรรม | อสูรโมหะจอมลวง |
| 2 | หน้าที่พลเมือง วัฒนธรรม และการดำเนินชีวิตในสังคม | — |
| 3 | เศรษฐศาสตร์ | — |
| 4 | ประวัติศาสตร์ | — |
| 5 | ภูมิศาสตร์ | — |

> ข้อสอบจริง 50 ข้อ (สาระละ 10 ข้อ) · 90 นาที · ข้อละ 2 คะแนน · 5 ตัวเลือก — ตั้งค่าไว้ที่ `src/content/examConfig.ts`

## 🎮 ฟีเจอร์

- 📚 **เรียนบทเรียน** — สรุปเนื้อหาครบ 5 สาระ พร้อมดาวความแม่นยำรายหัวข้อ
- 🕹️ **มินิเกม 4 แบบ + Question Block Runner** — วิ่งเก็บเหรียญ / ชนบล็อกคำถาม / หลบ obstacles
- 👾 **บอสประจำสาระ** — ผ่านด่านเพื่อพิชิตบอส
- 📝 **Mock Exam A-Level 70** — 50 ข้อ 90 นาที จับเวลาจริง พร้อมเฉลยและวิเคราะห์ผล
- 🔁 **Review (Spaced Repetition)** — ข้อที่ตอบผิดถูกจัดคิวทบทวนอัตโนมัติ
- 📄 **Past Papers** — รวมลิงก์ข้อสอบเก่าทางการ (ทปอ. / สทศ.)
- 🏆 **Gamification** — XP, เหรียญ, หัวใจ (ฟื้นตามเวลา), สตรีค (เวลาไทย), Daily Quest, สกิน, Achievements
- 📱 **Virtual Controls** — ปุ่มแตะจอสำหรับมือถือ (auto / show / hide, ปรับขนาด-ความโปร่งใส / สลับมือ)
- 💾 **เซฟในเครื่อง** — key `tiwland_social_8bit_save_v1` + Export/Import เป็น JSON หรือรหัสโอนย้าย `TIW1:...`
- 📲 **PWA** — ติดตั้งเป็นแอป + เล่นออฟไลน์ได้ (service worker)
- 🔊 **เสียง 8-Bit** — สังเคราะห์สดด้วย Web Audio (ปิดเสียงเป็นค่าเริ่มต้น)

## 🛠️ เทคโนโลยี

- Vite 7 + React 19 + TypeScript (strict) + Tailwind CSS v4
- Phaser (ฉากเกม), Zod (validate เนื้อหา), Howler (เสียง)
- `vite-plugin-singlefile` — build รวมเป็นไฟล์เดียว `dist/index.html`

## 🚀 เริ่มพัฒนา

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # production → dist/
npm run preview    # ดู build จริง
```

## ☁️ Deploy บน Vercel (ไม่ต้องตั้งค่าอะไรเลย)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPong5656%2Fsocial-quest)

> กดปุ่มด้านบน = Deploy ทันที (ล็อกอิน Vercel ในเบราว์เซอร์ตัวเอง) — รอ ~1–2 นาที แล้วเปิดลิงก์ที่ Vercel ให้
> หรือทำเอง: [vercel.com/new](https://vercel.com/new) → **Add New Project** → import repo `Pong5656/social-quest` → **Deploy**
> Vercel ตรวจจับ Vite อัตโนมัติ: build `npm run build` · output `dist` · **ไม่มี env ที่ต้องตั้ง**

## 📌 หมายเหตุ

- ไม่มี Backend/ฐานข้อมูล — ข้อมูลผู้เล่นอยู่ในเบราว์เซอร์เครื่องนั้น ๆ เท่านั้น (ย้ายเครื่องได้ผ่าน Export/Import)
- แหล่งที่มาสื่อ/ฟอนต์/ลิขสิทธิ์ ดูที่ [`CREDITS.md`](./CREDITS.md) · โครงสร้างข้อสอบและแผนงาน ดูที่ [`PLAN.md`](./PLAN.md)
