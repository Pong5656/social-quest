import React from "react";

export const PastPapersPage: React.FC = () => {
  const officialLinks = [
    {
      title: "โครงสร้างข้อสอบและตัวอย่างข้อสอบ A-Level 70 สังคมศึกษา (ทปอ.)",
      agency: "ที่ประชุมอธิการบดีแห่งประเทศไทย (ทปอ. / myTCAS)",
      url: "https://www.mytcas.com/blueprint/a-level-70-soc/",
      description:
        "หน้าทางการแสดง Test Blueprint จำนวนข้อ 50 ข้อ เวลา 90 นาที สัดส่วน 5 สาระ และตัวอย่างข้อสอบอย่างเป็นทางการ",
    },
    {
      title: "ระบบรับสมัครและข้อมูลการสอบ TCAS / A-Level ทางการ",
      agency: "myTCAS.com",
      url: "https://www.mytcas.com/",
      description:
        "ตรวจสอบปฏิทินการสอบ ระเบียบการสมัครสอบ A-Level และเกณฑ์การคัดเลือกของมหาวิทยาลัยทั่วประเทศ",
    },
    {
      title: "สถาบันทดสอบทางการศึกษาแห่งชาติ (องค์การมหาชน) — สทศ.",
      agency: "NIETS (niets.or.th)",
      url: "https://www.niets.or.th/",
      description:
        "เว็บไซต์ทางการของ สทศ. ผู้ดำเนินการจัดสอบมาตรฐานระดับชาติและคลังข้อมูลการทดสอบทางการศึกษา",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      <div className="pixel-box p-5 sm:p-6 bg-[var(--px-surface)] space-y-3">
        <div className="inline-block px-2.5 py-1 bg-blue-600 text-white font-pixel text-[10px]">
          OFFICIAL EXAM RESOURCES
        </div>
        <h1 className="font-heading-th font-bold text-2xl sm:text-3xl">
          🏛️ แหล่งข้อสอบและโครงสร้างข้อสอบทางการ (สทศ. / ทปอ. / myTCAS)
        </h1>
        <p className="text-base text-[var(--px-text-muted)]">
          เพื่อเคารพลิขสิทธิ์ข้อสอบของหน่วยงานจัดสอบ เว็บไซต์ <strong>ติวแลนด์ สังคมศึกษา</strong> ไม่มีการเก็บหรือเผยแพร่ไฟล์ข้อสอบเก่าที่มีลิขสิทธิ์ไว้บนเซิร์ฟเวอร์ของเรา แต่ได้รวบรวมลิงก์ตรงไปยังเว็บไซต์ทางการของผู้จัดสอบไว้ด้านล่างนี้
        </p>
      </div>

      <div className="space-y-4">
        {officialLinks.map((item, idx) => (
          <div
            key={idx}
            className="pixel-box p-5 bg-[var(--px-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {item.agency}
              </div>
              <h2 className="font-heading-th font-bold text-lg">{item.title}</h2>
              <p className="text-sm text-[var(--px-text-muted)]">{item.description}</p>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn bg-amber-400 text-slate-950 font-bold text-sm shrink-0"
            >
              เปิดเว็บทางการ ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
