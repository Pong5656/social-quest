import { StrandId } from "../lib/schema";

export interface TopicMeta {
  id: string;
  code: string;
  strand: StrandId;
  title: string;
  shortTitle: string;
  description: string;
  worldStageName: string;
  hasDynamicData?: boolean;
}

export interface StrandMeta {
  id: StrandId;
  number: number;
  nameTh: string;
  shortNameTh: string;
  nameEn: string;
  worldName: string;
  bossName: string;
  bossTitle: string;
  colorHex: string;
  badgeBgClass: string;
  borderClass: string;
  textClass: string;
  examQuota: number;
  topics: TopicMeta[];
}

export const STRANDS: StrandMeta[] = [
  {
    id: "religion",
    number: 1,
    nameTh: "สาระที่ 1 ศาสนา ศีลธรรม จริยธรรม",
    shortNameTh: "ศาสนาและจริยธรรม",
    nameEn: "WORLD 1: DHARMA TEMPLE",
    worldName: "วิหารแห่งปัญญา",
    bossName: "อสูรโมหะจอมลวง",
    bossTitle: "ผู้บิดเบือนหลักธรรมและศาสนาสากล",
    colorHex: "#7c3aed",
    badgeBgClass: "bg-purple-600 text-white",
    borderClass: "border-purple-600",
    textClass: "text-purple-700 dark:text-purple-300",
    examQuota: 10,
    topics: [
      {
        id: "buddhism-history",
        code: "1.1",
        strand: "religion",
        title: "พระพุทธศาสนา: พุทธประวัติ พระไตรปิฎก นิกาย และการเผยแผ่สู่ไทย",
        shortTitle: "พุทธประวัติและพระไตรปิฎก",
        description: "พุทธกิจสำคัญ องค์ประกอบพระไตรปิฎก เถรวาท-มหายาน-วัชรยาน และเส้นทางสู่สุวรรณภูมิ",
        worldStageName: "ด่าน 1-1 ลานโพธิ์ตรัสรู้",
      },
      {
        id: "dharma-principles",
        code: "1.2",
        strand: "religion",
        title: "หลักธรรมสำคัญ: ไตรลักษณ์ อริยสัจ 4 มรรค 8 ปฏิจจสมุปบาท และธรรมหมวดสำคัญ",
        shortTitle: "หลักธรรมทางพระพุทธศาสนา",
        description: "ไตรสิกขา พรหมวิหาร 4 สังคหวัตถุ 4 อิทธิบาท 4 ฆราวาสธรรม กาลามสูตร อบายมุข โอวาท 3",
        worldStageName: "ด่าน 1-2 หอคอยอริยสัจ",
      },
      {
        id: "world-religions",
        code: "1.3",
        strand: "religion",
        title: "ศาสนาสากล: อิสลาม คริสต์ ฮินดู ซิกข์ (ศาสดา คัมภีร์ หลักปฏิบัติ วันสำคัญ)",
        shortTitle: "ศาสนาสากลเปรียบเทียบ",
        description: "หลักศรัทธา 5 และปฏิบัติ 5 ของอิสลาม ตรีเอกภาพของคริสต์ ตรีมูรติฮินดู และคุรุแกรนธ์ซาฮิบซิกข์",
        worldStageName: "ด่าน 1-3 สะพานพหุวัฒนธรรม",
      },
      {
        id: "rituals-etiquette",
        code: "1.4",
        strand: "religion",
        title: "ศาสนพิธี มารยาทชาวพุทธ วันสำคัญทางศาสนา และการอยู่ร่วมกับต่างศาสนิก",
        shortTitle: "ศาสนพิธีและวันสำคัญ",
        description: "กุศลพิธี บุญพิธี ทานพิธี ปกิณกะ วันมาฆบูชา วิสาขบูชา อาสาฬหบูชา และศาสนสัมพันธ์",
        worldStageName: "ด่าน 1-4 ศาลาศาสนพิธี",
      },
      {
        id: "ethics-contemporary",
        code: "1.5",
        strand: "religion",
        title: "จริยธรรมและการตัดสินใจเชิงจริยธรรมในสังคมร่วมสมัย",
        shortTitle: "จริยธรรมร่วมสมัย",
        description: "การวิเคราะห์ปัญหาชีวจริยธรรม สิ่งแวดล้อม เทคโนโลยี และหลักคิดเชิงเหตุผลอย่างเป็นกลาง",
        worldStageName: "ด่าน 1-5 วิหารชั่งใจธรรม",
      },
    ],
  },
  {
    id: "civic",
    number: 2,
    nameTh: "สาระที่ 2 หน้าที่พลเมือง วัฒนธรรม และการดำเนินชีวิตในสังคม",
    shortNameTh: "หน้าที่พลเมืองและกฎหมาย",
    nameEn: "WORLD 2: CIVIC CITADEL",
    worldName: "ป้อมปราการพลเมือง",
    bossName: "จอมเผด็จการอธรรม",
    bossTitle: "ผู้ละเมิดสิทธิและบิดเบือนตัวบทกฎหมาย",
    colorHex: "#2563eb",
    badgeBgClass: "bg-blue-600 text-white",
    borderClass: "border-blue-600",
    textClass: "text-blue-700 dark:text-blue-300",
    examQuota: 10,
    topics: [
      {
        id: "law-constitution",
        code: "2.1",
        strand: "civic",
        title: "กฎหมายและรัฐธรรมนูญ: ลำดับศักดิ์ แพ่ง อาญา ครอบครัว มรดก แรงงาน ผู้บริโภค",
        shortTitle: "กฎหมายและรัฐธรรมนูญ",
        description: "ศักดิ์ของกฎหมาย ความรับผิดทางแพ่ง-อาญา กฎหมายครอบครัว-มรดก และสิทธิในกระบวนการยุติธรรม",
        worldStageName: "ด่าน 2-1 หอตราชูศักดิ์สิทธิ์",
        hasDynamicData: true,
      },
      {
        id: "rights-human-rights",
        code: "2.2",
        strand: "civic",
        title: "สิทธิ เสรีภาพ หน้าที่พลเมือง และสิทธิมนุษยชน",
        shortTitle: "สิทธิพลเมืองและสิทธิมนุษยชน",
        description: "ปฏิญญาสากลว่าด้วยสิทธิมนุษยชน (UDHR) สิทธิขั้นพื้นฐาน และหน้าที่ปวงชนชาวไทย",
        worldStageName: "ด่าน 2-2 จัตุรัสเสรีชน",
        hasDynamicData: true,
      },
      {
        id: "politics-governance",
        code: "2.3",
        strand: "civic",
        title: "การเมืองการปกครอง: ประชาธิปไตย อำนาจอธิปไตย 3 ฝ่าย องค์กรอิสระ การเลือกตั้ง ท้องถิ่น",
        shortTitle: "การเมืองการปกครองไทย-สากล",
        description: "นิติบัญญัติ บริหาร ตุลาการ ระบบรัฐสภา-ประธานาธิบดี-กึ่งฯ องค์กรอิสระ และ อปท.",
        worldStageName: "ด่าน 2-3 รัฐสภาธิปไตย",
        hasDynamicData: true,
      },
      {
        id: "thai-culture-wisdom",
        code: "2.4",
        strand: "civic",
        title: "วัฒนธรรมไทย ความหลากหลายทางวัฒนธรรม และภูมิปัญญาท้องถิ่น",
        shortTitle: "วัฒนธรรมและภูมิปัญญาไทย",
        description: "องค์ประกอบวัฒนธรรม การเลือกรับ-ปรับใช้ และภูมิปัญญา 4 ภาคของไทย",
        worldStageName: "ด่าน 2-4 หมู่บ้านภูมิปัญญา",
      },
      {
        id: "social-institutions",
        code: "2.5",
        strand: "civic",
        title: "สถาบันทางสังคม การขัดเกลา การจัดระเบียบ และการเปลี่ยนแปลงทางสังคม",
        shortTitle: "โครงสร้างและสถาบันสังคม",
        description: "สถาบันหลัก 7 แห่ง บรรทัดฐานทางสังคม (วิถีประชา จารีต กฎหมาย) และการเลื่อนชั้นทางสังคม",
        worldStageName: "ด่าน 2-5 เมืองเครือข่ายสังคม",
      },
      {
        id: "international-relations",
        code: "2.6",
        strand: "civic",
        title: "ความสัมพันธ์ระหว่างประเทศและองค์การระหว่างประเทศ (UN, อาเซียน ฯลฯ)",
        shortTitle: "ความสัมพันธ์ระหว่างประเทศ",
        description: "องค์การสหประชาชาติ (UN) เสาหลักอาเซียน 3 ด้าน และความร่วมมือพหุภาคีในยุคโลกาภิวัตน์",
        worldStageName: "ด่าน 2-6 ท่าเรือการทูตโลก",
        hasDynamicData: true,
      },
      {
        id: "digital-citizenship",
        code: "2.7",
        strand: "civic",
        title: "พลเมืองดิจิทัล การรู้เท่าทันสื่อ ข่าวปลอม และกฎหมายที่เกี่ยวข้อง",
        shortTitle: "พลเมืองดิจิทัลและกฎหมายไอที",
        description: "พ.ร.บ.คอมพิวเตอร์ PDPA ลิขสิทธิ์ออนไลน์ และการตรวจสอบข่าวปลอม (Fact-Checking)",
        worldStageName: "ด่าน 2-7 ไซเบอร์เกตเวย์",
        hasDynamicData: true,
      },
    ],
  },
  {
    id: "economics",
    number: 3,
    nameTh: "สาระที่ 3 เศรษฐศาสตร์",
    shortNameTh: "เศรษฐศาสตร์",
    nameEn: "WORLD 3: COIN FORTRESS",
    worldName: "มหานครเหรียญทอง",
    bossName: "ปีศาจเงินเฟ้อยักษ์",
    bossTitle: "ผู้ปั่นป่วนดุลยภาพตลาดและค่าเงิน",
    colorHex: "#d97706",
    badgeBgClass: "bg-amber-600 text-white",
    borderClass: "border-amber-600",
    textClass: "text-amber-700 dark:text-amber-300",
    examQuota: 10,
    topics: [
      {
        id: "basic-econ-ppf",
        code: "3.1",
        strand: "economics",
        title: "ปัญหาพื้นฐานทางเศรษฐกิจ ค่าเสียโอกาส และเส้นความเป็นไปได้ในการผลิต (PPF)",
        shortTitle: "ทรัพยากรจำกัดและเส้น PPF",
        description: "ความขาดแคลน การเลือก ต้นทุนค่าเสียโอกาส และประสิทธิภาพการผลิตบนเส้น PPF",
        worldStageName: "ด่าน 3-1 เหมืองทรัพยากรจำกัด",
      },
      {
        id: "demand-supply",
        code: "3.2",
        strand: "economics",
        title: "อุปสงค์-อุปทาน ดุลยภาพ ความยืดหยุ่น และการแทรกแซงราคา (เพดาน/ขั้นต่ำ)",
        shortTitle: "อุปสงค์ อุปทาน และกลไกราคา",
        description: "กฎอุปสงค์-อุปทาน ปัจจัยเลื่อนเส้น ความยืดหยุ่นต่อราคา และผลของราคาเพดาน/ราคาขั้นต่ำ",
        worldStageName: "ด่าน 3-2 ตลาดดุลยภาพ",
      },
      {
        id: "consumer-producer-market",
        code: "3.3",
        strand: "economics",
        title: "ผู้บริโภค ผู้ผลิต ต้นทุน รายได้ กำไร และโครงสร้างตลาด 4 ประเภท",
        shortTitle: "ผู้ผลิตและโครงสร้างตลาด",
        description: "ต้นทุนคงที่-ผันแปร จุดคุ้มทุน ตลาดแข่งขันสมบูรณ์ ผูกขาด ผู้ขายน้อยราย และกึ่งแข่งขันกึ่งผูกขาด",
        worldStageName: "ด่าน 3-3 โรงงานต้นทุนและกำไร",
      },
      {
        id: "econ-systems-macro",
        code: "3.4",
        strand: "economics",
        title: "ระบบเศรษฐกิจ และเศรษฐศาสตร์มหภาค (GDP/GNP เงินเฟ้อ เงินฝืด ว่างงาน วัฏจักร)",
        shortTitle: "GDP/GNP และเงินเฟ้อ-เงินฝืด",
        description: "ทุนนิยม-สังคมนิยม-ผสม สูตรคำนวณ GDP กับ GNP สาเหตุ-ผลกระทบเงินเฟ้อ เงินฝืด และวัฏจักรเศรษฐกิจ",
        worldStageName: "ด่าน 3-4 หอคอยรายได้ประชาชาติ",
        hasDynamicData: true,
      },
      {
        id: "fiscal-monetary-policy",
        code: "3.5",
        strand: "economics",
        title: "นโยบายการคลัง (ภาษี งบประมาณ หนี้สาธารณะ) และนโยบายการเงิน (ธปท. ดอกเบี้ย)",
        shortTitle: "นโยบายการคลังและการเงิน",
        description: "งบประมาณขาดดุล-เกินดุล ภาษีทางตรง-ทางอ้อม อัตราดอกเบี้ยนโยบาย และอัตราเงินสดสำรอง",
        worldStageName: "ด่าน 3-5 คลังหลวงและธนาคารกลาง",
        hasDynamicData: true,
      },
      {
        id: "international-trade",
        code: "3.6",
        strand: "economics",
        title: "การค้าระหว่างประเทศ ดุลการชำระเงิน อัตราแลกเปลี่ยน และข้อตกลงการค้า (FTA)",
        shortTitle: "การค้าระหว่างประเทศและค่าเงิน",
        description: "ความได้เปรียบโดยเปรียบเทียบ ค่าเงินแข็ง-อ่อน ดุลการค้า-ดุลการชำระเงิน และเขตการค้าเสรี",
        worldStageName: "ด่าน 3-6 ท่าเรือแลกเปลี่ยนเงินตรา",
        hasDynamicData: true,
      },
      {
        id: "sufficiency-personal-finance",
        code: "3.7",
        strand: "economics",
        title: "เศรษฐกิจพอเพียง การพัฒนาที่ยั่งยืน การเงินส่วนบุคคล และสหกรณ์",
        shortTitle: "เศรษฐกิจพอเพียงและการเงิน",
        description: "3 ห่วง 2 เงื่อนไข เป้าหมาย SDGs การออม-ลงทุน-ประกัน-จัดการหนี้ และสหกรณ์ 7 ประเภทในไทย",
        worldStageName: "ด่าน 3-7 สวนเกษตรทฤษฎีใหม่",
      },
    ],
  },
  {
    id: "history",
    number: 4,
    nameTh: "สาระที่ 4 ประวัติศาสตร์",
    shortNameTh: "ประวัติศาสตร์ไทยและสากล",
    nameEn: "WORLD 4: CHRONO RUINS",
    worldName: "โบราณสถานข้ามกาลเวลา",
    bossName: "จอมบิดเบือนศักราช",
    bossTitle: "ผู้สลับลำดับเหตุการณ์และหลักฐาน",
    colorHex: "#9a3412",
    badgeBgClass: "bg-orange-800 text-white",
    borderClass: "border-orange-800",
    textClass: "text-orange-800 dark:text-orange-300",
    examQuota: 10,
    topics: [
      {
        id: "historical-method-eras",
        code: "4.1",
        strand: "history",
        title: "วิธีการทางประวัติศาสตร์ หลักฐาน การตีความ และการเทียบศักราช",
        shortTitle: "วิธีการทางประวัติศาสตร์และศักราช",
        description: "ขั้นตอน 5 ขั้น หลักฐานชั้นต้น-ชั้นรอง และสูตรเทียบ พ.ศ. ค.ศ. ม.ศ. จ.ศ. ร.ศ. ฮ.ศ.",
        worldStageName: "ด่าน 4-1 หอจดหมายเหตุกาลเวลา",
      },
      {
        id: "thai-history-ancient-ayutthaya",
        code: "4.2",
        strand: "history",
        title: "ประวัติศาสตร์ไทย: สุวรรณภูมิ สุโขทัย อยุธยา และธนบุรี",
        shortTitle: "สุโขทัย อยุธยา และธนบุรี",
        description: "แคว้นโบราณ พ่อขุนรามคำแหง การปฏิรูปปกครองสมเด็จพระบรมไตรโลกนาถ และกอบกู้เอกราชธนบุรี",
        worldStageName: "ด่าน 4-2 กำแพงกรุงศรีอยุธยา",
      },
      {
        id: "thai-history-rattanakosin",
        code: "4.3",
        strand: "history",
        title: "ประวัติศาสตร์รัตนโกสินทร์: ปฏิรูปประเทศ 2475 สงครามโลก การพัฒนาเศรษฐกิจสังคม",
        shortTitle: "รัตนโกสินทร์และไทยสมัยใหม่",
        description: "การปฏิรูปสมัย ร.5 การเปลี่ยนแปลงการปกครอง 24 มิ.ย. 2475 สงครามโลกครั้งที่ 2 และแผนพัฒนาฯ",
        worldStageName: "ด่าน 4-3 พระนครยุคปฏิรูป",
      },
      {
        id: "thai-foreign-relations",
        code: "4.4",
        strand: "history",
        title: "ความสัมพันธ์ไทยกับต่างประเทศ สนธิสัญญา การเสียดินแดน และการรักษาเอกราช",
        shortTitle: "การทูตไทยและการรักษาเอกราช",
        description: "สนธิสัญญาเบอร์นี สนธิสัญญาเบาว์ริง วิกฤตการณ์ ร.ศ. 112 และการแก้ไขสนธิสัญญาไม่เป็นธรรม",
        worldStageName: "ด่าน 4-4 ศาลาการทูตสยาม",
      },
      {
        id: "world-ancient-civilizations",
        code: "4.5",
        strand: "history",
        title: "อารยธรรมโบราณ: เมโสโปเตเมีย อียิปต์ อินเดีย จีน กรีก โรมัน",
        shortTitle: "อารยธรรมโลกโบราณ",
        description: "มรดกโลกยุคโบราณ กฎหมายฮัมมูราบี พีระมิด ลุ่มน้ำสินธุ-หวงเหอ ประชาธิปไตยเอเธนส์ กฎหมายสิบสองโต๊ะ",
        worldStageName: "ด่าน 4-5 วิหารอารยธรรมลุ่มน้ำ",
      },
      {
        id: "world-modern-history",
        code: "4.6",
        strand: "history",
        title: "ประวัติศาสตร์สากลสมัยใหม่: ยุคกลาง เรอเนสซองส์ ปฏิวัติ สงครามโลก สงครามเย็น อาเซียน",
        shortTitle: "ประวัติศาสตร์สากลสมัยใหม่",
        description: "ฟิวดัล มนุษยนิยม ปฏิวัติอุตสาหกรรม-ฝรั่งเศส ล่าอาณานิคม สงครามโลก 1-2 สงครามเย็น และอาเซียน",
        worldStageName: "ด่าน 4-6 สมรภูมิประวัติศาสตร์โลก",
      },
    ],
  },
  {
    id: "geography",
    number: 5,
    nameTh: "สาระที่ 5 ภูมิศาสตร์",
    shortNameTh: "ภูมิศาสตร์และสิ่งแวดล้อม",
    nameEn: "WORLD 5: TERRA ATLAS",
    worldName: "ทวีปแผนที่พิกเซล",
    bossName: "มังกรภัยพิบัติโลก",
    bossTitle: "ผู้บิดเบือนพิกัดและภูมิอากาศโลก",
    colorHex: "#15803d",
    badgeBgClass: "bg-emerald-700 text-white",
    borderClass: "border-emerald-700",
    textClass: "text-emerald-700 dark:text-emerald-300",
    examQuota: 10,
    topics: [
      {
        id: "maps-geoinformatics",
        code: "5.1",
        strand: "geography",
        title: "แผนที่ พิกัด ละติจูด/ลองจิจูด เวลาโลก มาตราส่วน และ GIS/GPS/RS",
        shortTitle: "แผนที่ เวลาโลก และ GIS/GPS/RS",
        description: "การคำนวณมาตราส่วน เส้นแบ่งเขตวันสากล การคำนวณเวลาท้องถิ่น และการประยุกต์ใช้ GIS/GPS/RS",
        worldStageName: "ด่าน 5-1 หอดูดาวเส้นเมริเดียน",
      },
      {
        id: "physical-geography",
        code: "5.2",
        strand: "geography",
        title: "ลักษณะทางกายภาพ: ธรณีภาค อุทกภาค บรรยากาศ และชีวภาค",
        shortTitle: "ภูมิศาสตร์กายภาพ 4 ภาค",
        description: "การเคลื่อนที่แผ่นเปลือกโลก ภูมิลักษณ์ กระแสน้ำอุ่น-เย็น เขตภูมิอากาศเคิปเปน และไบโอมโลก",
        worldStageName: "ด่าน 5-2 หุบเขาแผ่นเปลือกโลก",
      },
      {
        id: "natural-disasters",
        code: "5.3",
        strand: "geography",
        title: "ภัยพิบัติธรรมชาติ และการเตรียมรับมืออย่างเป็นระบบ",
        shortTitle: "ภัยพิบัติและการจัดการเสี่ยง",
        description: "แผ่นดินไหว สึนามิ ภูเขาไฟปะทุ พายุหมุนเขตร้อน อุทกภัย ภัยแล้ง และวงจรการจัดการภัยพิบัติ",
        worldStageName: "ด่าน 5-3 แนวปะทะวงแหวนไฟ",
      },
      {
        id: "resources-environment",
        code: "5.4",
        strand: "geography",
        title: "ทรัพยากรธรรมชาติ สิ่งแวดล้อม ภาวะโลกร้อน และการจัดการอย่างยั่งยืน",
        shortTitle: "ทรัพยากรและวิกฤตสิ่งแวดล้อม",
        description: "ปรากฏการณ์เรือนกระจก เอลนีโญ-ลานีญา อนุสัญญาสิ่งแวดล้อมโลก (เกียวโต ปารีส แรมซาร์ ไซเตส)",
        worldStageName: "ด่าน 5-4 ป่าอนุรักษ์สมดุลโลก",
        hasDynamicData: true,
      },
      {
        id: "population-settlement",
        code: "5.5",
        strand: "geography",
        title: "ประชากร การย้ายถิ่น การตั้งถิ่นฐาน เมือง-ชนบท และปัญหาเมือง",
        shortTitle: "ประชากรและการตั้งถิ่นฐาน",
        description: "พีระมิดประชากร 3 รูปแบบ ปัจจัยผลัก-ดึง การขยายตัวของเมือง (Urbanization) และสังคมผู้สูงอายุ",
        worldStageName: "ด่าน 5-5 มหานครไร้พรมแดน",
        hasDynamicData: true,
      },
      {
        id: "regions-economic-geo",
        code: "5.6",
        strand: "geography",
        title: "ภูมิภาคของไทย-โลก/เอเชีย/อาเซียน และกิจกรรมทางเศรษฐกิจกับภูมิศาสตร์",
        shortTitle: "ภูมิภาคไทย-โลกและเศรษฐกิจ",
        description: "ภูมิศาสตร์ 6 ภูมิภาคของไทย ภูมิภาคเอเชีย-อาเซียน-โลก และปัจจัยที่ตั้งเกษตร-อุตสาหกรรม",
        worldStageName: "ด่าน 5-6 แผนที่ภูมิภาคสยาม-โลก",
      },
    ],
  },
];

export const ALL_TOPICS: TopicMeta[] = STRANDS.flatMap((s) => s.topics);

export function getStrandById(id: StrandId): StrandMeta {
  return STRANDS.find((s) => s.id === id) || STRANDS[0];
}

export function getTopicById(topicId: string): TopicMeta | undefined {
  return ALL_TOPICS.find((t) => t.id === topicId);
}
