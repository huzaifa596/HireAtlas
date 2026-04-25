// FilterSidebar.jsx
import { useState } from "react";
import "./filterTab.css";

// ─── Salary buckets ───────────────────────────────────────────────────────
const SALARY_BUCKETS = [
  { value: "0-30000",       label: "Under PKR 30,000",       min: 0,      max: 30000  },
  { value: "30000-60000",   label: "PKR 30,000 – 60,000",   min: 30000,  max: 60000  },
  { value: "60000-100000",  label: "PKR 60,000 – 100,000",  min: 60000,  max: 100000 },
  { value: "100000-200000", label: "PKR 100,000 – 200,000", min: 100000, max: 200000 },
  { value: "200000-999999", label: "PKR 200,000+",          min: 200000, max: null   },
];

// ─── Default state ────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  empType:         [],
  experienceLevel: [],
  isRemote:        "any",
  jobCategory:     [],
  salaryRange:     [],
  postedWithin:    "any",
  location:        "",
  sortBy:          "newest",
};

// ─── Build API params ─────────────────────────────────────────────────────
export function buildApiParams(filters) {
  const params = {};

  if (filters.empType?.length)
    params.empType = filters.empType;

  if (filters.experienceLevel?.length)
    params.experienceLevel = filters.experienceLevel;

  if (filters.isRemote !== "any")
    params.isRemote = Number(filters.isRemote);

  if (filters.jobCategory?.length)
    params.jobCategory = filters.jobCategory;

  if (filters.salaryRange?.length) {
    const matched = SALARY_BUCKETS.filter(b => filters.salaryRange.includes(b.value));
    params.minSalary = Math.min(...matched.map(b => b.min));
    params.maxSalary = matched.some(b => b.max === null)
      ? null
      : Math.max(...matched.map(b => b.max));
  }

  if (filters.postedWithin !== "any") {
    const d = new Date();
    d.setDate(d.getDate() - Number(filters.postedWithin));
    params.postedAfter = d.toISOString().split("T")[0];
  }

  if (filters.location?.trim())
    params.location = filters.location.trim();

  params.sortBy = filters.sortBy ?? "newest";

  return params;
}

// ─── Section definitions ──────────────────────────────────────────────────
const filterSections = [
  {
    id: "empType",
    label: "Employment Type",
    type: "check",
    options: [
      { value: "Full-Time",  label: "Full Time"  },
      { value: "Part-Time",  label: "Part Time"  },
      { value: "Contract",   label: "Contract"   },
      { value: "Freelance",  label: "Freelance"  },
      { value: "Internship", label: "Internship" },
    ],
  },
  {
    id: "experienceLevel",
    label: "Experience Level",
    type: "check",
    options: [
      { value: "Entry",     label: "Entry Level"    },
      { value: "Mid",       label: "Mid Level"      },
      { value: "Senior",    label: "Senior Level"   },
      { value: "Lead",      label: "Lead / Manager" },
      { value: "Executive", label: "Executive"      },
    ],
  },
  {
    id: "isRemote",
    label: "Work Mode",
    type: "radio",
    options: [
      { value: "any", label: "Any"         },
      { value: "1",   label: "Remote Only" },
      { value: "0",   label: "On-site"     },
    ],
  },
  {
    id: "jobCategory",
    label: "Job Category",
    type: "check",
    options: [
      { value: "Technology", label: "Technology" },
      { value: "Design",     label: "Design"     },
      { value: "Marketing",  label: "Marketing"  },
      { value: "Finance",    label: "Finance"    },
      { value: "Healthcare", label: "Healthcare" },
      { value: "Education",  label: "Education"  },
      { value: "Research",   label: "Research"   },
      { value: "Sales",      label: "Sales"      },
      { value: "Operations", label: "Operations" },
    ],
  },
  {
    id: "salaryRange",
    label: "Salary Range (PKR)",
    type: "check",
    options: SALARY_BUCKETS.map(({ value, label }) => ({ value, label })),
  },
  {
    id: "postedWithin",
    label: "Date Posted",
    type: "radio",
    options: [
      { value: "1",   label: "Last 24 hours" },
      { value: "7",   label: "Last 7 days"   },
      { value: "30",  label: "Last 30 days"  },
      { value: "any", label: "Anytime"       },
    ],
  },
  {
    id: "sortBy",
    label: "Sort By",
    type: "radio",
    options: [
      { value: "newest",        label: "Newest First"         },
      { value: "salaryHighest", label: "Highest Salary First" },
      { value: "salaryLowest",  label: "Lowest Salary First"  },
    ],
  },
];

// ─── Helper: count active selections ──────────────────────────────────────
function sectionActiveCount(section, value) {
  if (section.type === "radio") {
    const def = section.id === "sortBy" ? "newest" : "any";
    return value !== def ? 1 : 0;
  }
  return value?.length || 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────

function ChevronIcon({ open }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`chevron-icon ${open ? "chevron-icon--open" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Control({ checked, radio }) {
  return (
    <span
      className={`filter-control ${
        radio ? "filter-control--radio" : ""
      } ${checked ? "filter-control--checked" : ""}`}
    >
      {checked && !radio && (
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
          <polyline
            points="2,6 5,9 10,3"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {checked && radio && <span className="filter-control__radio-dot" />}
    </span>
  );
}

function FilterSection({ section, value, onChange }) {
  const [open, setOpen] = useState(true);
  const isRadio = section.type === "radio";
  const defaultRadioVal = section.id === "sortBy" ? "newest" : "any";

  const isChecked = (val) =>
    isRadio ? value === val : (value || []).includes(val);

  const toggle = (val) => {
    if (isRadio) {
      onChange(val);
      return;
    }
    const prev = value || [];
    onChange(isChecked(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const activeCount = sectionActiveCount(section, value);

  return (
    <div className="filter-section">
      <button
        className="filter-section__header"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="filter-section__label-row">
          <span className="filter-section__label">{section.label}</span>
          {activeCount > 0 && (
            <span className="filter-section__badge">{activeCount}</span>
          )}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="filter-section__options">
          {section.options.map((opt) => (
            <label
              key={opt.value}
              className="filter-option"
              onClick={() => toggle(opt.value)}
            >
              <Control checked={isChecked(opt.value)} radio={isRadio} />
              <span
                className={`filter-option__text ${
                  isChecked(opt.value) ? "filter-option__text--active" : ""
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationInput({ value, onChange }) {
  const [open, setOpen] = useState(true);
  const hasValue = value?.trim().length > 0;

  return (
    <div className="filter-section">
      <button
        className="filter-section__header"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="filter-section__label-row">
          <span className="filter-section__label">Location</span>
          {hasValue && <span className="filter-section__badge">1</span>}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="location-input__wrapper">
          <div className="location-input__container">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="City or area..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="location-input__field"
            />
            {hasValue && (
              <button
                className="location-input__clear"
                onClick={() => onChange("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
export default function FilterSidebar({ onApply }) {
  const [filters, setFilters] = useState(DEFAULT_STATE);

  const totalActive =
    (filters.empType?.length || 0) +
    (filters.experienceLevel?.length || 0) +
    (filters.isRemote !== "any" ? 1 : 0) +
    (filters.jobCategory?.length || 0) +
    (filters.salaryRange?.length || 0) +
    (filters.postedWithin !== "any" ? 1 : 0) +
    (filters.sortBy !== "newest" ? 1 : 0) +
    (filters.location?.trim() ? 1 : 0);

  const set = (id, val) => setFilters((prev) => ({ ...prev, [id]: val }));
  const reset = () => setFilters(DEFAULT_STATE);
  const apply = () => {
    if (onApply) onApply(buildApiParams(filters));
  };

  return (
    <aside className="filter-sidebar">
      {/* ── Header ── */}
      <div className="filter-sidebar__header">
        <div className="filter-sidebar__header-left">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="filter-sidebar__header-title">Filters</span>
          {totalActive > 0 && (
            <span className="filter-sidebar__total-badge">{totalActive}</span>
          )}
        </div>
        {totalActive > 0 && (
          <button className="filter-sidebar__clear-btn" onClick={reset}>
            Clear all
          </button>
        )}
      </div>

      <div className="filter-sidebar__divider" />

      {/* ── Sections ── */}
      <div className="filter-sidebar__sections">
        <LocationInput
          value={filters.location}
          onChange={(val) => set("location", val)}
        />

        {filterSections.map((sec) => (
          <FilterSection
            key={sec.id}
            section={sec}
            value={filters[sec.id]}
            onChange={(val) => set(sec.id, val)}
          />
        ))}
      </div>

      {/* ── Apply ── */}
      <div className="filter-sidebar__apply-area">
        <button className="filter-sidebar__apply-btn" onClick={apply}>
          Apply Filters
          {totalActive > 0 && (
            <span className="filter-sidebar__apply-badge">{totalActive}</span>
          )}
        </button>
      </div>
    </aside>
  );
}