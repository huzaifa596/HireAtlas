// sections/EducationSection.jsx
import React, { useState } from "react";
import SectionCard from "./SectionCard";
import TimelineItem from "./TimelineItem";
import FormInput from "./FormInput";
import API from '../../services/api';

const levelOptions = ["Matriculation","Intermediate","Bachelor's","Master's","PhD","Diploma","Other"];
const EMPTY = {
  instituteName: "", level: "", degreeName: "",
  grade: "", startDate: "", endDate: "",
};

const fmt = (d) => {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// ── Moved OUTSIDE EducationSection ──
const EntryForm = ({ form, errors, isSaving, editingId, onField, onSave, onCancel }) => (
  <div className="entry-form">
    <div className="entry-form__grid">
      <FormInput label="Institute Name"   name="instituteName" required placeholder="e.g. LUMS"              value={form.instituteName} onChange={onField("instituteName")} error={errors.instituteName} />
      <FormInput label="Level"            name="level"         required type="select" options={levelOptions}  value={form.level}         onChange={onField("level")}         error={errors.level} />
      <FormInput label="Degree / Program" name="degreeName"    required placeholder="e.g. BS Computer Science" value={form.degreeName}   onChange={onField("degreeName")}    error={errors.degreeName} />
      <FormInput label="Grade / GPA"      name="grade"                  placeholder="e.g. 3.8/4.0 or 85%"   value={form.grade}         onChange={onField("grade")}         error={errors.grade} />
      <FormInput label="Start Date"       name="startDate"     required type="date"                          value={form.startDate}     onChange={onField("startDate")}     error={errors.startDate} />
      <FormInput label="End Date"         name="endDate"                type="date"                          value={form.endDate}       onChange={onField("endDate")}       error={errors.endDate} />
    </div>
    <div className="entry-form__actions">
      <button className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel</button>
      <button className="btn btn--primary btn--sm" onClick={onSave} disabled={isSaving}>
        {isSaving ? <span className="spinner" /> : editingId === "new" ? "Add Entry" : "Update Entry"}
      </button>
    </div>
  </div>
);

const EducationSection = ({ userId, education: init, onEducationUpdated }) => {
  const [education, setEducation] = useState(init);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState({ ...EMPTY });
  const [errors,    setErrors]    = useState({});
  const [isSaving,  setIsSaving]  = useState(false);
  const [feedback,  setFeedback]  = useState(null);

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

  // ── field handler now returns an onChange function directly ──
  const onField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSaveEntry = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload = editingId === "new"
        ? { ...form }
        : { ...form, eduId: editingId };

      const response = await API.patch('/user/education', payload);
      const saved = response.data.education;

      let updated;
      if (editingId === "new") {
        updated = [saved, ...education];
        setFeedback({ type: "success", message: "Education entry added." });
      } else {
        updated = education.map((e) => e.eduId === editingId ? saved : e);
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
      await API.delete(`/user/education/${eduId}`);
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
                <EntryForm
                  form={form} errors={errors} isSaving={isSaving}
                  editingId={editingId} onField={onField}
                  onSave={handleSaveEntry} onCancel={handleCancelEntry}
                />
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
            <EntryForm
              form={form} errors={errors} isSaving={isSaving}
              editingId={editingId} onField={onField}
              onSave={handleSaveEntry} onCancel={handleCancelEntry}
            />
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