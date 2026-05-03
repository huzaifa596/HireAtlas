const TOKEN_KEY      = 'token';
const LAST_ACTIVE_KEY = 'lastActive';
const TIMEOUT_MS     = 10 * 60 * 1000; // 10 minutes

export const saveSession = (token) => {
  localStorage.setItem(TOKEN_KEY,       token);
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
};

export const refreshSession = () => {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
};

export const isSessionValid = () => {
  const token      = localStorage.getItem(TOKEN_KEY);
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);

  if (!token || !lastActive) return false;

  const elapsed = Date.now() - parseInt(lastActive);
  return elapsed < TIMEOUT_MS;
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
};