// sections/PersonalInfoSection.jsx
import React, { useState, useRef } from "react";
import SectionCard from "./SectionCard";
import FormInput from "./FormInput";
import API from '../../services/api';
// import { updateUserProfile } from "../services/profileApi"; // uncomment when backend ready

/**
 * PersonalInfoSection
 *
 * Handles: name, email, phone, age, CV download + CV replace/upload.
 * CV upload sends multipart/form-data to the backend via updateUserProfile().
 */
const PersonalInfoSection = ({ user, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [feedback,  setFeedback]  = useState(null);

  // Form field state
  const [form, setForm] = useState({ ...user });

  // CV file state — kept separate from form because it's a File object
  const [cvFile,     setCvFile]     = useState(null);   // selected File object
  const [cvPreview,  setCvPreview]  = useState(null);   // display name shown in UI
  const [errors,     setErrors]     = useState({});

  const cvInputRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  // ── Edit / Cancel ─────────────────────────────────────────────────────────────
  const handleEdit = () => {
    setForm({ ...user });
    setCvFile(null);
    setCvPreview(null);
    setErrors({});
    setFeedback(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm({ ...user });
    setCvFile(null);
    setCvPreview(null);
    setErrors({});
    setIsEditing(false);
  };

  // ── CV file selection ─────────────────────────────────────────────────────────
  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, cv: "Only PDF or Word documents are accepted." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cv: "File must be smaller than 5 MB." }));
      return;
    }

    setCvFile(file);
    setCvPreview(file.name);
    setErrors((prev) => ({ ...prev, cv: undefined }));
  };

  const handleRemoveCvSelection = () => {
    setCvFile(null);
    setCvPreview(null);
    if (cvInputRef.current) cvInputRef.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name?.trim())  errs.name  = "Name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (form.age && (isNaN(form.age) || form.age < 16 || form.age > 100))
      errs.age = "Age must be between 16 and 100";
    return errs;
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSaving(true);
    setFeedback(null);

    try {
      /* Real API call — uncomment and remove the setTimeout below:
      const updatedUser = await updateUserProfile(user.userId, {
        name:  form.name,
        email: form.email,
        phone: form.phone,
        age:   form.age,
      }, cvFile);
      onUserUpdated(updatedUser);
      */

      // ── Mock: simulate network delay ──
const response = await API.patch('/user/personal', {
  name:  form.name,
  email: form.email,
  phone: form.phone  || null,
  age:   form.age    || null,
});

onUserUpdated(response.data.personalInfo);
      // ────────────────────────────────

      setCvFile(null);
      setCvPreview(null);
      setFeedback({ type: "success", message: "Personal info updated successfully." });
      setIsEditing(false);
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to save. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Field binding helper ──────────────────────────────────────────────────────
  const field = (key) => ({
    value: form[key] ?? "",
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
    error: errors[key],
  });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SectionCard
      title="Personal Info"
      icon="👤"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      feedback={feedback}
    >
      {/* ════════════════ VIEW MODE ════════════════ */}
      {!isEditing ? (
        <div className="personal-view">
          <div className="personal-view__avatar">
            <div className="avatar-circle">{getInitials(user.name)}</div>
          </div>

          <div className="personal-view__details">
            <div className="personal-view__name">{user.name}</div>
            <div className="personal-view__grid">
              <div className="info-row">
                <span className="info-row__icon">📧</span>
                <span className="info-row__value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-row__icon">📞</span>
                <span className="info-row__value">{user.phone || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-row__icon">🎂</span>
                <span className="info-row__value">{user.age ? `${user.age} years old` : "—"}</span>
              </div>

              {/* CV row — download + quick-replace */}
              <div className="info-row">
                <span className="info-row__icon">📄</span>
                {user.cvPath ? (
                  <div className="cv-view-row">
                    <a href={user.cvPath} download={user.cvFileName} className="info-row__link">
                      {user.cvFileName || "Download CV"}
                    </a>
                    <span className="cv-view-row__sep">·</span>
                    <label className="btn btn--ghost btn--xs cv-replace-btn">
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Switch to edit mode pre-loaded with new CV
                            handleEdit();
                            setCvFile(file);
                            setCvPreview(file.name);
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="btn btn--ghost btn--xs">
                    Upload CV
                    <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { handleEdit(); setCvFile(file); setCvPreview(file.name); }
                    }} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

      ) : (
        /* ════════════════ EDIT MODE ════════════════ */
        <div className="personal-edit">
          <div className="personal-edit__avatar">
            <div className="avatar-circle avatar-circle--lg">{getInitials(form.name)}</div>
          </div>

          <div className="personal-edit__form">
            {/* Row 1 — Name + Age */}
            <div className="form-row form-row--2">
              <FormInput
                label="Full Name" name="name" required
                placeholder="Your full name"
                {...field("name")}
              />
              <FormInput
                label="Age" name="age" type="number"
                placeholder="e.g. 26"
                {...field("age")}
              />
            </div>

            {/* Row 2 — Email + Phone */}
            <div className="form-row form-row--2">
              <FormInput
                label="Email" name="email" type="email" required
                placeholder="you@example.com"
                {...field("email")}
              />
              <FormInput
                label="Phone" name="phone" type="tel"
                placeholder="+92 300 0000000"
                {...field("phone")}
              />
            </div>

            {/* Row 3 — CV upload */}
            <div className="cv-upload-row">
              <div className="cv-upload-row__label">
                <span>📄</span>
                <span>CV / Resume</span>
              </div>

              {/* Show current CV if no new file chosen */}
              {!cvPreview && user.cvPath && (
                <div className="cv-current">
                  <span className="cv-current__name">Current: {user.cvFileName || "CV on file"}</span>
                  <a href={user.cvPath} download={user.cvFileName} className="info-row__link cv-current__download">
                    Download
                  </a>
                </div>
              )}

              {/* New file selected — show preview chip */}
              {cvPreview && (
                <div className="cv-preview-chip">
                  <span>📎 {cvPreview}</span>
                  <button
                    type="button"
                    className="cv-preview-chip__remove"
                    onClick={handleRemoveCvSelection}
                    title="Remove selection"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* File picker */}
              <label className="btn btn--outline btn--sm cv-upload-btn">
                {cvPreview ? "Choose Different File" : user.cvPath ? "Replace CV" : "Upload CV"}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleCvChange}
                />
              </label>

              {errors.cv && (
                <span className="form-input__error-msg">{errors.cv}</span>
              )}
              <span className="cv-upload-hint">Accepted: PDF, DOC, DOCX · Max 5 MB</span>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default PersonalInfoSection;
