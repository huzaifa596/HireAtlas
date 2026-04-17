/**
 * AccountTypeSelector.jsx
 * The HireAtlas USP: Job Seeker / Employer / Both (highlighted as key differentiator).
 * Animated card selection with glowing "Both" option.
 */

import { motion } from "framer-motion";
import "./AccountTypeSelector.css";

const TYPES = [
  {
    id: "seeker",
    label: "Job Seeker",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    desc: "Discover & apply to opportunities",
    highlight: false,
  },
  {
    id: "employer",
    label: "Employer",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    desc: "Post jobs & find great talent",
    highlight: false,
  },
  {
    id: "both",
    label: "Both",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    desc: "The HireAtlas advantage — do it all",
    highlight: true,  // ← USP differentiator
  },
];

export default function AccountTypeSelector({ value, onChange }) {
  return (
    <div className="ats-root">
      <p className="ats-label">I want to…</p>
      <div className="ats-grid">
        {TYPES.map((t) => {
          const active = value === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              className={`ats-card ${active ? "ats-card--active" : ""} ${t.highlight ? "ats-card--highlight" : ""}`}
              onClick={() => onChange(t.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              aria-pressed={active}
            >
              {/* "Best" badge on the Both option */}
              {t.highlight && (
                <span className="ats-badge">
                  ✦ Unique
                </span>
              )}

              <span className={`ats-icon ${active && t.highlight ? "ats-icon--gold" : active ? "ats-icon--active" : ""}`}>
                {t.icon}
              </span>

              <span className="ats-card__label">{t.label}</span>
              <span className="ats-card__desc">{t.desc}</span>

              {/* Active ring */}
              {active && (
                <motion.div
                  className={`ats-card__ring ${t.highlight ? "ats-card__ring--gold" : ""}`}
                  layoutId="ats-ring"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
