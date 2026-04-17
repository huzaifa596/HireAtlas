import { useState, useEffect } from 'react'
// To these:
import LoadingScreen from './components/LoginSignup/LoadingScreen'
import AuthPage from './components/LoginSignup/AuthPage'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show loader for 2.2 s, then fade out over 0.5 s
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200)
    const doneTimer = setTimeout(() => setLoading(false), 2700)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [])

  return (
    <>
      {loading && <LoadingScreen fadeOut={fadeOut} />}
      {!loading && <AuthPage />}
    </>
  )
}
