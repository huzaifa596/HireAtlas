import { useState } from 'react'
import './AuthPage.css'
import AuthForm from './AuthForm'

const LogoIcon = () => (
  <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 22L9.5 6H13L6.5 22H3Z" fill="white" fillOpacity="0.95"/>
    <path d="M11 22L17.5 6H21L14.5 22H11Z" fill="white" fillOpacity="0.5"/>
    <circle cx="22" cy="7" r="3.5" fill="#6b9fe8"/>
  </svg>
)

const PILLS = ['AI-Matched Candidates', 'Smart Screening', 'Real-time Analytics']

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'

  return (
    <div className="ap-root">
      {/* ── Left brand panel ── */}
      <aside className="ap-left">
        <div className="ap-blob ap-blob--a" />
        <div className="ap-blob ap-blob--b" />
        <div className="ap-grid" />

        {/* Logo */}
        <div className="ap-logo">
          <div className="ap-logo__mark">
            <LogoIcon />
          </div>
          <div className="ap-logo__name">
            Hire<span>Atlas</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="ap-hero">
          <p className="ap-eyebrow">Smart Hiring Platform</p>
          <h1 className="ap-headline">
            Find the right<br />
            talent,&nbsp;<em>faster</em>
          </h1>
          <p className="ap-sub">
            HireAtlas uses intelligent matching to connect you with candidates
            who genuinely fit — not just on paper.
          </p>
        </div>

        {/* Feature pills */}
        <div className="ap-pills">
          {PILLS.map(pill => (
            <div className="ap-pill" key={pill}>
              <div className="ap-pill__dot" />
              <span className="ap-pill__text">{pill}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="ap-quote">
          <p className="ap-quote__text">
            "We cut our time-to-hire by 60% in the first month. HireAtlas doesn't just
            find candidates — it finds the right ones."
          </p>
          <div className="ap-quote__author">
            <div className="ap-quote__avatar">SR</div>
            <div>
              <p className="ap-quote__name">Sofia Rahman</p>
              <p className="ap-quote__role">Head of Talent · Nexus Labs</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="ap-right">
        <div className="ap-form-wrap">
          <AuthForm mode={mode} onModeChange={setMode} />
        </div>
      </main>
    </div>
  )
}
