import { getAllCoins, getCoinById, createCoin, updateCoin as updateCoinService, replaceCoin as replaceCoinService, deleteCoin as deleteCoinService, checkCoinExists as checkCoinExistsService, bulkCreateCoins, bulkUpdateCoins, bulkDeleteCoins, getCoinsByName, getCoinsBySymbol, getCoinsByRank, getCoinsByMonth, getCoinsByDate, getLatestCoins, getCoinHistory, getTopMarketCapCoins, getTopVolumeCoins, getTopGainersCoins, getTopLosersCoins, getOldestCoins, getNewestCoins, getTrendingCoins, getRecentCoins, getCoinPerformance, compareTwoCoins, compareThreeCoins, getCurrentPrice, getCoinHistoryByMonth, searchCoins as searchCoinsService } from '../services/coinService.js';


const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    const error = new Error(`${fieldName} must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }

  return parsedValue;
};

/**
 * @desc    Fetch all cryptocurrency records with advanced filtering, sorting & pagination
 * @route   GET /coins
 * @access  Public
 */
const getCoins = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');
    const { sort, fields, ...queryParams } = req.query;

    const result = await getAllCoins({
      page,
      limit,
      sort,
      fields,
      queryParams
    });

    res.status(200).json({
      success: true,
      message: 'Cryptocurrency records fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch cryptocurrency records',
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
 * @desc    Update an existing cryptocurrency record partially
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
 * @desc    Replace an existing cryptocurrency record fully
 * @route   PUT /coins/:id
 * @access  Public
 */
const replaceCoin = async (req, res) => {
  try {
    const { coin_id, coin_name, symbol, market_cap_rank, timestamp, date, price, market_cap, volume, month } = req.body;

    // Validate required fields for complete replacement
    if (!coin_id || !coin_name || !symbol || !market_cap_rank || !timestamp || !date || !price || !market_cap || !volume || !month) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for replacement. Please provide: coin_id, coin_name, symbol, market_cap_rank, timestamp, date, price, market_cap, volume, month'
      });
    }

    const coin = await replaceCoinService(req.params.id, req.body);

    if (!coin) {
      return res.status(404).json({
        success: false,
        message: `Coin with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coin replaced successfully',
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
      message: 'Failed to replace coin',
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
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
    
    if (!coinId?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'coinId route parameter is required'
      });
    }

    const result = await getCoinPerformance(coinId, metric);

    res.status(200).json({
      success: true,
      message: 'Coin performance statistics fetched successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coin performance statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Compare the latest records and performance statistics for two coins
 * @route   GET /coins/compare/:coin1/:coin2
 * @access  Public
 */
const compareTwo = async (req, res) => {
  try {
    const { coin1, coin2 } = req.params;

    if (!coin1?.trim() || !coin2?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'coin1 and coin2 route parameters are required'
      });
    }

    const result = await compareTwoCoins(coin1, coin2);

    res.status(200).json({
      success: true,
      message: 'Two-coin comparison fetched successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to compare coins',
      error: error.message
    });
  }
};

/**
 * @desc    Compare the latest records and performance statistics for three coins
 * @route   GET /coins/compare/:coin1/:coin2/:coin3
 * @access  Public
 */
const compareThree = async (req, res) => {
  try {
    const { coin1, coin2, coin3 } = req.params;

    if (!coin1?.trim() || !coin2?.trim() || !coin3?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'coin1, coin2, and coin3 route parameters are required'
      });
    }

    const result = await compareThreeCoins(coin1, coin2, coin3);

    res.status(200).json({
      success: true,
      message: 'Three-coin comparison fetched successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to compare coins',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch the latest price for a coin
 * @route   GET /coins/price/:coinId
 * @access  Public
 */
const getPrice = async (req, res) => {
  try {
    if (!req.params.coinId?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'coinId route parameter is required'
      });
    }

    const result = await getCurrentPrice(req.params.coinId);

    res.status(200).json({
      success: true,
      message: 'Current coin price fetched successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch current coin price',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch a coin's historical records filtered by month
 * @route   GET /coins/history/:coinId/:month
 * @access  Public
 */
const getHistoryByMonth = async (req, res) => {
  try {
    const { coinId, month } = req.params;
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');

    if (!coinId?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'coinId route parameter is required'
      });
    }

    if (!month?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'month route parameter is required'
      });
    }

    if (!MONTH_PATTERN.test(month.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Use YYYY-MM'
      });
    }

    const result = await getCoinHistoryByMonth(coinId, month, { page, limit });

    res.status(200).json({
      success: true,
      message: 'Monthly coin history fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly coin history',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch coins sorted by price ascending
 * @route   GET /coins/sort/price-asc
 * @access  Public
 */
const getSortedByPriceAsc = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');
    const { fields, ...queryParams } = req.query;

    const result = await getAllCoins({
      page,
      limit,
      sort: '+price',
      fields,
      queryParams
    });

    res.status(200).json({
      success: true,
      message: 'Coins sorted by price ascending fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins sorted by price ascending',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch coins sorted by price descending
 * @route   GET /coins/sort/price-desc
 * @access  Public
 */
const getSortedByPriceDesc = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');
    const { fields, ...queryParams } = req.query;

    const result = await getAllCoins({
      page,
      limit,
      sort: '-price',
      fields,
      queryParams
    });

    res.status(200).json({
      success: true,
      message: 'Coins sorted by price descending fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins sorted by price descending',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch coins sorted by volume descending
 * @route   GET /coins/sort/volume-desc
 * @access  Public
 */
const getSortedByVolumeDesc = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');
    const { fields, ...queryParams } = req.query;

    const result = await getAllCoins({
      page,
      limit,
      sort: '-volume',
      fields,
      queryParams
    });

    res.status(200).json({
      success: true,
      message: 'Coins sorted by volume descending fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins sorted by volume descending',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch coins sorted by market cap rank ascending
 * @route   GET /coins/sort/rank-asc
 * @access  Public
 */
const getSortedByRankAsc = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');
    const { fields, ...queryParams } = req.query;

    const result = await getAllCoins({
      page,
      limit,
      sort: '+rank',
      fields,
      queryParams
    });

    res.status(200).json({
      success: true,
      message: 'Coins sorted by rank ascending fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins sorted by rank ascending',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch coins sorted by daily return descending
 * @route   GET /coins/sort/return-desc
 * @access  Public
 */
const getSortedByReturnDesc = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');
    const { fields, ...queryParams } = req.query;

    const result = await getAllCoins({
      page,
      limit,
      sort: '-dailyReturn',
      fields,
      queryParams
    });

    res.status(200).json({
      success: true,
      message: 'Coins sorted by daily return descending fetched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins sorted by daily return descending',
      error: error.message
    });
  }
};

/**
 * @desc    Search coin records using regex keyword search
 * @route   GET /search/coins?q=...
 * @access  Public
 */
const searchCoins = async (req, res) => {
  try {
    const q = req.query.q;
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 50, 'limit');

    const result = await searchCoinsService(q, { page, limit });

    res.status(200).json({
      success: true,
      message: 'Coins searched successfully',
      ...result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search coins',
      error: error.message
    });
  }
};

export { getCoins, getCoin, addCoin, updateCoin, replaceCoin, removeCoin, checkCoinExists, bulkAddCoins, bulkModifyCoins, bulkRemoveCoins, getByName, getBySymbol, getByRank, getByMonth, getByDate, getLatest, getHistory, getTopMarketCap, getTopVolume, getTopGainers, getTopLosers, getOldest, getNewest, getTrending, getRecent, getPerformance, compareTwo, compareThree, getPrice, getHistoryByMonth, getSortedByPriceAsc, getSortedByPriceDesc, getSortedByVolumeDesc, getSortedByRankAsc, getSortedByReturnDesc, searchCoins };


