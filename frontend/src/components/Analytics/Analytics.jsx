import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import "./Analytics.css";

/* ── Colour palette for charts ── */
const PALETTE = [
  "#185FA5", "#0F6E56", "#7C3AED", "#B45309", "#0284C7",
  "#16A34A", "#DC2626", "#D97706", "#0E7490", "#BE185D",
];

const STATUS_COLORS = {
  Pending:  "#888780",
  Reviewed: "#378ADD",
  Accepted: "#1D9E75",
  Rejected: "#E24B4A",
};

/* ── Helper: count by key ── */
function countBy(arr, key) {
  const map = {};
  arr.forEach((item) => {
    const v = item[key] || "Unknown";
    map[v] = (map[v] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

/* ── Donut segment builder ── */
function buildDonutSegments(data, r = 54) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return data.map((d, i) => {
    const pct = total ? d.count / total : 0;
    const dash = pct * circ;
    const seg = { ...d, dasharray: `${dash} ${circ}`, dashoffset: -offset, color: PALETTE[i % PALETTE.length], pct: Math.round(pct * 100) };
    offset += dash;
    return seg;
  });
}

/* ── Sub-components ── */

function StatCard({ label, value, sub, subClass = "" }) {
  return (
    <div className="analytics-stat-card">
      <div className="analytics-stat-card__label">{label}</div>
      <div className="analytics-stat-card__value">{value}</div>
      {sub && <div className={`analytics-stat-card__sub ${subClass}`}>{sub}</div>}
    </div>
  );
}

function HBarChart({ title, sub, data, max }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card__title">{title}</div>
      <div className="analytics-card__sub">{sub}</div>
      <div className="analytics-bar-list">
        {data.map((item, i) => (
          <div className="analytics-bar-item" key={item.name}>
            <span className="analytics-bar-item__name" title={item.name}>{item.name}</span>
            <div className="analytics-bar-item__track">
              <div
                className="analytics-bar-item__fill"
                style={{
                  width: `${max ? (item.count / max) * 100 : 0}%`,
                  background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[(i + 1) % PALETTE.length]})`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </div>
            <span className="analytics-bar-item__count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutCard({ title, sub, data, centerPct, centerLabel }) {
  const r = 54;
  const segments = useMemo(() => buildDonutSegments(data, r), [data]);
  const circ = 2 * Math.PI * r;

  return (
    <div className="analytics-card">
      <div className="analytics-card__title">{title}</div>
      <div className="analytics-card__sub">{sub}</div>
      <div className="analytics-donut-wrap">
        <div className="analytics-donut">
          <svg className="analytics-donut__svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(170,200,255,0.18)" strokeWidth="12" />
            {segments.map((s, i) => (
              <circle
                key={i}
                cx="60" cy="60" r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <div className="analytics-donut__center">
            <span className="analytics-donut__pct">{centerPct}</span>
            <span className="analytics-donut__label">{centerLabel}</span>
          </div>
        </div>
        <div className="analytics-legend">
          {segments.map((s) => (
            <div className="analytics-legend__item" key={s.name}>
              <div className="analytics-legend__left">
                <span className="analytics-legend__dot" style={{ background: s.color }} />
                <span className="analytics-legend__name">{s.name}</span>
              </div>
              <span className="analytics-legend__val">{s.count} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, sub, data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="analytics-card">
      <div className="analytics-card__title">{title}</div>
      <div className="analytics-card__sub">{sub}</div>
      <div className="analytics-status-list">
        {data.map((item) => (
          <div key={item.name}>
            <div className="analytics-status-item__header">
              <span>{item.name}</span>
              <span className="analytics-status-item__count">{item.count}</span>
            </div>
            <div className="analytics-status-item__track">
              <div
                className="analytics-status-item__fill"
                style={{
                  width: `${total ? (item.count / total) * 100 : 0}%`,
                  background: STATUS_COLORS[item.name] || "#888780",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function Analytics() {
  const [posts, setPosts]       = useState([]);
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get("dashboard/posts"),
      API.get("/applications"),
    ])
      .then(([postsRes, appsRes]) => {
        setPosts(postsRes.data.posts ?? []);
        setApps(appsRes.data.applications ?? appsRes.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Aggregations ── */
  const totalPosts   = posts.length;
  const totalApps    = apps.length;
  const remotePosts  = posts.filter((p) => p.isRemote).length;
  const remotePct    = totalPosts ? Math.round((remotePosts / totalPosts) * 100) : 0;
  const acceptedApps = apps.filter((a) => a.status === "Accepted").length;
  const acceptRate   = totalApps ? Math.round((acceptedApps / totalApps) * 100) : 0;

  const byCategory  = useMemo(() => countBy(posts, "jobCategory").slice(0, 8), [posts]);
  const byEmpType   = useMemo(() => countBy(posts, "empType"), [posts]);
  const byExpLevel  = useMemo(() => countBy(posts, "experienceLevel"), [posts]);
  const byLocation  = useMemo(() => countBy(posts, "location").slice(0, 6), [posts]);
  const byStatus    = useMemo(() => {
    const order = ["Pending", "Reviewed", "Accepted", "Rejected"];
    const counts = countBy(apps, "status");
    return order.map((name) => ({ name, count: counts.find((c) => c.name === name)?.count ?? 0 }));
  }, [apps]);

  const remoteData = useMemo(() => [
    { name: "On-site", count: totalPosts - remotePosts },
    { name: "Remote",  count: remotePosts },
  ], [totalPosts, remotePosts]);

  const maxCat = byCategory[0]?.count || 1;
  const maxLoc = byLocation[0]?.count || 1;

  if (loading) {
    return <div className="analytics-loading">Loading analytics…</div>;
  }

  return (
    <div className="analytics-page">

      {/* ── KPI cards ── */}
      <div className="analytics-stat-grid">
        <StatCard
          label="Total job posts"
          value={totalPosts.toLocaleString()}
          sub="Active listings"
          subClass="analytics-stat-card__sub--blue"
        />
        <StatCard
          label="Total applications"
          value={totalApps.toLocaleString()}
          sub="Across all posts"
          subClass="analytics-stat-card__sub--green"
        />
        <StatCard
          label="Remote posts"
          value={remotePosts.toLocaleString()}
          sub={`${remotePct}% of all posts`}
        />
        <StatCard
          label="Acceptance rate"
          value={`${acceptRate}%`}
          sub={`${acceptedApps} accepted`}
          subClass={acceptRate > 15 ? "analytics-stat-card__sub--green" : "analytics-stat-card__sub--amber"}
        />
      </div>

      {/* ── Row 1: Category bar + Employment donut ── */}
      <div className="analytics-row">
        <HBarChart
          title="Jobs by field / category"
          sub="Active listings per job category"
          data={byCategory}
          max={maxCat}
        />
        <DonutCard
          title="Employment type"
          sub="Distribution across all posts"
          data={byEmpType}
          centerPct={`${byEmpType[0]?.count ?? 0}`}
          centerLabel={byEmpType[0]?.name?.split("-")[0] ?? ""}
        />
      </div>

      {/* ── Row 2: Experience + Status + Remote ── */}
      <div className="analytics-row--3">
        <HBarChart
          title="Experience level"
          sub="Jobs per seniority tier"
          data={byExpLevel}
          max={byExpLevel[0]?.count || 1}
        />
        <StatusCard
          title="Application status"
          sub="Breakdown of all submissions"
          data={byStatus}
        />
        <DonutCard
          title="Remote vs on-site"
          sub="Work arrangement split"
          data={remoteData}
          centerPct={`${remotePct}%`}
          centerLabel="remote"
        />
      </div>

      {/* ── Row 3: Location bar ── */}
      {byLocation.length > 0 && (
        <HBarChart
          title="Top hiring locations"
          sub="Posts by city / region"
          data={byLocation}
          max={maxLoc}
        />
      )}
    </div>
  );
}