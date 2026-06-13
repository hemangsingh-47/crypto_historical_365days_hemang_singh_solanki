import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import './Landing.css';

const Landing = () => {
  return (
    <PageContainer showHeader={false}>
      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Unlock the Power of <span className="text-gradient">Crypto Analytics</span>
          </h1>
          <p className="hero-subtitle">
            Track, analyze, and compare over 100 cryptocurrencies with real-time data, chronological insights, and comprehensive historical records.
          </p>
          <div className="hero-actions">
            <Link to="/signup">
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">Explore Platform</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>Advanced Analytics</h3>
          <p>View global market caps, 24h trading volumes, and historical trends across all assets.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚖️</div>
          <h3>Coin Comparison</h3>
          <p>Compare performance, volatility, and returns side-by-side to make informed decisions.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Deep History</h3>
          <p>Dive deep into 365 days of historical data with interactive charts and chronological summaries.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Landing;
