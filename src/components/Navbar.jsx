import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar({ user, onLogout }) {
  const { theme, toggleTheme, favorites } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { onLogout(); navigate('/'); };

  const isActive = (path, search = '') => {
    const matchPath = location.pathname === path;
    const matchSearch = search ? location.search.includes(search) : true;
    return matchPath && matchSearch ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/home" className="nav-brand">
        <span className="brand-icon">🍴</span>
        <span className="brand-text">Tasty <span>Recipe</span></span>
      </Link>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/home" className={isActive('/home')}>🏠 Home</Link>
        <Link to="/home?tab=popular" className={isActive('/home', 'popular')}>🔥 Popular</Link>
        <Link to="/community" className={isActive('/community')}>👨‍🍳 Community</Link>

        {/* Favourites — shows badge with count */}
        <Link to="/home?tab=favorites" className={`nav-link fav-nav-link ${isActive('/home', 'favorites') === 'nav-link active' ? 'active' : ''}`}>
          ❤️ Favourites
          {favorites.length > 0 && (
            <span className="fav-badge">{favorites.length}</span>
          )}
        </Link>

        {/* Profile */}
        <Link to="/profile" className={isActive('/profile')}>👤 Profile</Link>

        <a href="mailto:contact@tastyrecipe.com" className="nav-link">📬 Contact</a>

        {user && (
          <button className="nav-logout" onClick={handleLogout}>🚪 Logout</button>
        )}
      </div>

      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
