import './LoadingScreen.css'

export default function LoadingScreen({ fadeOut }) {
  return (
    <div className={`ls-root${fadeOut ? ' ls-root--fading' : ''}`}>
      <div className="ls-blob ls-blob--a" />
      <div className="ls-blob ls-blob--b" />
      <div className="ls-grid" />

      <div className="ls-center">
        {/* Logo mark */}
        <div className="ls-mark">
          <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 32L14 10H18L10 32H6Z" fill="white" fillOpacity="0.9"/>
            <path d="M16 32L24 10H28L20 32H16Z" fill="white" fillOpacity="0.55"/>
            <circle cx="30" cy="11" r="4" fill="#6b9fe8"/>
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="ls-wordmark">
          Hire<span>Atlas</span>
        </h1>

        <p className="ls-tagline">Smart Hiring Platform</p>

        {/* Progress bar */}
        <div className="ls-bar-track">
          <div className="ls-bar-fill" />
        </div>
      </div>
    </div>
  )
}
