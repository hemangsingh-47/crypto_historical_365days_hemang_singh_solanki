import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';
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
          <Hexagon size={28} color="var(--color-primary)" strokeWidth={2.5} />
          Crypto <span>Analytics</span>
        </Link>
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="nav-link-bg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{link.label}</span>
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
