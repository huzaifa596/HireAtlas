import {
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  Users,
  Briefcase,
  X,
} from "lucide-react";
import "./jobCard.css";
import AlertBox from "../alertBox/alert.jsx";
import { useState } from "react";

const TYPE_COLORS = {
  "Full-time": { bg: "#e0f2fe", color: "#0369a1" },
  "Part-time": { bg: "#fef9c3", color: "#854d0e" },
  Contract: { bg: "#ede9fe", color: "#6d28d9" },
  Remote: { bg: "#dcfce7", color: "#166534" },
};

export default function JobCard({
  job,
  index,
  onViewPost,
  isMyPost,
  onDelete,
  onSeeCandidates, // ← new prop
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const typeStyle = TYPE_COLORS[job.type] || {
    bg: "#f1f5f9",
    color: "#475569",
  };
  const initial = job.company?.charAt(0).toUpperCase() ?? "?";

  function handleConfirmDelete() {
    setShowConfirm(false);
    onDelete?.(job.id);
  }

  function handleDeleteClick() {
    setShowConfirm(true);
  }

  return (
    <article
      className="job-card"
      style={{ animationDelay: `${index * 80}ms`, position: "relative" }}
    >
      <AlertBox
        isOpen={showConfirm}
        type="confirm"
        title="Delete this post"
        confirmDanger={true}
        message={`Are you sure you want to delete ${job.title} at company ${job.company}?`}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />

      {isMyPost && (
        <button
          className="delete-btn"
          onClick={handleDeleteClick}
          aria-label="Delete post"
        >
          <X size={16} />
        </button>
      )}

      <div className="card-top">
        <div className="company-logo">{initial}</div>
        <div className="card-meta">
          <span
            className="type-badge"
            style={{ background: typeStyle.bg, color: typeStyle.color }}
          >
            {job.type}
          </span>
          <span className="posted-time">
            <Clock size={13} />
            {job.posted}
          </span>
        </div>
      </div>

      <div className="card-heading">
        <h3 className="job-title">{job.title}</h3>
        <p className="job-company">{job.company}</p>
      </div>

      <div className="card-info-row">
        <span className="info-chip">
          <MapPin size={13} /> {job.location}
        </span>
        <span className="info-chip">
          <DollarSign size={13} /> {job.salary}
        </span>
        {job.experienceLevel && (
          <span className="info-chip">
            <Briefcase size={13} /> {job.experienceLevel}
          </span>
        )}
      </div>

      <p className="job-description">{job.description}</p>

      {job.tags?.length > 0 && (
        <div className="tags-row">
          {job.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <span className="applicants-count">
          <Users size={14} />
          Posted by {job.postedBy ?? "Unknown"}
        </span>

        <div className="card-footer-actions">
          {/* See Candidates — only on My Posts */}
          {isMyPost && (
            <button
              className="candidates-btn"
              onClick={() => onSeeCandidates?.(job.id, job.title)}
            >
              <Users size={14} /> See Candidates
            </button>
          )}

          <button className="view-btn" onClick={() => onViewPost(job.id)}>
            View Details <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
