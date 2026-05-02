import React, { useState, useRef } from "react";
import SectionCard from "./SectionCard";
import FormInput from "./FormInput";
import API from '../../services/api';

const PersonalInfoSection = ({ user, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [feedback,  setFeedback]  = useState(null);
  const [form,      setForm]      = useState({ ...user });
  const [cvFile,    setCvFile]    = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [errors,    setErrors]    = useState({});

  const cvInputRef = useRef(null);

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

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

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
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

  const validate = () => {
    const errs = {};
    if (!form.name?.trim())  errs.name  = "Name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (form.age && (isNaN(form.age) || form.age < 16 || form.age > 100))
      errs.age = "Age must be between 16 and 100";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSaving(true);
    setFeedback(null);

    try {
      let updatedUser;

      if (cvFile) {
        // ── CV selected → multipart/form-data ──
        const formData = new FormData();
        formData.append('cv',    cvFile);
        formData.append('name',  form.name);
        formData.append('email', form.email);
        if (form.phone) formData.append('phone', form.phone);
        if (form.age)   formData.append('age',   form.age);

        const response = await API.post('/user/cv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedUser = response.data.personalInfo;

      } else {
        // ── No CV → normal JSON ──
        const response = await API.patch('/user/personal', {
          name:  form.name,
          email: form.email,
          phone: form.phone || null,
          age:   form.age   || null,
        });
        updatedUser = response.data.personalInfo;
      }

      onUserUpdated(updatedUser);
      setCvFile(null);
      setCvPreview(null);
      setFeedback({ type: "success", message: "Personal info updated successfully." });
      setIsEditing(false);

    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save. Please try again.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key] ?? "",
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
    error: errors[key],
  });

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
      {!isEditing ? (
        /* ════════════════ VIEW MODE ════════════════ */
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

              <div className="info-row">
                <span className="info-row__icon">📄</span>
                {user.cvPath ? (
                  <div className="cv-view-row">
                     <a
                      href={`http://localhost:3000/${user.cvPath}`}
                      download={user.cvFileName}
                      className="info-row__link"
                    >
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
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { handleEdit(); setCvFile(file); setCvPreview(file.name); }
                      }}
                    />
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
            <div className="form-row form-row--2">
              <FormInput label="Full Name" name="name" required placeholder="Your full name" {...field("name")} />
              <FormInput label="Age"       name="age"  type="number" placeholder="e.g. 26"   {...field("age")} />
            </div>

            <div className="form-row form-row--2">
              <FormInput label="Email" name="email" type="email" required placeholder="you@example.com"  {...field("email")} />
              <FormInput label="Phone" name="phone" type="tel"            placeholder="+92 300 0000000"   {...field("phone")} />
            </div>

            <div className="cv-upload-row">
              <div className="cv-upload-row__label">
                <span>📄</span>
                <span>CV / Resume</span>
              </div>

              {!cvPreview && user.cvPath && (
                <div className="cv-current">
                  <span className="cv-current__name">Current: {user.cvFileName || "CV on file"}</span>
                   <a
                    href={`http://localhost:3000/${user.cvPath}`}
                    download={user.cvFileName}
                    className="info-row__link cv-current__download"
                  >
                    Download
                  </a>
                </div>
              )}

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

              {errors.cv && <span className="form-input__error-msg">{errors.cv}</span>}
              <span className="cv-upload-hint">Accepted: PDF, DOC, DOCX · Max 5 MB</span>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default PersonalInfoSection;