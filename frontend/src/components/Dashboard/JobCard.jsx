import { MapPin, DollarSign, Clock, ChevronRight, Users } from 'lucide-react';

const TYPE_COLORS = {
  'Full-time': { bg: '#e0f2fe', color: '#0369a1' },
  'Part-time': { bg: '#fef9c3', color: '#854d0e' },
  'Contract':  { bg: '#ede9fe', color: '#6d28d9' },
  'Remote':    { bg: '#dcfce7', color: '#166534' },
};

export default function JobCard({ job, index }) {
  const typeStyle = TYPE_COLORS[job.type] || { bg: '#f1f5f9', color: '#475569' };
  const initial = job.company.charAt(0).toUpperCase();

  return (
    <article
      className="job-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top row */}
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

      {/* Title + Company */}
      <div className="card-heading">
        <h3 className="job-title">{job.title}</h3>
        <p className="job-company">{job.company}</p>
      </div>

      {/* Info row */}
      <div className="card-info-row">
        <span className="info-chip">
          <MapPin size={13} /> {job.location}
        </span>
        <span className="info-chip">
          <DollarSign size={13} /> {job.salary}
        </span>
      </div>

      {/* Description */}
      <p className="job-description">{job.description}</p>

      {/* Tags */}
      <div className="tags-row">
        {job.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <span className="applicants-count">
          <Users size={14} />
          {job.applicants} applicants
        </span>
        <button className="view-btn">
          View Details <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}
