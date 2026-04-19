// sections/EducationSection.jsx
import React, { useState } from "react";
import SectionCard from "./SectionCard";
import TimelineItem from "./TimelineItem";
import FormInput from "./FormInput";
import { levelOptions } from "./mockData";
// import { addEducation, updateEducation, deleteEducation } from "../services/profileApi";

const EMPTY = {
  instituteName: "", level: "", degreeName: "",
  grade: "", startDate: "", endDate: "",
};

const fmt = (d) => {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const EducationSection = ({ userId, education: init, onEducationUpdated }) => {
  const [education, setEducation] = useState(init);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // eduId | "new" | null
  const [form,      setForm]      = useState({ ...EMPTY });
  const [errors,    setErrors]    = useState({});
  const [isSaving,  setIsSaving]  = useState(false);
  const [feedback,  setFeedback]  = useState(null);

  // Section-level edit toggle (enables per-entry edit/delete buttons)
  const handleEdit   = () => { setIsEditing(true);  setFeedback(null); };
  const handleCancel = () => { setIsEditing(false); setEditingId(null); setForm({ ...EMPTY }); setErrors({}); };
  const handleSave   = () => { setIsEditing(false); setEditingId(null); };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingId("new");
    setForm({ ...EMPTY });
    setErrors({});
  };

  const handleEditEntry = (edu) => {
    setEditingId(edu.eduId);
    setForm({ ...edu });
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.instituteName?.trim()) e.instituteName = "Institute name is required";
    if (!form.level)                 e.level         = "Level is required";
    if (!form.degreeName?.trim())    e.degreeName    = "Degree name is required";
    if (!form.startDate)             e.startDate     = "Start date is required";
    return e;
  };

  const handleSaveEntry = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSaving(true);
    setFeedback(null);
    try {
      await new Promise((r) => setTimeout(r, 700)); // replace with real API call
      let updated;
      if (editingId === "new") {
        const entry = { ...form, eduId: Date.now() };
        updated = [entry, ...education];
        setFeedback({ type: "success", message: "Education entry added." });
      } else {
        updated = education.map((e) => e.eduId === editingId ? { ...e, ...form } : e);
        setFeedback({ type: "success", message: "Education entry updated." });
      }
      setEducation(updated);
      onEducationUpdated?.(updated);
      setEditingId(null);
      setForm({ ...EMPTY });
      if (editingId === "new") setIsEditing(false);
    } catch {
      setFeedback({ type: "error", message: "Failed to save. Try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (eduId) => {
    if (!window.confirm("Remove this education entry?")) return;
    try {
      await new Promise((r) => setTimeout(r, 400));
      const updated = education.filter((e) => e.eduId !== eduId);
      setEducation(updated);
      onEducationUpdated?.(updated);
      setFeedback({ type: "success", message: "Education entry removed." });
      if (editingId === eduId) { setEditingId(null); setForm({ ...EMPTY }); }
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
        <FormInput label="Institute Name" name="instituteName" required placeholder="e.g. LUMS" {...field("instituteName")} />
        <FormInput label="Level"          name="level"         required type="select" options={levelOptions} {...field("level")} />
        <FormInput label="Degree / Program" name="degreeName" required placeholder="e.g. BS Computer Science" {...field("degreeName")} />
        <FormInput label="Grade / GPA"    name="grade"         placeholder="e.g. 3.8/4.0 or 85%" {...field("grade")} />
        <FormInput label="Start Date"     name="startDate"     required type="date" {...field("startDate")} />
        <FormInput label="End Date"       name="endDate"       type="date" {...field("endDate")} />
      </div>
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
      title="Education" icon="🎓"
      isEditing={isEditing && editingId === null}
      isSaving={isSaving}
      onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      onAdd={handleAddNew} addLabel="Add Education"
      feedback={feedback}
    >
      <div className="timeline">
        {education.map((edu, idx) => (
          <React.Fragment key={edu.eduId}>
            {editingId === edu.eduId ? (
              <div className="timeline-edit-wrapper">
                <div className="timeline-edit-header">Editing: {edu.instituteName}</div>
                <EntryForm />
              </div>
            ) : (
              <TimelineItem
                title={edu.degreeName}
                subtitle={edu.instituteName}
                meta={`${edu.level}${edu.grade ? " · " + edu.grade : ""}`}
                dateRange={`${fmt(edu.startDate)} — ${fmt(edu.endDate)}`}
                onEdit={() => handleEditEntry(edu)}
                onDelete={() => handleDeleteEntry(edu.eduId)}
                isLast={idx === education.length - 1 && editingId !== "new"}
              />
            )}
          </React.Fragment>
        ))}

        {editingId === "new" && (
          <div className="timeline-edit-wrapper timeline-edit-wrapper--new">
            <div className="timeline-edit-header">➕ New Education Entry</div>
            <EntryForm />
          </div>
        )}

        {education.length === 0 && editingId !== "new" && (
          <div className="empty-state">
            <span>🎓</span>
            <p>No education entries yet. Click "+ Add Education" to get started.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default EducationSection;
