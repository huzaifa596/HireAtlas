import { Search, Briefcase, FileText, User } from 'lucide-react';

export default function MobileMenu({
  isOpen,
  closeMenu,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
}) {
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    closeMenu();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={closeMenu}
      />

      {/* Slide-down panel */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>

        {/* Search */}
        <div className="mobile-search-wrapper">
          <Search size={16} className="mobile-search-icon" />
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Nav Tabs */}
        <div className="mobile-nav-tabs">
          <button className={`mobile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => handleTabSwitch('posts')}>
            <Briefcase size={17} />
            Browse jobs
          </button>
          <button className={`mobile-tab ${activeTab === 'myPosts' ? 'active' : ''}`} onClick={() => handleTabSwitch('myPosts')}>
            <FileText size={17} />
            My posts
          </button>
          <button className={`mobile-tab ${activeTab === 'myApplications' ? 'active' : ''}`} onClick={() => handleTabSwitch('myApplications')}>
            <FileText size={17} /> My applications
          </button>
        </div>

        {/* Divider */}
        <div className="mobile-divider" />

        {/* Profile */}
        <div className="mobile-profile">
          <div className="mobile-avatar">
            <User size={22} />
          </div>
          <div className="mobile-profile-info">
            <p className="mobile-profile-name">Your profile</p>
            <p className="mobile-profile-email">View and edit account details</p>
          </div>
        </div>

      </div>
    </>
  );
}
