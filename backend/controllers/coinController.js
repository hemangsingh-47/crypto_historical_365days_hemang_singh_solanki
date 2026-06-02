import { getAllCoins, getCoinById, createCoin, updateCoin as updateCoinService, deleteCoin as deleteCoinService, checkCoinExists as checkCoinExistsService, bulkCreateCoins, bulkUpdateCoins, bulkDeleteCoins, getCoinsByName, getCoinsBySymbol, getCoinsByRank, getCoinsByMonth, getCoinsByDate, getLatestCoins, getCoinHistory, getTopMarketCapCoins, getTopVolumeCoins, getTopGainersCoins, getTopLosersCoins, getOldestCoins, getNewestCoins, getTrendingCoins, getRecentCoins, getCoinPerformance } from '../services/coinService.js';

/**
 * @desc    Fetch all cryptocurrency records (paginated)
 * @route   GET /coins
 * @access  Public
 */
const getCoins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getAllCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Coins fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch a single cryptocurrency record by ID
 * @route   GET /coins/:id
 * @access  Public
 */
const getCoin = async (req, res) => {
  try {
    const coin = await getCoinById(req.params.id);

    if (!coin) {
      return res.status(404).json({
        success: false,
        message: `Coin with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coin fetched successfully',
      data: coin
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid coin ID format: ${req.params.id}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coin',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new cryptocurrency record
 * @route   POST /coins
 * @access  Public
 */
const addCoin = async (req, res) => {
  try {
    const { coin_id, coin_name, symbol, market_cap_rank, timestamp, date, price, market_cap, volume, month } = req.body;

    // Validate required fields
    if (!coin_id || !coin_name || !symbol || !market_cap_rank || !timestamp || !date || !price || !market_cap || !volume || !month) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide: coin_id, coin_name, symbol, market_cap_rank, timestamp, date, price, market_cap, volume, month'
      });
    }

    const coin = await createCoin(req.body);

    res.status(201).json({
      success: true,
      message: 'Coin record created successfully',
      data: coin
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create coin record',
      error: error.message
    });
  }
};

/**
 * @desc    Update an existing cryptocurrency record
 * @route   PUT /coins/:id
 * @route   PATCH /coins/:id
 * @access  Public
 */
const updateCoin = async (req, res) => {
  try {
    const coin = await updateCoinService(req.params.id, req.body);

    if (!coin) {
      return res.status(404).json({
        success: false,
        message: `Coin with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coin updated successfully',
      data: coin
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid coin ID format: ${req.params.id}`
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update coin',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a cryptocurrency record
 * @route   DELETE /coins/:id
 * @access  Public
 */
const removeCoin = async (req, res) => {
  try {
    const coin = await deleteCoinService(req.params.id);

    if (!coin) {
      return res.status(404).json({
        success: false,
        message: `Coin with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coin deleted successfully',
      data: coin
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid coin ID format: ${req.params.id}`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete coin',
      error: error.message
    });
  }
};

/**
 * @desc    Check if a cryptocurrency record exists by ID
 * @route   GET /coins/exists/:id
 * @access  Public
 */
const checkCoinExists = async (req, res) => {
  try {
    const exists = await checkCoinExistsService(req.params.id);
    res.status(200).json({
      success: true,
      exists
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid coin ID format: ${req.params.id}`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to check coin existence',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk create cryptocurrency records
 * @route   POST /coins/bulk-create
 * @access  Public
 */
const bulkAddCoins = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of coin objects'
      });
    }
    
    const coins = await bulkCreateCoins(req.body);
    
    res.status(201).json({
      success: true,
      message: `${coins.length} coins created successfully`,
      data: coins
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed for one or more records',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create coins',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk update cryptocurrency records
 * @route   PATCH /coins/bulk-update
 * @access  Public
 */
const bulkModifyCoins = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of objects {id, updateData}'
      });
    }
    
    const result = await bulkUpdateCoins(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Bulk update completed',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update coins',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk delete cryptocurrency records
 * @route   DELETE /coins/bulk-delete
 * @access  Public
 */
const bulkRemoveCoins = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of coin IDs'
      });
    }
    
    const result = await bulkDeleteCoins(req.body);
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} coins`,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch cryptocurrency records by coin name
 * @route   GET /coins/name/:coinName
 * @access  Public
 */
const getByName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await getCoinsByName(req.params.coinName, { page, limit });
    
    res.status(200).json({
      success: true,
      message: 'Coins fetched successfully by name',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins by name',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch cryptocurrency records by symbol
 * @route   GET /coins/symbol/:symbol
 * @access  Public
 */
const getBySymbol = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await getCoinsBySymbol(req.params.symbol, { page, limit });
    
    res.status(200).json({
      success: true,
      message: 'Coins fetched successfully by symbol',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins by symbol',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch cryptocurrency records by market cap rank
 * @route   GET /coins/rank/:rank
 * @access  Public
 */
const getByRank = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await getCoinsByRank(req.params.rank, { page, limit });
    
    res.status(200).json({
      success: true,
      message: 'Coins fetched successfully by rank',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins by rank',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch cryptocurrency records by month
 * @route   GET /coins/month/:month
 * @access  Public
 */
const getByMonth = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getCoinsByMonth(req.params.month, { page, limit });

    res.status(200).json({
      success: true,
      message: 'Coins fetched successfully by month',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins by month',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch cryptocurrency records by date
 * @route   GET /coins/date/:date
 * @access  Public
 */
const getByDate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getCoinsByDate(req.params.date, { page, limit });

    res.status(200).json({
      success: true,
      message: 'Coins fetched successfully by date',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins by date',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch the latest record for each unique coin
 * @route   GET /coins/latest
 * @access  Public
 */
const getLatest = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getLatestCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Latest coin records fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch the full price history of a specific coin
 * @route   GET /coins/history/:coinId
 * @access  Public
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getCoinHistory(req.params.coinId, { page, limit });

    res.status(200).json({
      success: true,
      message: 'Coin history fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coin history',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch top coins by market cap
 * @route   GET /coins/top-market-cap
 * @access  Public
 */
const getTopMarketCap = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getTopMarketCapCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Top market cap coins fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top market cap coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch top coins by 24h volume
 * @route   GET /coins/top-volume
 * @access  Public
 */
const getTopVolume = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getTopVolumeCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Top volume coins fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top volume coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch top gainers by daily return
 * @route   GET /coins/top-gainers
 * @access  Public
 */
const getTopGainers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getTopGainersCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Top gainer coins fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top gainer coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch top losers by daily return
 * @route   GET /coins/top-losers
 * @access  Public
 */
const getTopLosers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getTopLosersCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Top loser coins fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top loser coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch oldest coin records in chronological order
 * @route   GET /coins/oldest
 * @access  Public
 */
const getOldest = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getOldestCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Oldest coin records fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch oldest coin records',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch newest coin records in chronological order
 * @route   GET /coins/newest
 * @access  Public
 */
const getNewest = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getNewestCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Newest coin records fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newest coin records',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch trending coin records
 * @route   GET /coins/trending
 * @access  Public
 */
const getTrending = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getTrendingCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Trending coin records fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending coin records',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch recent coin records
 * @route   GET /coins/recent
 * @access  Public
 */
const getRecent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getRecentCoins({ page, limit });

    res.status(200).json({
      success: true,
      message: 'Recent coin records fetched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent coin records',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch performance and analytics statistics for a coin
 * @route   GET /coins/performance/:coinId
 * @access  Public
 */
const getPerformance = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { metric } = req.query;

    const result = await getCoinPerformance(coinId, metric);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Coin performance statistics not found for coin_id: '${coinId}'`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coin performance statistics fetched successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coin performance statistics',
      error: error.message
    });
  }
};

export { getCoins, getCoin, addCoin, updateCoin, removeCoin, checkCoinExists, bulkAddCoins, bulkModifyCoins, bulkRemoveCoins, getByName, getBySymbol, getByRank, getByMonth, getByDate, getLatest, getHistory, getTopMarketCap, getTopVolume, getTopGainers, getTopLosers, getOldest, getNewest, getTrending, getRecent, getPerformance };
