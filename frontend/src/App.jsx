import { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './components/LoginSignup/LoadingScreen';
import AuthPage      from './components/LoginSignup/AuthPage';
import Dashboard     from './components/Dashboard/Dashboard';
import { isSessionValid, refreshSession, clearSession } from './services/auth';

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export default function App() {
  const [loading,         setLoading]         = useState(true);
  const [fadeOut,         setFadeOut]         = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Logout helper ──
  const logout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
  }, []);

  // ── Check session on app load ──
  useEffect(() => {
    if (isSessionValid()) {
      refreshSession();        // reset the 10 min timer on refresh
      setIsAuthenticated(true);
    } else {
      clearSession();          // clean up any stale data
      setIsAuthenticated(false);
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const doneTimer = setTimeout(() => setLoading(false), 2700);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, []);

  // ── Auto logout after 10 min inactivity ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated, logout]);



  return (
    <>
      {loading && <LoadingScreen fadeOut={fadeOut} />}
      {!loading && !isAuthenticated && (
        <AuthPage onLogin={() => {
          refreshSession();
          setIsAuthenticated(true);
        }} />
      )}
{!loading && isAuthenticated && (
  <Dashboard onLogout={logout} />
)}
    </>
  );
}