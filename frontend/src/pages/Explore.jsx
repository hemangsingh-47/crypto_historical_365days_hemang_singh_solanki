import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { coinService } from '../services/coinService';
import './Explore.css';

const Explore = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const limit = 20;

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
      
      setCoins(response.data || []);
      
      // Calculate total pages if the API returns totalCount or pagination metadata
      const total = response.pagination?.total || response.total || 100; // Fallback if API doesn't return total
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Failed to fetch coins:', error);
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const delayDebounceFn = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      fetchCoins(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch when page changes, but only if not triggered by the search debounce above
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

  return (
    <PageContainer title="Market Explorer">
      <Card className="explore-card">
        <div className="explore-header">
          <Input 
            placeholder="Search by coin name or symbol..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="explore-filters">
            {/* Future filters can go here */}
            {isSearching && <span className="search-badge">Showing Search Results</span>}
          </div>
        </div>

        <div className="table-responsive">
          <table className="coin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Asset</th>
                <th>Price</th>
                <th>Market Cap</th>
                <th>24h Volume</th>
                <th>Date Logged</th>
              </tr>
            </thead>
            <tbody>
              {loading && coins.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading assets...</td>
                </tr>
              ) : coins.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No coins found.</td>
                </tr>
              ) : (
                coins.map((coin) => (
                  <tr key={coin._id} className="explorer-row">
                    <td>
                      <span className="rank-badge">{coin.market_cap_rank || '-'}</span>
                    </td>
                    <td>
                      <div className="coin-name-cell">
                        <strong>{coin.coin_name}</strong>
                        <span className="coin-symbol">{coin.symbol}</span>
                      </div>
                    </td>
                    <td>${coin.price?.toFixed(4)}</td>
                    <td>${coin.market_cap?.toLocaleString() || '-'}</td>
                    <td>${coin.volume?.toLocaleString() || '-'}</td>
                    <td className="date-cell">{coin.date || coin.month}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && coins.length > 0 && (
          <div className="pagination-controls">
            <Button 
              variant="secondary" 
              onClick={handlePrevPage} 
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="page-indicator">Page {page} of {totalPages}</span>
            <Button 
              variant="secondary" 
              onClick={handleNextPage} 
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Explore;
