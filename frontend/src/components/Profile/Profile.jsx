// Profile.jsx — Main profile page for HireAtlas
// Place at: frontend/src/components/Profile/Profile.jsx
import React, { useState } from "react";
import "./Profile.css";
import PersonalInfoSection from "./PersonalInfoSection";
import EducationSection    from "./EducationSection";
import ExperienceSection   from "./ExperienceSection";
import SkillsSection       from "./SkillsSection";
import { mockUser, mockEducation, mockExperience, mockSkills } from "./mockData";

/**
 * Profile — top-level container.
 *
 * In production, replace the mock state initialisers with useEffect API calls:
 *
 *   const { userId } = useContext(AuthContext);
 *   useEffect(() => {
 *     getUserProfile(userId).then(setUser);
 *     getEducation(userId).then(setEducation);
 *     getExperience(userId).then(setExperience);
 *     getSkills(userId).then(setSkills);
 *   }, [userId]);
 */
const Profile = () => {
  const [user,       setUser]       = useState(mockUser);
  const [education,  setEducation]  = useState(mockEducation);
  const [experience, setExperience] = useState(mockExperience);
  const [skills,     setSkills]     = useState(mockSkills);

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  // Profile completion score
  const completion = Math.min(
    (user.name && user.email ? 25 : 0) +
    (user.phone              ? 10 : 0) +
    (education.length        ? 25 : 0) +
    (experience.length       ? 25 : 0) +
    (skills.length           ? 15 : 0),
    100
  );

  const circumference = 213.628; // 2 * π * 34

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // Clear auth state here, then redirect:
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
  };

  return (
    <div className="profile-page">

      {/* ══ Hero Banner ══ */}
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          <div className="avatar-circle avatar-circle--xl">
            {getInitials(user.name)}
          </div>

          <div className="profile-hero__info">
            <h1 className="profile-hero__name">{user.name}</h1>
            <p className="profile-hero__email">{user.email}</p>
            {experience[0] && (
              <p className="profile-hero__role">
                {experience[0].jobTitle} @ {experience[0].companyName}
              </p>
            )}
          </div>

          {/* Completion ring */}
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

      {/* ══ Section Content ══ */}
      <div className="profile-content">
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

      {/* ══ Logout ══ */}
      <div className="profile-logout-row">
        <button className="btn btn--logout" onClick={handleLogout}>
          <svg
            width="16" height="16" viewBox="0 0 24 24"
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
