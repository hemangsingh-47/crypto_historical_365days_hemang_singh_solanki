import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Globe, PieChart } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';
import { coinService } from '../services/coinService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
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

  const renderMiniList = (coins, isPositive) => (
    <div className="mini-coin-list">
      {coins.map((coin, index) => (
        <motion.div 
          key={coin.coin_id || index} 
          className="mini-coin-item"
          whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          onClick={() => navigate(`/coin/${coin.coin_id}`)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <div className="mini-coin-left">
            <span className="mini-rank">{index + 1}</span>
            <div className="mini-icon">
              {coin.symbol ? coin.symbol.substring(0, 1).toUpperCase() : '?'}
            </div>
            <div className="mini-name-col">
              <span className="mini-name">{coin.coin_name}</span>
              <span className="mini-symbol">{coin.symbol?.toUpperCase()}</span>
            </div>
          </div>
          <div className="mini-coin-right font-mono">
            <span className="mini-price">${coin.currentPrice?.toFixed(4) || coin.price?.toFixed(4)}</span>
            <span className={`mini-trend ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(coin.priceChangePercentage24h || 0).toFixed(2)}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <PageContainer title="Market Overview">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="dashboard-loading"
          >
            <div className="live-pulse" style={{ margin: '0 auto 24px', width: 16, height: 16 }}></div>
            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Aggregating Market Intelligence...</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
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
                  icon={<Globe size={24} color="var(--color-primary)" />}
                  trend={globalData?.marketCapChange24h || 0}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard 
                  title="24h Trading Volume"
                  value={`$${(globalData?.totalVolume24h || 0).toLocaleString()}`}
                  icon={<Activity size={24} color="var(--color-primary)" />}
                  trend={globalData?.volumeChange24h || 0}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard 
                  title="Tracked Assets"
                  value={globalData?.recordCount?.toLocaleString() || '0'}
                  icon={<PieChart size={24} color="var(--color-primary)" />}
                />
              </motion.div>
            </div>

            {/* Top Movers Section */}
            <div className="movers-grid">
              <motion.div variants={itemVariants}>
                <Card className="movers-card">
                  <div className="card-header-styled">
                    <h3><TrendingUp size={20} color="#10B981" /> Top Gainers (24h)</h3>
                  </div>
                  {renderMiniList(gainers, true)}
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="movers-card">
                  <div className="card-header-styled">
                    <h3><TrendingDown size={20} color="#EF4444" /> Top Losers (24h)</h3>
                  </div>
                  {renderMiniList(losers, false)}
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default Dashboard;
