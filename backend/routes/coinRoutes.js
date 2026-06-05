import express from 'express';
import { getCoins, getCoin, addCoin, updateCoin, replaceCoin, removeCoin, checkCoinExists, bulkAddCoins, bulkModifyCoins, bulkRemoveCoins, getByName, getBySymbol, getByRank, getByMonth, getByDate, getLatest, getHistory, getTopMarketCap, getTopVolume, getTopGainers, getTopLosers, getOldest, getNewest, getTrending, getRecent, getPerformance, compareTwo, compareThree, getPrice, getHistoryByMonth, getSortedByPriceAsc, getSortedByPriceDesc, getSortedByVolumeDesc, getSortedByRankAsc, getSortedByReturnDesc, getFilteredCoins, getAnalyticsSummary } from '../controllers/coinController.js';


const router = express.Router();

// GET /coins - Fetch all cryptocurrency records (paginated)
router.get('/', getCoins);

// POST /coins/bulk-create - Bulk create cryptocurrency records
router.post('/bulk-create', bulkAddCoins);

// PATCH /coins/bulk-update - Bulk update cryptocurrency records
router.patch('/bulk-update', bulkModifyCoins);

// DELETE /coins/bulk-delete - Bulk delete cryptocurrency records
router.delete('/bulk-delete', bulkRemoveCoins);

// GET /coins/exists/:id - Check if a cryptocurrency record exists by ID
router.get('/exists/:id', checkCoinExists);

// GET /coins/name/:coinName - Fetch cryptocurrency records by name
router.get('/name/:coinName', getByName);

// GET /coins/symbol/:symbol - Fetch cryptocurrency records by symbol
router.get('/symbol/:symbol', getBySymbol);

// GET /coins/rank/:rank - Fetch cryptocurrency records by market cap rank
router.get('/rank/:rank', getByRank);

// GET /coins/top-market-cap - Fetch top coins by market cap
router.get('/top-market-cap', getTopMarketCap);

// GET /coins/top-volume - Fetch top coins by volume
router.get('/top-volume', getTopVolume);

// GET /coins/top-gainers - Fetch top gainers by daily return
router.get('/top-gainers', getTopGainers);

// GET /coins/top-losers - Fetch top losers by daily return
router.get('/top-losers', getTopLosers);

// GET /coins/oldest - Fetch oldest coin records
router.get('/oldest', getOldest);

// GET /coins/newest - Fetch newest coin records
router.get('/newest', getNewest);

// GET /coins/trending - Fetch trending coin records
router.get('/trending', getTrending);

// GET /coins/recent - Fetch recent coin records
router.get('/recent', getRecent);

// GET /coins/sort/price-asc - Fetch coins sorted by price ascending
router.get('/sort/price-asc', getSortedByPriceAsc);

// GET /coins/sort/price-desc - Fetch coins sorted by price descending
router.get('/sort/price-desc', getSortedByPriceDesc);

// GET /coins/sort/volume-desc - Fetch coins sorted by volume descending
router.get('/sort/volume-desc', getSortedByVolumeDesc);

// GET /coins/sort/rank-asc - Fetch coins sorted by market cap rank ascending
router.get('/sort/rank-asc', getSortedByRankAsc);

// GET /coins/sort/return-desc - Fetch coins sorted by daily return descending
router.get('/sort/return-desc', getSortedByReturnDesc);

// GET /coins/analytics/summary - Fetch summary analytics (average/highest/lowest price & volume) grouped by coin
router.get('/analytics/summary', getAnalyticsSummary);

// GET /coins/filter/:filterType - Fetch coins filtered by criteria (high-price, low-price, bullish, bearish, profitable, loss-making)
router.get('/filter/:filterType', getFilteredCoins);


// GET /coins/performance/:coinId - Fetch performance statistics for a coin
router.get('/performance/:coinId', getPerformance);

// GET /coins/compare/:coin1/:coin2/:coin3 - Compare three cryptocurrencies
router.get('/compare/:coin1/:coin2/:coin3', compareThree);

// GET /coins/compare/:coin1/:coin2 - Compare two cryptocurrencies
router.get('/compare/:coin1/:coin2', compareTwo);

// GET /coins/price/:coinId - Fetch the latest price for a cryptocurrency
router.get('/price/:coinId', getPrice);

// GET /coins/month/:month - Fetch cryptocurrency records by month (YYYY-MM)
router.get('/month/:month', getByMonth);

// GET /coins/date/:date - Fetch cryptocurrency records by date (YYYY-MM-DD)
router.get('/date/:date', getByDate);

// GET /coins/latest - Fetch the latest record for each unique coin
router.get('/latest', getLatest);

// GET /coins/history/:coinId/:month - Fetch monthly price history for a specific coin
router.get('/history/:coinId/:month', getHistoryByMonth);

// GET /coins/history/:coinId - Fetch full price history for a specific coin
router.get('/history/:coinId', getHistory);

// GET /coins/:id - Fetch single cryptocurrency record by ID
router.get('/:id', getCoin);

// POST /coins - Add a new cryptocurrency record
router.post('/', addCoin);

// PUT /coins/:id - Replace a cryptocurrency record
router.put('/:id', replaceCoin);

// PATCH /coins/:id - Partially update a cryptocurrency record
router.patch('/:id', updateCoin);

// DELETE /coins/:id - Delete a cryptocurrency record
router.delete('/:id', removeCoin);

export default router;
