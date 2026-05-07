// components/Profile/Profile.jsx
import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./Profile.css";

import SectionCard       from "./SectionCard";
import PersonalInfoSection from "./PersonalInfoSection";
import EducationSection  from "./EducationSection";
import ExperienceSection from "./ExperienceSection";
import SkillsSection     from "./SkillsSection";

/* ── Completion scoring ── */
function calcCompletion(profile) {
  const checks = [
    !!profile?.personalInfo?.name,
    !!profile?.personalInfo?.email,
    !!profile?.personalInfo?.phone,
    !!profile?.personalInfo?.dob,
    !!profile?.personalInfo?.cvPath,
    (profile?.education  ?? []).length > 0,
    (profile?.experience ?? []).length > 0,
    (profile?.skills     ?? []).length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/* ── Initials from name ── */
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/* ── Completion Ring SVG ── */
function CompletionRing({ pct }) {
  const r    = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="completion-ring">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <defs>
          <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f0b429" />
            <stop offset="50%"  stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          className="completion-ring__bg"
          cx="38" cy="38" r={r}
          transform="rotate(-90 38 38)"
        />
        {/* fill */}
        <circle
          className="completion-ring__fill"
          cx="38" cy="38" r={r}
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset="0"
          transform="rotate(-90 38 38)"
          stroke="url(#completionGrad)"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="completion-ring__label">
        <span className="completion-ring__pct">{pct}%</span>
        <span className="completion-ring__sub">done</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Profile({ onLogout }) {
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [avatarUrl,     setAvatarUrl]     = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError,   setAvatarError]   = useState("");
  const fileInputRef = useRef(null);

  /* ── Fetch profile ── */
  useEffect(() => {
    API.get("/user")
      .then(({ data }) => {
        setProfile(data.profile);
        if (data.profile?.personalInfo?.avatarUrl) {
          setAvatarUrl(data.profile.personalInfo.avatarUrl);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5 MB.");
      return;
    }

    setAvatarError("");
    setAvatarUploading(true);

    /* Optimistic preview */
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { data } = await API.post("/user/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(data.avatarUrl ?? localUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarError("Upload failed. Please try again.");
      setAvatarUrl(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── Profile update callback (passed to child sections) ── */
  const handleProfileUpdate = (updated) => setProfile(updated);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p className="profile-loading__text">Loading profile…</p>
      </div>
    );
  }

  const info       = profile?.personalInfo ?? {};
  const pct        = calcCompletion(profile);
  const isVerified = profile?.isVerified ?? false;
  const userInitials = initials(info.name || "U");

  return (
    <div className="profile-page">

      {/* ════════════════ HERO BANNER ════════════════ */}
      <div className="profile-hero">
        <div className="profile-hero__inner">

          {/* Avatar (upload lives here) */}
          <div className="profile-avatar-zone">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-ring__border">
                <div className="profile-avatar-ring__inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={info.name} />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>

              {/* Camera / upload button */}
              <button
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                disabled={avatarUploading}
              >
                {avatarUploading ? "⏳" : "📷"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="avatar-upload-input"
                onChange={handleAvatarChange}
              />
            </div>

            {avatarError && (
              <span style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", maxWidth: 120 }}>
                {avatarError}
              </span>
            )}
          </div>

          {/* Name + email + tags */}
          <div className="profile-hero__info">
            <div className="profile-hero__name">
              {info.name || "Your Name"}
              {isVerified && (
                <span className="profile-hero__verified">✔ Verified</span>
              )}
            </div>
            <div className="profile-hero__email">{info.email || ""}</div>

            <div className="profile-hero__meta">
              {info.phone && (
                <span className="profile-hero__tag">📞 {info.phone}</span>
              )}
              {info.dob && (
                <span className="profile-hero__tag">
                  🎂 {new Date().getFullYear() - new Date(info.dob).getFullYear()} yrs
                </span>
              )}
              {(profile?.skills ?? []).length > 0 && (
                <span className="profile-hero__tag">
                  🛠 {profile.skills.length} skill{profile.skills.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Completion ring */}
          <div className="profile-completion">
            <CompletionRing pct={pct} />
            <span className="completion-label">Profile complete</span>
          </div>
        </div>
      </div>

      {/* ════════════════ BODY ════════════════ */}
      <div className="profile-body">

        {/* Verification */}
        <div className="section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <span className="section-card__icon">🔐</span>
              <h2>Profile Verification</h2>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                background: isVerified ? "rgba(16,185,129,.12)" : "rgba(245,158,11,.12)",
                color: isVerified ? "#065f46" : "#92400e",
                border: `1px solid ${isVerified ? "rgba(16,185,129,.25)" : "rgba(245,158,11,.25)"}`,
              }}
            >
              {isVerified ? "✔ Verified" : "⚠ Pending"}
            </span>
          </div>
          <div className="section-card__body">
            <div className="verify-card">
              <div className="verify-card__icon">
                {isVerified ? "✅" : "⏳"}
              </div>
              <div className="verify-card__text">
                <h3>
                  {isVerified
                    ? "Your profile is verified"
                    : "Verification pending"}
                </h3>
                <p>
                  {isVerified
                    ? "Recruiters can see your verified badge on all applications."
                    : "We'll review your profile shortly."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <PersonalInfoSection
          profile={profile}
          onUpdate={handleProfileUpdate}
        />

        {/* Education */}
        <EducationSection
  education={profile?.education ?? []}
  onEducationUpdated={(updated) =>
    handleProfileUpdate({ ...profile, education: updated })
  }
/>


        {/* Experience */}
       <ExperienceSection
  experience={profile?.experience ?? []}
  onExperienceUpdated={(updated) =>
    handleProfileUpdate({ ...profile, experience: updated })
  }
/>

        {/* Skills */}
        <SkillsSection
  skills={profile?.skills ?? []}
  onSkillsUpdated={(updated) =>
    handleProfileUpdate({ ...profile, skills: updated })
  }
/>
        {/* Logout */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
          <button
            className="btn btn--danger btn--sm"
            onClick={onLogout}
            style={{ borderRadius: 20, padding: "25px 70px" }}
          >
            🚪 Sign out
          </button>
        </div>
      </div>
    </div>
  );
}