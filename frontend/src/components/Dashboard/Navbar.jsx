import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Briefcase, FileText, Menu, X } from 'lucide-react';
import API  from "../../services/api"; 
export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  toggleMobileMenu,
  isMobileMenuOpen,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef(null);
  const [username, setUsername] = useState(""); 

  useEffect(() => {
    API.get("/user")
      .then(({ data }) => setUsername(data.profile.personalInfo.name))
      .catch((err) => console.error("Error fetching user name:", err));
  }, []);


  // Auto-focus when mobile search opens
  useEffect(() => {
    
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className="navbar">
      {/* ── Main bar ── */}
      <div className="navbar-inner">

        {/* LEFT: Logo + Tabs */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <div className="logo-icon"><span>//</span></div>
            <span className="logo-text">
              <span className="logo-hire">Hire</span>
              <span className="logo-atlas">Atlas</span>
            </span>
          </div>

          <div className="navbar-tabs">
            <button
              className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Briefcase size={15} /> My Posts
            </button>
            <button
              className={`nav-tab ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={15} /> My Applications
            </button>
          </div>
        </div>

        {/* CENTER: Desktop search */}
        <div className="navbar-center">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT: Bell + Avatar + Mobile icons */}
        <div className="navbar-right">
          {/* Mobile search icon — only visible on mobile */}
          <button
            className="icon-btn mobile-search-toggle"
            onClick={() => setMobileSearchOpen((o) => !o)}
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <button className="icon-btn bell-btn">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>

         
          <div
            className={`avatar-group ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar"><User size={18} /></div>
            <span className="avatar-name">{username}</span>
          </div>

          {/* MOBILE: Hamburger */}
          <button className="hamburger-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile search bar (slides down below navbar) ── */}
      <div className={`mobile-search-bar ${mobileSearchOpen ? 'open' : ''}`}>
        <div className="mobile-search-bar-inner">
          <Search size={16} className="msb-icon" />
          <input
            ref={mobileInputRef}
            type="text"
            className="msb-input"
            placeholder="Search jobs, companies, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="msb-clear" onClick={closeMobileSearch}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}