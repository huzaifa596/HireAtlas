import React, { useState } from "react";
import SectionCard from "./SectionCard";
import SkillBadge from "./SkillBadge";
import FormInput from "./FormInput";
import API from '../../services/api';

const skillOptions       = ["React.js","Vue.js","Angular","JavaScript","TypeScript","HTML5","CSS / Tailwind","Node.js","Express.js","Python","Django","FastAPI","Java","Spring Boot","SQL Server","PostgreSQL","MySQL","MongoDB","Redis","Git / GitHub","Docker","Kubernetes","AWS","Azure","Figma","Jira"];
const categoryOptions    = ["Frontend","Backend","Database","Tools","DevOps","Design","Other"];
const proficiencyOptions = ["Beginner","Intermediate","Expert"];

const EMPTY_SKILL = { skillName: "", category: "", proficiency: "Beginner" };

const SkillsSection = ({ userId, skills: initialSkills = [], onSkillsUpdated }) => {
  const [skills, setSkills] = useState(initialSkills ?? []);
  const [isEditing,   setIsEditing]   = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form,        setForm]        = useState({ ...EMPTY_SKILL });
  const [errors,      setErrors]      = useState({});
  const [isSaving,    setIsSaving]    = useState(false);
  const [feedback,    setFeedback]    = useState(null);

  const handleEdit   = () => { setIsEditing(true);  setFeedback(null); };
  const handleCancel = () => { setIsEditing(false); setShowAddForm(false); setForm({ ...EMPTY_SKILL }); setErrors({}); };
  const handleSave   = () => { setIsEditing(false); setShowAddForm(false); };

  const handleAddNew = () => {
    setIsEditing(true);
    setShowAddForm(true);
    setForm({ ...EMPTY_SKILL });
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.skillName?.trim()) e.skillName  = "Skill name is required";
    if (!form.category)          e.category   = "Category is required";
    if (!form.proficiency)       e.proficiency = "Proficiency is required";
    if (skills.some((s) => s.skillName.toLowerCase() === form.skillName.toLowerCase()))
      e.skillName = "This skill is already added";
    return e;
  };

  const handleAddSkill = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSaving(true);
    setFeedback(null);
    try {
      const response = await API.patch('/user/skills', {
        skillName:   form.skillName,
        category:    form.category,
        proficiency: form.proficiency,
      });

      const saved = response.data.skill;
      const updated = [...skills, saved];
      setSkills(updated);
      onSkillsUpdated?.(updated);
      setFeedback({ type: "success", message: `"${form.skillName}" added.` });
      setForm({ ...EMPTY_SKILL });
      setShowAddForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add skill.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (userSkillId, skillName) => {
    if (!window.confirm(`Remove "${skillName}"?`)) return;
    try {
      await API.delete(`/user/skills/${userSkillId}`);
      const updated = skills.filter((s) => s.userSkillId !== userSkillId);
      setSkills(updated);
      onSkillsUpdated?.(updated);
      setFeedback({ type: "success", message: `"${skillName}" removed.` });
    } catch {
      setFeedback({ type: "error", message: "Failed to remove skill." });
    }
  };

  const handleUpdateProficiency = async (userSkillId, newProficiency) => {
    try {
      const response = await API.patch('/user/skills', {
        userSkillId,
        proficiency: newProficiency,
      });

      const saved = response.data.skill;
      const updated = skills.map((s) =>
        s.userSkillId === userSkillId ? { ...s, proficiency: saved.proficiency } : s
      );
      setSkills(updated);
      onSkillsUpdated?.(updated);
    } catch {
      setFeedback({ type: "error", message: "Failed to update proficiency." });
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
      title="Skills" icon="⚡"
      isEditing={isEditing && !showAddForm}
      isSaving={isSaving}
      onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      onAdd={handleAddNew} addLabel="Add Skill"
      feedback={feedback}
    >
      {skills.length === 0 && !showAddForm && (
        <div className="empty-state">
          <span>⚡</span>
          <p>No skills added yet. Click "+ Add Skill" to showcase your abilities.</p>
        </div>
      )}

      <div className="skills-flat">
        {skills.map((skill) => (
          <div key={skill.userSkillId} className="skill-badge-wrapper">
            <SkillBadge
              skillName={skill.skillName}
              proficiency={skill.proficiency}
              isEditing={isEditing || showAddForm}
              onRemove={() => handleRemoveSkill(skill.userSkillId, skill.skillName)}
            />
            {(isEditing || showAddForm) && (
              <select
                className="skill-proficiency-select"
                value={skill.proficiency}
                onChange={(e) => handleUpdateProficiency(skill.userSkillId, e.target.value)}
                title="Change proficiency"
              >
                {proficiencyOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="entry-form entry-form--skills">
          <div className="entry-form__grid entry-form__grid--3">
            <FormInput label="Skill Name"  name="skillName"   type="select" required options={skillOptions}       {...field("skillName")} />
            <FormInput label="Category"    name="category"    type="select" required options={categoryOptions}    {...field("category")} />
            <FormInput label="Proficiency" name="proficiency" type="select" required options={proficiencyOptions} {...field("proficiency")} />
          </div>
          <div className="entry-form__actions">
            <button className="btn btn--ghost btn--sm" onClick={() => { setShowAddForm(false); if (!skills.length) setIsEditing(false); }}>
              Cancel
            </button>
            <button className="btn btn--primary btn--sm" onClick={handleAddSkill} disabled={isSaving}>
              {isSaving ? <span className="spinner" /> : "Add Skill"}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default SkillsSection;