import { useState, useMemo } from 'react';
import Navbar from './Navbar';
import JobCard from './JobCard';
import MobileMenu from './MobileMenu';
import './Dashboard.css';

const SAMPLE_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    salary: '$140k – $180k',
    type: 'Full-time',
    posted: '2 hours ago',
    description:
      'Build and maintain customer-facing products used by millions. Work with React, TypeScript, and internal design systems to ship polished UI at scale.',
    tags: ['React', 'TypeScript', 'GraphQL', 'Figma'],
    applicants: 47,
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'Linear',
    location: 'Remote',
    salary: '$120k – $160k',
    type: 'Remote',
    posted: '5 hours ago',
    description:
      'Work on our core infrastructure handling millions of issues, cycles, and projects every day. We value correctness, speed, and clean code above all.',
    tags: ['Node.js', 'PostgreSQL', 'Rust', 'AWS'],
    applicants: 31,
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'Figma',
    location: 'New York, NY',
    salary: '$110k – $145k',
    type: 'Full-time',
    posted: '1 day ago',
    description:
      'Shape the future of collaborative design tools. Partner with product and engineering to craft seamless user experiences and beautiful visual systems.',
    tags: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
    applicants: 89,
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'Vercel',
    location: 'Austin, TX',
    salary: '$130k – $165k',
    type: 'Full-time',
    posted: '2 days ago',
    description:
      'Own our deployment infrastructure that processes millions of builds per day. You will design, build, and scale distributed systems with high availability.',
    tags: ['Kubernetes', 'Terraform', 'CI/CD', 'Go'],
    applicants: 22,
  },
  {
    id: 5,
    title: 'React Native Developer',
    company: 'Notion',
    location: 'Remote',
    salary: '$100k – $135k',
    type: 'Contract',
    posted: '3 days ago',
    description:
      'Help us bring the Notion experience to mobile. You will own features end-to-end from design spec to App Store release on both iOS and Android.',
    tags: ['React Native', 'JavaScript', 'Expo', 'Redux'],
    applicants: 58,
  },
  {
    id: 6,
    title: 'Data Engineer',
    company: 'Airtable',
    location: 'Seattle, WA',
    salary: '$125k – $155k',
    type: 'Part-time',
    posted: '4 days ago',
    description:
      'Design and maintain data pipelines that power business intelligence across product, marketing, and operations. Own data quality and observability.',
    tags: ['Python', 'dbt', 'Airflow', 'Snowflake'],
    applicants: 14,
  },
];

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SAMPLE_JOBS;
    return SAMPLE_JOBS.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [searchQuery]);

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
        {/* Left sidebar (decorative) */}
        <aside className="sidebar sidebar-left" />

        {/* Center content */}
        <section className="content-center">
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
        </section>

        {/* Right sidebar (decorative) */}
        <aside className="sidebar sidebar-right" />
      </main>
    </div>
  );
}
