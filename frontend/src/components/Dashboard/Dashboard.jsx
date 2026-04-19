import { useEffect, useState, useMemo } from 'react';
import Navbar from './Navbar';
import JobCard from './JobCard';
import Profile from '../Profile/Profile'
import MobileMenu from './MobileMenu';
import './Dashboard.css';
import API from '../../services/api.js';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('dashboard/posts');
        const { status, posts } = res.data;

        // Map DB columns to JobCard expected shape
        const mapped = posts.map((p) => ({
          id:              p.postId,
          title:           p.jobTitle,
          company:         p.companyName,
          location:        p.isRemote ? 'Remote' : (p.location || 'N/A'),
          salary:          p.minSalary && p.maxSalary
                             ? `$${Number(p.minSalary).toLocaleString()} – $${Number(p.maxSalary).toLocaleString()}`
                             : 'Not specified',
          type:            p.isRemote ? 'Remote' : (p.empType || 'Full-time'),
          posted:          p.postedDate
                             ? new Date(p.postedDate).toLocaleDateString()
                             : 'Recently',
          description:     p.description || '',
          tags:            [p.jobCategory, p.experienceLevel, p.empType].filter(Boolean),
          applicants:      0,
          postedBy:        p.postedBy,
          postedByEmail:   p.postedByEmail,
          experienceLevel: p.experienceLevel,
        }));

        setStatus(status);
        setPosts(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [searchQuery, posts]);

  return (
    <div className="dashboard-root">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
        <aside className="sidebar sidebar-left" />

        <section className="content-center">
         {activeTab === 'profile' ? (
          <Profile />
        ) : (
          <>
            <div className="content-header">
              <h1 className="content-title">
                {activeTab === 'posts' ? 'My Job Posts' : 'My Applications'}
              </h1>
              <span className="content-count">
                {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">No jobs found</p>
                <p className="empty-sub">Try a different search term</p>
              </div>
            ) : (
              <div className="jobs-list">
                {filteredJobs.map((job, i) => (
                  <JobCard key={job.id} job={job} index={i} />
                ))}
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