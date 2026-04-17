/**
 * LoadingScreen.jsx
 * White & Blue Gradient Theme — 2.5s entry animation before auth page.
 * Navy-to-blue gradient background, blue-tinted glow blobs.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LoadingScreen.css";

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  enter: { opacity: 1 },
  exit: {
    opacity: 0,
    filter: "blur(12px)",
    scale: 1.04,
    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
  },
};

const logoLetterVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const taglineVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.85, duration: 0.6, ease: "easeOut" },
  },
};

const barVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 1.0, duration: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const dotVariants = {
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.4, 1, 0.4],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
};

// ── Component ───────────────────────────────────────────────────────────────

export default function LoadingScreen({ onComplete }) {
   const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);      // Start exit animation
      // Call onComplete after exit animation finishes (700ms)
      setTimeout(onComplete, 700);  
    }, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const logoText = "HireAtlas";

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="ls-root"
          variants={containerVariants}
          initial="enter"
          animate="enter"
          exit="exit"
        >
          {/* Ambient glow blobs — blue tones */}
          <div className="ls-blob ls-blob--gold" />
          <div className="ls-blob ls-blob--teal" />

          <div className="ls-center">
            {/* Logo placeholder monogram */}
            <motion.div
              className="ls-monogram"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              HA
            </motion.div>

            {/* Wordmark with per-letter stagger */}
            <h1 className="ls-wordmark" aria-label="HireAtlas">
              {logoText.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={logoLetterVariants}
                  initial="hidden"
                  animate="visible"
                  // "Atlas" starts at index 4 — accent colour via CSS class
                  className={i >= 4 ? "ls-wordmark--accent" : ""}
                >
                  {char}
                </motion.span>
              ))}
            </h1>

            {/* Platform caption tagline */}
            <motion.p
              className="ls-tagline"
              variants={taglineVariants}
              initial="hidden"
              animate="visible"
            >
              Where Careers Take Flight
            </motion.p>

            {/* Progress bar */}
            <div className="ls-bar-track">
              <motion.div
                className="ls-bar-fill"
                variants={barVariants}
                initial="hidden"
                animate="visible"
                style={{ originX: 0 }}
              />
            </div>

            {/* Pulse dots */}
            <div className="ls-dots">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span
                  key={i}
                  className="ls-dot"
                  variants={dotVariants}
                  animate="animate"
                  transition={{ delay }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
