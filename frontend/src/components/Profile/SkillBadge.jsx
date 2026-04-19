// components/SkillBadge.jsx
import React from "react";

/**
 * SkillBadge — color-coded badge with proficiency label and optional remove button.
 *
 * Props:
 *   skillName    string
 *   proficiency  "Beginner" | "Intermediate" | "Expert"
 *   isEditing    bool   show remove button when true
 *   onRemove     fn
 */
const proficiencyClass = {
  Beginner:     "badge--beginner",
  Intermediate: "badge--intermediate",
  Expert:       "badge--expert",
};

const SkillBadge = ({ skillName, proficiency, isEditing, onRemove }) => {
  return (
    <span className={`skill-badge ${proficiencyClass[proficiency] || ""}`}>
      <span className="skill-badge__name">{skillName}</span>
      <span className="skill-badge__level">{proficiency}</span>
      {isEditing && (
        <button className="skill-badge__remove" onClick={onRemove} title={`Remove ${skillName}`}>
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
