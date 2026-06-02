import Coin from '../models/Coin.js';

/**
 * Fetch all coin records with default pagination.
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getAllCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const totalRecords = await Coin.countDocuments();
  const coins = await Coin.find()
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch a single coin record by MongoDB _id.
 * @param {String} id - MongoDB document ID
 * @returns {Object|null} - Coin document or null
 */
const getCoinById = async (id) => {
  const coin = await Coin.findById(id);
  return coin;
};

/**
 * Create a new coin record.
 * @param {Object} coinData - Coin document fields
 * @returns {Object} - Newly created coin document
 */
const createCoin = async (coinData) => {
  const coin = await Coin.create(coinData);
  return coin;
};

/**
 * Update an existing coin record.
 * @param {String} id - MongoDB document ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} - Updated coin document or null
 */
const updateCoin = async (id, updateData) => {
  const coin = await Coin.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  });
  return coin;
};

/**
 * Delete a coin record by ID.
 * @param {String} id - MongoDB document ID
 * @returns {Object|null} - Deleted coin document or null
 */
const deleteCoin = async (id) => {
  const coin = await Coin.findByIdAndDelete(id);
  return coin;
};

/**
 * Check if a coin record exists by ID.
 * @param {String} id - MongoDB document ID
 * @returns {Boolean} - True if exists, false otherwise
 */
const checkCoinExists = async (id) => {
  const exists = await Coin.exists({ _id: id });
  return exists !== null;
};

/**
 * Bulk create multiple coin records.
 * @param {Array} coinsArray - Array of coin data objects
 * @returns {Array} - Array of newly created documents
 */
const bulkCreateCoins = async (coinsArray) => {
  const coins = await Coin.insertMany(coinsArray);
  return coins;
};

/**
 * Bulk update multiple coin records.
 * @param {Array} updatesArray - Array of objects containing { id, updateData }
 * @returns {Object} - Bulk write result
 */
const bulkUpdateCoins = async (updatesArray) => {
  const bulkOps = updatesArray.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: item.updateData }
    }
  }));
  const result = await Coin.bulkWrite(bulkOps);
  return result;
};

/**
 * Bulk delete multiple coin records by IDs.
 * @param {Array} idsArray - Array of MongoDB document IDs
 * @returns {Object} - Deletion result containing deletedCount
 */
const bulkDeleteCoins = async (idsArray) => {
  const result = await Coin.deleteMany({ _id: { $in: idsArray } });
  return result;
};

/**
 * Fetch coin records by name (case-insensitive).
 * @param {String} name - Coin name
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsByName = async (name, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { coin_name: { $regex: name, $options: 'i' } };
  
  const totalRecords = await Coin.countDocuments(filter);
  const coins = await Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch coin records by symbol.
 * @param {String} symbol - Coin symbol
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsBySymbol = async (symbol, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { symbol: symbol.toUpperCase() };
  
  const totalRecords = await Coin.countDocuments(filter);
  const coins = await Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch coin records by market cap rank.
 * @param {Number} rank - Market cap rank
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsByRank = async (rank, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  // Use $expr to handle the case where market_cap_rank might be stored as a string in the DB
  const filter = { $expr: { $eq: [{ $toInt: "$market_cap_rank" }, Number(rank)] } };
  
  const totalRecords = await Coin.countDocuments(filter);
  const coins = await Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch coin records by month (e.g., "2025-01").
 * @param {String} month - Month string in YYYY-MM format
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsByMonth = async (month, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { month };

  const totalRecords = await Coin.countDocuments(filter);
  const coins = await Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch coin records by date (e.g., "2025-01-15").
 * @param {String} date - Date string in YYYY-MM-DD format
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsByDate = async (date, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { date };

  const totalRecords = await Coin.countDocuments(filter);
  const coins = await Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch the latest coin records (most recent timestamp per unique coin).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getLatestCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const coins = await Coin.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$coin_id', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    { $sort: { market_cap: -1 } },
    { $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = coins[0].data;
  const totalRecords = coins[0].totalCount[0]?.count || 0;

  return {
    coins: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch the full price history of a specific coin by coin_id.
 * @param {String} coinId - The coin_id field (e.g., "bitcoin")
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinHistory = async (coinId, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { coin_id: coinId };

  const totalRecords = await Coin.countDocuments(filter);
  const coins = await Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch top coins by market cap (descending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getTopMarketCapCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const coins = await Coin.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$coin_id', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    {
      $addFields: {
        market_cap_num: { $toDouble: '$market_cap' }
      }
    },
    { $sort: { market_cap_num: -1 } },
    { $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = coins[0].data;
  const totalRecords = coins[0].totalCount[0]?.count || 0;

  return {
    coins: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch top coins by 24h volume (descending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getTopVolumeCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const coins = await Coin.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$coin_id', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    {
      $addFields: {
        volume_num: { $toDouble: '$volume' }
      }
    },
    { $sort: { volume_num: -1 } },
    { $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = coins[0].data;
  const totalRecords = coins[0].totalCount[0]?.count || 0;

  return {
    coins: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch top gainers by daily return (descending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getTopGainersCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const coins = await Coin.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$coin_id', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    {
      $addFields: {
        daily_return_num: { $toDouble: '$daily_return' }
      }
    },
    { $sort: { daily_return_num: -1 } },
    { $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = coins[0].data;
  const totalRecords = coins[0].totalCount[0]?.count || 0;

  return {
    coins: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch top losers by daily return (ascending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getTopLosersCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const coins = await Coin.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$coin_id', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    {
      $addFields: {
        daily_return_num: { $toDouble: '$daily_return' }
      }
    },
    { $sort: { daily_return_num: 1 } },
    { $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = coins[0].data;
  const totalRecords = coins[0].totalCount[0]?.count || 0;

  return {
    coins: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch oldest coin records in chronological order (timestamp ascending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getOldestCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const totalRecords = await Coin.countDocuments();
  const coins = await Coin.find()
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: 1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch newest coin records in chronological order (timestamp descending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getNewestCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const totalRecords = await Coin.countDocuments();
  const coins = await Coin.find()
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch trending coin records (latest records grouped, sorted by 24h volume descending).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getTrendingCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const coins = await Coin.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$coin_id', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    {
      $addFields: {
        volume_num: { $toDouble: '$volume' }
      }
    },
    { $sort: { volume_num: -1 } },
    { $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  const data = coins[0].data;
  const totalRecords = coins[0].totalCount[0]?.count || 0;

  return {
    coins: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch recent coin records (last 7 days of daily logs or latest timestamp records).
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getRecentCoins = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const totalRecords = await Coin.countDocuments();
  const coins = await Coin.find()
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    }
  };
};

/**
 * Fetch performance statistics for a specific coin by ID.
 * Calculates historical averages, highs, and lows using optimized aggregation.
 * @param {string} coinId - The unique identifier of the coin (e.g. bitcoin)
 * @param {string} [metric] - Optional filter for specific metric
 * @returns {Object|null} - Performance data or null if not found
 */
const getCoinPerformance = async (coinId, metric = null) => {
  // Check if coin exists by trying to fetch the latest record
  const latestRecord = await Coin.findOne({
    coin_id: { $regex: new RegExp(`^${coinId}$`, 'i') }
  }).sort({ timestamp: -1 });

  if (!latestRecord) {
    return null;
  }

  // Calculate statistics across all history safely using $convert with onError/onNull fallbacks
  const stats = await Coin.aggregate([
    { $match: { coin_id: { $regex: new RegExp(`^${coinId}$`, 'i') } } },
    {
      $project: {
        volatility_val: { $convert: { input: '$volatility_7d', to: 'double', onError: null, onNull: null } },
        market_cap_val: { $convert: { input: '$market_cap', to: 'double', onError: null, onNull: null } },
        volume_val: { $convert: { input: '$volume', to: 'double', onError: null, onNull: null } },
        daily_return_val: { $convert: { input: '$daily_return', to: 'double', onError: null, onNull: null } }
      }
    },
    {
      $group: {
        _id: null,
        avgVolatility: { $avg: '$volatility_val' },
        maxVolatility: { $max: '$volatility_val' },
        minVolatility: { $min: '$volatility_val' },
        avgMarketCap: { $avg: '$market_cap_val' },
        maxMarketCap: { $max: '$market_cap_val' },
        minMarketCap: { $min: '$market_cap_val' },
        avgVolume: { $avg: '$volume_val' },
        maxVolume: { $max: '$volume_val' },
        minVolume: { $min: '$volume_val' },
        avgDailyReturn: { $avg: '$daily_return_val' },
        maxDailyReturn: { $max: '$daily_return_val' },
        minDailyReturn: { $min: '$daily_return_val' }
      }
    }
  ]);

  if (!stats || stats.length === 0) {
    return null;
  }

  const performance = {
    volatility: {
      latestVolatility: latestRecord.volatility_7d != null ? parseFloat(latestRecord.volatility_7d) : null,
      averageVolatility: stats[0].avgVolatility,
      maxVolatility: stats[0].maxVolatility,
      minVolatility: stats[0].minVolatility
    },
    marketCap: {
      latestMarketCap: latestRecord.market_cap != null ? parseFloat(latestRecord.market_cap) : null,
      averageMarketCap: stats[0].avgMarketCap,
      maxMarketCap: stats[0].maxMarketCap,
      minMarketCap: stats[0].minMarketCap
    },
    volume: {
      latestVolume: latestRecord.volume != null ? parseFloat(latestRecord.volume) : null,
      averageVolume: stats[0].avgVolume,
      maxVolume: stats[0].maxVolume,
      minVolume: stats[0].minVolume
    },
    returns: {
      latestDailyReturn: latestRecord.daily_return != null ? parseFloat(latestRecord.daily_return) : null,
      averageDailyReturn: stats[0].avgDailyReturn,
      cumulativeReturn: latestRecord.cumulative_return != null ? parseFloat(latestRecord.cumulative_return) : null,
      maxDailyReturn: stats[0].maxDailyReturn,
      minDailyReturn: stats[0].minDailyReturn
    }
  };

  if (metric) {
    const formattedMetric = metric.toLowerCase();
    if (formattedMetric === 'volatility') return { volatility: performance.volatility };
    if (formattedMetric === 'market-cap' || formattedMetric === 'marketcap') return { marketCap: performance.marketCap };
    if (formattedMetric === 'volume') return { volume: performance.volume };
    if (formattedMetric === 'returns' || formattedMetric === 'return') return { returns: performance.returns };
  }

  return performance;
};

export {
  getAllCoins,
  getCoinById,
  createCoin,
  updateCoin,
  deleteCoin,
  checkCoinExists,
  bulkCreateCoins,
  bulkUpdateCoins,
  bulkDeleteCoins,
  getCoinsByName,
  getCoinsBySymbol,
  getCoinsByRank,
  getCoinsByMonth,
  getCoinsByDate,
  getLatestCoins,
  getCoinHistory,
  getTopMarketCapCoins,
  getTopVolumeCoins,
  getTopGainersCoins,
  getTopLosersCoins,
  getOldestCoins,
  getNewestCoins,
  getTrendingCoins,
  getRecentCoins,
  getCoinPerformance
};
