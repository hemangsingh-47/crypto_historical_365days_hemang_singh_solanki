import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import { coinService } from '../services/coinService';
import './Explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const limit = 15;

  const fetchCoins = async (currentPage, query = '') => {
    try {
      setLoading(true);
      let response;
      
      if (query.trim() !== '') {
        response = await coinService.searchCoins(query, { page: currentPage, limit });
        setIsSearching(true);
      } else {
        response = await coinService.getCoins({ page: currentPage, limit });
        setIsSearching(false);
      }
      
      setCoins(response.coins || []);
      
      const total = response.pagination?.totalRecords || response.total || 100; 
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Failed to fetch coins:', error);
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); 
      fetchCoins(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (!loading) {
      fetchCoins(page, searchQuery);
    }
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10, y: 10 },
    show: { opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <PageContainer title="Market Explorer">
      <div className="explore-header-section">
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text"
            className="modern-search-input"
            placeholder="Search assets by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="search-badge"
          >
            Searching network...
          </motion.div>
        )}
      </div>

      <Card className="explore-data-card">
        <div className="data-grid-header">
          <div className="grid-col rank-col">#</div>
          <div className="grid-col asset-col">Asset</div>
          <div className="grid-col price-col">Price</div>
          <div className="grid-col cap-col">Market Cap</div>
          <div className="grid-col vol-col">24h Volume</div>
          <div className="grid-col trend-col">Trend (24h)</div>
        </div>

        <div className="data-grid-body">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid-loading"
              >
                <div className="live-pulse"></div>
                Syncing with ledger...
              </motion.div>
            ) : coins.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid-empty"
              >
                No assets found matching your criteria.
              </motion.div>
            ) : (
              <motion.div 
                key="data"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid-rows-container"
              >
                {coins.map((coin, index) => {
                  // Simulate a trend based on price change if available, else random for demo
                  const trend = coin.priceChangePercentage24h || (Math.random() > 0.5 ? 2.4 : -1.2);
                  const isPositive = trend >= 0;

                  return (
                    <motion.div 
                      key={coin.coin_id || index}
                      variants={rowVariants}
                      className="data-grid-row"
                      onClick={() => navigate(`/coin/${coin.coin_id}`)}
                      whileHover={{ 
                        scale: 1.01, 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        zIndex: 10
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="grid-col rank-col">
                        <span className="rank-pill">{coin.market_cap_rank || '-'}</span>
                      </div>
                      <div className="grid-col asset-col">
                        <div className="asset-icon">
                          {coin.symbol ? coin.symbol.substring(0, 1).toUpperCase() : '?'}
                        </div>
                        <div className="asset-info">
                          <span className="asset-name">{coin.coin_name}</span>
                          <span className="asset-symbol">{coin.symbol?.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="grid-col price-col font-mono">
                        ${coin.price?.toFixed(4) || '0.00'}
                      </div>
                      <div className="grid-col cap-col font-mono">
                        ${coin.market_cap?.toLocaleString() || '-'}
                      </div>
                      <div className="grid-col vol-col font-mono">
                        ${coin.volume?.toLocaleString() || '-'}
                      </div>
                      <div className="grid-col trend-col">
                        <div className={`trend-pill ${isPositive ? 'positive' : 'negative'}`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(trend).toFixed(2)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {!loading && coins.length > 0 && (
        <div className="neo-pagination">
          <button 
            className="page-btn" 
            onClick={handlePrevPage} 
            disabled={page === 1}
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <div className="page-indicator">
            <span className="current-page">{page}</span>
            <span className="total-pages">/ {totalPages}</span>
          </div>
          <button 
            className="page-btn" 
            onClick={handleNextPage} 
            disabled={page >= totalPages}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </PageContainer>
  );
};

export default Explore;
