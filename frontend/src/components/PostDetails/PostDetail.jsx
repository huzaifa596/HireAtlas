import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../Dashboard/Navbar";
import "./PostDetail.css";

/* ─── helpers ──────────────────────────────────────────────── */
const fmt = (n, cur = "USD") => {
  if (n == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n);
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const LEVEL_CLASS = {
  beginner:     "lvl-beginner",
  intermediate: "lvl-intermediate",
  advanced:     "lvl-advanced",
  expert:       "lvl-expert",
};

/* ─── sub-components ───────────────────────────────────────── */
function Avatar({ name, size = "md" }) {
  return (
    <div className={`ha-avatar ha-avatar--${size}`} aria-hidden="true">
      {initials(name) || "?"}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="ha-card">
      <div className="ha-card-header">
        <span className="ha-card-icon">{icon}</span>
        <h2 className="ha-card-title">{title}</h2>
      </div>
      <div className="ha-card-body">{children}</div>
    </div>
  );
}

function MetaPill({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="ha-meta-pill">
      <span className="ha-meta-icon">{icon}</span>
      <div className="ha-meta-text">
        <span className="ha-meta-label">{label}</span>
        <span className="ha-meta-value">{value}</span>
      </div>
    </div>
  );
}

/* ─── main component ───────────────────────────────────────── */
// Props (no React Router):
//   postId  — the ID to fetch, passed down from Dashboard
//   onBack  — callback to return to the job list (setSelectedPostId(null))
export default function PostDetail({ postId, onBack }) {
  const [post,           setPost]   = useState(null);
  const [skills,         setSkills] = useState([]);
  const [qualifications, setQuals]  = useState([]);
  const [status,         setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");

    API.get(`dashboard/posts/${postId}`)

      .then(({ data }) => {

        if (cancelled) return;

        // Express returns: { status, post: { ...postDetails[0], skills, qualifications } }
        const postData  = data.post;
        const skillsData = data.post?.skills        ?? [];
        const qualsData  = data.post?.qualifications ?? [];

        // Express sends 404 with { status: 'ERROR', message: 'Post not found' }
        // SP itself returns Status: 'POST_NOT_FOUND' in the first record
        if (!postData || postData.Status === 'POST_NOT_FOUND') {
          setStatus("not_found");
          return;
        }
        setPost(postData);
        setSkills(skillsData ?? []);
        setQuals(qualsData ?? []);
        setStatus("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        // Express returns 404 for not found — everything else is a server error
        const httpStatus = err?.response?.status;
        setStatus(httpStatus === 404 ? "not_found" : "error");
      });

    return () => { cancelled = true; };
  }, [postId]);

  /* ── Loading ── */
  if (status === "loading") {
    return (
      <>
        <Navbar />
        <div className="ha-state-screen">
          <div className="ha-spinner" />
          <p className="ha-state-msg">Loading job details…</p>
        </div>
      </>
    );
  }

  /* ── Not found ── */
  if (status === "not_found") {
    return (
      <>
        <Navbar />
        <div className="ha-state-screen">
          <div className="ha-state-emoji">🔍</div>
          <h2 className="ha-state-title">Post not found</h2>
          <p className="ha-state-msg">
            This listing may have been removed or the link is incorrect.
          </p>
          <button className="ha-btn ha-btn--outline" onClick={onBack}>
            ← Back to Posts
          </button>
        </div>
      </>
    );
  }

  /* ── Error ── */
  if (status === "error") {
    return (
      <>
        <Navbar />
        <div className="ha-state-screen">
          <div className="ha-state-emoji">⚠️</div>
          <h2 className="ha-state-title">Something went wrong</h2>
          <p className="ha-state-msg">We couldn't load this post. Please try again.</p>
          <button className="ha-btn ha-btn--outline" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </>
    );
  }

  /* ── Salary string ── */
  const minF   = fmt(post.minSalary, post.salCurrency);
  const maxF   = fmt(post.maxSalary, post.salCurrency);
  const salary = minF && maxF ? `${minF} – ${maxF}`
               : minF         ? `From ${minF}`
               : maxF         ? `Up to ${maxF}`
               :                "Not disclosed";

  return (
    <>
      <Navbar />

      <main className="ha-root">
        <div className="ha-page-wrap">

          {/* ── Back button — calls onBack instead of navigate(-1) ── */}
          <button className="ha-back-btn" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Posts
          </button>

          {/* ── Banner ── */}
          <div className="ha-banner">
            <div className="ha-banner-left">
              <Avatar name={post.companyName} size="lg" />
              <div className="ha-banner-info">
                <h1 className="ha-banner-title">{post.jobTitle}</h1>
                <p className="ha-banner-company">{post.companyName}</p>
                <div className="ha-banner-chips">
                  {post.location && (
                    <span className="ha-banner-chip">📍 {post.location}</span>
                  )}
                  <span className="ha-banner-chip">
                    🗓 Posted {fmtDate(post.postedDate)}
                  </span>
                  {post.isRemote && (
                    <span className="ha-banner-chip ha-banner-chip--remote">
                      🌐 Remote
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="ha-banner-right">
              <button className="ha-btn ha-btn--apply">Apply Now</button>
            </div>
          </div>

          {/* ── Overview ── */}
          <div className="ha-card ha-card--flat">
            <div className="ha-meta-grid">
              <MetaPill icon="💰" label="Salary Range"     value={salary} />
              <MetaPill icon="⏱️" label="Employment Type"  value={post.empType} />
              <MetaPill icon="📈" label="Experience Level" value={post.experienceLevel} />
              <MetaPill icon="🗂️" label="Job Category"     value={post.jobCategory} />
            </div>
          </div>

          {/* ── Description ── */}
          <SectionCard title="Job Description" icon="📄">
            {post.description ? (
              <div className="ha-description">
                {post.description.split("\n").map((para, i) =>
                  para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                )}
              </div>
            ) : (
              <p className="ha-empty">No description provided.</p>
            )}
          </SectionCard>

          {/* ── Skills ── */}
          <SectionCard title="Required Skills" icon="🛠️">
            {skills.length === 0 ? (
              <p className="ha-empty">No specific skills listed.</p>
            ) : (
              <div className="ha-skills-grid">
                {skills.map((s) => (
                  <div key={s.skillId} className="ha-skill-chip">
                    <div className="ha-skill-top">
                      <span className="ha-skill-name">{s.skillName}</span>
                      <span className={`ha-skill-badge ${LEVEL_CLASS[s.requiredLevel?.toLowerCase()] ?? "lvl-default"}`}>
                        {s.requiredLevel}
                      </span>
                    </div>
                    {s.category && (
                      <span className="ha-skill-cat">{s.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Qualifications ── */}
          <SectionCard title="Qualifications" icon="🎓">
            {qualifications.length === 0 ? (
              <p className="ha-empty">No qualifications listed.</p>
            ) : (
              <div className="ha-quals-list">
                {qualifications.map((q) => (
                  <div key={q.qualId} className="ha-qual-row">
                    <div className="ha-qual-dot" />
                    <div className="ha-qual-text">
                      <span className="ha-qual-degree">
                        {q.minDegree}
                        {q.fieldOfStudy ? ` in ${q.fieldOfStudy}` : ""}
                      </span>
                      {q.minGrade && (
                        <span className="ha-qual-grade">
                          Minimum grade: <strong>{q.minGrade}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Posted by ── */}
          <SectionCard title="Posted By" icon="👤">
            <div className="ha-creator-row">
              <Avatar name={post.creatorName} size="sm" />
              <div className="ha-creator-info">
                <span className="ha-creator-name">{post.creatorName}</span>
                <a href={`mailto:${post.creatorEmail}`} className="ha-creator-email">
                  {post.creatorEmail}
                </a>
              </div>
            </div>
          </SectionCard>

          {/* ── Apply CTA footer ── */}
          <div className="ha-apply-footer">
            <div className="ha-apply-footer-text">
              <h3>Interested in this role?</h3>
              <p>Submit your application to <strong>{post.companyName}</strong> today.</p>
            </div>
            <button className="ha-btn ha-btn--apply ha-btn--lg">Apply Now</button>
          </div>

        </div>
      </main>
    </>
  );
}
