// Email validation
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password strength score: 0–4
export function getStrength(pass) {
  let score = 0;
  if (pass.length >= 8)              score++;
  if (/[A-Z]/.test(pass))            score++;
  if (/[0-9]/.test(pass))            score++;
  if (/[^A-Za-z0-9]/.test(pass))     score++;
  return score;
}

// Colors mapped to strength score
export const strengthColors = {
  0: "transparent",
  1: "#e74c3c",   // weak   — red
  2: "#e67e22",   // fair   — orange
  3: "#f1c40f",   // good   — yellow
  4: "#2ecc71",   // strong — green
};