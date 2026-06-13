import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TopNavbar.css';

const TopNavbar = () => {
  const location = useLocation();

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Explore', path: '/explore' },
    { label: 'Compare', path: '/compare' },
    { label: 'Analytics', path: '/analytics' }
  ];

  return (
    <nav className="top-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Crypto Analytics
        </Link>
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="navbar-auth">
          <Link to="/login" className="nav-login-btn">Log In</Link>
          <Link to="/signup" className="nav-signup-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
