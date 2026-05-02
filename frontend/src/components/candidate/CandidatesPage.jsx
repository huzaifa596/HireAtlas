import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, User, Clock, ChevronDown } from "lucide-react";
import API from "../../services/api";
import "./CandidatesPage.css";

const STATUS_STYLES = {
  Pending: { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  Reviewed: { bg: "#e0f2fe", color: "#0369a1", dot: "#0ea5e9" },
  Accepted: { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  Rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

const STATUSES = ["Pending", "Reviewed", "Accepted", "Rejected"];

function CandidateCard({ candidate, onStatusChange }) {
  const {
    applicationId,
    applicantName,
    applicantEmail,
    status,
    applicationDate,
    cvPath,
  } = candidate;
  const [current, setCurrent] = useState(status);
  const [updating, setUpdating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (newStatus === current) {
        setDropdownOpen(false);
        return;
      }
      setUpdating(true);
      setDropdownOpen(false);
      try {
        await API.patch(`/applications/${applicationId}/status`, {
          status: newStatus,
        });
        setCurrent(newStatus);
        onStatusChange?.(applicationId, newStatus);
      } catch (err) {
        console.error("Failed to update status:", err);
      } finally {
        setUpdating(false);
      }
    },
    [applicationId, current, onStatusChange],
  );

  const style = STATUS_STYLES[current] || STATUS_STYLES.Pending;
  const initial = applicantName?.charAt(0).toUpperCase() ?? "?";
  const formattedDate = applicationDate
    ? new Date(applicationDate).toLocaleDateString()
    : "Recently";

  return (
    <div className="candidate-card">
      <div className="candidate-left">
        <div className="candidate-avatar">{initial}</div>
        <div className="candidate-info">
          <p className="candidate-name">{applicantName || "Unknown"}</p>
          <p className="candidate-email">{applicantEmail || "—"}</p>
          <span className="candidate-date">
            <Clock size={12} /> Applied {formattedDate}
          </span>
        </div>
      </div>

      <div className="candidate-right">
        {/* View CV link */}
        {cvPath && (
          <a
            href={`http://localhost:3000/${cvPath}`}
            target="_blank"
            rel="noreferrer"
            className="view-cv-link"
          >
            View CV
          </a>
        )}
        <div className="status-dropdown-wrapper">
          <button
            className="status-dropdown-btn"
            style={{ background: style.bg, color: style.color }}
            onClick={() => setDropdownOpen((o) => !o)}
            disabled={updating}
          >
            <span className="status-dot" style={{ background: style.dot }} />
            {updating ? "Saving…" : current}
            <ChevronDown size={13} />
          </button>

          {dropdownOpen && (
            <div className="status-dropdown-menu">
              {STATUSES.map((s) => {
                const st = STATUS_STYLES[s];
                return (
                  <button
                    key={s}
                    className={`status-option ${s === current ? "active" : ""}`}
                    onClick={() => handleStatusChange(s)}
                  >
                    <span
                      className="status-dot"
                      style={{ background: st.dot }}
                    />
                    {s}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidatesPage({ postId, jobTitle, onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    API.get(`/applications/post/${postId}`)
      .then((res) => setCandidates(res.data.applications ?? res.data))
      .catch((err) => {
        console.error("fetchCandidates:", err);
        setError("Failed to load candidates.");
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleStatusChange = useCallback((applicationId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.applicationId === applicationId ? { ...c, status: newStatus } : c,
      ),
    );
  }, []);

  return (
    <div className="candidates-page">
      <div className="candidates-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h2 className="candidates-title">Candidates</h2>
          {jobTitle && <p className="candidates-subtitle">{jobTitle}</p>}
        </div>
        <span className="candidates-count">
          <User size={14} />
          {candidates.length} applicant{candidates.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="candidates-empty">
          <p>Loading candidates…</p>
        </div>
      ) : error ? (
        <div className="candidates-empty">
          <p>{error}</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="candidates-empty">
          <p className="empty-title">No applications yet</p>
          <p className="empty-sub">Candidates who apply will appear here</p>
        </div>
      ) : (
        <div className="candidates-list">
          {candidates.map((c) => (
            <CandidateCard
              key={c.applicationId}
              candidate={c}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
