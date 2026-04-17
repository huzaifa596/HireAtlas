/**
 * AuthContainer.jsx
 * Split-screen auth layout: 42% visual storytelling / 58% form.
 * White & Blue Gradient Theme — Plus Jakarta Sans font.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignInForm from "../SignIn/SignInForm.jsx";
import SignUpForm from "../SignUp/SignUpForm.jsx";
import "./AuthContainer.css";

// ── Stats ──────────────────────────────────────────────────────────────────
const STATS = [
  { value: "50K+", label: "Hires Made" },
  { value: "12K+", label: "Jobs Active" },
  { value: "4.9★", label: "Avg Rating" },
];

const TESTIMONIALS = [
  { quote: "Found my dream role in 4 days.", name: "Sara K.", role: "Senior Designer" },
  { quote: "Hired 3 brilliant engineers in a week.", name: "James T.", role: "CTO at Nexus" },
  { quote: "The dual account is a game-changer.", name: "Aisha M.", role: "Freelance & Founder" },
];

// ── Panel animation variants ───────────────────────────────────────────────
const panelVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] },
  }),
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AuthContainer() {
  const [mode, setMode] = useState("signin");
  const [dir, setDir] = useState(1);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const switchMode = (next) => {
    if (next === mode) return;
    setDir(next === "signup" ? 1 : -1);
    setMode(next);
  };

  // Rotate testimonials every 4s
  useState(() => {
    const iv = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(iv);
  });

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="ac-root">
      {/* ── Left: Visual storytelling ──────────────────────────── */}
      <div className="ac-left">
        {/* Gradient glows */}
        <div className="ac-left__glow ac-left__glow--gold" />
        <div className="ac-left__glow ac-left__glow--teal" />

        {/* Logo — placeholder box + wordmark */}
        <div className="ac-logo">
          <span className="ac-logo__mark">HA</span>
          <span className="ac-logo__name">
            Hire<span className="ac-logo__accent">Atlas</span>
          </span>
        </div>

        {/* Headline — caption + large text, no paragraph body */}
        <div className="ac-left__hero">
          <p className="ac-left__caption">Career Platform</p>
          <h2 className="ac-left__headline">
            One account.<br />
            Infinite<br />
            <em>possibilities.</em>
          </h2>
        </div>

        {/* Stats row */}
        <div className="ac-stats">
          {STATS.map((s) => (
            <div key={s.label} className="ac-stat">
              <span className="ac-stat__value">{s.value}</span>
              <span className="ac-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Rotating testimonial */}
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonialIdx}
            className="ac-testimonial"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <p className="ac-testimonial__quote">"{t.quote}"</p>
            <div className="ac-testimonial__author">
              <span className="ac-testimonial__avatar">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="ac-testimonial__name">{t.name}</p>
                <p className="ac-testimonial__role">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative grid */}
        <div className="ac-grid" aria-hidden="true" />
      </div>

      {/* ── Right: Auth form ───────────────────────────────────── */}
      <div className="ac-right">
        <div className="ac-form-wrapper">
          {/* Toggle tabs */}
          <div className="ac-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "signin"}
              className={`ac-toggle__btn ${mode === "signin" ? "ac-toggle__btn--active" : ""}`}
              onClick={() => switchMode("signin")}
            >
              Sign In
            </button>
            <button
              role="tab"
              aria-selected={mode === "signup"}
              className={`ac-toggle__btn ${mode === "signup" ? "ac-toggle__btn--active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>
            {/* Sliding pill indicator */}
            <motion.div
              className="ac-toggle__pill"
              animate={{ x: mode === "signup" ? "100%" : "0%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Animated panel */}
          <div className="ac-panel-container">
            <AnimatePresence mode="wait" custom={dir}>
              {mode === "signin" ? (
                <motion.div
                  key="signin"
                  custom={dir}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="ac-panel"
                >
                  <SignInForm onSwitch={() => switchMode("signup")} />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  custom={dir}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="ac-panel"
                >
                  <SignUpForm onSwitch={() => switchMode("signin")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
