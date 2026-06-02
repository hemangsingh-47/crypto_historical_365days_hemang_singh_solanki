import express from 'express';
import { getCoins, getCoin, addCoin, updateCoin, removeCoin, checkCoinExists, bulkAddCoins, bulkModifyCoins, bulkRemoveCoins, getByName, getBySymbol, getByRank, getByMonth, getByDate, getLatest, getHistory, getTopMarketCap, getTopVolume, getTopGainers, getTopLosers, getOldest, getNewest, getTrending, getRecent, getPerformance } from '../controllers/coinController.js';

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

// GET /coins/performance/:coinId - Fetch performance statistics for a coin
router.get('/performance/:coinId', getPerformance);

// GET /coins/month/:month - Fetch cryptocurrency records by month (YYYY-MM)
router.get('/month/:month', getByMonth);

// GET /coins/date/:date - Fetch cryptocurrency records by date (YYYY-MM-DD)
router.get('/date/:date', getByDate);

// GET /coins/latest - Fetch the latest record for each unique coin
router.get('/latest', getLatest);

// GET /coins/history/:coinId - Fetch full price history for a specific coin
router.get('/history/:coinId', getHistory);

// GET /coins/:id - Fetch single cryptocurrency record by ID
router.get('/:id', getCoin);

// POST /coins - Add a new cryptocurrency record
router.post('/', addCoin);

// PUT /coins/:id - Replace a cryptocurrency record
router.put('/:id', updateCoin);

// PATCH /coins/:id - Partially update a cryptocurrency record
router.patch('/:id', updateCoin);

// DELETE /coins/:id - Delete a cryptocurrency record
router.delete('/:id', removeCoin);

export default router;
