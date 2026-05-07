// components/Profile/PersonalInfoSection.jsx
import { useState } from "react";
import API from "../../services/api";
import SectionCard from "./SectionCard";
import FormInput   from "./FormInput";

export default function PersonalInfoSection({ profile, onUpdate }) {
  const info = profile?.personalInfo ?? {};

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [feedback,  setFeedback]  = useState(null);
  const [cvFile,    setCvFile]    = useState(null);

  const [form, setForm] = useState({
    name:  info.name  ?? "",
    email: info.email ?? "",
    phone: info.phone ?? "",
    dob:   info.dob   ? info.dob.slice(0, 10) : "",
  });

  const field = (key) => ({
    value:    form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cvFile) fd.append("cv", cvFile);

      const { data } = await API.post("/user/personal", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdate(data.profile);
      setFeedback({ type: "success", message: "Personal info saved!" });
      setIsEditing(false);
      setCvFile(null);
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Save failed. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name:  info.name  ?? "",
      email: info.email ?? "",
      phone: info.phone ?? "",
      dob:   info.dob   ? info.dob.slice(0, 10) : "",
    });
    setCvFile(null);
    setFeedback(null);
    setIsEditing(false);
  };

  return (
    <SectionCard
      title="Personal Info"
      icon="👤"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
      feedback={feedback}
    >
      {!isEditing ? (
        /* ── View mode ── */
        <div className="personal-info-grid">
          <div className="info-field">
            <span className="info-field__label">Full name</span>
            <span className="info-field__value">
              <span className="icon">👤</span>
              {info.name || <span className="info-empty">Not set</span>}
            </span>
          </div>

          <div className="info-field">
            <span className="info-field__label">Email</span>
            <span className="info-field__value">
              <span className="icon">✉️</span>
              {info.email || <span className="info-empty">Not set</span>}
            </span>
          </div>

          <div className="info-field">
            <span className="info-field__label">Phone</span>
            <span className="info-field__value">
              <span className="icon">📞</span>
              {info.phone || <span className="info-empty">Not set</span>}
            </span>
          </div>

          <div className="info-field">
            <span className="info-field__label">Date of birth</span>
            <span className="info-field__value">
              <span className="icon">🎂</span>
              {info.dob
                ? new Date(info.dob).toLocaleDateString("en-US", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : <span className="info-empty">Not set</span>}
            </span>
          </div>

          <div className="info-field" style={{ gridColumn: "1 / -1" }}>
            <span className="info-field__label">CV / Résumé</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
              {info.cvPath ? (
                <>
                  <a
                    href={info.cvPath}
                    target="_blank"
                    rel="noreferrer"
                    className="cv-badge"
                  >
                    📄 Download CV
                  </a>
                  <button
                    className="cv-replace-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Replace
                  </button>
                </>
              ) : (
                <span className="info-empty">No CV uploaded yet</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="form-stack">
          <div className="form-grid-2">
            <FormInput label="Full name"  name="name"  type="text"  {...field("name")}  required />
            <FormInput label="Email"      name="email" type="email" {...field("email")} required />
            <FormInput label="Phone"      name="phone" type="tel"   {...field("phone")} />
            <FormInput label="Date of birth" name="dob" type="date" {...field("dob")} />
          </div>

          <FormInput
            label="CV / Résumé"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />
          {info.cvPath && !cvFile && (
            <p style={{ fontSize: 12, color: "var(--gray-400)" }}>
              Current CV will be kept unless you upload a new one.
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}