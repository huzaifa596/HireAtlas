import { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './components/LoginSignup/LoadingScreen';
import AuthPage      from './components/LoginSignup/AuthPage';
import Dashboard     from './components/Dashboard/Dashboard';
import { isSessionValid, refreshSession, clearSession } from './services/auth';
import LandingPage from './components/landingpage/landingpage';

const TIMEOUT_MS = 10 * 60 * 1000; 

export default function App() {
  const [loading,setLoading]  = useState(true);
  const [fadeOut,         setFadeOut]         = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem('darkMode') === 'true';
});
const [showLanding, setShowLanding] = useState(true);

 
  const logout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
  }, []);

  
  useEffect(() => {
    if (isSessionValid()) {
      refreshSession();        
      setIsAuthenticated(true);
    } else {
      clearSession();          
      setIsAuthenticated(false);
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const doneTimer = setTimeout(() => setLoading(false), 2700);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, []);


  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated, logout]);

useEffect(() => {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  localStorage.setItem('darkMode', darkMode);
}, [darkMode]);

 return (
  <>
    {showLanding && !isAuthenticated && (
      <LandingPage onEnter={() => setShowLanding(false)} />
    )}
    {!showLanding && loading && <LoadingScreen fadeOut={fadeOut} />}
    {!showLanding && !loading && !isAuthenticated && (
      <AuthPage onLogin={() => setIsAuthenticated(true)} />
    )}
    {!loading && isAuthenticated && (
      <Dashboard onLogout={() => { setShowLanding(true); logout(); }} darkMode={darkMode} setDarkMode={setDarkMode} />
    )}
  </>
);
}