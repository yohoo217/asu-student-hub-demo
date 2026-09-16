"use client";

import { useState } from "react";
import { ArrowUpRight, Bell, BookOpen, BriefcaseBusiness, CalendarDays, Compass, LayoutDashboard, UsersRound } from "lucide-react";

const priorities = [
  { title: "Map spring electives", detail: "Compare three pathways before advising", date: "This week" },
  { title: "Draft a portfolio case study", detail: "Turn a recent project into a clear story", date: "Sep 22" },
  { title: "Visit an office hour", detail: "Bring questions for the next studio milestone", date: "Sep 25" },
];
const courses = [
  { code: "DEV 210", title: "Web systems studio", focus: "Feedback cycle", progress: 76 },
  { code: "DES 315", title: "Interaction design", focus: "Prototype review", progress: 58 },
  { code: "CIV 220", title: "Technology & society", focus: "Discussion prep", progress: 42 },
];
const opportunities = [
  { type: "Research", title: "Applied AI student researcher", note: "Human-centered computing lab" },
  { type: "Campus role", title: "Web content assistant", note: "University communications" },
  { type: "Event", title: "Portfolio review studio", note: "Career services" },
];
type Section = "today" | "learning" | "opportunities" | "planning";

function CourseCards() {
  return <div className="course-grid">{courses.map((course) => <article className="course-card" key={course.code}><span className="eyebrow">{course.code}</span><h3>{course.title}</h3><p>Current focus · {course.focus}</p><div className="course-progress"><span style={{ width: `${course.progress}%` }} /></div><strong>{course.progress}% ready</strong></article>)}</div>;
}

export default function Home() {
  const [active, setActive] = useState<Section>("today");
  const tabs: { value: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { value: "today", label: "Today", icon: LayoutDashboard }, { value: "learning", label: "Learning", icon: BookOpen }, { value: "opportunities", label: "Opportunities", icon: BriefcaseBusiness }, { value: "planning", label: "Planning", icon: CalendarDays },
  ];
  return <main className="hub-shell">
    <nav className="topbar" aria-label="Student Hub navigation"><a className="brand" href="#overview"><span>Student</span>Hub<sup>°</sup></a><div className="topbar-actions"><span className="demo-badge">Portfolio demo</span><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><div className="avatar" aria-label="Fictional student profile">JL</div></div></nav>
    <section className="intro" id="overview"><div><p className="eyebrow">A calm command center for student life</p><h1>Good evening,<br /><em>Jordan.</em></h1><p className="intro-copy">One place to see the work ahead, explore what matters next, and move through the semester with intention.</p></div><aside className="fiction-note"><Compass size={20} /><p><strong>Designed for a real problem.</strong><br />All names, dates, courses, and figures in this portfolio version are fictional.</p></aside></section>
    <section className="dashboard-tabs"><div role="tablist" aria-label="Dashboard sections">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.value} role="tab" aria-selected={active === tab.value} data-state={active === tab.value ? "active" : "inactive"} onClick={() => setActive(tab.value)}><Icon size={15} /> {tab.label}</button>; })}</div>
      {active === "today" && <div className="tab-panel"><div className="dashboard-layout"><section className="priority-panel panel"><div className="panel-heading"><div><span className="eyebrow">Right now</span><h2>Priority queue</h2></div><span className="count">03</span></div><div className="priority-list">{priorities.map((item, index) => <article className="priority-row" key={item.title}><span className="priority-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div><span className="due-date">{item.date}</span><ArrowUpRight size={18} aria-hidden="true" /></article>)}</div></section><aside className="readiness-card"><span className="eyebrow">Semester pulse</span><div className="readiness-number">76<span>%</span></div><p>of your planned learning goals are on track.</p><div className="progress-track" role="progressbar" aria-label="Semester readiness: 76 percent" aria-valuenow={76}><span style={{ width: "76%" }} /></div><div className="signal-row"><span>Steady momentum</span><b>+8% this month</b></div></aside></div><section className="learning-section"><div className="section-heading"><div><span className="eyebrow">Learning map</span><h2>Keep the important work visible.</h2></div><button className="text-link">View all learning <ArrowUpRight size={16} /></button></div><CourseCards /></section></div>}
      {active === "learning" && <div className="tab-panel"><section className="learning-page panel"><span className="eyebrow">Learning map</span><h2>Coursework with context, not clutter.</h2><p>Each course turns a vague to-do list into a visible next milestone.</p><CourseCards /></section></div>}
      {active === "opportunities" && <div className="tab-panel"><section className="opportunities-panel panel"><div className="section-heading"><div><span className="eyebrow">Beyond the classroom</span><h2>Opportunities worth a closer look.</h2></div><UsersRound size={28} /></div><div className="opportunity-list">{opportunities.map((item) => <article key={item.title}><span>{item.type}</span><h3>{item.title}</h3><p>{item.note}</p><ArrowUpRight size={18} /></article>)}</div></section></div>}
      {active === "planning" && <div className="tab-panel"><section className="planning-panel panel"><span className="eyebrow">Planning studio</span><h2>Make the next decision feel manageable.</h2><div className="planning-grid"><article><b>01</b><h3>Choose a focus</h3><p>Identify the one outcome that makes this week successful.</p></article><article><b>02</b><h3>Protect time</h3><p>Give deep work a visible place before the calendar fills up.</p></article><article><b>03</b><h3>Review gently</h3><p>Use a short weekly reset to keep the plan honest.</p></article></div></section></div>}
    </section><footer>Student Hub is a fictionalized portfolio demo, built to explore information architecture, responsive UI, and accessible interaction patterns.</footer>
  </main>;
}
