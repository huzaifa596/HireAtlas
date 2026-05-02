import { MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import "./ApplicationCard.css";

const STATUS_STYLES = {
  Pending:  { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  Reviewed: { bg: "#e0f2fe", color: "#0369a1", dot: "#0ea5e9" },
  Accepted: { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  Rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

export default function ApplicationCard({ application }) {
  const {
    jobTitle,
    companyName,
    location,
    empType,
    experienceLevel,
    status,
    applicationDate,
    isRemote,
  } = application;

  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const initial = companyName?.charAt(0).toUpperCase() ?? "?";
  const displayLocation = isRemote ? "Remote" : location || "N/A";
  const formattedDate = applicationDate
    ? new Date(applicationDate).toLocaleDateString()
    : "Recently";

  return (
    <article className="app-card">
      <div className="app-card-top">
        <div className="app-company-logo">{initial}</div>
        <div className="app-card-meta">
          <span
            className="app-status-badge"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            <span
              className="status-dot"
              style={{ background: statusStyle.dot }}
            />
            {status}
          </span>
          <span className="app-posted-time">
            <Clock size={13} /> Applied {formattedDate}
          </span>
        </div>
      </div>

      <div className="app-card-heading">
        <h3 className="app-job-title">{jobTitle}</h3>
        <p className="app-company-name">
          <Building2 size={13} /> {companyName || "Unknown Company"}
        </p>
      </div>

      <div className="app-info-row">
        <span className="app-info-chip">
          <MapPin size={13} /> {displayLocation}
        </span>
        {empType && (
          <span className="app-info-chip">
            <Briefcase size={13} /> {empType}
          </span>
        )}
        {experienceLevel && (
          <span className="app-info-chip">
            <Briefcase size={13} /> {experienceLevel}
          </span>
        )}
      </div>
    </article>
  );
}
