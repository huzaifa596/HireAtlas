/**
 * Shared/InputField.jsx
 * Floating-label input with real-time validation feedback.
 * Supports error shake animation via Framer Motion.
 */

import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import "./Shared.css";

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
};

export default function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  icon,
  autoFocus,
  autoComplete,
  placeholder = " ",
}) {
  const [focused, setFocused] = useState(false);
  const controls = useAnimationControls();

  // Trigger shake whenever error changes to a truthy value
  useState(() => {
    if (error) controls.start("shake");
  }, [error]);

  const hasValue = value && value.length > 0;
  const labelUp = focused || hasValue;

  return (
    <motion.div
      className={`sf-field ${error ? "sf-field--error" : ""} ${focused ? "sf-field--focused" : ""}`}
      variants={shakeVariants}
      animate={controls}
    >
      {/* Icon slot */}
      {icon && <span className="sf-field__icon">{icon}</span>}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className={`sf-input ${icon ? "sf-input--icon" : ""}`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {/* Floating label */}
      <label
        htmlFor={name}
        className={`sf-label ${labelUp ? "sf-label--up" : ""} ${icon ? "sf-label--icon" : ""}`}
      >
        {label}
      </label>

      {/* Animated focus border */}
      <motion.div
        className="sf-field__border"
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
      />

      {/* Validation icon */}
      {hasValue && !error && !focused && (
        <motion.span
          className="sf-field__valid"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          ✓
        </motion.span>
      )}

      {/* Error message */}
      {error && (
        <motion.p
          id={`${name}-error`}
          className="sf-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
