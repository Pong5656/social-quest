import { StrandId } from "../lib/schema";

export interface TimelineChallenge {
  id: string;
  strand: StrandId;
  topic: string;
  title: string;
  instruction: string;
  items: {
    id: string;
    label: string;
    detail: string;
    orderIndex: number; // 0 = earliest / first step
  }[];
}

export const TIMELINE_CHALLENGES: TimelineChallenge[] = [
  {
    id: "tl-thai-history-1",
    strand: "history",
    topic: "thai-history-rattanakosin",
    title: "ลำดับเหตุการณ์สำคัญสมัยรัตนโกสินทร์",
    instruction: "เรียงลำดับเหตุการณ์ทางประวัติศาสตร์ไทยจากอดีตไปหาปัจจุบัน (บนลงล่าง)",
    items: [
      { id: "t1", label: "ชำระกฎหมายตราสามดวง (ร.1)", detail: "พ.ศ. 2347", orderIndex: 0 },
      { id: "t2", label: "ลงนามสนธิสัญญาเบาว์ริง (ร.4)", detail: "พ.ศ. 2398", orderIndex: 1 },
      { id: "t3", label: "ปฏิรูประบบราชการตั้ง 12 กระทรวง (ร.5)", detail: "พ.ศ. 2435", orderIndex: 2 },
      { id: "t4", label: "ออก พ.ร.บ.เลิกทาส ร.ศ. 124 (ร.5)", detail: "พ.ศ. 2448", orderIndex: 3 },
      { id: "t5", label: "คณะราษฎรเปลี่ยนแปลงการปกครอง", detail: "24 มิ.ย. พ.ศ. 2475", orderIndex: 4 },
      { id: "t6", label: "ประกาศใช้แผนพัฒนาเศรษฐกิจแห่งชาติ ฉบับที่ 1", detail: "พ.ศ. 2504", orderIndex: 5 },
    ],
  },
  {
    id: "tl-world-history-1",
    strand: "history",
    topic: "world-modern-history",
    title: "จุดเปลี่ยนประวัติศาสตร์สากลสมัยใหม่",
    instruction: "เรียงลำดับเหตุการณ์ประวัติศาสตร์โลกจากเกิดก่อนไปเกิดหลัง",
    items: [
      { id: "w1", label: "ยุคฟื้นฟูศิลปวิทยาการ (เรอเนสซองส์) ในอิตาลี", detail: "คริสต์ศตวรรษที่ 14-16", orderIndex: 0 },
      { id: "w2", label: "การปฏิวัติอุตสาหกรรมเริ่มต้นในอังกฤษ", detail: "ราว ค.ศ. 1760", orderIndex: 1 },
      { id: "w3", label: "การปฏิวัติฝรั่งเศส ทลายคุกบาสตีย์", detail: "ค.ศ. 1789", orderIndex: 2 },
      { id: "w4", label: "สงครามโลกครั้งที่ 1 และก่อตั้งสันนิบาตชาติ", detail: "ค.ศ. 1914 - 1919", orderIndex: 3 },
      { id: "w5", label: "สงครามโลกครั้งที่ 2 และก่อตั้งองค์การสหประชาชาติ (UN)", detail: "ค.ศ. 1939 - 1945", orderIndex: 4 },
      { id: "w6", label: "สหภาพโซเวียตล่มสลาย สิ้นสุดสงครามเย็น", detail: "ค.ศ. 1991", orderIndex: 5 },
    ],
  },
  {
    id: "tl-historical-method",
    strand: "history",
    topic: "historical-method-eras",
    title: "ขั้นตอนวิธีการทางประวัติศาสตร์ 5 ขั้น",
    instruction: "เรียงลำดับขั้นตอนการศึกษาประวัติศาสตร์ที่ถูกต้องตามหลักวิชาการ",
    items: [
      { id: "hm1", label: "1. การกำหนดหัวข้อหรือประเด็นที่จะศึกษา", detail: "ตั้งคำถามวิจัยทางประวัติศาสตร์", orderIndex: 0 },
      { id: "hm2", label: "2. การรวบรวมหลักฐานชั้นต้นและชั้นรอง", detail: "สืบค้นเอกสาร โบราณวัตถุ จารึก", orderIndex: 1 },
      { id: "hm3", label: "3. การประเมินคุณค่าของหลักฐาน (วิพากษ์ภายนอก-ภายใน)", detail: "ตรวจความแท้จริงและความน่าเชื่อถือ", orderIndex: 2 },
      { id: "hm4", label: "4. การวิเคราะห์ สังเคราะห์ และตีความข้อมูล", detail: "เชื่อมโยงเหตุและผลอย่างเป็นกลาง", orderIndex: 3 },
      { id: "hm5", label: "5. การเรียบเรียงและนำเสนอข้อเท็จจริง", detail: "เขียนรายงานหรือบทความประวัติศาสตร์", orderIndex: 4 },
    ],
  },
  {
    id: "tl-law-hierarchy",
    strand: "civic",
    topic: "law-constitution",
    title: "ลำดับศักดิ์ของกฎหมายไทย (สูง -> ต่ำ)",
    instruction: "เรียงลำดับศักดิ์ของกฎหมายไทยจากศักดิ์สูงสุดลงไปต่ำสุด",
    items: [
      { id: "lw1", label: "รัฐธรรมนูญแห่งราชอาณาจักรไทย", detail: "กฎหมายสูงสุดของประเทศ", orderIndex: 0 },
      { id: "lw2", label: "พระราชบัญญัติประกอบรัฐธรรมนูญ (พ.ร.ป.)", detail: "กฎหมายขยายความรัฐธรรมนูญ", orderIndex: 1 },
      { id: "lw3", label: "พระราชบัญญัติ (พ.ร.บ.) / ประมวลกฎหมาย / พ.ร.ก.", detail: "กฎหมายระดับพระราชบัญญัติ", orderIndex: 2 },
      { id: "lw4", label: "พระราชกฤษฎีกา (พ.ร.ฎ.)", detail: "ออกโดยคณะรัฐมนตรี", orderIndex: 3 },
      { id: "lw5", label: "กฎกระทรวง", detail: "ออกโดยรัฐมนตรีเจ้ากระทรวง", orderIndex: 4 },
      { id: "lw6", label: "เทศบัญญัติ / ข้อบัญญัติท้องถิ่น", detail: "ออกโดยองค์กรปกครองส่วนท้องถิ่น", orderIndex: 5 },
    ],
  },
  {
    id: "tl-disaster-cycle",
    strand: "geography",
    topic: "natural-disasters",
    title: "วงจรการจัดการภัยพิบัติ 4 ระยะ",
    instruction: "เรียงลำดับขั้นตอนการจัดการภัยพิบัติตั้งแต่ก่อนเกิดเหตุจนถึงหลังเกิดเหตุ",
    items: [
      { id: "dc1", label: "ระยะการป้องกันและลดผลกระทบ (Mitigation)", detail: "สร้างเขื่อน ออกกฎหมายคุมอาคาร", orderIndex: 0 },
      { id: "dc2", label: "ระยะการเตรียมความพร้อม (Preparedness)", detail: "ซ้อมอพยพ ติดตั้งระบบเตือนภัย", orderIndex: 1 },
      { id: "dc3", label: "ระยะการเผชิญเหตุและบรรเทาทุกข์ (Response)", detail: "อพยพผู้ประสบภัย กู้ชีพฉุกเฉิน", orderIndex: 2 },
      { id: "dc4", label: "ระยะการฟื้นฟูบูรณะ (Recovery)", detail: "ซ่อมแซมสาธารณูปโภค เยียวยาอาชีพ", orderIndex: 3 },
    ],
  },
];

export interface MapTarget {
  id: string;
  label: string;
  clue: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
}

export interface PixelMapScenario {
  id: string;
  strand: StrandId;
  topic: string;
  title: string;
  mapType: "thailand" | "asean" | "world";
  targets: MapTarget[];
}

export const PIXEL_MAPS: PixelMapScenario[] = [
  {
    id: "map-thailand-regions",
    strand: "geography",
    topic: "regions-economic-geo",
    title: "แผนที่ภูมิศาสตร์ประเทศไทย 6 ภูมิภาค",
    mapType: "thailand",
    targets: [
      {
        id: "th-north",
        label: "ภาคเหนือ (ต้นน้ำปิง-วัง-ยม-น่าน)",
        clue: "ภูมิประเทศเทือกเขาสลับหุบเขา แหล่งกำเนิดแม่น้ำ 4 สายที่รวมเป็นเจ้าพระยา",
        xPercent: 34,
        yPercent: 20,
      },
      {
        id: "th-northeast",
        label: "ภาคตะวันออกเฉียงเหนือ (แอ่งโคราช)",
        clue: "ที่ราบสูงดินทราย มีแม่น้ำชีและแม่น้ำมูลไหลลงสู่แม่น้ำโขง",
        xPercent: 64,
        yPercent: 35,
      },
      {
        id: "th-central",
        label: "ภาคกลาง (ที่ราบลุ่มเจ้าพระยา)",
        clue: "ดินตะกอนน้ำพาอุดมสมบูรณ์ เป็นอู่ข้าวอู่น้ำและศูนย์กลางเศรษฐกิจของประเทศ",
        xPercent: 41,
        yPercent: 45,
      },
      {
        id: "th-west",
        label: "ภาคตะวันตก (ทิวเขาตะนาวศรี)",
        clue: "มีทิวเขาตะนาวศรีกั้นพรมแดนเมียนมา เกิดเขตเงาฝนและเป็นที่ตั้งเขื่อนสำคัญ",
        xPercent: 27,
        yPercent: 47,
      },
      {
        id: "th-east",
        label: "ภาคตะวันออก (เขตพัฒนา EEC)",
        clue: "มีชายฝั่งทะเล ท่าเรือน้ำลึก นิคมอุตสาหกรรม และแหล่งปลูกทุเรียน-มังคุด",
        xPercent: 53,
        yPercent: 55,
      },
      {
        id: "th-south",
        label: "ภาคใต้ (คาบสมุทรขนาบสองทะเล)",
        clue: "ขนาบด้วยอ่าวไทยและทะเลอันดามัน ฝนตกชุก 8-10 เดือน แหล่งยางพาราและปาล์มน้ำมัน",
        xPercent: 33,
        yPercent: 79,
      },
    ],
  },
  {
    id: "map-asean",
    strand: "geography",
    topic: "regions-economic-geo",
    title: "แผนที่ภูมิภาคอาเซียน (ASEAN 10 ประเทศ)",
    mapType: "asean",
    targets: [
      {
        id: "as-laos",
        label: "สปป.ลาว (ประเทศไม่มีทางออกสู่ทะเล)",
        clue: "ประเทศเดียวในเอเชียตะวันออกเฉียงใต้ที่ไม่มีอาณาเขตติดต่อกับทะเล (Landlocked)",
        xPercent: 42,
        yPercent: 26,
      },
      {
        id: "as-vietnam",
        label: "เวียดนาม (ชายฝั่งทะเลจีนใต้)",
        clue: "มีรูปร่างเรียวยาวตามชายฝั่งตะวันออกของคาบสมุทรอินโดจีน ติดทะเลจีนใต้",
        xPercent: 51,
        yPercent: 34,
      },
      {
        id: "as-singapore",
        label: "สิงคโปร์ (ศูนย์กลางช่องแคบมะละกา)",
        clue: "นครรัฐเกาะขนาดเล็กปลายคาบสมุทรมลายู คุมเส้นทางเดินเรือช่องแคบมะละกา",
        xPercent: 43,
        yPercent: 64,
      },
      {
        id: "as-indonesia",
        label: "อินโดนีเซีย (ประเทศหมู่เกาะใหญ่ที่สุด)",
        clue: "ประเทศหมู่เกาะในแนววงแหวนแห่งไฟ ตั้งอยู่บนเส้นศูนย์สูตร มีประชากรมากที่สุดในอาเซียน",
        xPercent: 56,
        yPercent: 78,
      },
      {
        id: "as-philippines",
        label: "ฟิลิปปินส์ (หมู่เกาะในมหาสมุทรแปซิฟิก)",
        clue: "ประเทศหมู่เกาะทางตะวันออกเฉียงเหนือของอาเซียน เผชิญพายุไต้ฝุ่นและแผ่นดินไหวบ่อย",
        xPercent: 76,
        yPercent: 36,
      },
    ],
  },
  {
    id: "map-world-geo",
    strand: "geography",
    topic: "physical-geography",
    title: "แผนที่ภูมิศาสตร์กายภาพโลกและกระแสน้ำ",
    mapType: "world",
    targets: [
      {
        id: "wd-himalaya",
        label: "เทือกเขาหิมาลัย (แผ่นทวีปชนแผ่นทวีป)",
        clue: "แนวเทือกเขาสูงที่สุดในโลก เกิดจากแผ่นอินเดีย-ออสเตรเลียชนกับแผ่นยูเรเชีย",
        xPercent: 71,
        yPercent: 42,
      },
      {
        id: "wd-atacama",
        label: "ทะเลทรายอาตากามา (กระแสน้ำเย็นฮัมโบลต์)",
        clue: "ทะเลทรายชายฝั่งตะวันตกของอเมริกาใต้ที่แห้งแล้งจัดจากกระแสน้ำเย็นเปรู",
        xPercent: 29,
        yPercent: 69,
      },
      {
        id: "wd-gulfstream",
        label: "ยุโรปตะวันตก (กระแสน้ำอุ่นกัลฟ์สตรีม)",
        clue: "ภูมิภาคที่ได้รับอิทธิพลจากกระแสน้ำอุ่นแอตแลนติกเหนือทำให้ท่าเรือไม่เป็นน้ำแข็ง",
        xPercent: 48,
        yPercent: 29,
      },
      {
        id: "wd-sahara",
        label: "ทะเลทรายสะฮารา (เขตความกดอากาศสูง 30°N)",
        clue: "ทะเลทรายเขตร้อนที่ใหญ่ที่สุดในโลกทางตอนเหนือของทวีปแอฟริกา",
        xPercent: 52,
        yPercent: 46,
      },
      {
        id: "wd-ringoffire",
        label: "ญี่ปุ่น / วงแหวนแห่งไฟแปซิฟิก",
        clue: "หมู่เกาะภูเขาไฟและแนวแผ่นดินไหวรุนแรงขอบมหาสมุทรแปซิฟิกตะวันตก",
        xPercent: 86,
        yPercent: 39,
      },
    ],
  },
];

export interface WordQuestItem {
  id: string;
  strand: StrandId;
  topic: string;
  word: string; // Thai or English keyword without spaces
  clue: string;
  categoryHint: string;
}

export const WORD_QUEST_ITEMS: WordQuestItem[] = [
  { id: "wq-1", strand: "religion", topic: "dharma-principles", word: "ไตรลักษณ์", clue: "ลักษณะสามัญ 3 ประการของสรรพสิ่ง ได้แก่ อนิจจัง ทุกขัง อนัตตา", categoryHint: "หลักธรรมพุทธศาสนา (9 ตัวอักษร)" },
  { id: "wq-2", strand: "religion", topic: "dharma-principles", word: "อริยสัจ", clue: "ความจริงอันประเสริฐ 4 ประการ ได้แก่ ทุกข์ สมุทัย นิโรธ มรรค", categoryHint: "หัวใจคำสอน (6 ตัวอักษร)" },
  { id: "wq-3", strand: "religion", topic: "dharma-principles", word: "กาลามสูตร", clue: "หลักความเชื่อ 10 ประการที่สอนให้ใช้ปัญญาไตร่ตรองก่อนปลงใจเชื่อ", categoryHint: "พระสูตรสำคัญ (9 ตัวอักษร)" },
  { id: "wq-4", strand: "religion", topic: "world-religions", word: "อัลกุรอาน", clue: "พระคัมภีร์สูงสุดในศาสนาอิสลามที่ประทานแก่นบีมุฮัมมัด", categoryHint: "คัมภีร์ศาสนาสากล (9 ตัวอักษร)" },
  { id: "wq-5", strand: "civic", topic: "law-constitution", word: "รัฐธรรมนูญ", clue: "กฎหมายสูงสุดในการปกครองประเทศ กฎหมายอื่นจะขัดแย้งมิได้", categoryHint: "กฎหมายสูงสุด (10 ตัวอักษร)" },
  { id: "wq-6", strand: "civic", topic: "politics-governance", word: "นิติธรรม", clue: "หลักการปกครองโดยยึดกฎหมายเป็นใหญ่เหนืออำเภอใจของบุคคล", categoryHint: "หลักการปกครอง (8 ตัวอักษร)" },
  { id: "wq-7", strand: "civic", topic: "social-institutions", word: "วิถีประชา", clue: "บรรทัดฐานทางสังคมระดับความเคยชิน ฝ่าฝืนจะถูกนินทาหรือตำหนิ", categoryHint: "บรรทัดฐานสังคม (9 ตัวอักษร)" },
  { id: "wq-8", strand: "economics", topic: "demand-supply", word: "ดุลยภาพ", clue: "จุดที่ปริมาณอุปสงค์เท่ากับปริมาณอุปทาน ณ ระดับราคาตลาด", categoryHint: "กลไกราคา (7 ตัวอักษร)" },
  { id: "wq-9", strand: "economics", topic: "econ-systems-macro", word: "เงินเฟ้อ", clue: "ภาวะระดับราคาสินค้าทั่วไปสูงขึ้นต่อเนื่องทำให้อำนาจซื้อของเงินลดลง", categoryHint: "เศรษฐกิจมหภาค (8 ตัวอักษร)" },
  { id: "wq-10", strand: "economics", topic: "sufficiency-personal-finance", word: "สหกรณ์", clue: "องค์กรเศรษฐกิจที่สมาชิก 1 คนมีสิทธิออกเสียงได้ 1 เสียงเท่ากัน", categoryHint: "สถาบันเศรษฐกิจ (6 ตัวอักษร)" },
  { id: "wq-11", strand: "history", topic: "historical-method-eras", word: "ศักราช", clue: "ระบบการนับปีทางประวัติศาสตร์ เช่น พ.ศ. ค.ศ. ม.ศ. จ.ศ. ร.ศ.", categoryHint: "เวลาทางประวัติศาสตร์ (6 ตัวอักษร)" },
  { id: "wq-12", strand: "history", topic: "thai-history-ancient-ayutthaya", word: "จตุสดมภ์", clue: "ระบบการบริหารราชการส่วนกลางสมัยอยุธยา ประกอบด้วย เวียง วัง คลัง นา", categoryHint: "การปกครองอยุธยา (8 ตัวอักษร)" },
  { id: "wq-13", strand: "history", topic: "world-ancient-civilizations", word: "ฮัมมูราบี", clue: "กษัตริย์แห่งบาบิโลเนียผู้สร้างประมวลกฎหมายลายลักษณ์อักษรยุคโบราณ", categoryHint: "อารยธรรมเมโสโปเตเมีย (9 ตัวอักษร)" },
  { id: "wq-14", strand: "geography", topic: "maps-geoinformatics", word: "ลองจิจูด", clue: "เส้นสมมติแนวตั้งเชื่อมขั้วโลกเหนือ-ใต้ ใช้คำนวณเวลาท้องถิ่นของโลก", categoryHint: "พิกัดภูมิศาสตร์ (8 ตัวอักษร)" },
  { id: "wq-15", strand: "geography", topic: "resources-environment", word: "เอลนีโญ", clue: "ปรากฏการณ์น้ำอุ่นไหลย้อนไปฝั่งเปรู ทำให้ประเทศไทยเกิดภาวะแห้งแล้ง", categoryHint: "ภูมิอากาศโลก (8 ตัวอักษร)" },
];
