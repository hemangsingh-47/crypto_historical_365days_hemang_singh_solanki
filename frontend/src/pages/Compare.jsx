import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Swords } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { coinService } from '../services/coinService';
import './Compare.css';

const Compare = () => {
  const [coin1, setCoin1] = useState('bitcoin');
  const [coin2, setCoin2] = useState('ethereum');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!coin1.trim() || !coin2.trim()) {
      setError('Please enter both coin IDs to compare.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await coinService.compareCoins(coin1.trim().toLowerCase(), coin2.trim().toLowerCase());
      setComparisonData(response.data);
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Failed to fetch comparison. Please ensure both coin IDs are correct (e.g., "bitcoin", "ethereum").');
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Compare Coins">
      <Card className="compare-form-card">
        <div className="compare-inputs">
          <Input 
            label="First Coin ID" 
            placeholder="e.g. bitcoin" 
            value={coin1} 
            onChange={(e) => setCoin1(e.target.value)} 
          />
          <div className="compare-vs">VS</div>
          <Input 
            label="Second Coin ID" 
            placeholder="e.g. ethereum" 
            value={coin2} 
            onChange={(e) => setCoin2(e.target.value)} 
          />
          <Button variant="primary" onClick={handleCompare} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? 'Comparing...' : 'Compare'}
          </Button>
        </div>
        {error && <p className="compare-error">{error}</p>}
      </Card>

      <AnimatePresence>
        {comparisonData && (
          <motion.div 
            className="compare-results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="compare-vs-badge">
              <Swords size={32} color="var(--color-primary)" />
            </div>
            {comparisonData.map((item, index) => (
              <motion.div 
                key={item.coinId}
                initial={{ opacity: 0, x: index === 0 ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1), type: "spring", stiffness: 200 }}
                style={{ flex: 1 }}
              >
                <Card className="compare-result-card" colorStripe={index === 0 ? 'var(--color-primary)' : 'var(--color-accent)'}>
                  <div className="compare-card-header">
                    <h2 className="compare-coin-title">{item.latestRecord.coin_name} <span className="compare-symbol">({item.latestRecord.symbol})</span></h2>
                  </div>
                  <h1 className="compare-price font-mono">${item.latestRecord.price?.toFixed(4)}</h1>
                  
                  <div className="compare-metrics-list">
                    <div className="compare-metric-row">
                      <span>Market Rank</span>
                      <strong className="font-mono">#{item.latestRecord.market_cap_rank}</strong>
                    </div>
                    <div className="compare-metric-row">
                      <span>Market Cap</span>
                      <strong className="font-mono">${item.latestRecord.market_cap?.toLocaleString()}</strong>
                    </div>
                    <div className="compare-metric-row">
                      <span>24h Volume</span>
                      <strong className="font-mono">${item.latestRecord.volume?.toLocaleString()}</strong>
                    </div>
                    <div className="compare-metric-row">
                      <span>24h Return</span>
                      <strong className={`font-mono ${item.performance.dailyReturn >= 0 ? 'trend-up' : 'trend-down'}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {item.performance.dailyReturn >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                          {item.performance.dailyReturn >= 0 ? '+' : ''}{item.performance.dailyReturn?.toFixed(2)}%
                        </div>
                      </strong>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default Compare;
