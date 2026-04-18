import { useState, useRef, useEffect } from 'react'
import './AuthForm.css'
import API from '../../services/api.js';
/* ── SVG Icons ──────────────────────────────────────────────────────────── */
const IconMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const IconEye = ({ open }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

/* ── Password strength ──────────────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

/* ── Floating label field ───────────────────────────────────────────────── */
function Field({ label, type = 'text', value, onChange, error, icon: Icon, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type
  const hasValue = value.length > 0
  const labelUp = focused || hasValue

  return (
    <div className={`af-field${error ? ' af-field--error' : ''}`}>
      <input
        className={`af-input${Icon ? '' : ' af-input--no-icon'}${isPassword ? ' af-input--has-eye' : ''}`}
        type={inputType}
        value={value}
        placeholder={label}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {/* Floating label */}
      <label className={`af-label${Icon ? '' : ' af-label--no-icon'}${labelUp ? ' af-label--up' : ''}`}>
        {label}
      </label>

      {/* Leading icon */}
      {Icon && (
        <span className="af-icon">
          <Icon />
        </span>
      )}

      {/* Eye toggle */}
      {isPassword && (
        <button
          type="button"
          className="af-eye"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <IconEye open={show} />
        </button>
      )}

      {error && <p className="af-error">⚠ {error}</p>}
    </div>
  )
}

/* ── Password strength indicator ────────────────────────────────────────── */
function StrengthMeter({ password }) {
  const strength = getStrength(password)
  if (!password) return null
  return (
    <div className="af-strength">
      <div className="af-strength__bars">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`af-strength__bar${strength >= i ? ` af-strength__bar--${strength}` : ''}`}
          />
        ))}
      </div>
      <span className={`af-strength__label af-strength__label--${strength}`}>
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  )
}

/* ── Main AuthForm ──────────────────────────────────────────────────────── */
export default function AuthForm({ mode, onModeChange,onLogin }) {
  const isLogin = mode === 'login'

  // Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [remember, setRemember] = useState(false)

  // UI state
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Tab pill position
  const tabRef = useRef(null)
  const loginBtnRef = useRef(null)
  const signupBtnRef = useRef(null)
  const [pillStyle, setPillStyle] = useState({ left: '4px', width: '50%' })

  useEffect(() => {
    const active = isLogin ? loginBtnRef.current : signupBtnRef.current
    const wrap = tabRef.current
    if (active && wrap) {
      const wRect = wrap.getBoundingClientRect()
      const aRect = active.getBoundingClientRect()
      setPillStyle({ left: `${aRect.left - wRect.left}px`, width: `${aRect.width}px` })
    }
  }, [mode])

  // Reset form when switching modes
  useEffect(() => {
    setErrors({})
    setSuccess(false)
  }, [mode])

  /* Validation */
  function validate() {
    const errs = {}
    if (!isLogin && !name.trim()) errs.name = 'Name is required'
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email'
    if (password.length < 8) errs.password = 'At least 8 characters'
    if (!isLogin && password !== confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
  e.preventDefault();

  const errs = validate();
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setErrors({});
  setLoading(true);

  try {
    let res;

    if (isLogin) {
      // 🔐 LOGIN
      res = await API.post('/auth/login', {
        email,
        password,
      });

      const { token, message } = res.data;

      localStorage.setItem('token', token); // store JWT
      onLogin();

    } else {
      // 📝 SIGNUP
      res = await API.post('/auth/signup', {
        name,
        email,
        password,
      });

      alert(res.data.message || "Signup successful");
    }

    setSuccess(true);

  } catch (err) {
    console.error("API ERROR:", err);

    const msg =
      err.response?.data?.message ||
      "Something went wrong";

    alert(msg);
  } finally {
    setLoading(false);
  }
}

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.35)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8, letterSpacing: '-0.5px' }}>
          {isLogin ? 'Welcome back!' : 'Account created!'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 28 }}>
          {isLogin ? 'You\'re now signed in to HireAtlas.' : 'Your HireAtlas account is ready to go.'}
        </p>
        <button
          className="af-btn"
          onClick={() => { setSuccess(false); setEmail(''); setPassword(''); setName(''); setConfirm('') }}
        >
          Back to {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Mode tabs ── */}
      <div className="af-tabs" ref={tabRef}>
        <div className="af-tab-pill" style={pillStyle} aria-hidden="true" />
        <button
          type="button"
          ref={loginBtnRef}
          className={`af-tab${isLogin ? ' af-tab--active' : ''}`}
          onClick={() => onModeChange('login')}
        >
          Sign In
        </button>
        <button
          type="button"
          ref={signupBtnRef}
          className={`af-tab${!isLogin ? ' af-tab--active' : ''}`}
          onClick={() => onModeChange('signup')}
        >
          Create Account
        </button>
      </div>

      {/* ── Header ── */}
      <div className="af-header">
        <h2 className="af-title">
          {isLogin ? 'Welcome back' : 'Get started'}
        </h2>
        <p className="af-sub">
          {isLogin
            ? 'Sign in to your HireAtlas workspace'
            : 'Create your free HireAtlas account today'}
        </p>
      </div>

      {/* ── Fields ── */}
      <div className="af-fields">
        {!isLogin && (
          <Field
            label="Full name"
            value={name}
            onChange={v => { setName(v); setErrors(e => ({ ...e, name: '' })) }}
            error={errors.name}
            icon={IconUser}
            autoComplete="name"
          />
        )}

        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: '' })) }}
          error={errors.email}
          icon={IconMail}
          autoComplete="email"
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })) }}
          error={errors.password}
          icon={IconLock}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />

        {!isLogin && <StrengthMeter password={password} />}

        {!isLogin && (
          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: '' })) }}
            error={errors.confirm}
            icon={IconLock}
            autoComplete="new-password"
          />
        )}
      </div>

      {/* ── Meta row ── */}
      {isLogin && (
        <div className="af-meta">
          <label className="af-remember">
            <input
              type="checkbox"
              className="af-check-input"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            <span className="af-check-box" />
            Remember me
          </label>
          <button type="button" className="af-forgot">
            Forgot password?
          </button>
        </div>
      )}

      {/* ── Submit ── */}
      <button type="submit" className="af-btn" disabled={loading} style={{ marginTop: isLogin ? 0 : 18 }}>
        {loading ? (
          <span className="af-spinner" />
        ) : (
          <>
            {isLogin ? 'Sign In' : 'Create Account'}
            <IconArrow />
          </>
        )}
      </button>

      {/* ── Terms (signup only) ── */}
      {!isLogin && (
        <p className="af-terms">
          By creating an account, you agree to our{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>
      )}

      {/* ── Mode switch ── */}
      <p className="af-switch">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          className="af-switch__link"
          onClick={() => onModeChange(isLogin ? 'signup' : 'login')}
        >
          {isLogin ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </form>
  )
}
