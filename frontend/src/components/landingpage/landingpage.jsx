import { useState, useEffect, useRef } from "react";
import "./LandingPage.css";

/* ══════════════════════════════════════════════════════
   MASCOT SVGs — Three unique characters, one per creator
   ══════════════════════════════════════════════════════ */

/** Huzaifa — Full Stack Dev · Blue · Glasses + Terminal */
const MascotHuzaifa = () => (
  <svg viewBox="0 0 110 148" className="lp-mascot-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Shadow */}
    <ellipse cx="55" cy="145" rx="25" ry="5" fill="rgba(0,0,0,0.13)"/>
    {/* Shoes */}
    <rect x="22" y="127" width="25" height="13" rx="6" fill="#1a202c"/>
    <rect x="63" y="127" width="25" height="13" rx="6" fill="#1a202c"/>
    {/* Legs */}
    <rect x="27" y="103" width="19" height="28" rx="8" fill="#2d3748"/>
    <rect x="64" y="103" width="19" height="28" rx="8" fill="#2d3748"/>
    {/* Body — blue hoodie */}
    <rect x="16" y="61" width="78" height="48" rx="17" fill="#1e3a5f"/>
    <rect x="42" y="61" width="26" height="48" rx="5" fill="#163050" opacity="0.55"/>
    <rect x="37" y="87" width="36" height="18" rx="9" fill="#0f2040"/>
    <text x="55" y="100" textAnchor="middle" fontSize="7.5" fill="#4299e1"
      fontFamily="monospace" fontWeight="bold" opacity="0.95">{"</>"}</text>
    {/* Left arm */}
    <g transform="rotate(-9,13,82)">
      <rect x="4" y="62" width="18" height="38" rx="9" fill="#1e3a5f"/>
      <ellipse cx="13" cy="101" rx="9" ry="8" fill="#F5C18A"/>
    </g>
    {/* Right arm — waving */}
    <g className="mascot-arm-wave" style={{transformOrigin:"95px 70px"}}>
      <rect x="88" y="62" width="18" height="38" rx="9" fill="#1e3a5f" transform="rotate(9,97,81)"/>
      <ellipse cx="100" cy="101" rx="9" ry="8" fill="#F5C18A" transform="rotate(9,97,81)"/>
    </g>
    {/* Neck */}
    <rect x="46" y="52" width="18" height="14" rx="6" fill="#E8A870"/>
    {/* Head */}
    <circle cx="55" cy="33" r="28" fill="#F5C18A"/>
    {/* Ears */}
    <ellipse cx="27" cy="35" rx="5.5" ry="7" fill="#E8A870"/>
    <ellipse cx="83" cy="35" rx="5.5" ry="7" fill="#E8A870"/>
    {/* Hair — dark, tidy */}
    <path d="M27,31 Q27,5 55,5 Q83,5 83,31 Q78,12 55,12 Q32,12 27,31Z" fill="#1A0A00"/>
    <path d="M27,31 Q23,39 25,46" stroke="#1A0A00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d="M83,31 Q87,39 85,46" stroke="#1A0A00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    {/* Glasses */}
    <rect x="33" y="26" width="18" height="13" rx="4.5" fill="rgba(147,197,253,0.1)" stroke="#4a5568" strokeWidth="1.6"/>
    <rect x="59" y="26" width="18" height="13" rx="4.5" fill="rgba(147,197,253,0.1)" stroke="#4a5568" strokeWidth="1.6"/>
    <line x1="51" y1="32" x2="59" y2="32" stroke="#4a5568" strokeWidth="1.6"/>
    <line x1="33" y1="32" x2="27" y2="34" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="77" y1="32" x2="83" y2="34" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round"/>
    {/* Eyes */}
    <ellipse cx="42" cy="32" rx="5.5" ry="5.5" fill="white" className="mascot-eye-l"/>
    <ellipse cx="68" cy="32" rx="5.5" ry="5.5" fill="white" className="mascot-eye-r"/>
    <circle cx="43" cy="33" r="3.2" fill="#1D4ED8"/>
    <circle cx="69" cy="33" r="3.2" fill="#1D4ED8"/>
    <circle cx="43.5" cy="32.5" r="1.6" fill="#0a0a14"/>
    <circle cx="69.5" cy="32.5" r="1.6" fill="#0a0a14"/>
    <circle cx="45.2" cy="31" r="1.1" fill="white"/>
    <circle cx="71.2" cy="31" r="1.1" fill="white"/>
    {/* Eyebrows */}
    <path d="M34,22 Q41,18 49,21" stroke="#1A0A00" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M61,21 Q69,18 76,22" stroke="#1A0A00" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M52,40 Q55,45 58,40" stroke="#C88040" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    {/* Mouth — focused smile */}
    <path d="M44,50 Q55,58 66,50" stroke="#B8702A" strokeWidth="2.1" fill="none" strokeLinecap="round"/>
    {/* Floating terminal */}
    <g className="mascot-accessory" transform="translate(72,-4)">
      <rect x="0" y="0" width="27" height="19" rx="4" fill="#0f172a" stroke="#4299e1" strokeWidth="1.2"/>
      <circle cx="4.5" cy="4.5" r="1.4" fill="#ef4444"/>
      <circle cx="9" cy="4.5" r="1.4" fill="#f59e0b"/>
      <circle cx="13.5" cy="4.5" r="1.4" fill="#22c55e"/>
      <rect x="2.5" y="9" width="11" height="2" rx="0.9" fill="#4299e1" opacity="0.9"/>
      <rect x="2.5" y="13" width="18" height="2" rx="0.9" fill="#4299e1" opacity="0.45"/>
      <rect x="2.5" y="16.5" width="8" height="1.6" rx="0.7" fill="#48bb78" opacity="0.75"/>
    </g>
  </svg>
);

/** Ahmed — Frontend Engineer · Green · Curly hair + Laptop */
const MascotAhmed = () => (
  <svg viewBox="0 0 110 148" className="lp-mascot-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Shadow */}
    <ellipse cx="55" cy="145" rx="25" ry="5" fill="rgba(0,0,0,0.13)"/>
    {/* Shoes — white sneakers */}
    <rect x="22" y="127" width="25" height="13" rx="6" fill="#e2e8f0"/>
    <rect x="63" y="127" width="25" height="13" rx="6" fill="#e2e8f0"/>
    <rect x="22" y="127" width="25" height="5" rx="2.5" fill="#cbd5e0"/>
    <rect x="63" y="127" width="25" height="5" rx="2.5" fill="#cbd5e0"/>
    {/* Legs */}
    <rect x="27" y="103" width="19" height="28" rx="8" fill="#374151"/>
    <rect x="64" y="103" width="19" height="28" rx="8" fill="#374151"/>
    {/* Body — green tshirt */}
    <rect x="16" y="61" width="78" height="48" rx="17" fill="#15803d"/>
    <path d="M40,61 Q55,73 70,61" fill="#166534" stroke="none"/>
    {/* Left arm */}
    <g transform="rotate(-11,13,82)">
      <rect x="4" y="62" width="18" height="37" rx="9" fill="#15803d"/>
      <ellipse cx="13" cy="100" rx="9" ry="8" fill="#C4956A"/>
    </g>
    {/* Right arm — raised wave */}
    <g className="mascot-arm-wave" style={{transformOrigin:"95px 65px"}}>
      <rect x="88" y="52" width="18" height="36" rx="9" fill="#15803d" transform="rotate(-28,97,68)"/>
      <ellipse cx="102" cy="84" rx="9" ry="8" fill="#C4956A" transform="rotate(-28,97,68)"/>
    </g>
    {/* Neck */}
    <rect x="46" y="52" width="18" height="14" rx="6" fill="#B47A50"/>
    {/* Head */}
    <circle cx="55" cy="33" r="28" fill="#C8956A"/>
    {/* Ears */}
    <ellipse cx="27" cy="35" rx="5.5" ry="7" fill="#B47A50"/>
    <ellipse cx="83" cy="35" rx="5.5" ry="7" fill="#B47A50"/>
    {/* Curly hair */}
    <path d="M27,30 Q27,4 55,4 Q83,4 83,30 Q78,10 55,10 Q32,10 27,30Z" fill="#2C1810"/>
    <circle cx="33" cy="15" r="8" fill="#2C1810"/>
    <circle cx="43" cy="9" r="9" fill="#2C1810"/>
    <circle cx="55" cy="7" r="9" fill="#2C1810"/>
    <circle cx="67" cy="9" r="9" fill="#2C1810"/>
    <circle cx="77" cy="15" r="8" fill="#2C1810"/>
    <path d="M27,30 Q21,37 24,46" stroke="#2C1810" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M83,30 Q89,37 86,46" stroke="#2C1810" strokeWidth="5" fill="none" strokeLinecap="round"/>
    {/* Eyes — big, friendly */}
    <ellipse cx="42" cy="33" rx="7" ry="7" fill="white" className="mascot-eye-l"/>
    <ellipse cx="68" cy="33" rx="7" ry="7" fill="white" className="mascot-eye-r"/>
    <circle cx="43" cy="34" r="4" fill="#15803d"/>
    <circle cx="69" cy="34" r="4" fill="#15803d"/>
    <circle cx="43.5" cy="33.5" r="2" fill="#0a0a14"/>
    <circle cx="69.5" cy="33.5" r="2" fill="#0a0a14"/>
    <circle cx="45.5" cy="31.5" r="1.5" fill="white"/>
    <circle cx="71.5" cy="31.5" r="1.5" fill="white"/>
    {/* Eyebrows — arched, expressive */}
    <path d="M35,24 Q42,19 50,23" stroke="#2C1810" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
    <path d="M60,23 Q68,19 75,24" stroke="#2C1810" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M52,40 Q55,46 58,40" stroke="#9A6040" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    {/* Big smile + teeth */}
    <path d="M41,49 Q55,64 69,49 Q55,58 41,49Z" fill="#7C3010"/>
    <rect x="46" y="49" width="18" height="6" rx="2.5" fill="white" opacity="0.92"/>
    {/* Floating laptop */}
    <g className="mascot-accessory" transform="translate(71,-6)">
      <rect x="0" y="0" width="30" height="19" rx="3.5" fill="#1e293b" stroke="#16a34a" strokeWidth="1.3"/>
      <rect x="1.5" y="1.5" width="27" height="16" rx="2.5" fill="#0f172a"/>
      <rect x="3" y="3.5" width="15" height="1.8" rx="0.8" fill="#4ade80" opacity="0.9"/>
      <rect x="3" y="7" width="22" height="1.8" rx="0.8" fill="#60a5fa" opacity="0.75"/>
      <rect x="3" y="10.5" width="12" height="1.8" rx="0.8" fill="#f59e0b" opacity="0.75"/>
      <rect x="3" y="14" width="18" height="1.8" rx="0.8" fill="#4ade80" opacity="0.55"/>
      <rect x="-3" y="18.5" width="36" height="3.5" rx="1.8" fill="#334155"/>
      <rect x="9" y="21" width="12" height="2" rx="1" fill="#4a5568"/>
    </g>
  </svg>
);

/** Zain — UI/UX Designer · Orange · Stylish hair + Design pen */
const MascotZain = () => (
  <svg viewBox="0 0 110 148" className="lp-mascot-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Shadow */}
    <ellipse cx="55" cy="145" rx="25" ry="5" fill="rgba(0,0,0,0.13)"/>
    {/* Shoes — clean minimalist */}
    <rect x="22" y="127" width="25" height="13" rx="6" fill="#fafaf9"/>
    <rect x="63" y="127" width="25" height="13" rx="6" fill="#fafaf9"/>
    <rect x="22" y="127" width="25" height="4" rx="2" fill="#e7e5e4"/>
    <rect x="63" y="127" width="25" height="4" rx="2" fill="#e7e5e4"/>
    {/* Legs */}
    <rect x="27" y="103" width="19" height="28" rx="8" fill="#1c1917"/>
    <rect x="64" y="103" width="19" height="28" rx="8" fill="#1c1917"/>
    {/* Body — orange sweater */}
    <rect x="16" y="61" width="78" height="48" rx="17" fill="#c2410c"/>
    <path d="M38,61 Q55,75 72,61" fill="#9a3412" stroke="none"/>
    <rect x="16" y="72" width="78" height="2.5" rx="1" fill="#9a3412" opacity="0.6"/>
    <rect x="16" y="78" width="78" height="2.5" rx="1" fill="#9a3412" opacity="0.35"/>
    {/* Left arm */}
    <g transform="rotate(-7,13,82)">
      <rect x="4" y="62" width="18" height="38" rx="9" fill="#c2410c"/>
      <ellipse cx="13" cy="101" rx="9" ry="8" fill="#FBBF72"/>
    </g>
    {/* Right arm — waving */}
    <g className="mascot-arm-wave" style={{transformOrigin:"95px 70px"}}>
      <rect x="88" y="62" width="18" height="37" rx="9" fill="#c2410c" transform="rotate(11,97,80)"/>
      <ellipse cx="101" cy="100" rx="9" ry="8" fill="#FBBF72" transform="rotate(11,97,80)"/>
    </g>
    {/* Neck */}
    <rect x="46" y="52" width="18" height="14" rx="6" fill="#F0A840"/>
    {/* Head */}
    <circle cx="55" cy="33" r="28" fill="#FBBF72"/>
    {/* Ears */}
    <ellipse cx="27" cy="35" rx="5.5" ry="7" fill="#F0A840"/>
    <ellipse cx="83" cy="35" rx="5.5" ry="7" fill="#F0A840"/>
    {/* Earring */}
    <circle cx="83" cy="40" r="2.2" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8"/>
    {/* Stylish swept hair */}
    <path d="M27,30 Q27,4 55,4 Q83,4 83,30 Q78,10 55,10 Q32,10 27,30Z" fill="#3D1A00"/>
    <path d="M27,22 Q42,5 82,11 Q62,7 30,19Z" fill="#5C2E00"/>
    <path d="M78,12 Q88,22 85,38" stroke="#3D1A00" strokeWidth="7" fill="none" strokeLinecap="round"/>
    <path d="M31,14 Q39,8 47,12" stroke="#5C2E00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Fringe detail */}
    <path d="M40,13 Q48,7 56,11" stroke="#4A2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Eyes — thoughtful */}
    <ellipse cx="42" cy="33" rx="6.5" ry="6.5" fill="white" className="mascot-eye-l"/>
    <ellipse cx="68" cy="33" rx="6.5" ry="6.5" fill="white" className="mascot-eye-r"/>
    <circle cx="43" cy="34" r="3.8" fill="#ea580c"/>
    <circle cx="69" cy="34" r="3.8" fill="#ea580c"/>
    <circle cx="43.5" cy="33.5" r="1.9" fill="#0a0a14"/>
    <circle cx="69.5" cy="33.5" r="1.9" fill="#0a0a14"/>
    <circle cx="45.5" cy="32" r="1.2" fill="white"/>
    <circle cx="71.5" cy="32" r="1.2" fill="white"/>
    {/* Eyebrows — one slightly raised (creative look) */}
    <path d="M35,23 Q41,19 49,22" stroke="#3D1A00" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
    <path d="M61,21 Q68,18 75,23" stroke="#3D1A00" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M52,40 Q55,45 58,40" stroke="#D4906A" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    {/* Smirk */}
    <path d="M44,50 Q55,58 66,51" stroke="#C47030" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* Floating design pen + palette */}
    <g className="mascot-accessory" transform="translate(73,-6)">
      {/* Pen */}
      <rect x="9" y="0" width="8" height="24" rx="4" fill="#f59e0b"/>
      <path d="M10.5,24 L13,31 L15.5,24Z" fill="#d97706"/>
      <rect x="15" y="3" width="2.5" height="15" rx="1.2" fill="#d97706"/>
      <rect x="9" y="0" width="8" height="5" rx="4" fill="#92400e"/>
      <circle cx="13" cy="2" r="1.5" fill="#b45309"/>
      {/* Colour swatches */}
      <circle cx="2.5" cy="4.5" r="4" fill="#ef4444"/>
      <circle cx="2.5" cy="14" r="4" fill="#3b82f6"/>
      <circle cx="2.5" cy="23.5" r="4" fill="#22c55e"/>
    </g>
  </svg>
);

/* ══════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════ */

const creators = [
  {
    name: "Huzaifa Naseer",
    role: "Full Stack Developer",
    Mascot: MascotHuzaifa,
    color: "#4299e1",
    desc: "Architected the backend systems and database layer powering HireAtlas.",
  },
  {
    name: "Muhammad Ahmed",
    role: "Frontend Engineer",
    Mascot: MascotAhmed,
    color: "#48bb78",
    desc: "Crafted the user experience and interactive interfaces across the platform.",
  },
  {
    name: "Muhammad Zain Khan",
    role: "UI/UX Designer",
    Mascot: MascotZain,
    color: "#ed8936",
    desc: "Designed the visual language, brand identity and design system for HireAtlas.",
  },
];

const features = [
  { icon: "🎯", title: "Smart Job Matching", desc: "AI-powered matching connects the right talent with the right opportunities instantly." },
  { icon: "⚡", title: "Lightning Fast",    desc: "Post jobs, apply, and get matched in seconds. No bloat, no friction." },
  { icon: "🔒", title: "Secure & Private",  desc: "JWT-secured sessions with role-based access. Your data stays yours." },
  { icon: "📊", title: "Candidate Insights",desc: "See applicant profiles, skills, and experience at a glance." },
  { icon: "🌍", title: "Remote-Ready",      desc: "Filter by remote, hybrid, or on-site. Work from anywhere." },
  { icon: "🛠️", title: "Skill-Based Search",desc: "Filter by tech stack, experience level, salary, and more." },
];

const stats = [
  { value: "10K+", label: "Jobs Posted" },
  { value: "25K+", label: "Developers" },
  { value: "500+", label: "Companies" },
  { value: "98%",  label: "Match Rate" },
];

const steps = [
  {
    num: "01",
    icon: "👤",
    title: "Create Your Profile",
    desc: "Set up your profile with skills, experience, and education. Upload your CV in under 5 minutes.",
  },
  {
    num: "02",
    icon: "🔍",
    title: "Browse or Post Jobs",
    desc: "Employers post opportunities; candidates explore with filters by skill, salary, location and more.",
  },
  {
    num: "03",
    icon: "🤝",
    title: "Connect & Hire",
    desc: "Apply with one click, track applications, and employers review candidates — all in one place.",
  },
];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function LandingPage({ onEnter }) {
  const [dark, setDark]               = useState(true);
  const [scrolled, setScrolled]       = useState(false);
  const [visibleSections, setVisible] = useState(new Set());
  const observerRef                   = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("landingDark");
    if (saved !== null) setDark(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("landingDark", dark);
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((prev) => new Set([...prev, e.target.dataset.section]));
        }),
      { threshold: 0.13 }
    );
    document.querySelectorAll("[data-section]").forEach((el) =>
      observerRef.current.observe(el)
    );
    return () => observerRef.current?.disconnect();
  }, []);

  const vis = (key) => visibleSections.has(key);

  return (
    <div className={`lp-root ${dark ? "lp-dark" : ""}`}>

      {/* ── NAVBAR ── */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark"><span>{"//"}</span></div>
            <span className="lp-logo-text">Hire<span>Atlas</span></span>
          </div>
          <div className="lp-nav-right">
            <button className="lp-theme-btn" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? "☀️" : "🌙"}
            </button>
            <button className="lp-btn lp-btn--ghost" onClick={onEnter}>Sign In</button>
            <button className="lp-btn lp-btn--primary" onClick={onEnter}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-blob lp-blob--a"/>
          <div className="lp-blob lp-blob--b"/>
          <div className="lp-blob lp-blob--c"/>
          <div className="lp-grid-pattern"/>
        </div>

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-pulse"/>
            Smart Hiring Platform
          </div>

          <h1 className="lp-hero-title">
            Find the right talent,<br/>
            <span className="lp-gradient-text">faster than ever</span>
          </h1>

          <p className="lp-hero-sub">
            HireAtlas connects skilled developers with companies that value their craft.
            No noise, no fluff — just intelligent matching that works.
          </p>

          <div className="lp-hero-cta">
            <button className="lp-btn lp-btn--hero" onClick={onEnter}>
              Start Hiring Today <span className="lp-btn-arrow">→</span>
            </button>
            <button className="lp-btn lp-btn--hero-ghost" onClick={onEnter}>
              Browse Jobs
            </button>
          </div>

          <div className="lp-hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="lp-stat">
                <span className="lp-stat-value">{s.value}</span>
                <span className="lp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating cards */}
        <div className="lp-hero-cards">
          <div className="lp-float-card lp-float-card--1">
            <div className="lp-float-card-icon">💼</div>
            <div>
              <div className="lp-float-card-title">Senior React Dev</div>
              <div className="lp-float-card-sub">Acme Corp · Remote · $120k</div>
            </div>
            <div className="lp-float-card-badge">New</div>
          </div>
          <div className="lp-float-card lp-float-card--2">
            <div className="lp-float-card-icon">🎯</div>
            <div>
              <div className="lp-float-card-title">Match Found!</div>
              <div className="lp-float-card-sub">98% compatibility score</div>
            </div>
          </div>
          <div className="lp-float-card lp-float-card--3">
            <div className="lp-float-card-icon">⚡</div>
            <div>
              <div className="lp-float-card-title">24 Applications</div>
              <div className="lp-float-card-sub">In the last 2 hours</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className={`lp-section lp-features ${vis("features") ? "lp-animate-in" : ""}`}
        data-section="features"
      >
        <div className="lp-section-inner">
          <div className="lp-section-label">Why HireAtlas</div>
          <h2 className="lp-section-title">
            Everything you need to hire <span className="lp-gradient-text">smarter</span>
          </h2>
          <p className="lp-section-sub">
            Built by developers, for developers. Every feature is designed to remove friction
            from the hiring process.
          </p>
          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="lp-feature-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="lp-feature-icon-wrap">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className={`lp-section lp-how ${vis("how") ? "lp-animate-in" : ""}`}
        data-section="how"
      >
        <div className="lp-how-bg"/>
        <div className="lp-section-inner">
          <div className="lp-section-label">How It Works</div>
          <h2 className="lp-section-title">
            Three steps to your <span className="lp-gradient-text">perfect match</span>
          </h2>
          <div className="lp-steps">
            {steps.map((step, i) => (
              <div key={step.num} className="lp-step" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
                {i < 2 && <div className="lp-step-connector"/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREATORS ── */}
      <section
        className={`lp-section lp-creators ${vis("creators") ? "lp-animate-in" : ""}`}
        data-section="creators"
      >
        <div className="lp-section-inner">
          <div className="lp-section-label">The Team</div>
          <h2 className="lp-section-title">
            Built with ❤️ by <span className="lp-gradient-text">passionate developers</span>
          </h2>
          <p className="lp-section-sub">
            HireAtlas was created as a passion project to solve real problems in the hiring space.
            Meet the people behind the platform.
          </p>

          <div className="lp-creators-grid">
            {creators.map((c, i) => {
              const { Mascot } = c;
              return (
                <div
                  key={c.name}
                  className="lp-creator-card"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {/* Glow */}
                  <div className="lp-creator-glow" style={{ background: c.color }}/>
                  {/* Spinning dashed ring */}
                  <div className="lp-creator-ring" style={{ borderColor: c.color }}/>

                  {/* Mascot */}
                  <div className="lp-mascot-wrap">
                    <Mascot/>
                  </div>

                  <h3 className="lp-creator-name">{c.name}</h3>
                  <div className="lp-creator-role" style={{ color: c.color }}>{c.role}</div>
                  <p className="lp-creator-desc">{c.desc}</p>
                  <div className="lp-creator-dots">
                    {[...Array(3)].map((_, j) => (
                      <span key={j} className="lp-creator-dot" style={{ background: c.color }}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className={`lp-section lp-cta-banner ${vis("cta") ? "lp-animate-in" : ""}`}
        data-section="cta"
      >
        <div className="lp-cta-bg">
          <div className="lp-blob lp-blob--cta-a"/>
          <div className="lp-blob lp-blob--cta-b"/>
        </div>
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">Ready to find your next opportunity?</h2>
          <p className="lp-cta-sub">
            Join thousands of developers and companies already using HireAtlas.
          </p>
          <div className="lp-cta-btns">
            <button className="lp-btn lp-btn--cta" onClick={onEnter}>Create Free Account →</button>
            <button className="lp-btn lp-btn--cta-ghost" onClick={onEnter}>Sign In Instead</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">
            <div className="lp-logo-mark lp-logo-mark--sm"><span>{"//"}</span></div>
            <span className="lp-logo-text">Hire<span>Atlas</span></span>
          </div>
          <p className="lp-footer-copy">
            © 2026 HireAtlas · Built by Huzaifa Naseer, Muhammad Ahmed &amp; Muhammad Zain Khan
          </p>
          <button className="lp-theme-btn" onClick={() => setDark((d) => !d)}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </footer>
    </div>
  );
}