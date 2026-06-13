import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MetricCard from '../components/ui/MetricCard';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
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
      <PageContainer title="Dashboard Overview">
        <div className="dashboard-loading">Loading market data...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Dashboard Overview">
      {/* Top Metrics Row */}
      <div className="dashboard-metrics-grid">
        <MetricCard 
          title="Global Market Cap" 
          value={`$${globalData?.totalMarketCap?.toLocaleString() || 'N/A'}`} 
          subtitle="Total market capitalization"
          icon="🌎"
        />
        <MetricCard 
          title="24h Trading Volume" 
          value={`$${globalData?.totalVolume?.toLocaleString() || 'N/A'}`} 
          subtitle="Total volume across tracked coins"
          icon="📈"
        />
        <MetricCard 
          title="Tracked Coins" 
          value={globalData?.uniqueCoinsCount || 'N/A'} 
          subtitle="Total unique assets in database"
          icon="🪙"
        />
      </div>

      <div className="dashboard-tables-grid">
        {/* Top Gainers Table */}
        <Card className="dashboard-table-card">
          <div className="card-header">
            <h3>Top Gainers (24h)</h3>
            <Chip variant="success">Bullish</Chip>
          </div>
          <div className="table-responsive">
            <table className="coin-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>24h Return</th>
                </tr>
              </thead>
              <tbody>
                {gainers.map((coin) => (
                  <tr key={coin._id}>
                    <td>
                      <div className="coin-name-cell">
                        <strong>{coin.coin_name}</strong>
                        <span className="coin-symbol">{coin.symbol}</span>
                      </div>
                    </td>
                    <td>${coin.price.toFixed(4)}</td>
                    <td className="trend-up">+{coin.daily_return.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Losers Table */}
        <Card className="dashboard-table-card">
          <div className="card-header">
            <h3>Top Losers (24h)</h3>
            <Chip variant="error">Bearish</Chip>
          </div>
          <div className="table-responsive">
            <table className="coin-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>24h Return</th>
                </tr>
              </thead>
              <tbody>
                {losers.map((coin) => (
                  <tr key={coin._id}>
                    <td>
                      <div className="coin-name-cell">
                        <strong>{coin.coin_name}</strong>
                        <span className="coin-symbol">{coin.symbol}</span>
                      </div>
                    </td>
                    <td>${coin.price.toFixed(4)}</td>
                    <td className="trend-down">{coin.daily_return.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
