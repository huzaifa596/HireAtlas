import { useState, useCallback } from "react";
import { InputField, SocialButtons } from "./components";
import { isValidEmail } from "./LoginSignup/utils";

export default function SignInPanel({ flipped, onFlip }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState({ email: null, pass: null });

  const handleSubmit = useCallback(() => {
    const emailOk = isValidEmail(email);
    const passOk = pass.length >= 6;
    setValid({ email: emailOk, pass: passOk });
    if (!emailOk || !passOk) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }, [email, pass]);

  return (
    <div className={`form-panel signin-panel${flipped ? " flipped" : ""}`}>
      <h1>Welcome back</h1>
      <p className="panel-subtitle">Sign in to continue your journey</p>

      <SocialButtons />
      <div className="or-divider">or with email</div>

      <InputField
        type="email"
        placeholder="Email address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon="far fa-envelope"
        validity={valid.email}
      />
      <InputField
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        icon="fas fa-lock"
        validity={valid.pass}
      />

      <div className="helper-row">
        <a href="#">Forgot password?</a>
      </div>

      <button
        className={`btn-primary${loading ? " loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        <span className="btn-text">Sign In</span>
      </button>

      <p className="mobile-switch">
        No account? <span onClick={() => onFlip(true)}>Sign up</span>
      </p>
    </div>
  );
}
