/**
 * Shared/PasswordField.jsx
 * Password input with:
 *  - Eye toggle (show/hide)
 *  - Optional strength meter (shown when showStrength prop is true)
 *  - Shake on error via Framer Motion
 */

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Shared.css";

// ── Password strength scorer ───────────────────────────────────────────────

function scorePassword(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Too weak",  color: "#F87171" },
    { label: "Weak",      color: "#FB923C" },
    { label: "Fair",      color: "#FBBF24" },
    { label: "Good",      color: "#34D399" },
    { label: "Strong",    color: "#10B981" },
    { label: "Very strong", color: "#059669" },
  ];

  return { score, ...levels[Math.min(score, levels.length - 1)] };
}

// ── Eye icon ──────────────────────────────────────────────────────────────

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PasswordField({
  label = "Password",
  name = "password",
  value,
  onChange,
  error,
  showStrength = false,
  autoFocus,
  autoComplete = "current-password",
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const hasValue = value && value.length > 0;
  const labelUp  = focused || hasValue;
  const strength = showStrength ? scorePassword(value) : null;

  return (
    <div className={`sf-field ${error ? "sf-field--error" : ""} ${focused ? "sf-field--focused" : ""}`}>
      {/* Lock icon */}
      <span className="sf-field__icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </span>

      <input
        id={`${id}-${name}`}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className="sf-input sf-input--icon sf-input--password"
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      <label
        htmlFor={`${id}-${name}`}
        className={`sf-label sf-label--icon ${labelUp ? "sf-label--up" : ""}`}
      >
        {label}
      </label>

      {/* Focus border */}
      <motion.div
        className="sf-field__border"
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
      />

      {/* Toggle visibility */}
      <button
        type="button"
        className="sf-eye"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        <EyeIcon open={visible} />
      </button>

      {/* Error */}
      {error && (
        <motion.p
          id={`${name}-error`}
          className="sf-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          {error}
        </motion.p>
      )}

      {/* Strength meter */}
      <AnimatePresence>
        {showStrength && hasValue && (
          <motion.div
            className="sf-strength"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="sf-strength__bars">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.div
                  key={n}
                  className="sf-strength__bar"
                  animate={{
                    background: strength.score >= n ? strength.color : "rgba(255,255,255,0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            <span className="sf-strength__label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
