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

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [filterParams, setFilterParams] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const LIMIT = 20;

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  // handle delettepost

  const handleDeletePost = async (postid) => {
    try {
      const result = await API.post(`dashboard/deletepost/${postid}`);
      setPosts((prev) => prev.filter((p) => p.id != postid));
    } catch (err) {
      console.error(
        "Error in deleting the post function api fetch in dashboard.jsx",
      );
    }
  };

  // ── Fetch all posts OR my posts ───────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // 'applications' is what Navbar passes for "My Posts" tab
      const endpoint =
        activeTab === "myPosts" ? "dashboard/myposts" : "dashboard/posts";

      const res = await API.get(endpoint);
      setPosts(res.data.posts.map(mapPost));
      setTotalPages(1);
    } catch (err) {
      console.error("fetchPosts:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // ── Fetch filtered posts ──────────────────────────────────────────────────
  const fetchFilteredPosts = useCallback(async (params, currentPage = 1) => {
    setLoading(true);
    try {
      const res = await API.get("dashboard/filter/filteredJobs", {
        params: { ...params, page: currentPage, limit: LIMIT },
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

  // ── Unified effect: runs on tab change, filter change, or page change ─────
  useEffect(() => {
    // Only fetch on post-related tabs
    if (activeTab !== "posts" && activeTab !== "myPosts") return;

    const hasFilters = Object.keys(filterParams).length > 0;

    // Filters only apply to the main posts tab, not my posts
    if (hasFilters && activeTab === "posts") {
      fetchFilteredPosts(filterParams, page);
    } else {
      fetchPosts();
    }
  }, [activeTab, filterParams, page, fetchPosts, fetchFilteredPosts]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplyFilters = (params) => {
    setPage(1);
    setFilterParams(params);
    window.scrollTo(0, 0);
  };

  const handleSetActiveTab = (tab) => {
    setSelectedPostId(null);
    setPosts([]);
    setFilterParams({}); // clear filters when switching tabs
    setPage(1);
    setActiveTab(tab);
  };

  // ── Client-side search ────────────────────────────────────────────────────
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
                      isMyPost={activeTab === "myPosts"}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>
              )}

              {/* Pagination — only shown for filtered posts tab */}
              {activeTab === "posts" &&
                Object.keys(filterParams).length > 0 &&
                totalPages > 1 && (
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
