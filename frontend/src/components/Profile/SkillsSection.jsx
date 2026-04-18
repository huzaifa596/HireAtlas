// sections/SkillsSection.jsx
import React, { useState } from "react";
import SectionCard from "../components/SectionCard";
import SkillBadge from "../components/SkillBadge";
import FormInput from "../components/FormInput";
import { skillOptions, categoryOptions, proficiencyOptions } from "../mockData";

const EMPTY_SKILL = { skillName: "", category: "", proficiency: "Beginner" };

const SkillsSection = ({ userId, skills: initialSkills, onSkillsUpdated }) => {
  const [skills, setSkills] = useState(initialSkills);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_SKILL });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Group skills by category
  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const handleEdit = () => {
    setIsEditing(true);
    setFeedback(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowAddForm(false);
    setForm({ ...EMPTY_SKILL });
    setErrors({});
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setShowAddForm(true);
    setForm({ ...EMPTY_SKILL });
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.skillName?.trim()) errs.skillName = "Skill name is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.proficiency) errs.proficiency = "Proficiency is required";
    const exists = skills.some(
      (s) => s.skillName.toLowerCase() === form.skillName.toLowerCase()
    );
    if (exists) errs.skillName = "This skill is already added";
    return errs;
  };

  const handleAddSkill = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSaving(true);
    setFeedback(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const newSkill = { ...form, userSkillId: Date.now() };
      const updated = [...skills, newSkill];
      setSkills(updated);
      onSkillsUpdated?.(updated);
      setFeedback({ type: "success", message: `"${form.skillName}" added.` });
      setForm({ ...EMPTY_SKILL });
      setShowAddForm(false);
    } catch {
      setFeedback({ type: "error", message: "Failed to add skill." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (userSkillId, skillName) => {
    if (!window.confirm(`Remove "${skillName}"?`)) return;
    try {
      await new Promise((r) => setTimeout(r, 400));
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
      await new Promise((r) => setTimeout(r, 300));
      const updated = skills.map((s) =>
        s.userSkillId === userSkillId ? { ...s, proficiency: newProficiency } : s
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
      title="Skills"
      icon="⚡"
      isEditing={isEditing && !showAddForm}
      isSaving={isSaving}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      onAdd={handleAddNew}
      addLabel="Add Skill"
      feedback={feedback}
    >
      {/* Flat skill badges — no category grouping */}
      {skills.length === 0 && !showAddForm && (
        <div className="empty-state">
          <span>⚡</span>
          <p>No skills added yet. Click "+ Add Skill" to showcase your abilities.</p>
        </div>
      )}

      <div className="sg-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: skills.length ? '4px' : 0 }}>
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

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="entry-form entry-form--skills">
          <div className="entry-form__grid entry-form__grid--3">
            <FormInput
              label="Skill Name"
              name="skillName"
              type="select"
              {...field("skillName")}
              required
              options={skillOptions}
            />
            <FormInput
              label="Category"
              name="category"
              type="select"
              {...field("category")}
              required
              options={categoryOptions}
            />
            <FormInput
              label="Proficiency"
              name="proficiency"
              type="select"
              {...field("proficiency")}
              required
              options={proficiencyOptions}
            />
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
