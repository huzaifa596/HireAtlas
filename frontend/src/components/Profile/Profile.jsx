// Profile.jsx — Main profile page container for HireAtlas
import React, { useState } from "react";
import "./Profile.css";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import EducationSection from "./sections/EducationSection";
import ExperienceSection from "./sections/ExperienceSection";
import SkillsSection from "./sections/SkillsSection";
import { mockUser, mockEducation, mockExperience, mockSkills } from "./mockData";

const Profile = () => {
  // In a real app, fetch these from the API using the authenticated userId
  const [user, setUser] = useState(mockUser);
  const [education, setEducation] = useState(mockEducation);
  const [experience, setExperience] = useState(mockExperience);
  const [skills, setSkills] = useState(mockSkills);

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const completionScore = () => {
    let score = 0;
    if (user.name && user.email) score += 25;
    if (user.phone) score += 10;
    if (education.length > 0) score += 25;
    if (experience.length > 0) score += 25;
    if (skills.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const completion = completionScore();

  return (
    <div className="profile-page">
      {/* ── Profile Hero Banner ── */}
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          <div className="profile-hero__avatar">
            <div className="avatar-circle avatar-circle--xl">{getInitials(user.name)}</div>
            <div className="avatar-circle__ring" />
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
          <div className="profile-hero__completion">
            <div className="completion-ring">
              <svg viewBox="0 0 80 80" className="completion-ring__svg">
                <circle cx="40" cy="40" r="34" className="completion-ring__track" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="completion-ring__fill"
                  strokeDasharray={`${(completion / 100) * 213.6} 213.6`}
                />
              </svg>
              <span className="completion-ring__pct">{completion}%</span>
            </div>
            <span className="completion-label">Profile Complete</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
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

      {/* ── Logout ── */}
      <div className="profile-logout-row">
        <button
          className="btn btn--logout"
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              // Clear auth token and redirect: window.location.href = "/login";
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
