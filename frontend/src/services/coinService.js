import api from './api';

export const coinService = {
  // Get paginated coins (for Explorer)
  getCoins: async (params = { page: 1, limit: 50 }) => {
    return await api.get('/coins', { params });
  },

  // Get specific coin details
  getCoinById: async (id) => {
    return await api.get(`/coins/${id}`);
  },

  // Get dashboard global analytics
  getGlobalAnalytics: async () => {
    return await api.get('/coins/analytics/global');
  },

  // Get top gainers
  getTopGainers: async (params = { limit: 5 }) => {
    return await api.get('/coins/top-gainers', { params });
  },

  // Get top losers
  getTopLosers: async (params = { limit: 5 }) => {
    return await api.get('/coins/top-losers', { params });
  },

  // Get trending/latest coins
  getLatestCoins: async (params = { limit: 10 }) => {
    return await api.get('/coins/latest', { params });
  },

  // Search coins by name
  searchCoins: async (query, params = { limit: 10 }) => {
    return await api.get(`/search/coins`, { params: { q: query, ...params } });
  },

  // Get performance history
  getCoinHistory: async (id) => {
    return await api.get(`/coins/history/${id}`);
  },

  // Compare two coins
  compareCoins: async (coin1, coin2) => {
    return await api.get(`/coins/compare/${coin1}/${coin2}`);
  }
};
