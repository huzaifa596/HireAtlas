import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "./Navbar";
import JobCard from "./JobCard";
import Profile from "../Profile/Profile";
import MobileMenu from "./MobileMenu";
import PostDetail from "../PostDetails/PostDetail";
import FilterSidebar from "../filterTab/FilterSidebar";
import "./Dashboard.css";
import API from "../../services/api.js";
import CreatePost from "../insertpost/CreatePost";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [filterParams, setFilterParams] = useState({}); // fixed casing
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // ── Map raw API record → JobCard shape ────────────────────────────────
  const mapPost = (p) => ({
    id: p.postId,
    title: p.jobTitle,
    company: p.companyName,
    location: p.isRemote ? "Remote" : p.location || "N/A",
    salary:
      p.minSalary && p.maxSalary
        ? `$${Number(p.minSalary).toLocaleString()} – $${Number(p.maxSalary).toLocaleString()}`
        : "Not specified",
    type: p.isRemote ? "Remote" : p.empType || "Full-time",
    posted: p.postedDate
      ? new Date(p.postedDate).toLocaleDateString()
      : "Recently",
    description: p.description || "",
    tags: [p.jobCategory, p.experienceLevel, p.empType].filter(Boolean),
    applicants: 0,
    postedBy: p.postedBy,
    postedByEmail: p.postedByEmail,
    experienceLevel: p.experienceLevel,
  });

  // ── Default fetch (no filters) ────────────────────────────────────────
  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("dashboard/posts");
      const { status, posts } = res.data;
      setStatus(status);
      setPosts(posts.map(mapPost));
      setTotalPages(1); // default endpoint has no pagination
    } catch (err) {
      console.error("fetchAllPosts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Filtered fetch ────────────────────────────────────────────────────
  const fetchFilteredPosts = useCallback(async (params, currentPage = 1) => {
    setLoading(true);
    try {
      const res = await API.get("dashboard/filter/filteredJobs", {
        params: { ...params, page: currentPage, limit },
      });
      const { jobs, totalPages: tp } = res.data;
      setPosts(jobs.map(mapPost));
      setTotalPages(tp ?? 1);
    } catch (err) {
      console.error("fetchFilteredPosts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  // ── Re-fetch when filters or page change ──────────────────────────────
  useEffect(() => {
    // If no filter params are active, stay on the default data
    if (Object.keys(filterParams).length === 0) return;
    fetchFilteredPosts(filterParams, page);
  }, [filterParams, page, fetchFilteredPosts]);

  // ── Client-side search on top of whatever `posts` is ─────────────────
  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [searchQuery, posts]);

  // ── Filter apply handler ──────────────────────────────────────────────
  const handleApplyFilters = (params) => {
    setPage(1); // reset to page 1 on new filter
    setFilterParams(params);

    // If sidebar was cleared (no params), go back to default feed
    if (Object.keys(params).length === 0) {
      fetchAllPosts();
      setFilterParams({});
    }
  };

  const handleSetActiveTab = (tab) => {
    setSelectedPostId(null);
    setActiveTab(tab);
  };

  return (
    <div className="dashboard-root">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        toggleMobileMenu={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        closeMenu={closeMobileMenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="dashboard-main">
        <aside className="sidebar sidebar-left">
          <FilterSidebar onApply={handleApplyFilters} />
        </aside>

        <section className="content-center">
          {selectedPostId ? (
            <PostDetail
              postId={selectedPostId}
              onBack={() => setSelectedPostId(null)}
            />
          ) : activeTab === "profile" ? (
            <Profile />
          ) : activeTab === "createPost" ? (
            <CreatePost />
          ) : (
            <>
              <div className="content-header">
                <h1 className="content-title">
                  {activeTab === "posts" ? "Posts" : "My Posts"}
                </h1>
                <span className="content-count">
                  {filteredJobs.length} result
                  {filteredJobs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loading ? (
                <div className="empty-state">
                  <p className="empty-title">Loading…</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-title">No jobs found</p>
                  <p className="empty-sub">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="jobs-list">
                  {filteredJobs.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      index={i}
                      onViewPost={setSelectedPostId}
                    />
                  ))}
                </div>
              )}

              {/* ── Pagination (only shown when filters are active) ── */}
              {Object.keys(filterParams).length > 0 && totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="sidebar sidebar-right" />
      </main>
    </div>
  );
}
