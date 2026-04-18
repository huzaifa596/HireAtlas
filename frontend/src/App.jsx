import { useState, useEffect } from 'react'
import LoadingScreen from './components/LoginSignup/LoadingScreen'
import AuthPage from './components/LoginSignup/AuthPage'
import Dashboard from './components/Dashboard/Dashboard'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200)
    const doneTimer = setTimeout(() => setLoading(false), 2700)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [])

  return (
    <>
      {loading && <LoadingScreen fadeOut={fadeOut} />}
      {!loading && !isAuthenticated && (
        <AuthPage onLogin={() => setIsAuthenticated(true)} />
      )}
      {!loading && isAuthenticated && <Dashboard />}
    </>
  )
}