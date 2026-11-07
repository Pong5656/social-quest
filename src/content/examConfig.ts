import { StrandId } from "../lib/schema";

export interface MockExamBlueprintConfig {
  examCode: string;
  examNameTh: string;
  examNameEn: string;
  sourceReference: string;
  asOf: string;
  totalQuestions: number;
  durationMinutes: number;
  pointsPerQuestion: number;
  maxScore: number;
  officialChoiceCount: number;
  strandDistribution: Record<StrandId, number>;
}

/**
 * โครงสร้างข้อสอบจำลอง A-Level 70 สังคมศึกษา
 * อ้างอิงจากประกาศโครงสร้างข้อสอบทางการของ ทปอ. (mytcas.com/blueprint/a-level-70-soc/)
 * ปรับแก้ตัวเลขได้ในไฟล์นี้หากมีการเปลี่ยนแปลงประกาศในอนาคต
 */
export const A_LEVEL_SOCIAL_CONFIG: MockExamBlueprintConfig = {
  examCode: "A-Level 70",
  examNameTh: "วิชาสังคมศึกษา (A-Level 70 Soc)",
  examNameEn: "A-Level 70 Social Studies",
  sourceReference: "ทปอ. (mytcas.com/blueprint/a-level-70-soc)",
  asOf: "TCAS68-70 Blueprint",
  totalQuestions: 50,
  durationMinutes: 90,
  pointsPerQuestion: 2,
  maxScore: 100,
  officialChoiceCount: 5,
  strandDistribution: {
    religion: 10,
    civic: 10,
    economics: 10,
    history: 10,
    geography: 10,
  },
};

export const MINI_MOCK_CONFIG: MockExamBlueprintConfig = {
  examCode: "Mini A-Level 70",
  examNameTh: "มินิจำลอง A-Level สังคม (10 ข้อ)",
  examNameEn: "Quick 10-Item A-Level Drill",
  sourceReference: "สัดส่วน 2 ข้อ/สาระ ตามโครงสร้าง ทปอ.",
  asOf: "TCAS68-70 Blueprint",
  totalQuestions: 10,
  durationMinutes: 18,
  pointsPerQuestion: 10,
  maxScore: 100,
  officialChoiceCount: 5,
  strandDistribution: {
    religion: 2,
    civic: 2,
    economics: 2,
    history: 2,
    geography: 2,
  },
};
