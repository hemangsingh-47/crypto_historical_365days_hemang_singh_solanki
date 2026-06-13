import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Activity, BarChart2, Shield, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import './Landing.css';

const Landing = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PageContainer showHeader={false}>
      <div className="landing-wrapper" ref={containerRef}>
        
        {/* Floating Background Orbs */}
        <motion.div className="orb orb-1" animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="orb orb-2" animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />

        {/* Hero Section */}
        <motion.section 
          className="hero-section"
          style={{ y: y1, opacity }}
        >
          <motion.div 
            className="hero-content"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeInUp} className="hero-badge">
              <span className="live-pulse"></span>
              Live Data Intelligence
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="hero-title">
              Decode the Market.<br/>
              <span className="text-gradient">Dominate the Future.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="hero-subtitle">
              Advanced analytics, 365-day historical insights, and real-time comparative metrics for the serious crypto investor.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="hero-actions">
              <Link to="/explore" className="btn-glow">
                Explore Markets <ChevronRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn-outline">
                View Dashboard
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{ y: y2 }}
          >
            {/* Abstract 3D-like Dashboard Card */}
            <div className="glass-panel main-panel">
              <div className="panel-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <div className="panel-body">
                <div className="chart-line"></div>
                <div className="stats-row">
                  <div className="stat-box"></div>
                  <div className="stat-box active"></div>
                  <div className="stat-box"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Features Grid - Scroll Driven */}
        <section className="features-section">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2>Built for <span className="text-gradient">Precision</span></h2>
            <p>Everything you need to analyze cryptographic assets in one place.</p>
          </motion.div>

          <div className="features-grid">
            <FeatureCard 
              icon={<Activity size={32} color="var(--color-primary)" />}
              title="Real-time Tracking"
              desc="Monitor live prices, market caps, and 24h volumes with millisecond precision."
              delay={0.1}
            />
            <FeatureCard 
              icon={<TrendingUp size={32} color="var(--color-primary)" />}
              title="Historical Deep Dive"
              desc="Analyze 365 days of granular chronological data to identify macroeconomic trends."
              delay={0.2}
            />
            <FeatureCard 
              icon={<BarChart2 size={32} color="var(--color-primary)" />}
              title="Advanced Comparison"
              desc="Side-by-side asset comparison revealing correlation and relative strength."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Zap size={32} color="var(--color-primary)" />}
              title="Lightning Fast"
              desc="Optimized backend architecture delivering massive datasets instantly."
              delay={0.4}
            />
            <FeatureCard 
              icon={<Shield size={32} color="var(--color-primary)" />}
              title="Secure Sessions"
              desc="Enterprise-grade JWT authentication protecting your custom watchlists."
              delay={0.5}
            />
          </div>
        </section>

      </div>
    </PageContainer>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => {
  return (
    <motion.div 
      className="cyber-feature-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 200 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="feature-icon-wrapper">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="card-glow"></div>
    </motion.div>
  );
};

export default Landing;
