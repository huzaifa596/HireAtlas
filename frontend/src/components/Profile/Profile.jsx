
import React, { useState, useEffect } from "react";
import "./Profile.css";
import PersonalInfoSection from "./PersonalInfoSection";
import EducationSection  from "./EducationSection";
import ExperienceSection from "./ExperienceSection";
import SkillsSection from "./SkillsSection";
import API from "../../services/api";        

const Profile = ({ onLogout }) => {

  const [user, setUser] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience,setExperience]= useState([]);
  const [skills,setSkills] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]  = useState(null);
const [verifyStep, setVerifyStep]   = useState(null); // null | 'sent' 
const [verifyOtp,  setVerifyOtp]    = useState("");
const [verifyMsg,  setVerifyMsg]    = useState("");
const [verifyErr,  setVerifyErr]    = useState("");
const [verifyLoad, setVerifyLoad]   = useState(false);
const [isVerified, setIsVerified]   = useState(false);

const handleSendVerifyOtp = async () => {
  setVerifyLoad(true); setVerifyErr(""); setVerifyMsg("");
  try {
    await API.post("/user/send-verification");
    setVerifyStep("sent");
    setVerifyMsg("OTP sent to your email");
  } catch (err) {
    setVerifyErr(err.response?.data?.message || "Failed to send OTP");
  } finally { setVerifyLoad(false); }
};

const handleVerifyProfile = async () => {
  if (!verifyOtp) return setVerifyErr("Enter the OTP");
  setVerifyLoad(true); setVerifyErr("");
  try {
    await API.post("/user/verify-profile", { otp: verifyOtp });
    setIsVerified(true);
    setVerifyStep(null);
    setVerifyMsg("");
    setVerifyOtp("");
  } catch (err) {
    setVerifyErr(err.response?.data?.message || "Invalid OTP");
  } finally { setVerifyLoad(false); }
};
  useEffect(() => {
  

    setLoading(true);
     
  API.get("/user")
    .then(({ data }) => {
      if (data.status !== "SUCCESS") throw new Error("Failed to load profile");

      const { personalInfo, education, experience, skills } = data.profile;
      setUser(personalInfo);
      setEducation(education);
      setExperience(experience);
      setSkills(skills);
    })
    .catch((err) => {
      console.error("Error fetching profile:", err);
      setError(err.message);
    })
    .finally(() => setLoading(false));
}, []);


  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const completion = Math.min(
    (user?.name && user?.email ? 25 : 0) +
    (user?.phone  ? 10 : 0) +
    (education.length  ? 25 : 0) +
    (experience.length   ? 25 : 0) +
    (skills.length  ? 15 : 0),
    100
  );

  const circumference = 213.628;

  
const handleLogout = () => {
  if (window.confirm("Are you sure you want to log out?")) {
    onLogout();
  }
};

  if (loading) return <div className="profile-loading">Loading profile…</div>;
  if (error)   return <div className="profile-error">Error: {error}</div>;
  if (!user)   return null;

  return (
    <div className="profile-page">

     
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          <div className="avatar-circle avatar-circle--xl">
            {getInitials(user.name)}
          </div>

          <div className="profile-hero__info">
            <h1 className="profile-hero__name">
  {user.name}
  {isVerified && (
    <span style={{
      marginLeft: 10,
      fontSize: "0.75rem",
      fontWeight: 700,
      background: "#16a34a",
      color: "#fff",
      padding: "3px 10px",
      borderRadius: 99,
      verticalAlign: "middle",
      letterSpacing: "0.03em"
    }}>
      ✓ Verified
    </span>
  )}
</h1>

            <p className="profile-hero__email">{user.email}</p>
            {experience[0] && (
              <p className="profile-hero__role">
                {experience[0].jobTitle} @ {experience[0].companyName}
              </p>
            )}
          </div>

          <div className="profile-hero__completion">
            <div className="completion-ring">
              <svg viewBox="0 0 80 80" className="completion-ring__svg">
                <circle cx="40" cy="40" r="34" className="completion-ring__track" />
                <circle
                  cx="40" cy="40" r="34"
                  className="completion-ring__fill"
                  strokeDasharray={`${(completion / 100) * circumference} ${circumference}`}
                />
              </svg>
              <span className="completion-ring__pct">{completion}%</span>
            </div>
            <span className="completion-label">Profile Complete</span>
          </div>
        </div>
      </div>

     
      <div className="profile-content">
      
        {/* ── Profile Verification ── */}
<div className="section-card">
  <div className="section-card__header">
    <div className="section-card__title">
      <span className="section-card__icon">🔒</span>
      <h2>Profile Verification</h2>
    </div>
    {isVerified && (
      <span style={{ color:"#16a34a", fontWeight:700, fontSize:".85rem",
        background:"#dcfce7", padding:"4px 12px", borderRadius:99 }}>
        ✓ Verified
      </span>
    )}
  </div>

  <div className="section-card__body">
    {isVerified ? (
      <p style={{ color:"#16a34a", margin:0 }}>Your profile is verified ✓</p>
    ) : (
      <>
        <p style={{ color:"var(--gray-500)", fontSize:".88rem", margin:"0 0 14px" }}>
          Verify your email to build trust with employers.
        </p>

        {verifyErr && <p style={{ color:"#dc2626", fontSize:13, marginBottom:10 }}>⚠ {verifyErr}</p>}
        {verifyMsg && <p style={{ color:"#16a34a", fontSize:13, marginBottom:10 }}>✓ {verifyMsg}</p>}

        {verifyStep === "sent" && (
          <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom:14 }}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={verifyOtp}
              onChange={(e) => setVerifyOtp(e.target.value)}
              className="form-input__control"
              style={{ maxWidth:200 }}
            />
            <button className="btn btn--primary btn--sm"
              onClick={handleVerifyProfile} disabled={verifyLoad}>
              {verifyLoad ? <span className="spinner" /> : "Confirm OTP"}
            </button>
          </div>
        )}

        {!verifyStep && (
          <button className="btn btn--outline btn--sm"
            onClick={handleSendVerifyOtp} disabled={verifyLoad}>
            {verifyLoad ? <span className="spinner" /> : "📧 Send Verification OTP"}
          </button>
        )}
      </>
    )}
  </div>
</div>
  <PersonalInfoSection
          user={user}
          onUserUpdated={setUser}
        />
        <EducationSection
          userId={user.userId}
          education={education}
          onEducationUpdated={setEducation}
        />
        <ExperienceSection
          userId={user.userId}
          experience={experience}
          onExperienceUpdated={setExperience}
        />
        <SkillsSection
          userId={user.userId}
          skills={skills}
          onSkillsUpdated={setSkills}
        />
      </div>

     
      <div className="profile-logout-row">
        <button className="btn btn--logout" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>

    </div>
  );
};

export default Profile;