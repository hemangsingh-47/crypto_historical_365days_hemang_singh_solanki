import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';
import { coinService } from '../services/coinService';
import './Dashboard.css';

const Dashboard = () => {
  const [globalData, setGlobalData] = useState(null);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [globalRes, gainersRes, losersRes] = await Promise.all([
          coinService.getGlobalAnalytics(),
          coinService.getTopGainers({ limit: 5 }),
          coinService.getTopLosers({ limit: 5 })
        ]);
        
        setGlobalData(globalRes.data);
        setGainers(gainersRes.coins || []);
        setLosers(losersRes.coins || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageContainer title="Market Overview">
        <div className="dashboard-loading">
          <div className="live-pulse" style={{ margin: '0 auto 16px' }}></div>
          Syncing with blockchain data...
        </div>
      </PageContainer>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PageContainer title="Market Overview">
      <motion.div 
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Global Stats Grid */}
        <div className="stats-grid">
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Global Market Cap"
              value={`$${(globalData?.totalMarketCap || 0).toLocaleString()}`}
              icon="🌐"
              trend={globalData?.marketCapChange24h || 0}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="24h Trading Volume"
              value={`$${(globalData?.totalVolume24h || 0).toLocaleString()}`}
              icon="📊"
              trend={globalData?.volumeChange24h || 0}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Tracked Assets"
              value={globalData?.recordCount?.toLocaleString() || '0'}
              icon="🪙"
            />
          </motion.div>
        </div>

        {/* Top Movers Section */}
        <div className="movers-grid">
          <motion.div variants={itemVariants}>
            <Card className="movers-card" colorStripe="var(--color-success)">
              <h3>Top Gainers (24h)</h3>
              <div className="coin-list">
                {gainers.map((coin, index) => (
                  <motion.div 
                    key={coin.coinId} 
                    className="coin-list-item"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="coin-info">
                      <span className="coin-rank">{index + 1}</span>
                      <span className="coin-name">{coin.name}</span>
                    </div>
                    <div className="coin-price-info">
                      <span className="coin-price">${coin.currentPrice?.toFixed(4)}</span>
                      <span className="trend positive">+{coin.priceChangePercentage24h?.toFixed(2)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="movers-card" colorStripe="var(--color-error)">
              <h3>Top Losers (24h)</h3>
              <div className="coin-list">
                {losers.map((coin, index) => (
                  <motion.div 
                    key={coin.coinId} 
                    className="coin-list-item"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="coin-info">
                      <span className="coin-rank">{index + 1}</span>
                      <span className="coin-name">{coin.name}</span>
                    </div>
                    <div className="coin-price-info">
                      <span className="coin-price">${coin.currentPrice?.toFixed(4)}</span>
                      <span className="trend negative">{coin.priceChangePercentage24h?.toFixed(2)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default Dashboard;
