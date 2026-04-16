import { useState, useCallback } from "react";
import { InputField, SocialButtons } from "./components";
import { isValidEmail, getStrength, strengthColors } from "./utils";

export default function SignUpPanel({ flipped, onFlip }) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [loading, setLoading] = useState(false);
  const [valid,   setValid]   = useState({ name: null, email: null, pass: null });

  const strength = getStrength(pass);

  const handleSubmit = useCallback(() => {
    const nameOk  = name.trim().length >= 2;
    const emailOk = isValidEmail(email);
    const passOk  = pass.length >= 8;
    setValid({ name: nameOk, email: emailOk, pass: passOk });
    if (!nameOk || !emailOk || !passOk) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }, [name, email, pass]);

  return (
    <div className={`form-panel signup-panel${flipped ? " flipped" : ""}`}>
      <h1>Create account</h1>
      <p className="panel-subtitle">Join us — it only takes a minute</p>

      <SocialButtons />
      <div className="or-divider">or with email</div>

      <InputField
        type="text"
        placeholder="Full name"
        autoComplete="name"
        value={name}
        onChange={e => setName(e.target.value)}
        icon="far fa-user"
        validity={valid.name}
      />
      <InputField
        type="email"
        placeholder="Email address"
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        icon="far fa-envelope"
        validity={valid.email}
      />
      <InputField
        type="password"
        placeholder="Password"
        autoComplete="new-password"
        value={pass}
        onChange={e => setPass(e.target.value)}
        icon="fas fa-lock"
        validity={valid.pass}
      />

      {/* Password strength indicator */}
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${(strength / 4) * 100}%`,
            background: strengthColors[strength] || "transparent",
          }}
        />
      </div>

      <button
        className={`btn-primary${loading ? " loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        <span className="btn-text">Create Account</span>
      </button>

      <p className="terms">
        By signing up you agree to our <a href="#">Terms</a> and{" "}
        <a href="#">Privacy Policy</a>
      </p>
      <p className="mobile-switch">
        Have an account? <span onClick={() => onFlip(false)}>Sign in</span>
      </p>
    </div>
  );
}
