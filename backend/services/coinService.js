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
  getTopLosersCoins
};
