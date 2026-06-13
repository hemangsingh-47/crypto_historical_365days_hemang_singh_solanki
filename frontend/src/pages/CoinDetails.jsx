import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import PriceChart from '../components/ui/PriceChart';
import { coinService } from '../services/coinService';
import './CoinDetails.css';

const CoinDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [coin, setCoin] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setLoading(true);
        // Using Promise.all to fetch both coin details and history concurrently
        const [coinRes, historyRes] = await Promise.all([
          coinService.getCoinById(id),
          coinService.getCoinHistory(id)
        ]);

        setCoin(coinRes.data);
        
        // Prepare chart data. The API returns full history, we reverse it so chronological order is left-to-right
        const chartData = (historyRes.coins || [])
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(item => ({
            date: item.date,
            price: item.price
          }));
        
        setHistory(chartData);
      } catch (error) {
        console.error('Failed to load coin details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCoinData();
  }, [id]);

  if (loading) {
    return (
      <PageContainer title="Loading Details...">
        <div className="details-loading">Fetching coin data...</div>
      </PageContainer>
    );
  }

  if (!coin) {
    return (
      <PageContainer title="Not Found">
        <div className="details-error">
          <p>The cryptocurrency you are looking for does not exist.</p>
          <Button onClick={() => navigate('/explore')} variant="primary">Back to Explorer</Button>
        </div>
      </PageContainer>
    );
  }

  const isBullish = coin.daily_return >= 0;

  return (
    <PageContainer title={`${coin.coin_name} (${coin.symbol})`}>
      <div className="details-header-actions">
        <Button onClick={() => navigate(-1)} variant="secondary" size="sm">
          ← Back
        </Button>
      </div>

      <div className="details-grid">
        {/* Core Info & Metrics */}
        <div className="details-left">
          <Card className="details-main-card">
            <div className="details-title-row">
              <h2 className="details-coin-name">{coin.coin_name}</h2>
              <Chip variant={isBullish ? 'success' : 'error'}>
                Rank #{coin.market_cap_rank}
              </Chip>
            </div>
            
            <h1 className="details-price">${coin.price?.toFixed(4)}</h1>
            <div className={`details-return ${isBullish ? 'trend-up' : 'trend-down'}`}>
              {isBullish ? '▲' : '▼'} {Math.abs(coin.daily_return || 0).toFixed(2)}% (24h)
            </div>

            <div className="details-metrics-small">
              <div className="metric-small">
                <span className="metric-label">Market Cap</span>
                <span className="metric-val">${coin.market_cap?.toLocaleString()}</span>
              </div>
              <div className="metric-small">
                <span className="metric-label">24h Volume</span>
                <span className="metric-val">${coin.volume?.toLocaleString()}</span>
              </div>
              <div className="metric-small">
                <span className="metric-label">7D Volatility</span>
                <span className="metric-val">{coin.volatility_7d ? `${coin.volatility_7d.toFixed(2)}%` : 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Area */}
        <div className="details-right">
          <Card className="details-chart-card">
            <h3>Price History (365 Days)</h3>
            <div className="chart-container">
              {history.length > 0 ? (
                <PriceChart data={history} />
              ) : (
                <p>No historical data available for chart.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default CoinDetails;
