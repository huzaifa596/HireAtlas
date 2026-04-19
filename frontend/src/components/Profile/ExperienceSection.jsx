// sections/ExperienceSection.jsx
import React, { useState } from "react";
import SectionCard from "../components/SectionCard";
import TimelineItem from "../components/TimelineItem";
import FormInput from "../components/FormInput";
// import { addExperience, updateExperience, deleteExperience } from "../services/profileApi";

const EMPTY = {
  companyName: "", jobTitle: "", description: "",
  startDate: "", endDate: "",
};

const fmt = (d) => {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const ExperienceSection = ({ userId, experience: init, onExperienceUpdated }) => {
  const [experience, setExperience] = useState(init);
  const [isEditing,  setIsEditing]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState({ ...EMPTY });
  const [errors,     setErrors]     = useState({});
  const [isSaving,   setIsSaving]   = useState(false);
  const [feedback,   setFeedback]   = useState(null);

  const handleEdit   = () => { setIsEditing(true);  setFeedback(null); };
  const handleCancel = () => { setIsEditing(false); setEditingId(null); setForm({ ...EMPTY }); setErrors({}); };
  const handleSave   = () => { setIsEditing(false); setEditingId(null); };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingId("new");
    setForm({ ...EMPTY });
    setErrors({});
  };

  const handleEditEntry = (exp) => {
    setEditingId(exp.expId);
    setForm({ ...exp });
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.companyName?.trim()) e.companyName = "Company name is required";
    if (!form.jobTitle?.trim())    e.jobTitle    = "Job title is required";
    if (!form.startDate)           e.startDate   = "Start date is required";
    return e;
  };

  const handleSaveEntry = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSaving(true);
    setFeedback(null);
    try {
      await new Promise((r) => setTimeout(r, 700));
      let updated;
      if (editingId === "new") {
        const entry = { ...form, expId: Date.now() };
        updated = [entry, ...experience];
        setFeedback({ type: "success", message: "Experience entry added." });
      } else {
        updated = experience.map((e) => e.expId === editingId ? { ...e, ...form } : e);
        setFeedback({ type: "success", message: "Experience entry updated." });
      }
      setExperience(updated);
      onExperienceUpdated?.(updated);
      setEditingId(null);
      setForm({ ...EMPTY });
      if (editingId === "new") setIsEditing(false);
    } catch {
      setFeedback({ type: "error", message: "Failed to save. Try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (expId) => {
    if (!window.confirm("Remove this experience entry?")) return;
    try {
      await new Promise((r) => setTimeout(r, 400));
      const updated = experience.filter((e) => e.expId !== expId);
      setExperience(updated);
      onExperienceUpdated?.(updated);
      setFeedback({ type: "success", message: "Experience entry removed." });
      if (editingId === expId) { setEditingId(null); setForm({ ...EMPTY }); }
    } catch {
      setFeedback({ type: "error", message: "Failed to delete." });
    }
  };

  const handleCancelEntry = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
    setErrors({});
    if (editingId === "new") setIsEditing(false);
  };

  const field = (key) => ({
    value: form[key] ?? "",
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
    error: errors[key],
  });

  const EntryForm = () => (
    <div className="entry-form">
      <div className="entry-form__grid">
        <FormInput label="Company Name" name="companyName" required placeholder="e.g. Systems Limited" {...field("companyName")} />
        <FormInput label="Job Title"    name="jobTitle"    required placeholder="e.g. Software Engineer" {...field("jobTitle")} />
        <FormInput label="Start Date"   name="startDate"   required type="date" {...field("startDate")} />
        <FormInput label="End Date"     name="endDate"     type="date" {...field("endDate")} />
      </div>
      <FormInput
        label="Description" name="description" type="textarea" rows={4}
        placeholder="Describe your role, responsibilities, and key achievements..."
        {...field("description")}
      />
      <div className="entry-form__actions">
        <button className="btn btn--ghost btn--sm" onClick={handleCancelEntry}>Cancel</button>
        <button className="btn btn--primary btn--sm" onClick={handleSaveEntry} disabled={isSaving}>
          {isSaving ? <span className="spinner" /> : editingId === "new" ? "Add Entry" : "Update Entry"}
        </button>
      </div>
    </div>
  );

  return (
    <SectionCard
      title="Experience" icon="💼"
      isEditing={isEditing && editingId === null}
      isSaving={isSaving}
      onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      onAdd={handleAddNew} addLabel="Add Experience"
      feedback={feedback}
    >
      <div className="timeline">
        {experience.map((exp, idx) => (
          <React.Fragment key={exp.expId}>
            {editingId === exp.expId ? (
              <div className="timeline-edit-wrapper">
                <div className="timeline-edit-header">
                  Editing: {exp.jobTitle} @ {exp.companyName}
                </div>
                <EntryForm />
              </div>
            ) : (
              <TimelineItem
                title={exp.jobTitle}
                subtitle={exp.companyName}
                description={exp.description}
                dateRange={`${fmt(exp.startDate)} — ${fmt(exp.endDate)}`}
                onEdit={() => handleEditEntry(exp)}
                onDelete={() => handleDeleteEntry(exp.expId)}
                isLast={idx === experience.length - 1 && editingId !== "new"}
              />
            )}
          </React.Fragment>
        ))}

        {editingId === "new" && (
          <div className="timeline-edit-wrapper timeline-edit-wrapper--new">
            <div className="timeline-edit-header">➕ New Experience Entry</div>
            <EntryForm />
          </div>
        )}

        {experience.length === 0 && editingId !== "new" && (
          <div className="empty-state">
            <span>💼</span>
            <p>No experience listed yet. Click "+ Add Experience" to begin.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default ExperienceSection;
