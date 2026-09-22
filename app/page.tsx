"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  tag: string;
  label: string;
  note: string;
  resources: Array<{ label: string; href: string }>;
};
type Course = { code: string; title: string; instructor: string; format: string; due: string[]; status: string; link: string };
type Workstream = { tag: string; title: string; status: string; detail: string; next: string; link: string; linkLabel: string };
type Mentor = {
  name: string;
  role: string;
  fit: string[];
  priority: string;
  researchNow: string;
  question: string;
  advisorNote: string;
  thesisTopic: string;
  emailSubject: string;
  emailDraft: string;
  link: string;
};
type CalendarDay = { weekday: string; date: string; today?: boolean; items: Array<{ title: string; detail: string; tone?: "deadline" | "optional" | "class" }> };
type ProgramProgress = { total: string; core: string; concentration: string; elective: string; capstone: string };
type ProgramPhase = { term: string; range: string; status: string; focus: string; courses: string[]; study: string; build: string; career: string; checkpoint: string; progress: ProgramProgress; tone: "current" | "plan" | "finish" };
type ImmigrationStep = { period: string; status: string; title: string; action: string; proof: string; risk: string; tone: "now" | "next" | "later" };
type ImmigrationScenario = { id: "sponsor" | "lottery" | "research" | "no-perm"; label: string; stage: string; description: string; next: string; routes: Array<{ title: string; detail: string; watch: string }> };
type AcademicPrepPhase = { term: string; timing: string; outcome: string; actions: string[]; opens: string[]; guardrail: string; tone: "now" | "next" | "later" };
type GlossaryEntry = { label: string; definition: string };
type FounderRoute = { label: string; stage: string; fit: string; requirements: string; reality: string; tone: "now" | "next" | "later" };
type View = "home" | "tasks" | "courses" | "projects" | "people" | "plan" | "immigration" | "events" | "links";
type PlannerSchedule = Record<string, string[]>;
type PlannerCourse = { title: string; credits: number; terms: string[] };

const CHECKLIST_KEY = "ian-asu-week4-dashboard-v1";
const COURSE_PLANNER_KEY = "ian-asu-course-planner-v1";

const PLANNER_TERMS = ["Spring 2027", "Summer 2027", "Fall 2027", "Spring 2028", "Summer 2028"];
const PLANNER_COURSES: PlannerCourse[] = [
  { title: "SER 501 · Advanced Data Structures and Algorithms", credits: 3, terms: ["Spring 2027", "Fall 2027"] }, { title: "SER 515 · Foundations of Software Engineering", credits: 3, terms: ["Spring 2027"] }, { title: "CSE 578 · Data Visualization", credits: 3, terms: ["Spring 2027", "Fall 2027"] }, { title: "CSE 584 / SER 584 · Internship", credits: 3, terms: ["Summer 2027", "Summer 2028"] }, { title: "SER 502 · Emerging Languages and Programming Paradigms", credits: 3, terms: ["Fall 2027"] }, { title: "CSE 572 · Data Mining", credits: 3, terms: ["Fall 2027", "Spring 2028"] }, { title: "CSE 571 · Artificial Intelligence", credits: 3, terms: ["Fall 2027", "Spring 2028"] }, { title: "MFG 523 · AI for Smart Manufacturing", credits: 3, terms: ["Spring 2028"] }, { title: "SER 517 · Engineering Project", credits: 3, terms: ["Summer 2028"] },
  { title: "CSE 574 · Planning and Learning Methods", credits: 3, terms: ["Spring 2027", "Spring 2028"] }, { title: "SER 516 · Software Product and Process Management", credits: 3, terms: ["Spring 2027", "Fall 2027"] }, { title: "CSE 575 · Statistical Machine Learning", credits: 3, terms: ["Fall 2027", "Spring 2028"] }, { title: "SER 594 · Software Engineering Topics", credits: 3, terms: ["Summer 2027", "Spring 2028"] }, { title: "CSE 598 · Perception in Robotics", credits: 3, terms: ["Fall 2027", "Spring 2028"] },
];
const DEFAULT_COURSE_PLAN: PlannerSchedule = {
  "Spring 2027": ["SER 501 · Advanced Data Structures and Algorithms", "SER 515 · Foundations of Software Engineering", "CSE 578 · Data Visualization"],
  "Summer 2027": ["CSE 584 / SER 584 · Internship"],
  "Fall 2027": ["SER 502 · Emerging Languages and Programming Paradigms", "CSE 572 · Data Mining", "CSE 571 · Artificial Intelligence"],
  "Spring 2028": ["MFG 523 · AI for Smart Manufacturing"],
  "Summer 2028": ["SER 517 · Engineering Project"],
};
const IMMIGRATION_STAGE_OPTIONS = ["F-1 · 就學", "Post-completion OPT", "STEM OPT", "H-1B / cap-exempt 工作", "雇主 EB-2 / EB-3"];

const TASKS: Task[] = [
  { id: "ser334-exercise", tag: "09/10 · 15:00", label: "SER 334 · Module 3 Exercise", note: "13:30 開放、90 分鐘；這是本週最早的硬截止。先確認 Canvas 的可作答時段與提交格式，課程內容與作答仍由你自行完成。", resources: [{ label: "開啟 SER 334 Assignments", href: "https://canvas.asu.edu/courses/266408/assignments" }, { label: "開啟 SER 334 Modules", href: "https://canvas.asu.edu/courses/266408/modules" }] },
  { id: "fse560-quiz", tag: "09/11 · 23:59", label: "FSE 560 · Module 3 Quiz", note: "目前是 Classification（Supervised Learning）週。這是日期管理提醒；測驗內容、作答與複習請由你依 Canvas 與課程規則自行完成。", resources: [{ label: "開啟 FSE 560 Canvas", href: "https://canvas.asu.edu/courses/261828" }, { label: "查看 Canvas Calendar", href: "https://canvas.asu.edu/calendar" }] },
  { id: "fse561-lab1", tag: "09/11 · 23:59", label: "FSE 561 · Lab 1: Stakeholder Map & Impact Assessment", note: "和 FSE 560 Quiz 同日截止。先確認該作業頁的格式、AI 使用規則與繳交項目；Dashboard 只保留行政提醒。", resources: [{ label: "開啟 FSE 561 Assignments", href: "https://canvas.asu.edu/courses/270303/assignments" }, { label: "查看 Academic Integrity 規則", href: "https://canvas.asu.edu/courses/270303/pages/academic-integrity-and-responsible-use-of-generative-ai-tools" }] },
  { id: "fse560-assignment2", tag: "09/13 · 23:59", label: "FSE 560 · Assignment 2 Modeling", note: "作業可依課程規定安排；不要假設 quiz 的 late policy 相同。若 Canvas 的個別頁面日期不同，以 Canvas 為準。", resources: [{ label: "開啟 FSE 560 Assignments", href: "https://canvas.asu.edu/courses/261828/assignments" }, { label: "查看 Canvas Calendar", href: "https://canvas.asu.edu/calendar" }] },
  { id: "ser334-cp3", tag: "09/14 · 23:59", label: "SER 334 · Module CP3 Programming", note: "把它和週六的 FSE 560 作業分開安排，避免兩份程式工作都壓到週日晚上。", resources: [{ label: "開啟 SER 334 Assignments", href: "https://canvas.asu.edu/courses/266408/assignments" }, { label: "開啟 SER 334 Modules", href: "https://canvas.asu.edu/courses/266408/modules" }] },
  { id: "fulton-career", tag: "THIS WEEK", label: "預約 Fulton Engineering Career 顧問", note: "預約 résumé review 或 job / internship strategy；帶目前 CV、公開作品集與一頁想問的問題。重點是把 Aotter、automation、SDK integration 與 AI systems 經驗對準美國職缺。", resources: [{ label: "預約 Career Services", href: "https://career-asu.12twenty.com/appointments/" }, { label: "查看公開作品集", href: "https://uncleean.github.io/jyunyan-portfolio/" }, { label: "開啟 Workday Jobs Hub", href: "https://www.myworkday.com/asu/d/home.htmld" }] },
  { id: "careerlink-profile", tag: "THIS WEEK", label: "完成 CareerLink 個人檔案與申請材料", note: "先上傳最新 résumé 與 DeskGuard case study、設定 job preferences；每份職缺出現後再寫對應 cover letter，不上傳通用版本。", resources: [{ label: "開啟 CareerLink", href: "https://career.asu.edu/careerlink" }, { label: "最新 résumé", href: "https://docs.google.com/document/d/1eitg2l_hSqQj9UjwmtDu-KP-QzfAJVF1-IJAfwc2zjs/edit" }, { label: "查看 GitHub", href: "https://github.com/yohoo217" }] },
  { id: "portfolio-plan", tag: "SEPTEMBER", label: "把作品集從展示頁變成求職證據", note: "先完成 Smart Industrial Control 的 case study：問題、系統架構、Quest 3 → MQTT → ESP32 的實作、sensor-to-digital-twin、可量化結果與下一步。DeskGuard 則補資料標註、YOLO 評估指標、短 demo 與 README。", resources: [{ label: "查看公開作品集", href: "https://uncleean.github.io/jyunyan-portfolio/" }, { label: "開啟 GitHub", href: "https://github.com/yohoo217" }, { label: "作品集工作區", href: "https://github.com/yohoo217" }] },
  { id: "arm-prep", tag: "SEPTEMBER", label: "為 Arm Summer 2027 internship 建立準備清單", note: "Chandler 路徑與你的 systems / integration 經驗吻合。申請前先把預計畢業時間改為 Summer 2028，並補 C/C++、Linux、Git、unit testing、基本 OS 與 computer architecture 的可證明經驗。", resources: [{ label: "開啟 Workday Jobs Hub", href: "https://www.myworkday.com/asu/d/home.htmld" }, { label: "查看履歷", href: "https://docs.google.com/document/d/1eitg2l_hSqQj9UjwmtDu-KP-QzfAJVF1-IJAfwc2zjs/edit" }, { label: "開啟 GitHub", href: "https://github.com/yohoo217" }] },
  { id: "advisor-plan", tag: "SEPTEMBER", label: "向 SCAI advisor 確認 thesis／capstone 與 iPOS", note: "確認 AIE Software Engineering MS 可由哪些 faculty 正式指導。把你的 Smart Industrial Control、作品集與想談的三個問題先列成一頁。", resources: [{ label: "AI MS faculty list", href: "https://ai-ms.engineering.asu.edu/faculty/" }] },
];

const COURSES: Course[] = [
  { code: "FSE 560", title: "AI Engineering Foundations", instructor: "Yeonjung Lee", format: "MON · 10:30–11:45 · Tempe", due: ["9/11 · Module 3 Quiz", "9/13 · Assignment 2 Modeling"], status: "Module 3 · Classification", link: "https://canvas.asu.edu/courses/261828" },
  { code: "FSE 561", title: "AI Ethics & Social Responsibility", instructor: "Ali Sarabi", format: "MON · 16:30–17:45 · Zoom / Hybrid", due: ["9/11 · Lab 1", "後續以 Canvas 個別項目為準"], status: "先核對 Lab 1 格式與規則", link: "https://canvas.asu.edu/courses/270303" },
  { code: "SER 334", title: "Operating Systems & System Programming", instructor: "Pranut Jain", format: "TUE / THU · 13:30–14:45 · Polytechnic", due: ["9/10 15:00 · M3 Exercise", "9/14 · CP3 Programming"], status: "Module 3 進行中", link: "https://canvas.asu.edu/courses/266408" },
];

const WORKSTREAMS: Workstream[] = [
  { tag: "CAMPUS JOB", title: "一筆已投，一筆值得追", status: "JR126197 · 已申請", detail: "Data Analyst / System Developer 已送出。接著優先申請 CIS Research Aide JR126337；跳過 Federal Work-Study / FWS only 職缺。", next: "完成 CIS 版本 cover letter；每週固定搜尋 No Federal Funding 的 software、data、AI、IT、research 職缺。", link: "https://www.myworkday.com/asu/d/home.htmld", linkLabel: "開啟 Workday Jobs Hub ↗" },
  { tag: "PORTFOLIO", title: "兩個專案，兩種證據", status: "Smart Control + DeskGuard", detail: "Smart Industrial Control 證明 mixed reality、IoT 與系統整合；DeskGuard 證明你能做電腦視覺資料、評估與部署思維。兩者都要從「技術清單」變成有情境、有架構、有結果的 case study。", next: "先畫 Smart Control 架構圖，再列一個能實際量測的 demo 指標；DeskGuard 的資料集、評估與影片安排在下一個 sprint。", link: "https://uncleean.github.io/jyunyan-portfolio/", linkLabel: "查看公開作品集 ↗" },
  { tag: "SUMMER 2027", title: "Arm 等系統型 internship 準備", status: "早期準備", detail: "目標職類依序是 software / developer tools / automation、systems integration，再到 ML / computer vision。Arm Chandler 是最符合系統整合方向的候選之一。", next: "修正履歷學位日期為 Summer 2028；補強 C/C++、Linux、testing 與 OS 證據，並建立每週職缺追蹤。", link: "https://career.asu.edu/careerlink", linkLabel: "開啟 CareerLink ↗" },
];

const MENTORS: Mentor[] = [
  {
    name: "Rong Pan", role: "Professor · Industrial Engineering / Data Science", fit: ["Reliability", "Digital twins", "Trustworthy AI", "Advanced manufacturing"], priority: "最符合主線",
    researchNow: "研究把統計、資料分析與 AI 用在複雜系統的可靠度；目前也聚焦多階段製造的 digital twins、機器學習與 human–AI coordination。這正好能把你的 Quest 3 → MQTT → ESP32 prototype 從 demo 轉成可驗證的工程研究。",
    question: "若把 real-time sensor data、digital twin 與操作決策放在一起，您會建議先測「異常／drift 偵測」、「製程品質預警」還是「安全動作建議」？什麼是碩士 thesis 可在一年內驗證的範圍？",
    advisorNote: "他是 Professor，且 ASU profile 列有 CSE 599 Thesis；仍需由他與 AIE program 確認當期是否可擔任你的正式 chair、名額與題目適配。",
    thesisTopic: "Reliability-aware digital twin for industrial IoT control：用串流感測資料偵測 drift／異常，讓 MR 控制介面在高風險狀態下提供可追溯、較安全的決策建議。",
    emailSubject: "Prospective MS thesis conversation: reliability-aware industrial IoT digital twin",
    emailDraft: "Dear Professor Pan,\n\nI am an MS student in AI Engineering (Software Engineering) with experience in software automation, SDK integration and production monitoring. I am building a Smart Industrial Control prototype using Quest 3, Unity, MQTT and ESP32-based sensors, and I saw your work on reliability, digital twins and data-driven manufacturing coordination.\n\nCould I ask whether a reliability-aware industrial IoT digital twin could be a reasonable MS thesis direction in your group? I would especially value your view on a small, measurable first study—such as sensor-drift detection or risk-aware control recommendations. If you are available, may I request a short conversation? I would also appreciate knowing whether you are able to chair or recommend a chair for an AIE MS thesis.\n\nBest regards,\nIan",
    link: "https://search.asu.edu/profile/969256"
  },
  {
    name: "Muslum Ozgur Ozmen", role: "Assistant Professor · SCAI", fit: ["IoT security", "Industrial control", "Formal methods", "Applied cryptography"], priority: "Smart Control 高度重疊",
    researchNow: "研究新興運算平台與實體環境互動時的 security / privacy，方法包括 systems design、formal methods、machine learning 與 applied cryptography；明確涵蓋 IoT、robots 與 industrial control systems。近年也有 batteryless IoT secure communication 與 PLC safety 漏洞相關工作。",
    question: "我正在做 Quest、MQTT、ESP32 的 industrial-control prototype；若加入 safety / security 評估，第一個應定義的威脅模型會是什麼？例如 replay／unauthorized command、sensor spoofing，或 PLC / state-machine 的不一致？",
    advisorNote: "他是 Assistant Professor，研究題材與你高度相合；仍應直接確認他本學期是否收 MS thesis students，以及是否能擔任 AIE MS chair 或適合當 co-advisor / committee member。",
    thesisTopic: "Security- and safety-aware MQTT control plane for mixed-reality industrial IoT：建立 attack model，對不可信感測或控制命令做 detection / mitigation，量測 latency、控制成功率與安全風險。",
    emailSubject: "Prospective MS thesis conversation: securing MR-enabled industrial IoT control",
    emailDraft: "Dear Professor Ozmen,\n\nI am an MS student in AI Engineering (Software Engineering). My current portfolio project is a Smart Industrial Control prototype that connects Quest 3 / Unity, MQTT and ESP32-based sensors. Your work on security and privacy for IoT, robots and industrial control systems strongly overlaps with the direction I want to develop.\n\nCould I ask which threat model would make the best first research question for this prototype—for example, unauthorized MQTT commands, replay attacks, sensor spoofing or unsafe state transitions? If the direction is a fit, may I ask whether you are considering MS thesis students and whether you could chair, co-advise or recommend an appropriate advisor?\n\nBest regards,\nIan",
    link: "https://search.asu.edu/profile/5143759"
  },
  {
    name: "Yeonjung Lee", role: "FSE 560 · Assistant Teaching Professor", fit: ["AI / ML", "NLP", "Social network analysis", "Social good"], priority: "先從課堂建立連結",
    researchNow: "研究 social-media / social-network data 的 connections 與 interactions，並以 AI、ML、NLP 處理 polarization 與 social good 等問題。這和你的 physical-system 主線不是最直接的 match，但她很適合幫你把「資料、評估、AI 方法」說清楚。",
    question: "如果我把 production support / incident data 做成一個可評估的 NLP 或 network-analysis side project，應該先定義什麼研究問題與 baseline，才能不是只做 dashboard？",
    advisorNote: "她是 Assistant Teaching Professor；先把她視為課程與方法 mentor。是否能指導或擔任 committee 需直接確認；若不適合，請她推薦做 applied AI / data systems 的正式 graduate faculty。",
    thesisTopic: "NLP-assisted operational incident intelligence：從 anonymized support / incident records 找出 escalation patterns 與 coordination bottlenecks，並用可解釋模型評估預警是否真的有用。",
    emailSubject: "Question about MS research / independent-study direction in applied AI",
    emailDraft: "Dear Professor Lee,\n\nI am in your FSE 560 course and previously worked on software automation, SDK integration and production monitoring. I am exploring how to turn that background into a rigorous applied-AI project rather than only a product demo.\n\nWould an NLP or network-analysis study of anonymized operational incidents—such as identifying escalation risk or coordination bottlenecks—be a meaningful small research direction? I would appreciate a brief conversation about the right methods and evaluation baseline. Also, if this could develop into an independent study or thesis, could you let me know whether you supervise MS work or recommend a suitable graduate-faculty advisor?\n\nBest regards,\nIan",
    link: "https://search.asu.edu/profile/2883883"
  },
  {
    name: "Pranut Jain", role: "SER 334 · Assistant Teaching Professor", fit: ["Software engineering", "HCI", "Intelligent agents", "Privacy / security"], priority: "軟體系統與 project mentor",
    researchNow: "專長是 intelligent agent systems、user modeling、context-sharing、security 與 privacy，也教 SER 334。這很適合討論你的系統如何從「功能做出來」走到「人、情境、權限與可靠性都被設計進去」。",
    question: "若 MR industrial-control interface 要依 role、task 和 physical state 給不同建議或限制，如何把這件事縮成一學期能做出 prototype 與 evaluation 的 software-engineering project？",
    advisorNote: "他是 Assistant Teaching Professor；很適合先從 SER 334 建立關係與討論 independent project。正式 thesis chair 資格與可用名額都要先確認，並請他轉介合適的 graduate faculty。",
    thesisTopic: "Context-aware authorization and explanation layer for MR industrial control：依 operator role、task context 與 sensor state 限制或解釋控制動作，並評估 usability、error rate 與 policy coverage。",
    emailSubject: "Question about MS thesis mentoring: context-aware intelligent systems",
    emailDraft: "Dear Professor Jain,\n\nI am in your SER 334 course and have a background in web systems, SDK integration and automation. I am building a mixed-reality industrial IoT prototype, and your work on intelligent agents, user modeling, context-sharing, security and privacy made me think about a context-aware control interface.\n\nCould a project that adapts control permissions or explanations to an operator’s role, task and sensor state be a reasonable MS-level research direction? I would appreciate your view on a one-semester prototype and evaluation. May I also ask whether you supervise MS thesis / independent-study work, or whether there is a graduate-faculty colleague you would recommend?\n\nBest regards,\nIan",
    link: "https://scai.engineering.asu.edu/faculty/pranut-jain/"
  },
  {
    name: "Sami Mian", role: "Assistant Teaching Professor · Polytechnic", fit: ["Robotics", "IoT", "Mechatronics", "Smart cities"], priority: "可能接觸的應用型老師",
    researchNow: "技術重點橫跨 robotics、AI、mechatronics、UAV systems、IoT 與 smart cities。你的 Smart Industrial Control 的 hardward + software + interaction prototype 和這些應用面接近，適合問場景與測試方式。",
    question: "我的 Smart Industrial Control prototype 結合 MR、MQTT 與 sensors；若要讓它成為一個可展示、可評估的 robotics / IoT 系統 project，最值得加上的真實 task、metrics 或 testbed 是什麼？",
    advisorNote: "他是 Assistant Teaching Professor，應先確認 thesis chair 資格與 availability；即使不能正式指導，他仍可能適合提供應用場景、prototype feedback 或 faculty referral。",
    thesisTopic: "Mixed-reality supervisory interface for industrial IoT：設計安全狀態與任務流程，對比 MR 與傳統 dashboard 在 task completion、operator error、latency awareness 與 usability 上的差異。",
    emailSubject: "Question about MS research: mixed reality and industrial IoT control",
    emailDraft: "Dear Professor Mian,\n\nI am an MS student in AI Engineering (Software Engineering) with professional experience in automation and system integration. I am building a Smart Industrial Control prototype using mixed reality, MQTT and ESP32-based sensors, and I saw your work in robotics, AI, mechatronics and IoT.\n\nCould I ask what real task, testbed or evaluation metrics would make this prototype more credible as a graduate research project? I am considering a comparison of a mixed-reality supervisory interface with a conventional dashboard for task completion, errors and safety awareness. If this overlaps with your work, may I ask whether you supervise MS thesis students or could recommend an appropriate advisor?\n\nBest regards,\nIan",
    link: "https://search.asu.edu/profile/1870943"
  },
];

const EVENTS = [
  { date: "09/10", title: "Falling Walls Lab Arizona", note: "14:30–18:00 · WCPH 160；先確認 RSVP，再決定是否加入 Calendar。", link: "https://events.asu.edu/" },
  { date: "09/11", title: "TCS GenAI Micro-internship info session", note: "線上活動；若想了解短期實作與企業合作，先以 CareerLink 確認註冊與時間。", link: "https://career.asu.edu/careerlink" },
  { date: "09/17", title: "Fulton Career Fair · Master’s / PhD", note: "11:00–16:00 · Polytechnic SDFC；提前完成 résumé 與 30 秒自我介紹。", link: "https://career.engineering.asu.edu/career-fair-day-3/" },
  { date: "09/25", title: "Data Science Career Day", note: "13:00–17:00；先把 CareerLink profile、résumé、LinkedIn 與 job preferences 補齊，再決定報名。", link: "https://career.asu.edu/careerlink" },
  { date: "09/29", title: "Graduate Degree Career Panel", note: "13:30–15:00；適合問碩士生 internship、職涯轉換與履歷策略。", link: "https://career.asu.edu/careerlink" },
];

const CALENDAR_DAYS: CalendarDay[] = [
  { weekday: "WED", date: "09", today: true, items: [{ title: "整理本週", detail: "確認 Canvas 個別頁面與活動 RSVP。", tone: "class" }] },
  { weekday: "THU", date: "10", items: [{ title: "SER 334 M3 Exercise", detail: "13:30–15:00 · 硬截止", tone: "deadline" }, { title: "Falling Walls Lab", detail: "14:30–18:00 · 可選；與 Exercise 重疊", tone: "optional" }] },
  { weekday: "FRI", date: "11", items: [{ title: "FSE 560 M3 Quiz", detail: "23:59 · 硬截止", tone: "deadline" }, { title: "FSE 561 Lab 1", detail: "23:59 · 硬截止", tone: "deadline" }, { title: "TCS GenAI Session", detail: "線上 · 先確認時間與註冊", tone: "optional" }] },
  { weekday: "SAT", date: "12", items: [{ title: "預留作業時間", detail: "為 9/13 FSE 560 Assignment 2 留出整段時間。", tone: "class" }] },
  { weekday: "SUN", date: "13", items: [{ title: "FSE 560 Assignment 2", detail: "23:59 · 硬截止", tone: "deadline" }] },
  { weekday: "MON", date: "14", items: [{ title: "FSE 561 上課", detail: "16:30–17:45 · Zoom / Hybrid", tone: "class" }, { title: "SER 334 CP3 Programming", detail: "23:59 · 硬截止", tone: "deadline" }] },
  { weekday: "TUE", date: "15", items: [{ title: "Portfolio case study", detail: "整理一個可展示的系統故事", tone: "deadline" }] },
];

const QUICK_LINKS = [
  ["My ASU · 課表", "https://my.asu.edu/"], ["iPOS · 學位規劃", "https://graduate.asu.edu/current-students/completing-your-degree/your-plan-study-ipos"], ["Canvas · 三門課", "https://canvas.asu.edu/"], ["ASU Email · Outlook", "https://outlook.office.com/mail/"],
  ["Class Search / Catalog", "https://catalog.apps.asu.edu/catalog/classes"], ["Academic Calendar", "https://registrar.asu.edu/academic-calendar"], ["Workday · 校內職缺", "https://www.myworkday.com/asu/d/home.htmld"],
  ["CareerLink · 職缺與活動", "https://career-asu.12twenty.com/"], ["Career 顧問預約", "https://career-asu.12twenty.com/appointments/"],
  ["Fulton Student Hub", "https://students.engineering.asu.edu/"], ["SCAI Research Labs", "https://scai.engineering.asu.edu/research-labs/"], ["ISSC · 國際學生", "https://issc.asu.edu/"],
  ["ASU Library", "https://lib.asu.edu/"], ["ASU Parking & Transit", "https://cfo.asu.edu/parking"], ["ASU Search", "https://search.asu.edu/"],
];

const PROGRAM_TIMELINE: ProgramPhase[] = [
  { term: "Fall 2026", range: "現在 → Dec 2026", status: "本學期 · 6 學分", tone: "current", focus: "完成兩門共同核心必修；SER 334 是補強，不先算入學位", courses: ["FSE 560 · AI Engineering Foundations（人工智慧工程基礎）", "FSE 561 · AI Ethics & Social Responsibility（AI 倫理與社會責任）", "SER 334 · Operating Systems（作業系統；先修／補強）"], study: "學位預計累積 6 / 30 學分。SER 334 對軟體背景很重要，但先視為先修／補強；是否可計入 iPOS 必須由 advisor 確認。", build: "把 Smart Industrial Control 做成可量測的案例研究；你目前是非論文路徑，預設以 SER 517 畢業專題收尾。", career: "完成 Fulton career 顧問預約、CareerLink 個人檔案、作品集與可投遞的履歷。", checkpoint: "11–12 月：讓 advisor 確認這兩門共同核心必修已正確放入 iPOS，並確認 SER 334 的學分定位。", progress: { total: "6 / 30", core: "6 / 12", concentration: "0 / 9", elective: "0 / 6", capstone: "0 / 3" } },
  { term: "Spring 2027", range: "Jan → May 2027", status: "9 學分", tone: "plan", focus: "先完成兩門 Software Engineering 專業領域必修", courses: ["SER 501 · Advanced Data Structures and Algorithms（進階資料結構與演算法）", "SER 515 · Foundations of Software Engineering（軟體工程基礎）", "CSE 578 · Data Visualization（資料視覺化；AI 系統與工具共同核心）"], study: "預計累積 15 / 30 學分。SER 501、SER 515 是 Software Engineering 專業領域必修；CSE 578 完成 AI 系統與工具共同核心。", build: "把 Smart Industrial Control 的資料、使用者流程與系統架構整理為能被評估的專案提案。", career: "開始投校內研究、Summer internship 與符合 CPT 規則的機會；每一份申請都連到可展示的作品。", checkpoint: "註冊前以當期開課與先修條件再核對；若 CSE 578 未開，改從 AI 系統與工具官方清單選一門。", progress: { total: "15 / 30", core: "9 / 12", concentration: "6 / 9", elective: "0 / 6", capstone: "0 / 3" } },
  { term: "Summer 2027", range: "May → Aug 2027", status: "實習選項 · 學分待確認", tone: "plan", focus: "保留給實習或深度作品；把 CSE 584 納入 iPOS 確認事項", courses: ["CSE 584 · Internship（實習；1 學分，待 advisor 確認）", "不排 30 學分內的其他正式課程", "作品集衝刺／research（研究）"], study: "CSE 584 已列入規劃，但暫不計入 30 學分：AIE Software Engineering 的現行手冊使用 SER 584 名稱，需由 advisor 確認你應登記 CSE 584 或 SER 584、iPOS 是否須先列入，以及能否計入學位。", build: "完成可重現 demo：架構、資料紀錄、測試流程、結果與 README。", career: "若取得符合 CPT 規則的 internship，可用這一季實習；否則以 research assistantship 或集中作品集衝刺為主。", checkpoint: "Spring 2027 前：向 SCAI advisor 確認 CSE 584／SER 584 的正確課號、iPOS 與 CPT 時程、可登記次數及是否計入 30 學分。", progress: { total: "15 / 30", core: "9 / 12", concentration: "6 / 9", elective: "0 / 6", capstone: "0 / 3" } },
  { term: "Fall 2027", range: "Aug → Dec 2027", status: "9 學分", tone: "plan", focus: "完成專業領域必修，補齊最後一門共同核心與第一門選修", courses: ["SER 502 · Emerging Languages and Programming Paradigms（新興程式語言與典範）", "CSE 572 · Data Mining（資料探勘；資料蒐集與評估共同核心）", "CSE 571 · Artificial Intelligence（人工智慧；核准選修）"], study: "預計累積 24 / 30 學分。SER 502 是第三門專業領域必修；CSE 572 完成資料蒐集與評估共同核心；CSE 571 是 AI 選修。", build: "把畢業專題定為一個可交付的工程成果，而不是論文提案：範圍、里程碑、demo 與評估標準。", career: "為 Summer 2028 full-time / internship 機會更新履歷；把 course projects 變成精簡案例研究。", checkpoint: "12 月：核對 iPOS 的 24 學分是否分類正確，以及 Spring / Summer 只剩 6 學分的安排。", progress: { total: "24 / 30", core: "12 / 12 ✓", concentration: "9 / 9 ✓", elective: "3 / 6", capstone: "0 / 3" } },
  { term: "Spring 2028", range: "Jan → May 2028", status: "3 學分", tone: "finish", focus: "完成最後一門選修，保留畢業專題到 Summer", courses: ["MFG 523 · AI for Smart Manufacturing（智慧製造人工智慧；核准選修）", "畢業專題前置準備", "其餘時間給求職與作品集"], study: "預計累積 27 / 30 學分。MFG 523 貼近你的 industrial IoT 主線，但在這份規劃中是選修，不和已完成的共同核心重複計算。", build: "做 SER 517 前的畢業專題準備：需求、架構、驗收指標、demo 影片與利害關係人回饋。", career: "密集投遞 full-time roles，安排 mock interview；用系統整合、AI 與畢業專題交付能力講故事。", checkpoint: "確認 SER 517 是否在 Summer 2028 開設；若未開，需把畢業專題前移到 Spring，並把畢業日期改為 Spring 2028。", progress: { total: "27 / 30", core: "12 / 12 ✓", concentration: "9 / 9 ✓", elective: "6 / 6 ✓", capstone: "0 / 3" } },
  { term: "Summer 2028", range: "May → Aug 2028", status: "3 學分", tone: "finish", focus: "以 SER 517 完成非論文畢業專題", courses: ["SER 517 · Engineering Project（工程畢業專題）", "完成 30 / 30 學分", "申請 Summer 2028 畢業"], study: "預計 30 / 30 學分、非論文路徑完成。SER 517 的當期開課、faculty approval 與 project requirements 必須在前一學期確認。", build: "交付完整畢業專題：可運行 demo、文件、評估結果與作品集案例研究。", career: "以 AI-enabled software、systems integration、industrial IoT / automation 作為求職主線。", checkpoint: "畢業申請、final submission 和工作授權／身分時程要以 My ASU、advisor 與 ISSC 的正式要求為準。", progress: { total: "30 / 30 ✓", core: "12 / 12 ✓", concentration: "9 / 9 ✓", elective: "6 / 6 ✓", capstone: "3 / 3 ✓" } },
];

const IMMIGRATION_STEPS: ImmigrationStep[] = [
  { period: "2026 → Summer 2028", status: "F-1 · 就學", title: "把學位與職涯證據做完整", action: "維持全職學籍與合規工作授權；把 Smart Industrial Control、實習、course projects 做成可驗證的成果。畢業前確認 I-20 上的 degree / CIP 是否符合 STEM OPT，而不是自行假設。", proof: "學位、I-20、成績單、offer / internship records、作品集、推薦人與可量化成果。", risk: "未授權工作、逾期或錯誤的 SEVIS / I-20 資料會傷害後續選項。", tone: "now" },
  { period: "Summer 2028 → 2029", status: "Post-completion OPT · 最多 12 個月", title: "先取得與學位直接相關的全職工作", action: "依 ISSC 時程申請 Post-OPT；求職重點放在願意雇用 international graduate 的 software、AI systems、automation、industrial IoT 職位。", proof: "職務描述與學位關聯說明、offer、薪資單、工作時數、SEVP / MyISSC 更新紀錄。", risk: "初始 OPT 的失業累計通常不可超過 90 天；不能把 offer 當作已開始就業。", tone: "next" },
  { period: "2029 → 2031", status: "STEM OPT · 最多再 24 個月", title: "延長工作窗口，同步布局 H-1B", action: "只選 E-Verify、能簽 I-983、工作與學位直接相關且每週至少 20 小時的雇主。每年 1–3 月主動問雇主是否願意參加 H-1B registration。", proof: "E-Verify、I-983、每 6 個月 reporting、self-evaluation、職務與專案成果。", risk: "STEM OPT 不是自動取得；整段 OPT / STEM OPT 的失業上限合計 150 天，規則與 I-94 / travel 狀態都要讓 ISSC 個案確認。", tone: "next" },
  { period: "2029 → 2034+", status: "H-1B 或 cap-exempt 工作", title: "把工作身分做成可續航的橋", action: "常見做法是 cap-subject H-1B 每年抽籤；同時把大學、非營利研究機構或相關職位視為 cap-exempt 備案。拿到願意長期留人的雇主，比只追求 title 更重要。", proof: "H-1B registration / petition、LCA、職務專業性、持續的職涯成長與雇主支持。", risk: "抽籤不是可控結果；沒有中籤時，STEM OPT、cap-exempt offer 或回台累積跨國經驗是備案，而不是身分空窗。", tone: "later" },
  { period: "約 2030 → 2035+", status: "Employer-sponsored EB-2 / EB-3", title: "最務實的綠卡主線：早談 sponsor", action: "進入穩定職位後，及早問公司是否有 PERM policy、年資門檻、律師與費用政策。通常雇主處理 prevailing wage、recruitment、PERM、I-140；priority date 是否 current 才決定何時能走 I-485 / 取得永久居民身分。", proof: "職位與學歷條件、PERM 文件、I-140、雇主支持與長期工作紀錄。", risk: "雇主可不 sponsor；PERM 會受招募、audit 與處理時間影響，Visa Bulletin 也可能前進或倒退。", tone: "later" },
];

const IMMIGRATION_SCENARIOS: ImmigrationScenario[] = [
  { id: "sponsor", label: "拿到願意 sponsor 的工作", stage: "最理想、也最常見的主線", description: "你在 OPT / STEM OPT 進入有既定 immigration policy 的雇主；HR 願意每年協助 H-1B registration，並在符合公司年資門檻後啟動 PERM。", next: "入職前或一開始就確認：E-Verify、H-1B registration、PERM 是否為公司政策、最早何時能開始，以及政策是否寫在 offer / employee handbook 或由 HR 書面確認。", routes: [{ title: "H-1B 有中籤", detail: "轉到 H-1B 後繼續累積專業職務經驗；在公司政策允許時，讓雇主啟動 PERM → I-140。", watch: "H-1B 並不等於綠卡；PERM、I-140 與 Visa Bulletin 仍是各自的關卡。" }, { title: "H-1B 尚未中籤", detail: "用剩餘 STEM OPT 繼續工作、隔年再登記，同時要求 HR 明確說明他們是否會提早啟動 PERM。", watch: "不要把 3 年 OPT 當成無限緩衝；每次失業、換工作與 I-983 都會消耗選項。" }] },
  { id: "lottery", label: "H-1B 沒中／雇主改政策", stage: "最常見的壓力測試", description: "不少經驗分享都提到：雇主口頭說會 sponsor，但換 HR、預算或主管後政策改變；也有人連續幾年沒有抽中。這不是個人能力失敗，而是需要提早設計備案的風險。", next: "不要等到 OPT 快到期才問。每年 1 月前向 HR 確認登記意願；若答案模糊，就同時尋找能明確提供 E-Verify / sponsorship 的新雇主。", routes: [{ title: "還有 STEM OPT 時間", detail: "把申請重心轉到已知雇用 international graduates 的雇主；同時保留 research / higher-ed 職缺。", watch: "求職表的 sponsorship 問題要如實回答；不要用『未來不需要』掩蓋你需要的工作授權。" }, { title: "STEM OPT 接近結束", detail: "優先評估 cap-exempt 職位、回台後繼續累積跨國經驗再由雇主調派、或其他由合格律師個案評估的身分選項。", watch: "不要把未核准的工作、volunteer 或 Day-1 CPT 當成萬用 bridge；先讓 ISSC 與合格律師確認合法性。" }] },
  { id: "research", label: "先走大學／研究機構", stage: "降低抽籤依賴的職涯選擇", description: "如果你把 professor / lab connections 真的做成 research staff、university IT、研究中心或符合條件的非營利研究工作，可能有 cap-exempt H-1B 的機會。它是職涯方向，而不只是簽證 workaround。", next: "從現在開始把研究機會視為可投遞職缺：談 RA、research engineer、lab developer、university-affiliated institute 的 systems / AI positions。", routes: [{ title: "拿到 cap-exempt offer", detail: "由雇主與律師確認該實體／職位的 cap-exempt 資格；獲批後可避免一般 annual lottery 的不確定性。", watch: "不是所有 nonprofit、學校合作單位或職稱都自動 cap-exempt；以雇主律師書面判斷為準。" }, { title: "想日後轉產業", detail: "繼續累積可轉移的 systems / AI 成果，同時查詢是否可在保留職涯彈性的前提下參與一般 cap-subject H-1B 流程。", watch: "研究職薪資、資金週期與職涯成長也要比較，不要只因 cap-exempt 就接受不適合的工作。" }] },
  { id: "no-perm", label: "工作穩定，但公司不做 PERM", stage: "常被延後處理的中期問題", description: "有工作、甚至有 H-1B，不等於公司會啟動綠卡。很多人直到第二、三年才發現公司沒有 PERM policy，或年資、職級、績效門檻比想像更晚。", next: "在加入前或前 6–18 個月就問：公司通常替什麼職級 sponsor、是否有等待年限、PERM 由誰付費、HR 或 immigration counsel 的正式窗口是誰。", routes: [{ title: "公司願意有條件啟動", detail: "把門檻、目標日期與需要達成的職務條件記下來；持續維持 job description 與學歷／經驗要求的一致性。", watch: "PERM 由雇主主導，招募結果、audit 與處理時間都可能讓預估延後。" }, { title: "公司明確不做", detail: "在仍有有效工作授權時，優先轉向有 sponsorship track record 的雇主；同時把你的產出累積成未來 NIW 可評估的證據。", watch: "NIW 不是『公司不 sponsor 就自動改走』；需先符合 EB-2，並證明具體 endeavor 與國家利益。" }] },
];

const ACADEMIC_PREP: AcademicPrepPhase[] = [
  { term: "Fall 2026", timing: "現在 → Dec", outcome: "建立未來雇主看得懂的起點", actions: ["完成 Fulton career 顧問預約；把 résumé 改成能量化的 Aotter、automation、SDK integration 與 systems evidence。", "建立「international-friendly employer」清單：E-Verify、過去是否有 H-1B filings、是否雇用 STEM OPT、職位與你的 AI / systems 主線是否相符。", "約一次 ISSC 了解 session：只問未來 Post-OPT、STEM OPT、CPT / CSE 584 或 SER 584 的正確時間點與文件。"], opens: ["主線 A：你更早知道哪些雇主值得投。", "備案 B：開始接觸 professors、labs 與 university-adjacent roles。"], guardrail: "校外有報酬或無報酬工作都先看授權；不要為了累積履歷自行接 freelance、consulting 或 unpaid work。", tone: "now" },
  { term: "Spring 2027", timing: "Jan → May", outcome: "拿到第一段可驗證的美國經驗", actions: ["申請 Summer internship、校內 research / developer role；每份申請都連到同一條作品主線，而不是把技能散開。", "與 SCAI advisor 確認 internship course、iPOS 與 CPT 的適用條件；CSE 584 / SER 584 不自行假設可註冊或可計學分。", "為 Smart Industrial Control 做可被外人理解的 README、架構、demo 與 metrics；請一位教授或 career advisor 給回饋。"], opens: ["主線 A：實習可轉 full-time return offer。", "支線 C：研究成果開始累積為 NIW 是否值得評估的長線材料。"], guardrail: "CPT 必須在開始實習前由 ISSC 正式核准；offer 或課程興趣都不是工作授權。", tone: "next" },
  { term: "Summer 2027", timing: "May → Aug", outcome: "把經驗變成雇主或研究者願意背書的成果", actions: ["若有經核准的實習：留下職務說明、成果、review、pay records 與可公開的 impact summary。", "若沒有實習：選一個有 professor / lab context 的研究或產品成果，完成一份可公開的 case study，不用空白夏天換來未授權工作。", "每月更新 sponsor-target list；追蹤實際招聘季、H-1B policy、E-Verify 與適合的 full-time roles。"], opens: ["H-1B 未中時：有可再投遞的 evidence，也有 research network。", "cap-exempt：更容易從真實合作關係辨識合適機構。"], guardrail: "STEM OPT 與 CPT 對工作型態、雇主、時數有不同規則；每次變動都回到 ISSC 核對。", tone: "next" },
  { term: "Fall 2027", timing: "Aug → Dec", outcome: "從學生作品轉成全職 hiring evidence", actions: ["鎖定 25–40 家目標雇主：一半是 product / engineering sponsor candidates，一半是 university、research center 或 nonprofit research 備案。", "每兩週找一位 professor、alumni、recruiter 或工程師聊具體技術，而不是只問『能不能 sponsor』。", "讓每個 semester project 有一頁英文 case study：problem、your role、architecture、metrics、trade-offs、repository / demo。"], opens: ["主線 A：全職求職不從零開始。", "備案 B：你已有 cap-exempt 與 research 路線的人脈。"], guardrail: "公司過去辦過 H-1B，不保證當年、該職級或該團隊會 sponsor；面試中要正式確認。", tone: "later" },
  { term: "Spring → Summer 2028", timing: "Jan → graduation", outcome: "把畢業與 OPT 的行政風險降到最低", actions: ["用 ISSC 的當期清單提早規劃 Post-OPT：確認 degree completion date、I-20、passport、I-94、推薦時點與申請窗口。", "全職 offer 對照：是否直接 related to major、是否 E-Verify、誰簽 I-983、未來 sponsorship policy、start date 是否不會耗掉失業日數。", "整理一個私密 evidence folder：I-20 / EAD、成績單、offer、job descriptions、pay records、projects、awards、推薦信與每次 status filing。"], opens: ["主線 A：用完整 OPT / STEM OPT 工作窗口爭取 sponsor。", "支線 C：多年後若評估 NIW，不必從零補文件。"], guardrail: "畢業後不是學生就能繼續工作；未經核准的 assistantship、research 或 side work 都可能造成身分問題。", tone: "later" },
];

const IMMIGRATION_GLOSSARY: GlossaryEntry[] = [
  { label: "F-1", definition: "美國學生身分；就學、實習與畢業後工作都要依 I-20 和當下授權條件維持。" },
  { label: "OPT", definition: "Optional Practical Training：與學位直接相關的畢業後工作授權；一般最長 12 個月。" },
  { label: "STEM OPT", definition: "符合 STEM 條件者可在 OPT 後申請的最多 24 個月延長；雇主、訓練計畫與工作相關性都要符合規定。" },
  { label: "CPT", definition: "Curricular Practical Training：在學期間、與課程整合的實習授權；必須在開始工作前取得 ISSC 核准。" },
  { label: "E-Verify", definition: "美國政府的雇主就業資格驗證系統；STEM OPT 雇主必須參與。" },
  { label: "I-983", definition: "STEM OPT 的訓練計畫，由學生與雇主共同完成，並依規定更新與提交。" },
  { label: "H-1B", definition: "由雇主為 specialty occupation 提出的工作身分；一般名額有年度註冊與選擇程序。" },
  { label: "cap-exempt", definition: "不受一般 H-1B 年度名額限制的特定雇主或職位類型；是否符合要由雇主與律師確認。" },
  { label: "PERM", definition: "雇主申請永久居留時常見的前段勞工認證流程，通常包含 prevailing wage、招募與勞工部審核。" },
  { label: "I-140", definition: "移民簽證請願書；由雇主，或在符合 NIW 等情況下由申請人，向 USCIS 提出。" },
  { label: "I-485", definition: "人在美國境內申請調整為永久居民的表格；需有可用移民名額並符合資格。" },
  { label: "priority date", definition: "移民案件用來判斷排期位置的基準日期；它影響何時可能進入下一步。" },
  { label: "Visa Bulletin", definition: "美國國務院每月發布的移民名額與排期表；日期可能前進、停滯或倒退。" },
  { label: "EB-2 / EB-3", definition: "就業移民的第二／第三優先類別；適用分類、資格與排期要依案件和當月規則判斷。" },
  { label: "NIW", definition: "National Interest Waiver：EB-2 的一種豁免路徑，不需要雇主 job offer 或 PERM，但不會因有碩士學位而自動成立。" },
  { label: "E-2 visa", definition: "條約投資人非移民簽證；台灣國民可申請，但需要實際營運的企業與已承諾、足以讓企業運作的投資。它不是綠卡。" },
  { label: "IER", definition: "International Entrepreneur Rule：符合高成長與創造就業等條件的創業者，可能獲得個案裁量的 parole；它不是簽證，也不是一般早期創業者的預設路線。" },
  { label: "O-1A", definition: "具傑出能力人士的非移民工作身分；創辦人可嘗試，但需要有持續的高層級專業成就與證據。" },
  { label: "beneficiary-owner", definition: "H-1B 申請中對受益人同時控制公司時的規則；公司仍要符合條件，且案件會有額外限制。" },
];

const FOUNDER_ROUTES: FounderRoute[] = [
  { label: "現在：學術型驗證", stage: "F-1 在學期間", fit: "把 Smart Industrial Control 從作品集做成 customer discovery、問題訪談、原型與商業假設；先累積技術、需求與團隊證據。", requirements: "只做 ASU 列出的學術活動；不成立公司、不進行商業活動、不簽客戶／供應商合約。", reality: "這不是創業工作授權，但它是最安全、最值得從本學期開始的準備。", tone: "now" },
  { label: "畢業後：Post-OPT 創辦人", stage: "Summer 2028 起（先取得授權）", fit: "若工作與 AI Engineering 學位直接相關，Post-OPT 可涵蓋 self-employed business owner；適合把原型真正做成最初的產品與客戶驗證。", requirements: "先取得 Post-OPT，維持與學位的直接關聯、每週至少 20 小時與完整的公司／工作證據。", reality: "STEM OPT 不可把自己當雇主；不要把『之後可延長』當作 founder 的自動三年跑道。", tone: "next" },
  { label: "H-1B：創辦人公司申請", stage: "成熟一些後的工作身分選項", fit: "若新創已有真實的 specialty-occupation 職位與資金／營運，可評估公司為你提出 H-1B。2025 規則已處理 beneficiary-owner 情境。", requirements: "仍需符合 H-1B、cap registration 與公司資格；若你有 controlling interest，主要工作必須是 specialty-occupation duties，首次最長 18 個月。", reality: "可行不代表容易；小公司用它前應由專做 founder cases 的律師設計治理、職務與證據。", tone: "next" },
  { label: "E-2：台灣創辦人的營運橋", stage: "有資本與真實商業模式時", fit: "台灣在 E-2 treaty country 名單；若產品已要長期營運，E-2 可讓你 develop and direct 符合條件的美國企業。", requirements: "資金要已實際投入且足以讓企業成功運作；企業須真實營運、不可只養活你自己，且有離境意圖。", reality: "它能延長創業經營時間，但不是綠卡，更不應為了身分硬投一個不成立的生意。", tone: "later" },
  { label: "IER：投資／政府 grant 驗證", stage: "高成長新創的短期備案", fit: "若真的拿到 qualified investor 或政府 grant，IER 是比一般雇主贊助更貼近創辦人的暫時工作選項。", requirements: "目前初次申請常見門檻是 18 個月內至少 $311,071 qualified investment 或 $124,429 政府 award / grant，並需有至少 10% 所有權及 central active role。", reality: "它是 case-by-case parole，不是 visa 或綠卡；ASU 的小額 student grant 很有價值，但通常離 IER 門檻很遠。", tone: "later" },
  { label: "O-1A / EB-2 NIW：讓成果變成長線選項", stage: "非畢業即用的永久居留準備", fit: "創業本身不會帶來綠卡，但可把你在 industrial AI、reliability 或 IoT security 的技術成果變成影響力證據。", requirements: "O-1A 看傑出能力；NIW 要先符合 EB-2，並證明具體 endeavor 的國家重要性與你推動它的能力。", reality: "論文、採用、營收、外部資金、專利、獎項與獨立推薦都可能有用，但沒有任何單一項目自動過關。", tone: "later" },
];

const NAV_ITEMS: Array<{ id: View; label: string }> = [
  { id: "home", label: "本週" }, { id: "tasks", label: "待辦" }, { id: "courses", label: "課程" }, { id: "projects", label: "專案" },
  { id: "people", label: "教授" }, { id: "plan", label: "學程規劃" }, { id: "immigration", label: "長期路徑" }, { id: "events", label: "活動" }, { id: "links", label: "常用入口" },
];

const TASK_GROUPS = [
  { title: "這週硬截止", ids: ["ser334-exercise", "fse560-quiz", "fse561-lab1", "fse560-assignment2", "ser334-cp3"] },
  { title: "職涯下一步", ids: ["fulton-career", "careerlink-profile", "arm-prep"] },
  { title: "作品與研究", ids: ["portfolio-plan", "advisor-plan"] },
];

function readStored(key: string) {
  try { const value = window.localStorage.getItem(key); return value ? (JSON.parse(value) as Record<string, boolean>) : {}; } catch { return {}; }
}

function readCoursePlan() {
  try {
    const value = window.localStorage.getItem(COURSE_PLANNER_KEY);
    return value ? { ...DEFAULT_COURSE_PLAN, ...(JSON.parse(value) as PlannerSchedule) } : DEFAULT_COURSE_PLAN;
  } catch { return DEFAULT_COURSE_PLAN; }
}

function GlossaryTerm({ label }: { label: string }) {
  const entry = IMMIGRATION_GLOSSARY.find((item) => item.label === label);
  if (!entry) return <>{label}</>;
  return <span className="glossary-term" tabIndex={0} data-tooltip={entry.definition} aria-label={`${label}：${entry.definition}`}>{label}</span>;
}

function CoursePlannerModal({ open, coursePlan, draggedCourse, onDragStart, onDrop, onRemove, onClose }: { open: boolean; coursePlan: PlannerSchedule; draggedCourse: string | null; onDragStart: (course: string) => void; onDrop: (course: string, term: string) => void; onRemove: (course: string) => void; onClose: () => void }) {
  const assigned = new Set(Object.values(coursePlan).flat());
  const details = (course: string) => PLANNER_COURSES.find((item) => item.title === course);
  const creditsFor = (term: string) => (coursePlan[term] ?? []).reduce((total, course) => total + (details(course)?.credits ?? 3), 0);
  if (!open) return null;
  return <div className="planner-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="course-planner planner-modal" role="dialog" aria-modal="true" aria-labelledby="course-planner-title">
    <div className="planner-heading"><div><p className="eyebrow">COURSE CONFIGURATOR</p><h3 id="course-planner-title">選擇可選課，再放到有開課的學期</h3></div><div className="planner-actions"><p>每門課都標示可排入的學期與學分；「移除」會讓它回到可選課程。正式開課仍以 ASU 當期資料為準。</p><button type="button" className="modal-close" onClick={onClose} aria-label="關閉課程配置器">關閉 ×</button></div></div>
    <div className="planner-layout"><aside className="course-pool"><h4>可選課程</h4><p className="planner-help">先點選或拖曳一門課，再放到標示為可開課的學期。</p>{PLANNER_COURSES.filter((course) => !assigned.has(course.title)).map((course) => <button key={course.title} type="button" draggable onDragStart={() => onDragStart(course.title)} onClick={() => onDragStart(course.title)} className={draggedCourse === course.title ? "is-selected" : ""}><span><b>{course.title}</b><small>{course.credits} 學分 · {course.terms.join(" / ")}</small></span><em>選擇</em></button>)}</aside><div className="planner-terms">{PLANNER_TERMS.map((term) => { const canDrop = draggedCourse ? Boolean(details(draggedCourse)?.terms.includes(term)) : false; return <section key={term} className={"planner-term" + (canDrop ? " can-drop" : "")} onDragOver={(event) => { if (canDrop) event.preventDefault(); }} onDrop={() => canDrop && draggedCourse && onDrop(draggedCourse, term)}><header><h4>{term}</h4><strong>{creditsFor(term)} 學分</strong></header><div>{(coursePlan[term] ?? []).map((course) => <article key={course} className="planned-course"><span>{course}<small>{details(course)?.credits ?? 3} 學分</small></span><button type="button" onClick={() => onRemove(course)}>移除</button></article>)}</div>{draggedCourse && <p>{canDrop ? "可放到這裡" : "這學期未列為開課"}</p>}</section>; })}</div></div>
  </section></div>;
}

export default function Home() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [coursePlan, setCoursePlan] = useState<PlannerSchedule>(DEFAULT_COURSE_PLAN);
  const [plannerReady, setPlannerReady] = useState(false);
  const [draggedCourse, setDraggedCourse] = useState<string | null>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [immigrationScenario, setImmigrationScenario] = useState<ImmigrationScenario["id"]>("sponsor");
  const [immigrationStage, setImmigrationStage] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { setChecked(readStored(CHECKLIST_KEY)); setReady(true); });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { setCoursePlan(readCoursePlan()); setPlannerReady(true); });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked)); } catch { /* session-only fallback */ }
  }, [checked, ready]);
  useEffect(() => {
    if (!plannerReady) return;
    try { window.localStorage.setItem(COURSE_PLANNER_KEY, JSON.stringify(coursePlan)); } catch { /* session-only fallback */ }
  }, [coursePlan, plannerReady]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setPlannerOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  const completed = useMemo(() => TASKS.filter((item) => checked[item.id]).length, [checked]);
  const toggle = (id: string) => setChecked((current) => ({ ...current, [id]: !current[id] }));
  const selectView = (next: View) => {
    setView(next);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  const taskById = (id: string) => TASKS.find((task) => task.id === id);
  const selectedImmigrationScenario = IMMIGRATION_SCENARIOS.find((scenario) => scenario.id === immigrationScenario) ?? IMMIGRATION_SCENARIOS[0];
  const moveCourse = (course: string, destination: string) => {
    setCoursePlan((current) => {
      const next = Object.fromEntries(Object.entries(current).map(([term, list]) => [term, list.filter((item) => item !== course)])) as PlannerSchedule;
      next[destination] = [...(next[destination] ?? []), course];
      return next;
    });
    setDraggedCourse(null);
  };
  const removeCourse = (course: string) => {
    setCoursePlan((current) => Object.fromEntries(Object.entries(current).map(([term, list]) => [term, list.filter((item) => item !== course)])) as PlannerSchedule);
    setDraggedCourse(null);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到頁首"><span>ASU</span><strong>Student Pathway</strong></a>
        <nav aria-label="主要導覽">{NAV_ITEMS.map((item) => <button key={item.id} type="button" className={view === item.id ? "is-active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => selectView(item.id)}>{item.label}</button>)}<a className="language-toggle" href="/en">English</a></nav>
      </header>
      <div className="page app-shell" id="top">
        {view === "home" && <section className="pathway-home" aria-labelledby="pathway-title">
          <div className="pathway-hero"><div><p className="eyebrow">STUDENT PATHWAY · ASU</p><h1 id="pathway-title">我現在在哪？<br /><i>下一步能做什麼？</i></h1><p>不是把所有事情塞進清單，而是幫你在探索、規劃與行動之間，找到現在最值得做的一步。</p></div><div className="pathway-scribble" aria-hidden="true"><span>START<br />HERE</span><b>→</b><em>MAKE<br />A MOVE</em></div></div>
          <div className="pathway-actions"><button type="button" onClick={() => selectView("plan")}><span>01</span><strong>規劃我的路徑</strong><p>選課、安排學期，確認畢業前的下一個 checkpoint。</p><b>開始規劃 →</b></button><button type="button" onClick={() => selectView("projects")}><span>02</span><strong>把經驗變成證據</strong><p>把專案、實習與作品整理成別人看得懂的職涯故事。</p><b>建立作品 →</b></button><button type="button" onClick={() => selectView("people")}><span>03</span><strong>找到能幫你的人</strong><p>從 advisor、教授與校內資源開始，問一個具體問題。</p><b>尋找支援 →</b></button><button type="button" onClick={() => selectView("immigration")}><span>04</span><strong>看見長期選項</strong><p>選擇你的目前階段，理解後續可準備的工作與身分路徑。</p><b>查看路徑 →</b></button></div>
          <section className="pathway-now"><div><p className="eyebrow">YOUR NEXT MOVE</p><h2>先做一件能讓未來更清楚的事。</h2></div><article><span>本週</span><strong>SER 334 exercise</strong><p>先確認作答時段與提交格式。</p><button type="button" onClick={() => selectView("tasks")}>查看所有下一步 →</button></article><article><span>現在</span><strong>選擇你的目前階段</strong><p>讓長期路徑只顯示接下來真正相關的內容。</p><button type="button" onClick={() => selectView("immigration")}>我現在在哪？ →</button></article></section>
        </section>}

        {view === "tasks" && <section className="workspace-panel" aria-labelledby="tasks-title"><div className="workspace-heading"><div><p className="eyebrow">OPERATING BOARD</p><h2 id="tasks-title">待辦依類別收好</h2></div><p>{completed}/{TASKS.length} 完成。點每個項目的「細節與資源」才展開說明，不必一直看長文字。</p></div><div className="task-group-grid">{TASK_GROUPS.map((group) => <article className="task-group" key={group.title}><h3>{group.title}</h3>{group.ids.map((id) => { const item = taskById(id); return item ? <article className={"compact-task " + (checked[item.id] ? "is-done" : "")} key={item.id}><button type="button" className="task-status" aria-pressed={Boolean(checked[item.id])} onClick={() => toggle(item.id)}>{checked[item.id] ? "已完成" : "完成"}</button><span><small>{item.tag}</small><strong>{item.label}</strong></span><details><summary>細節與資源</summary><p>{item.note}</p><div>{item.resources.map((resource) => <a href={resource.href} target="_blank" rel="noreferrer" key={resource.label}>{resource.label} ↗</a>)}</div></details></article> : null; })}</article>)}</div></section>}

        {view === "courses" && <section className="workspace-panel" aria-labelledby="courses-title"><div className="workspace-heading"><div><p className="eyebrow">COURSE CONTROL</p><h2 id="courses-title">三門課的本週狀態</h2></div><p>只列行政狀態與截止日；作業、測驗與考試內容仍由你自行完成。</p></div><div className="course-grid">{COURSES.map((course, index) => <article className="course-card compact-course" key={course.code}><div className="course-top"><span>0{index + 1}</span><strong>{course.status}</strong></div><p className="course-code">{course.code}</p><h3>{course.title}</h3><p className="schedule">{course.format}</p><div className="person"><h4>{course.instructor}</h4><p>Fall 2026 instructor</p></div><div className="course-week"><small>本週截止</small>{course.due.map((item) => <strong key={item}>{item}</strong>)}</div><a href={course.link} target="_blank" rel="noreferrer">開啟課程 Canvas ↗</a></article>)}</div><div className="faculty-note"><strong>課程提醒：</strong>最後仍以 Canvas 個別作業／測驗頁為準。FSE 560 不允許使用生成式 AI 完成課程工作，因此本頁只做行政排程。</div></section>}

        {view === "projects" && <section className="workspace-panel" aria-labelledby="projects-title"><div className="workspace-heading"><div><p className="eyebrow">PARALLEL WORKSTREAMS</p><h2 id="projects-title">把課外主線變成證據</h2></div><p>每條只留下一個下一步，讓你可以判斷今天該往哪裡推。</p></div><div className="workstream-grid">{WORKSTREAMS.map((item) => <article className="workstream-card" key={item.title}><div className="workstream-top"><span>{item.tag}</span><strong>{item.status}</strong></div><h3>{item.title}</h3><p>{item.detail}</p><div className="next-step"><small>下一步</small><strong>{item.next}</strong></div><a href={item.link} target="_blank" rel="noreferrer">{item.linkLabel}</a></article>)}</div><div className="f1-note"><strong>F-1 求職篩選：</strong>優先看「No Federal Funding」；看到「Federal Work-Study / FWS only」就跳過。校外工作或 unpaid project 先向 ISSC 確認授權。</div></section>}

        {view === "people" && <section className="workspace-panel" aria-labelledby="people-title"><div className="workspace-heading"><div><p className="eyebrow">RESEARCH FIT</p><h2 id="people-title">先聊這 5 位</h2></div><p>先從他們的研究與一個具體問題出發；展開卡片就有可直接修改後寄出的信。</p></div><div className="mentor-grid">{MENTORS.map((mentor) => <article className="mentor-card" key={mentor.name}><p className="mini-label">{mentor.role}</p><h3>{mentor.name}</h3><div className="focus-list">{mentor.fit.map((focus) => <span key={focus}>{focus}</span>)}</div><p><strong>{mentor.priority}</strong></p><div className="conversation-starter"><small>可以先問</small><strong>{mentor.question}</strong></div><details className="mentor-outreach"><summary>研究、論文方向與信件</summary><div><small>目前研究／為何適合</small><p>{mentor.researchNow}</p></div><div><small>若能指導，可從這個題目開始</small><p>{mentor.thesisTopic}</p></div><div><small>先確認</small><p>{mentor.advisorNote}</p></div><div><small>可寄出的 email</small><p className="email-subject">Subject: {mentor.emailSubject}</p><pre>{mentor.emailDraft}</pre></div></details><a href={mentor.link} target="_blank" rel="noreferrer">查看 ASU profile 與聯絡方式 ↗</a></article>)}</div><div className="research-method"><span>CoRAL 狀態</span><strong>Vivek Gupta 的 CoRAL 有碩士生入口，但主軸是 LLM 對表格、圖表、地圖等複雜資料的推理；目前維持備選，不佔你的主要研究機會。</strong><a href="https://forge.engineering.asu.edu/faculty_mentor/vivek-gupta/" target="_blank" rel="noreferrer">研究頁 ↗</a></div></section>}

        {view === "plan" && <section className="workspace-panel" aria-labelledby="plan-title"><div className="workspace-heading"><div><p className="eyebrow">FALL 2026 → SUMMER 2028</p><h2 id="plan-title">兩年碩士學程規劃</h2></div><p>目前採非論文路徑：30 學分，最後以 SER 517 工程畢業專題收尾。這是預排，正式 iPOS、當期開課與先修條件仍以 advisor 為準。</p></div><div className="program-summary"><div><small>預計完成</small><strong>Summer 2028</strong></div><div><small>學位路徑</small><strong>非論文 · SER 517</strong></div><div><small>學分目標</small><strong>30 學分</strong></div></div><div className="planner-launch-row planner-launch-top"><div><p className="mini-label">個人化學期配置</p><strong>先設定你想修的課，下面的學程時間表會立即更新。</strong></div><button type="button" className="planner-launch" onClick={() => setPlannerOpen(true)}>開啟課程配置器</button></div><div className="requirement-key"><div><strong>12</strong><span>共同核心必修<br />Core requirements</span></div><div><strong>9</strong><span>專業領域必修<br />Concentration requirements</span></div><div><strong>6</strong><span>核准選修<br />Approved electives</span></div><div><strong>3</strong><span>工程畢業專題<br />Capstone</span></div></div><div className="program-timeline">{PROGRAM_TIMELINE.map((phase) => <article className={"program-phase " + phase.tone} key={phase.term}><div className="phase-rail"><span></span></div><div className="phase-head"><div><p className="mini-label">{phase.status}</p><h3>{phase.term}</h3><p>{phase.range}</p></div><strong>{phase.focus}</strong></div><div className="planned-courses"><small>預排課程</small><div>{(coursePlan[phase.term] ?? phase.courses).map((course) => <span key={course}>{course}</span>)}</div></div><div className="term-progress"><div className="term-progress-head"><small>到這學期結束的累計進度</small><strong>總學分 {phase.progress.total}</strong></div><div><span>共同核心必修 <b>{phase.progress.core}</b></span><span>專業領域必修 <b>{phase.progress.concentration}</b></span><span>選修 <b>{phase.progress.elective}</b></span><span>畢業專題 <b>{phase.progress.capstone}</b></span></div></div><div className="phase-grid"><section><small>學分定位</small><p>{phase.study}</p></section><section><small>研究／作品</small><p>{phase.build}</p></section><section><small>職涯</small><p>{phase.career}</p></section></div><div className="phase-checkpoint"><small>學期 checkpoint</small><strong>{phase.checkpoint}</strong></div></article>)}</div><CoursePlannerModal open={plannerOpen} coursePlan={coursePlan} draggedCourse={draggedCourse} onDragStart={setDraggedCourse} onDrop={moveCourse} onRemove={removeCourse} onClose={() => { setPlannerOpen(false); setDraggedCourse(null); }} /><div className="plan-guardrail"><strong>排課前先核對：</strong>這張表依 AI Engineering MS Software Engineering concentration 的現行 handbook 排出 30-credit non-thesis 路徑。每次選課前仍要確認當期有開課、先修條件、是否可計入 iPOS，以及 SER 517 的 faculty / project approval。<a href="https://ai-ms.engineering.asu.edu/resources/" target="_blank" rel="noreferrer">官方 handbook ↗</a></div></section>}

        {view === "immigration" && <section className="workspace-panel" aria-labelledby="immigration-title">
          <div className="workspace-heading">
            <div><p className="eyebrow">2026 → 2035+ · SCENARIO, NOT A PROMISE</p><h2 id="immigration-title">長期工作與永久居留路徑</h2></div>
            <p>以「2028 畢業、持續維持合法身分、台灣出生且適用一般排期」做的保守模擬；不是法律意見，也不是綠卡保證。</p>
          </div>
          <div className="immigration-summary">
            <div><small>最務實主線</small><strong><GlossaryTerm label="F-1" /> → <GlossaryTerm label="OPT" /> / <GlossaryTerm label="STEM OPT" /> → 雇主 <GlossaryTerm label="H-1B" /> → 雇主 <GlossaryTerm label="EB-2 / EB-3" /></strong></div>
            <div><small>較早可談 sponsor</small><strong>第一份全職工作的 6–18 個月內</strong></div>
            <div><small>可預期窗口</small><strong>約 2031–2035+ 才可能進入 <GlossaryTerm label="I-140" /> / <GlossaryTerm label="I-485" /> 階段</strong></div>
          </div>
          <div className="immigration-warning"><strong>先校正兩件事：</strong>出生地／chargeability 若不是台灣，排期可能不同；STEM OPT 是否適用則要以畢業時 I-20 的實際 degree / CIP 與 ISSC 確認。這兩項都會改變時間線。</div>
          <section className="stage-selector" aria-labelledby="stage-selector-title">
            <div><p className="mini-label">長期路徑</p><h3 id="stage-selector-title">我現在在哪？</h3><p>依順序選擇你的目前階段；箭頭會帶你看見接下來每一段需要處理的事。</p></div>
            <div className="stage-track" role="tablist" aria-label="選擇目前階段">{IMMIGRATION_STAGE_OPTIONS.map((stage, index) => <button key={stage} type="button" role="tab" aria-selected={immigrationStage === index} className={immigrationStage === index ? "is-selected" : ""} onClick={() => setImmigrationStage(index)}><span>{index + 1}</span><strong>{stage}</strong></button>)}</div>
          </section>
          <div className="glossary-strip" aria-label="永久居留路徑名詞說明">
            <span>名詞提示</span>
            <div><p>把游標移到帶點線的名詞上（或用鍵盤聚焦），就會看到說明。</p>{IMMIGRATION_GLOSSARY.map((entry) => <GlossaryTerm key={entry.label} label={entry.label} />)}</div>
          </div>
          {immigrationStage === 0 && <><section className="academic-prep" aria-labelledby="academic-prep-title">
            <div className="academic-prep-heading"><div><p className="mini-label">FROM THIS SEMESTER</p><h3 id="academic-prep-title">在學期間：把未來可選路徑一條條打開</h3></div><p>目的不是現在開始辦綠卡，而是讓 2028 畢業時有合規的工作授權、雇主看得懂的成果、以及不只一條求職路線。</p></div>
            <div className="academic-prep-list">
              {ACADEMIC_PREP.map((phase) => <article className={"academic-prep-phase " + phase.tone} key={phase.term}>
                <div className="academic-prep-term"><small>{phase.timing}</small><h4>{phase.term}</h4><strong>{phase.outcome}</strong></div>
                <div><small>這學期要做</small><ul>{phase.actions.map((action) => <li key={action}>{action}</li>)}</ul></div>
                <div><small>它會打開的選項</small><ul>{phase.opens.map((open) => <li key={open}>{open}</li>)}</ul></div>
                <div className="academic-prep-guardrail"><small>合規提醒</small><p>{phase.guardrail}</p></div>
              </article>)}
            </div>
          </section>
          <section className="founder-panel" aria-labelledby="founder-title">
            <div className="founder-heading"><div><p className="mini-label">ENTREPRENEURSHIP · BUILD FIRST, THEN UNLOCK OPTIONS</p><h3 id="founder-title">創業不是綠卡捷徑，但能拓展你的工作身分選項</h3></div><p>對你最有價值的起點不是立刻成立 LLC，而是把 industrial AI / IoT 的問題、原型、客戶需求與可量化成果做紮實；這些同時能服務求職、創業與日後的證據累積。</p></div>
            <div className="founder-warning"><strong>最重要的界線：</strong>F-1 身分下，創業的實際工作就算沒有收入也常會被視為 employment。現在可做學術型原型、訪談、customer discovery 與商業假設；在沒有正確授權前，不成立公司、不接單、不簽商業合約。CPT 不是自己創業的授權。</div>
            <div className="founder-route-grid">
              {FOUNDER_ROUTES.map((route) => <article className={"founder-route " + route.tone} key={route.label}>
                <p className="mini-label">{route.stage}</p><h4>{route.label}</h4><p>{route.fit}</p><div><small>需要先成立的條件</small><strong>{route.requirements}</strong></div><em>{route.reality}</em>
              </article>)}
            </div>
            <div className="founder-actions">
              <div><small>Fall 2026 的一個務實動作</small><strong>加入 Venture Devils，先以 Smart Industrial Control 做 1 頁 problem brief：誰的什麼流程有什麼可量測的痛點？再找 5 位潛在使用者做訪談。</strong></div>
              <div><small>先約誰</small><strong>先向 ISSC 問「我在 F-1 下做哪些學術型準備不算 employment？」並在任何 entity、收入、合約或創業 funding 前再次確認。</strong></div>
              <div><small>長線要保留什麼</small><strong>版本紀錄、技術決策、測試結果、客戶／教授回饋、外部採用、獎項或 grant；它們比創業公司名稱更有用。</strong></div>
            </div>
            <div className="founder-resources"><a href="https://issc.asu.edu/entrepreneur" target="_blank" rel="noreferrer">ASU ISSC · 創業與 F-1 規則 ↗</a><a href="https://entrepreneurship.asu.edu/programs/venture-devils/" target="_blank" rel="noreferrer">ASU Venture Devils · mentor、pitch 與 funding ↗</a><a href="https://www.uscis.gov/working-in-the-united-states/international-entrepreneur-rule" target="_blank" rel="noreferrer">USCIS · International Entrepreneur Rule ↗</a><a href="https://travel.state.gov/content/travel/en/us-visas/employment/treaty-trader-investor-visa-e.html" target="_blank" rel="noreferrer">Department of State · E-2 規則 ↗</a></div>
          </section></>}
          <section className="scenario-panel" aria-labelledby="scenario-title">
            <div className="scenario-heading"><div><p className="mini-label">經驗分享裡最常遇到的分岔</p><h3 id="scenario-title">如果我遇到這種情況，下一步怎麼走？</h3></div><p>選一個情境，頁面會改成對應的可做選擇。這些是從 F-1 / OPT 社群經驗中整理出的常見模式，法規與個案結論以 ISSC、雇主律師為準。</p></div>
            <div className="scenario-choices" role="group" aria-label="選擇工作與移民情境">
              {IMMIGRATION_SCENARIOS.map((scenario) => <button key={scenario.id} type="button" className={immigrationScenario === scenario.id ? "is-selected" : ""} aria-pressed={immigrationScenario === scenario.id} onClick={() => setImmigrationScenario(scenario.id)}>{scenario.label}</button>)}
            </div>
            <div className="scenario-result">
              <div><p className="mini-label">{selectedImmigrationScenario.stage}</p><h4>{selectedImmigrationScenario.label}</h4><p>{selectedImmigrationScenario.description}</p><strong>現在先做：{selectedImmigrationScenario.next}</strong></div>
              <div className="scenario-route-grid">{selectedImmigrationScenario.routes.map((route) => <article key={route.title}><h5>{route.title}</h5><p>{route.detail}</p><small>注意：{route.watch}</small></article>)}</div>
            </div>
          </section>
          <div className="immigration-timeline">
            {IMMIGRATION_STEPS.slice(immigrationStage).map((step) => <article className={"immigration-step " + step.tone} key={step.title}>
              <div className="immigration-period"><small>{step.status}</small><strong>{step.period}</strong></div>
              <div className="immigration-body"><h3>{step.title}</h3><p>{step.action}</p></div>
              <div><small>你要留下的證據</small><p>{step.proof}</p></div>
              <div className="immigration-risk"><small>不可忽略的風險</small><p>{step.risk}</p></div>
            </article>)}
          </div>
          <div className="immigration-branches">
            <article>
              <p className="mini-label">主線 A · 最應優先經營</p><h3>願意 sponsor 的產品／工程雇主</h3><p>前人最常走的做法不是一畢業就遞綠卡，而是先在 OPT / STEM OPT 做出可留任價值，進入有既定 immigration policy 的公司，再及早確認 H-1B 與 PERM 的時程。你的目標是 AI-enabled software、systems integration、automation 或 industrial tech 的長期職位。</p>
              <strong>現在可做：把「是否 E-Verify、是否 sponsor、PERM 年資門檻」變成求職與面試要確認的欄位。</strong>
            </article>
            <article>
              <p className="mini-label">備案 B · 降低 H-1B 抽籤風險</p><h3>大學／非營利研究機構／相關職位</h3><p>部分高等教育或符合規則的非營利研究職位可不受一般 H-1B cap 限制。它不一定是薪資或職涯的最佳答案，但對研究型或 university-adjacent 的 systems / AI 工作，值得在求職時保留一條線。</p>
              <strong>現在可做：把教授研究、ASU labs、research staff 與非營利技術組織列為真實職涯選項，不只當成履歷加分。</strong>
            </article>
            <article>
              <p className="mini-label">支線 C · 不把它當畢業後立刻選項</p><h3>EB-2 NIW · 國家利益豁免</h3><p>碩士學位可幫你滿足 EB-2 的門檻之一，但不代表 NIW 會成立。它需證明具實質價值與國家重要性的具體 endeavor、你有能力推進它，以及免除 job offer / PERM 對美國有利。你的 industrial reliability、IoT security、可信賴 AI 可成為長線證據主題，而不是現在就湊一份申請。</p>
              <strong>現在可做：累積可驗證影響：研究／發表、公開技術成果、採用、外部推薦與量化成果。</strong>
            </article>
          </div>
          <div className="immigration-sources">
            <strong>每季重新核對的官方來源</strong>
            <div>
              <a href="https://issc.asu.edu/f-1j-1-students/employment/stem" target="_blank" rel="noreferrer">ASU ISSC · STEM OPT 規則與 I-983 ↗</a>
              <a href="https://issc.asu.edu/f-1j-1-students/employment/h1-b" target="_blank" rel="noreferrer">ASU ISSC · H-1B / cap-gap ↗</a>
              <a href="https://www.dol.gov/agencies/eta/foreign-labor/programs/permanent" target="_blank" rel="noreferrer">DOL · PERM 流程 ↗</a>
              <a href="https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250115-Employment-BasedNationalInterestWaivers.pdf" target="_blank" rel="noreferrer">USCIS · EB-2 NIW 政策 ↗</a>
              <a href="https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-september-2026.html" target="_blank" rel="noreferrer">Department of State · Visa Bulletin ↗</a>
            </div>
          </div>
          <div className="plan-guardrail"><strong>何時該找律師：</strong>拿到願意 sponsor 的全職 offer、考慮 NIW、準備離境／轉換身分，或任何 F-1 / OPT 狀態有不確定時。ISSC 可協助學生身分與 OPT；雇主移民策略、PERM 與 I-140 則應由雇主律師或獨立 immigration attorney 依你的完整資料判斷。</div>
        </section>}


        {view === "events" && <section className="workspace-panel" aria-labelledby="events-title"><div className="workspace-heading"><div><p className="eyebrow">SHOW UP</p><h2 id="events-title">值得出現的節點</h2></div><p>活動尚未自動加入你的行事曆；先決定是否 RSVP。</p></div><div className="event-list">{EVENTS.map((event) => <article className="event-row" key={event.title}><strong>{event.date}</strong><div><h4>{event.title}</h4><span>{event.note}</span></div><a href={event.link} target="_blank" rel="noreferrer" aria-label={"查看 " + event.title}>↗</a></article>)}</div></section>}

        {view === "links" && <section className="workspace-panel" aria-labelledby="links-title"><div className="workspace-heading"><div><p className="eyebrow">OFFICIAL LINKS</p><h2 id="links-title">學校常用入口</h2></div><p>課程、學務、求職、系所與國際學生常用的官方入口都集中在這裡。</p></div><div className="quick-grid">{QUICK_LINKS.map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={label}><span>{label}</span><strong>↗</strong></a>)}</div><p className="ipos-note"><strong>iPOS 怎麼開：</strong>登入 My ASU 後，依序進入 <em>My Programs → 你的 degree program → iPOS</em>。上面連結是 ASU 的官方說明；實際建立或送出前，先向 advisor 確認 thesis / capstone 與課程選擇。</p><div className="money-grid admin-grid"><article className="money-card transfer-card"><div className="money-card-top"><span className="op-status path">已完成</span><strong>交通</strong></div><h3>已購車 · 2017 Toyota Corolla</h3><p>Title 已轉、排放檢測已通過。之後持續留存保養、維修、輪胎與召回處理收據，為兩年後出售準備。</p><a href="https://azdot.gov/mvd/services/registration-plates-title/selling-vehicle" target="_blank" rel="noreferrer">Arizona 賣車官方流程 ↗</a></article><article className="money-card insurance-card"><div className="money-card-top"><span className="op-status late">提醒</span><strong>ISSC</strong></div><h3>旅行前先核對身分規則</h3><p>若要出境再入境，先向 ISSC 核對最新 I-94、grace period 與 re-entry 影響。</p><a href="https://issc.asu.edu/" target="_blank" rel="noreferrer">開啟 ISSC ↗</a></article></div><details className="archive"><summary>已完成／已封存</summary><div><span>落地與入住完成</span><span>ASU Mobile ID 已下載</span><span>Graduate Welcome 已完成</span><span>SEVIS check-in 已完成</span><span>House rules 已確認</span><span>Data Analyst / System Developer 已申請</span><span>Web portfolio 已公開</span></div></details></section>}
        <footer><p>ASU · Student Pathway Dashboard</p><p>學生探索、規劃與行動的互動式作品 demo；課程資訊仍以 Canvas 為準。</p></footer>
      </div>
    </main>
  );
}
