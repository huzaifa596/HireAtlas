/**
 * Shared/Button.jsx
 * Primary and secondary button variants with loading state.
 */

import { motion } from "framer-motion";
import "./Shared.css";

function Spinner() {
  return (
    <svg className="btn-spinner" viewBox="0 0 24 24" fill="none" width="16" height="16">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

export default function Button({
  children,
  type = "button",
  variant = "primary",   // "primary" | "ghost" | "social"
  loading = false,
  disabled = false,
  onClick,
  icon,
  className = "",
}) {
  return (
    <motion.button
      type={type}
      className={`ha-btn ha-btn--${variant} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled && !loading ? { y: -2, boxShadow: "0 8px 30px rgba(245, 158, 11, 0.25)" } : {}}
      whileTap={!disabled && !loading ? { y: 0, scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      {loading ? (
        <>
          <Spinner />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
