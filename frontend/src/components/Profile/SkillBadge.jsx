// components/Profile/SkillBadge.jsx
import React from "react";

const proficiencyClass = {
  Beginner:     "skill-badge--beginner",
  Intermediate: "skill-badge--intermediate",
  Expert:       "skill-badge--expert",
};

const proficiencyDot = {
  Beginner:     "🟡",
  Intermediate: "🔵",
  Expert:       "🟢",
};

const SkillBadge = ({ skillName, proficiency, isEditing, onRemove }) => {
  return (
    <span className={`skill-badge ${proficiencyClass[proficiency] || ""}`}>
      <span style={{ fontSize: 11 }}>{proficiencyDot[proficiency] ?? "⚪"}</span>
      <span className="skill-badge__name">{skillName}</span>
      <span className="skill-badge__level">{proficiency}</span>
      {isEditing && (
        <button
          className="skill-badge__remove"
          onClick={onRemove}
          title={`Remove ${skillName}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;