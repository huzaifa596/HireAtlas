const TOKEN_KEY       = 'token';
const LAST_ACTIVE_KEY = 'lastActive';
const TIMEOUT_MS      = 10 * 60 * 1000; // 10 minutes

export const saveSession = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString()); // ← sessionStorage
};

export const refreshSession = () => {
  sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString()); // ← sessionStorage
};

export const isSessionValid = () => {
  const token      = localStorage.getItem(TOKEN_KEY);
  const lastActive = sessionStorage.getItem(LAST_ACTIVE_KEY);     // ← sessionStorage

  if (!token || !lastActive) return false;

  const elapsed = Date.now() - parseInt(lastActive);
  return elapsed < TIMEOUT_MS;
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LAST_ACTIVE_KEY);                      // ← sessionStorage
};