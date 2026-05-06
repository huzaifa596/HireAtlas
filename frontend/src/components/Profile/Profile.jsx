
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