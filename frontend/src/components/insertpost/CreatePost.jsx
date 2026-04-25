import { useState, useEffect } from "react";
import API from "../../services/api";
import "./CreatePost.css";

/* ── Constants ─────────────────────────────────────────────── */
const EMP_TYPES        = ["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"];
const EXP_LEVELS       = ["Entry", "Mid", "Senior", "Lead", "Executive"];
const SKILL_LEVELS     = ["Beginner", "Intermediate", "Expert"];
const CURRENCIES       = ["PKR", "USD", "EUR", "GBP", "AED"];
const DEGREE_OPTIONS   = ["Matriculation", "Intermediate", "Bachelor's", "Master's", "PhD", "Diploma", "Other"];
const JOB_CATEGORIES   = [
  "Software Engineering", "Data Science", "Design", "Product Management",
  "Marketing", "Sales", "Finance", "Human Resources", "Operations",
  "Customer Support", "DevOps", "Cybersecurity", "Other",
];

const EMPTY_FORM = {
  jobTitle:        "",
  companyName:     "",
  description:     "",
  location:        "",
  empType:         "",
  jobCategory:     "",
  experienceLevel: "",
  minSalary:       "",
  maxSalary:       "",
  salCurrency:     "PKR",
  isRemote:        false,
  skills:          [],           // [{ skillId, skillName, requiredLevel }]
  qualification:   {             // single object
    minDegree:    "",
    fieldOfStudy: "",
    minGrade:     "",
  },
};

/* ── Helpers ────────────────────────────────────────────────── */
function FieldGroup({ label, required, error, children }) {
  return (
    <div className={`cp-field${error ? " cp-field--error" : ""}`}>
      <label className="cp-label">
        {label}
        {required && <span className="cp-required">*</span>}
      </label>
      {children}
      {error && <span className="cp-error-msg">⚠ {error}</span>}
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="cp-card">
      <div className="cp-card-header">
        <span className="cp-card-icon">{icon}</span>
        <h2 className="cp-card-title">{title}</h2>
      </div>
      <div className="cp-card-body">{children}</div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function CreatePost({ onBack, onSuccess }) {
  const [form,      setForm]    = useState({ ...EMPTY_FORM, qualification: { ...EMPTY_FORM.qualification } });
  const [errors,    setErrors]  = useState({});
  const [allSkills, setAllSkills] = useState([]);  // skills from DB
  const [loading,   setLoading] = useState(false);
  const [feedback,  setFeedback]= useState(null);  // { type, message }
  const [skillSearch, setSkillSearch] = useState("");

  /* fetch skills list on mount */
  useEffect(() => {
    API.get("/skills")
      .then(({ data }) => setAllSkills(data.skills || []))
      .catch(() => setAllSkills([]));  // silently fail — user can still submit without skills
  }, []);

  /* ── Field handlers ─────────────────────────────────────────── */
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const setQual = (key, value) => {
    setForm((f) => ({ ...f, qualification: { ...f.qualification, [key]: value } }));
  };

  /* ── Skill management ───────────────────────────────────────── */
  const addSkill = (skill) => {
    if (form.skills.find((s) => s.skillId === skill.skillId)) return;
    setForm((f) => ({
      ...f,
      skills: [...f.skills, { skillId: skill.skillId, skillName: skill.skillName, requiredLevel: "Beginner" }],
    }));
    setSkillSearch("");
  };

  const removeSkill = (skillId) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s.skillId !== skillId) }));
  };

  const updateSkillLevel = (skillId, level) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.map((s) => s.skillId === skillId ? { ...s, requiredLevel: level } : s),
    }));
  };

  /* ── Filtered skill dropdown ───────────────────────────────── */
  const filteredSkills = allSkills.filter(
    (s) =>
      s.skillName.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !form.skills.find((sel) => sel.skillId === s.skillId)
  );

  /* ── Validation ─────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.jobTitle.trim())    e.jobTitle    = "Job title is required";
    if (!form.empType)            e.empType     = "Employment type is required";
    if (!form.experienceLevel)    e.experienceLevel = "Experience level is required";
    if (form.minSalary && form.maxSalary && Number(form.minSalary) > Number(form.maxSalary))
      e.maxSalary = "Max salary must be ≥ min salary";
    return e;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setFeedback(null);

    const payload = {
      jobTitle:        form.jobTitle        || undefined,
      companyName:     form.companyName     || undefined,
      description:     form.description     || undefined,
      location:        form.location        || undefined,
      empType:         form.empType         || undefined,
      jobCategory:     form.jobCategory     || undefined,
      experienceLevel: form.experienceLevel || undefined,
      minSalary:       form.minSalary       ? Number(form.minSalary) : undefined,
      maxSalary:       form.maxSalary       ? Number(form.maxSalary) : undefined,
      salCurrency:     form.salCurrency,
      isRemote:        form.isRemote,
      skills: form.skills.map(({ skillId, requiredLevel }) => ({ skillId, requiredLevel })),
      qualification:
        form.qualification.minDegree || form.qualification.fieldOfStudy
          ? {
              minDegree:    form.qualification.minDegree    || undefined,
              fieldOfStudy: form.qualification.fieldOfStudy || undefined,
              minGrade:     form.qualification.minGrade     ? Number(form.qualification.minGrade) : undefined,
            }
          : undefined,
    };

    try {
      const res = await API.post("/dashboard/posts/createPost", payload);
      const { postId } = res.data;
      setFeedback({ type: "success", message: `Post created! ID: ${postId}` });
      setTimeout(() => onSuccess?.(postId), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create post. Please try again.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="cp-root">

      {/* ── Top bar ── */}
      <div className="cp-topbar">
        <button className="cp-back-btn" onClick={onBack}>
          ← Back to Posts
        </button>
        <div className="cp-topbar-right">
          <button className="cp-btn cp-btn--ghost" onClick={onBack}>Cancel</button>
          <button className="cp-btn cp-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="cp-spinner" /> : "Publish Post"}
          </button>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="cp-page-header">
        <div className="cp-page-header-inner">
          <div className="cp-page-icon">✍️</div>
          <div>
            <h1 className="cp-page-title">Create Job Post</h1>
            <p className="cp-page-sub">Fill in the details below to publish your listing</p>
          </div>
        </div>
      </div>

      {/* ── Feedback banner ── */}
      {feedback && (
        <div className={`cp-feedback cp-feedback--${feedback.type}`}>
          {feedback.type === "success" ? "✅" : "❌"} {feedback.message}
        </div>
      )}

      <div className="cp-content">

        {/* ══ 1. Basic Info ══ */}
        <SectionCard icon="📋" title="Basic Information">
          <div className="cp-grid cp-grid--1">
            <FieldGroup label="Job Title" required error={errors.jobTitle}>
              <input
                className="cp-input"
                placeholder="e.g. Senior React Developer"
                value={form.jobTitle}
                onChange={(e) => set("jobTitle", e.target.value)}
              />
            </FieldGroup>
          </div>

          <div className="cp-grid cp-grid--2">
            <FieldGroup label="Company Name">
              <input
                className="cp-input"
                placeholder="e.g. TechCorp Pvt Ltd"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Job Category">
              <select className="cp-input cp-select" value={form.jobCategory} onChange={(e) => set("jobCategory", e.target.value)}>
                <option value="">— Select Category —</option>
                {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FieldGroup>
          </div>

          <FieldGroup label="Job Description">
            <textarea
              className="cp-input cp-textarea"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FieldGroup>
        </SectionCard>

        {/* ══ 2. Job Details ══ */}
        <SectionCard icon="⚙️" title="Job Details">
          <div className="cp-grid cp-grid--3">
            <FieldGroup label="Employment Type" required error={errors.empType}>
              <select className="cp-input cp-select" value={form.empType} onChange={(e) => set("empType", e.target.value)}>
                <option value="">— Select —</option>
                {EMP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FieldGroup>

            <FieldGroup label="Experience Level" required error={errors.experienceLevel}>
              <select className="cp-input cp-select" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
                <option value="">— Select —</option>
                {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </FieldGroup>

            <FieldGroup label="Location">
              <input
                className="cp-input"
                placeholder="e.g. Lahore, Pakistan"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </FieldGroup>
          </div>

          {/* Remote toggle */}
          <div className="cp-remote-row">
            <div className="cp-remote-info">
              <span className="cp-remote-label">Remote Position</span>
              <span className="cp-remote-sub">Toggle on if this role can be done remotely</span>
            </div>
            <button
              type="button"
              className={`cp-toggle ${form.isRemote ? "cp-toggle--on" : ""}`}
              onClick={() => set("isRemote", !form.isRemote)}
              aria-pressed={form.isRemote}
            >
              <span className="cp-toggle-thumb" />
            </button>
          </div>
        </SectionCard>

        {/* ══ 3. Salary ══ */}
        <SectionCard icon="💰" title="Salary Range">
          <div className="cp-grid cp-grid--3">
            <FieldGroup label="Min Salary">
              <input
                className="cp-input"
                type="number"
                placeholder="e.g. 80000"
                min={0}
                value={form.minSalary}
                onChange={(e) => set("minSalary", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup label="Max Salary" error={errors.maxSalary}>
              <input
                className="cp-input"
                type="number"
                placeholder="e.g. 150000"
                min={0}
                value={form.maxSalary}
                onChange={(e) => set("maxSalary", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup label="Currency">
              <select className="cp-input cp-select" value={form.salCurrency} onChange={(e) => set("salCurrency", e.target.value)}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FieldGroup>
          </div>
          <p className="cp-hint">💡 Leave blank if you prefer not to disclose the salary</p>
        </SectionCard>

        {/* ══ 4. Skills ══ */}
        <SectionCard icon="🛠️" title="Required Skills">

          {/* Search / add skill */}
          <div className="cp-skill-search-wrap">
            <input
              className="cp-input cp-skill-search"
              placeholder="Search and add a skill..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
            {skillSearch && filteredSkills.length > 0 && (
              <div className="cp-skill-dropdown">
                {filteredSkills.slice(0, 8).map((s) => (
                  <button key={s.skillId} className="cp-skill-option" onClick={() => addSkill(s)}>
                    <span className="cp-skill-option-name">{s.skillName}</span>
                    {s.category && <span className="cp-skill-option-cat">{s.category}</span>}
                  </button>
                ))}
              </div>
            )}
            {skillSearch && filteredSkills.length === 0 && (
              <div className="cp-skill-dropdown">
                <p className="cp-skill-empty">No matching skills found in the database</p>
              </div>
            )}
          </div>

          {/* Selected skills */}
          {form.skills.length === 0 ? (
            <p className="cp-empty-hint">No skills added yet. Search above to add required skills.</p>
          ) : (
            <div className="cp-skills-list">
              {form.skills.map((s) => (
                <div key={s.skillId} className="cp-skill-row">
                  <div className="cp-skill-row-name">
                    <span className="cp-skill-dot" />
                    {s.skillName}
                  </div>
                  <select
                    className="cp-skill-level"
                    value={s.requiredLevel}
                    onChange={(e) => updateSkillLevel(s.skillId, e.target.value)}
                  >
                    {SKILL_LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <button className="cp-skill-remove" onClick={() => removeSkill(s.skillId)} title="Remove">✕</button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ══ 5. Qualification ══ */}
        <SectionCard icon="🎓" title="Required Qualification">
          <p className="cp-hint" style={{ marginBottom: 16 }}>Optional — leave blank if no specific qualification is required</p>
          <div className="cp-grid cp-grid--3">
            <FieldGroup label="Minimum Degree">
              <select className="cp-input cp-select" value={form.qualification.minDegree} onChange={(e) => setQual("minDegree", e.target.value)}>
                <option value="">— Select —</option>
                {DEGREE_OPTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FieldGroup>

            <FieldGroup label="Field of Study">
              <input
                className="cp-input"
                placeholder="e.g. Computer Science"
                value={form.qualification.fieldOfStudy}
                onChange={(e) => setQual("fieldOfStudy", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup label="Minimum Grade / GPA">
              <input
                className="cp-input"
                type="number"
                placeholder="e.g. 2.5"
                step="0.01"
                min={0}
                value={form.qualification.minGrade}
                onChange={(e) => setQual("minGrade", e.target.value)}
              />
            </FieldGroup>
          </div>
        </SectionCard>

        {/* ══ Bottom action bar ══ */}
        <div className="cp-action-bar">
          <button className="cp-btn cp-btn--ghost" onClick={onBack}>Cancel</button>
          <button className="cp-btn cp-btn--primary cp-btn--lg" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="cp-spinner" /> Publishing…</> : "🚀 Publish Job Post"}
          </button>
        </div>

      </div>
    </div>
  );
}