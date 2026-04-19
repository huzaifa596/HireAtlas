// components/FormInput.jsx
import React from "react";

/**
 * FormInput — styled input / select / textarea / file for profile forms.
 *
 * Props:
 *   label        string
 *   type         "text"|"email"|"tel"|"number"|"date"|"select"|"textarea"|"file"
 *   value        any
 *   onChange     fn
 *   options      array    [string] or [{ value, label }]  — for type="select"
 *   required     bool
 *   placeholder  string
 *   error        string
 *   rows         number   for textarea
 *   accept       string   for file input  e.g. ".pdf,.doc,.docx"
 *   name         string   used to build element id
 */
const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  options = [],
  required = false,
  placeholder = "",
  error,
  rows = 3,
  accept,
  name,
}) => {
  const id = `fi-${name || label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`form-input ${error ? "form-input--error" : ""}`}>
      {label && (
        <label htmlFor={id} className="form-input__label">
          {label}
          {required && <span className="form-input__required">*</span>}
        </label>
      )}

      {type === "select" ? (
        <select id={id} className="form-input__control" value={value} onChange={onChange}>
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>

      ) : type === "textarea" ? (
        <textarea
          id={id}
          className="form-input__control"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />

      ) : type === "file" ? (
        /* File inputs are uncontrolled — no value prop */
        <input
          id={id}
          type="file"
          className="form-input__control form-input__control--file"
          onChange={onChange}
          accept={accept}
        />

      ) : (
        <input
          id={id}
          type={type}
          className="form-input__control"
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}

      {error && <span className="form-input__error-msg">{error}</span>}
    </div>
  );
};

export default FormInput;
