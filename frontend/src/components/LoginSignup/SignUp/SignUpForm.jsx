/**
 * SignUp/SignUpForm.jsx
 * White & Blue Gradient Theme — Plus Jakarta Sans font.
 * Two-step sign-up: Step 1 (credentials) → Step 2 (account type).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputField          from "../Shared/InputField.jsx";
import PasswordField       from "../Shared/PasswordField.jsx";
import Button              from "../Shared/Button.jsx";
import AccountTypeSelector from "./AccountTypeSelector.jsx";
import "../Shared/Shared.css";
import "./SignUpForm.css";

// ── Validation ────────────────────────────────────────────────────────────
function validateStep1({ fullName, email, phone, password, confirmPassword }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2)   errors.fullName = "Enter your full name";
  if (!email)                                     errors.email    = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email))           errors.email    = "Enter a valid email";
  if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) errors.phone = "Enter a valid phone number";
  if (!password)                                  errors.password = "Password is required";
  else if (password.length < 8)                   errors.password = "Minimum 8 characters";
  if (!confirmPassword)                           errors.confirmPassword = "Confirm your password";
  else if (confirmPassword !== password)          errors.confirmPassword = "Passwords do not match";
  return errors;
}

function validateStep2({ accountType, terms }) {
  const errors = {};
  if (!accountType) errors.accountType = "Please select an account type";
  if (!terms)       errors.terms       = "You must accept the terms to continue";
  return errors;
}

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  return (
    <div className="suf-steps">
      {[1, 2].map((n) => (
        <div key={n} className="suf-step">
          <motion.div
            className={`suf-step__dot ${step >= n ? "suf-step__dot--active" : ""} ${step > n ? "suf-step__dot--done" : ""}`}
            animate={step >= n ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {step > n ? "✓" : n}
          </motion.div>
          <span className={`suf-step__label ${step >= n ? "suf-step__label--active" : ""}`}>
            {n === 1 ? "Account" : "Profile"}
          </span>
        </div>
      ))}
      <div className={`suf-steps__bar ${step === 2 ? "suf-steps__bar--full" : ""}`} />
    </div>
  );
}

// ── Step panel variants ───────────────────────────────────────────────────
const stepVariants = {
  enter:  { x: 50, opacity: 0, filter: "blur(4px)" },
  center: { x: 0, opacity: 1, filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:   { x: -50, opacity: 0, filter: "blur(4px)",
    transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] } },
};

// ── Component ─────────────────────────────────────────────────────────────
export default function SignUpForm({ onSwitch }) {
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState({
    fullName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    accountType: "both",
    terms: false,
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFields((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: "" }));
  };

  const handleNext = () => {
    const errs = validateStep1(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Sign up payload:", fields);
    } catch (err) {
      setErrors({ terms: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suf-root">
      <div className="suf-header">
        <h2 className="suf-title">Start your journey</h2>
        <p className="suf-sub">Join 50,000+ professionals on HireAtlas</p>
      </div>

      <StepIndicator step={step} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="suf-panel-wrap">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="suf-step-panel"
              >
                <InputField
                  label="Full name"
                  name="fullName"
                  value={fields.fullName}
                  onChange={set("fullName")}
                  error={errors.fullName}
                  autoFocus
                  autoComplete="name"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  }
                />

                <InputField
                  label="Email address"
                  type="email"
                  name="email"
                  value={fields.email}
                  onChange={set("email")}
                  error={errors.email}
                  autoComplete="email"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  }
                />

                <InputField
                  label="Phone (optional)"
                  type="tel"
                  name="phone"
                  value={fields.phone}
                  onChange={set("phone")}
                  error={errors.phone}
                  autoComplete="tel"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  }
                />

                <PasswordField
                  label="Password"
                  name="password"
                  value={fields.password}
                  onChange={set("password")}
                  error={errors.password}
                  showStrength
                  autoComplete="new-password"
                />

                <PasswordField
                  label="Confirm password"
                  name="confirmPassword"
                  value={fields.confirmPassword}
                  onChange={set("confirmPassword")}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />

                <Button type="button" variant="primary" onClick={handleNext}>
                  Continue →
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="suf-step-panel"
              >
                <AccountTypeSelector
                  value={fields.accountType}
                  onChange={(v) => {
                    setFields((f) => ({ ...f, accountType: v }));
                    if (errors.accountType) setErrors((e) => ({ ...e, accountType: "" }));
                  }}
                />
                {errors.accountType && (
                  <p className="sf-error" style={{ marginTop: -12, marginBottom: 12 }}>
                    {errors.accountType}
                  </p>
                )}

                {/* Terms */}
                <label className="suf-terms">
                  <input
                    type="checkbox"
                    checked={fields.terms}
                    onChange={set("terms")}
                    className="sif-check"
                  />
                  <span className="sif-check-custom" />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" className="suf-link">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy" className="suf-link">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && <p className="sf-error">{errors.terms}</p>}

                <div className="suf-actions">
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    ← Back
                  </Button>
                  <Button type="submit" variant="primary" loading={loading}>
                    Join HireAtlas
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      <p className="suf-switch">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="sif-switch__link">
          Sign in
        </button>
      </p>
    </div>
  );
}
