/**
 * SignIn/SignInForm.jsx
 * White & Blue Gradient Theme — Plus Jakarta Sans font.
 * Social auth (Google + LinkedIn), email/password, remember me, forgot password.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import InputField    from "../Shared/InputField.jsx";
import PasswordField from "../Shared/PasswordField.jsx";
import Button        from "../Shared/Button.jsx";
import "../Shared/Shared.css";
import "./SignInForm.css";
import "../../../services/api.js"; 
import API from "../../../services/api.js";

// ── Validation ────────────────────────────────────────────────────────────
function validate({ email, password }) {
  const errors = {};
  if (!email)                           errors.email    = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email    = "Enter a valid email address";
  if (!password)                        errors.password = "Password is required";
  else if (password.length < 6)         errors.password = "Password must be at least 6 characters";
  return errors;
}

// ── Google icon ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── LinkedIn icon ─────────────────────────────────────────────────────────
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function SignInForm({ onSwitch }) {
  const [fields, setFields]     = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: "" }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate(fields);
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setLoading(true);

  try {
    const res = await API.post("/auth/login", {
      email: fields.email,
      password: fields.password,
    });

    console.log("Login response:", res.data);

    const { status, message, token, user } = res.data;

    alert(message);

    localStorage.setItem("token", token);

    console.log("User:", user);

    // TODO: redirect to dashboard
    // navigate("/dashboard");

  } catch (err) {
    console.log(err);

    setErrors({
      email: "Invalid credentials. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="sif-root">
      <div className="sif-header">
        <h2 className="sif-title">Welcome back</h2>
        <p className="sif-sub">Sign in to continue your journey</p>
      </div>

      {/* Social auth */}
      <div className="sif-social">
        <Button variant="social" icon={<GoogleIcon />} type="button">
          Google
        </Button>
        <Button variant="social" icon={<LinkedInIcon />} type="button">
          LinkedIn
        </Button>
      </div>

      <div className="sif-divider">
        <span className="sif-divider__line" />
        <span className="sif-divider__text">or continue with email</span>
        <span className="sif-divider__line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email address"
          type="email"
          name="email"
          value={fields.email}
          onChange={set("email")}
          error={errors.email}
          autoFocus
          autoComplete="email"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          }
        />

        <PasswordField
          label="Password"
          name="password"
          value={fields.password}
          onChange={set("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        {/* Remember + Forgot */}
        <div className="sif-meta">
          <label className="sif-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="sif-check"
            />
            <span className="sif-check-custom" />
            <span>Remember me</span>
          </label>
          <button type="button" className="sif-forgot">
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="primary" loading={loading}>
          Sign in to HireAtlas
        </Button>
      </form>

      <p className="sif-switch">
        New to HireAtlas?{" "}
        <button type="button" onClick={onSwitch} className="sif-switch__link">
          Create an account
        </button>
      </p>
    </div>
  );
}