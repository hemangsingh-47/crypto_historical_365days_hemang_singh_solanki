import Coin from '../models/Coin.js';

const PERFORMANCE_METRIC_MAP = {
  volatility: ['coinId', 'volatility'],
  returns: ['coinId', 'dailyReturn', 'cumulativeReturn', 'growthPercentage'],
  'market-cap': ['coinId', 'averageMarketCap'],
  marketcap: ['coinId', 'averageMarketCap'],
  volume: ['coinId', 'averageVolume']
};

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildCoinIdFilter = (coinId) => ({
  coin_id: { $regex: new RegExp(`^${escapeRegex(coinId)}$`, 'i') }
});

const findLatestCoinRecord = async (coinId) => {
  const normalizedCoinId = coinId?.trim();

  if (!normalizedCoinId) {
    throw createServiceError('coinId is required', 400);
  }

  return Coin.findOne(buildCoinIdFilter(normalizedCoinId)).sort({ timestamp: -1 });
};

const validateHistoryMonth = (month) => {
  if (!MONTH_PATTERN.test(month)) {
    throw createServiceError('Invalid month format. Use YYYY-MM', 400);
  }
};

const roundMetric = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Number(value.toFixed(2));
};

const parseNumberParam = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return undefined;
  const val = Array.isArray(value) ? value[value.length - 1] : value;
  const parsed = Number(val);
  if (Number.isNaN(parsed)) {
    throw createServiceError(`${fieldName} must be a valid number`, 400);
  }
  return parsed;
};

const getStringParam = (value) => {
  if (value === undefined || value === null) return undefined;
  const val = Array.isArray(value) ? value[value.length - 1] : value;
  return String(val).trim();
};

// ==========================================
// Phase 15: Query Parameter Helpers
// ==========================================

/**
 * Map of allowed sort fields to their MongoDB field names.
 */
const ALLOWED_SORT_FIELDS = {
  price: 'price',
  volume: 'volume',
  marketCap: 'market_cap',
  market_cap: 'market_cap',
  rank: 'market_cap_rank',
  dailyReturn: 'daily_return',
  daily_return: 'daily_return',
  timestamp: 'timestamp',
  date: 'date',
  symbol: 'symbol',
  coin_name: 'coin_name',
  volatility: 'volatility_7d'
};

/**
 * Build a MongoDB filter object from the supplied query parameters.
 * @param {Object} query - Express req.query object
 * @returns {Object} - MongoDB filter document
 */
const buildQueryFilter = (query) => {
  const filter = {};

  // --- Price filters ---
  const price = parseNumberParam(query.price, 'price');
  const minPrice = parseNumberParam(query.minPrice, 'minPrice');
  const maxPrice = parseNumberParam(query.maxPrice, 'maxPrice');

  if (price !== undefined) {
    filter.price = price;
  } else if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // --- Volume filters ---
  const volume = parseNumberParam(query.volume, 'volume');
  const minVolume = parseNumberParam(query.minVolume, 'minVolume');
  const maxVolume = parseNumberParam(query.maxVolume, 'maxVolume');

  if (volume !== undefined) {
    filter.volume = volume;
  } else if (minVolume !== undefined || maxVolume !== undefined) {
    filter.volume = {};
    if (minVolume !== undefined) filter.volume.$gte = minVolume;
    if (maxVolume !== undefined) filter.volume.$lte = maxVolume;
  }

  // --- Rank filter ---
  const rank = parseNumberParam(query.rank, 'rank');
  if (rank !== undefined) {
    filter.market_cap_rank = rank;
  }

  // --- Month filter ---
  const month = getStringParam(query.month);
  if (month !== undefined) {
    if (!MONTH_PATTERN.test(month)) {
      throw createServiceError('Invalid month format. Use YYYY-MM', 400);
    }
    filter.month = month;
  }

  // --- Date filter ---
  const date = getStringParam(query.date);
  if (date !== undefined) {
    const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!DATE_PATTERN.test(date)) {
      throw createServiceError('Invalid date format. Use YYYY-MM-DD', 400);
    }
    filter.date = date;
  }

  // --- Daily return filters ---
  const dailyReturn = parseNumberParam(query.dailyReturn, 'dailyReturn');
  const minDailyReturn = parseNumberParam(query.minDailyReturn, 'minDailyReturn');
  const maxDailyReturn = parseNumberParam(query.maxDailyReturn, 'maxDailyReturn');

  if (dailyReturn !== undefined) {
    filter.daily_return = dailyReturn;
  } else if (minDailyReturn !== undefined || maxDailyReturn !== undefined) {
    filter.daily_return = {};
    if (minDailyReturn !== undefined) filter.daily_return.$gte = minDailyReturn;
    if (maxDailyReturn !== undefined) filter.daily_return.$lte = maxDailyReturn;
  }

  // --- Volatility filters ---
  const volatility = parseNumberParam(query.volatility, 'volatility');
  const minVolatility = parseNumberParam(query.minVolatility, 'minVolatility');
  const maxVolatility = parseNumberParam(query.maxVolatility, 'maxVolatility');

  if (volatility !== undefined) {
    filter.volatility_7d = volatility;
  } else if (minVolatility !== undefined || maxVolatility !== undefined) {
    filter.volatility_7d = {};
    if (minVolatility !== undefined) filter.volatility_7d.$gte = minVolatility;
    if (maxVolatility !== undefined) filter.volatility_7d.$lte = maxVolatility;
  }

  // --- Market cap filters ---
  const marketCap = parseNumberParam(query.marketCap, 'marketCap');
  const minMarketCap = parseNumberParam(query.minMarketCap, 'minMarketCap');
  const maxMarketCap = parseNumberParam(query.maxMarketCap, 'maxMarketCap');

  if (marketCap !== undefined) {
    filter.market_cap = marketCap;
  } else if (minMarketCap !== undefined || maxMarketCap !== undefined) {
    filter.market_cap = {};
    if (minMarketCap !== undefined) filter.market_cap.$gte = minMarketCap;
    if (maxMarketCap !== undefined) filter.market_cap.$lte = maxMarketCap;
  }

  // --- Symbol filter (case-insensitive exact match) ---
  const symbol = getStringParam(query.symbol);
  if (symbol !== undefined) {
    filter.symbol = { $regex: new RegExp(`^${escapeRegex(symbol)}$`, 'i') };
  }

  // --- Coin name filter (case-insensitive partial match) ---
  const coinName = getStringParam(query.coin_name || query.coinName);
  if (coinName !== undefined) {
    filter.coin_name = { $regex: new RegExp(escapeRegex(coinName), 'i') };
  }

  // --- Coin ID filter (case-insensitive exact match) ---
  const coinId = getStringParam(query.coin_id || query.coinId);
  if (coinId !== undefined) {
    filter.coin_id = { $regex: new RegExp(`^${escapeRegex(coinId)}$`, 'i') };
  }

  return filter;
};

/**
 * Parse the `sort` query parameter into a Mongoose-compatible sort object.
 * Supports: sort=price, sort=-price, sort=+price, sort=price:asc, sort=price,-volume
 * @param {String|Array} sortParam - Raw sort query parameter
 * @returns {Object} - Mongoose sort document
 */
const buildSortObject = (sortParam) => {
  if (!sortParam) return { timestamp: -1 };

  const sortStr = Array.isArray(sortParam) ? sortParam.join(',') : String(sortParam);
  const sortFields = sortStr.split(',');
  const sortObject = {};

  for (const field of sortFields) {
    let trimmedField = field.trim();
    let direction = -1; // default descending

    // Handle +/- prefix
    if (trimmedField.startsWith('-')) {
      direction = -1;
      trimmedField = trimmedField.slice(1);
    } else if (trimmedField.startsWith('+')) {
      direction = 1;
      trimmedField = trimmedField.slice(1);
    }

    // Handle :asc / :desc suffix
    if (trimmedField.includes(':')) {
      const [fieldName, dir] = trimmedField.split(':');
      trimmedField = fieldName;
      if (dir?.toLowerCase() === 'asc') direction = 1;
      else if (dir?.toLowerCase() === 'desc') direction = -1;
    }

    const mappedField = ALLOWED_SORT_FIELDS[trimmedField];
    if (mappedField) {
      sortObject[mappedField] = direction;
    }
  }

  // Fallback if no valid sort fields matched
  return Object.keys(sortObject).length > 0 ? sortObject : { timestamp: -1 };
};

/**
 * Build a Mongoose field projection from the `fields` query parameter.
 * @param {String|Array} fieldsParam - Comma-separated list of field names or array of them
 * @returns {Object|null} - Mongoose select object or null for all fields
 */
const buildFieldProjection = (fieldsParam) => {
  if (!fieldsParam) return null;

  const fieldsStr = Array.isArray(fieldsParam) ? fieldsParam.join(',') : String(fieldsParam);
  const requestedFields = fieldsStr.split(',').map((f) => f.trim()).filter(Boolean);
  if (!requestedFields.length) return null;

  const projection = {};
  for (const field of requestedFields) {
    projection[field] = 1;
  }
  return projection;
};


// ==========================================
// Core CRUD Operations
// ==========================================

/**
 * Fetch all coin records with advanced query parameter support.
 * Supports filtering, sorting, pagination, and field projection.
 * @param {Object} options - Query options
 * @returns {Object} - Paginated and filtered results with metadata
 */
const getAllCoins = async ({ page = 1, limit = 50, sort, fields, queryParams = {} } = {}) => {
  const skip = (page - 1) * limit;

  // Build the filter, sort, and projection from query parameters
  const filter = buildQueryFilter(queryParams);
  const sortObject = buildSortObject(sort);
  const projection = buildFieldProjection(fields);

  const totalRecords = await Coin.countDocuments(filter);

  let query = Coin.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortObject);

  if (projection) {
    query = query.select(projection);
  }

  const coins = await query;

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    },
    appliedFilters: Object.keys(filter).length > 0 ? filter : undefined,
    appliedSort: sortObject
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

// ==========================================
// Coin Info Routes Services
// ==========================================

/**
 * Fetch coin records by name (case-insensitive).
 * @param {String} name - Coin name
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsByName = async (name, { page = 1, limit = 50 } = {}) => {
  const normalizedName = name?.trim();
  if (!normalizedName) {
    throw createServiceError('coinName parameter is required', 400);
  }

  const skip = (page - 1) * limit;
  const filter = { coin_name: { $regex: escapeRegex(normalizedName), $options: 'i' } };
  
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
  const normalizedSymbol = symbol?.trim();
  if (!normalizedSymbol) {
    throw createServiceError('symbol parameter is required', 400);
  }

  const skip = (page - 1) * limit;
  const filter = { symbol: normalizedSymbol.toUpperCase() };
  
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
 * @param {Number|String} rank - Market cap rank
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinsByRank = async (rank, { page = 1, limit = 50 } = {}) => {
  const parsedRank = Number(rank);
  if (Number.isNaN(parsedRank) || parsedRank <= 0) {
    throw createServiceError('rank parameter must be a positive integer', 400);
  }

  const skip = (page - 1) * limit;
  const filter = { market_cap_rank: parsedRank };
  
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
  const normalizedMonth = month?.trim();
  if (!normalizedMonth || !MONTH_PATTERN.test(normalizedMonth)) {
    throw createServiceError('Invalid month format. Use YYYY-MM', 400);
  }

  const skip = (page - 1) * limit;
  const filter = { month: normalizedMonth };

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
  const normalizedDate = date?.trim();
  const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!normalizedDate || !DATE_PATTERN.test(normalizedDate)) {
    throw createServiceError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  const skip = (page - 1) * limit;
  const filter = { date: normalizedDate };

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

// ==========================================
// Top Performers & Market Standings
// ==========================================

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

// ==========================================
// Chronological Routes
// ==========================================

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

// ==========================================
// Analytical & Comparison Services
// ==========================================

/**
 * Fetch performance statistics for a specific coin by ID.
 * Calculates historical averages, highs, and lows using optimized aggregation.
 * @param {string} coinId - The unique identifier of the coin (e.g. bitcoin)
 * @param {string} [metric] - Optional filter for specific metric
 * @returns {Object|null} - Performance data or null if not found
 */
const getCoinPerformance = async (coinId, metric = null) => {
  const normalizedCoinId = coinId?.trim();
  const normalizedMetric = metric?.trim().toLowerCase() || null;

  if (!normalizedCoinId) {
    throw createServiceError('coinId is required', 400);
  }

  if (normalizedMetric && !PERFORMANCE_METRIC_MAP[normalizedMetric]) {
    throw createServiceError(
      'Invalid metric. Allowed values are volatility, returns, market-cap, and volume',
      400
    );
  }

  const coinFilter = buildCoinIdFilter(normalizedCoinId);

  const performanceStats = await Coin.aggregate([
    { $match: coinFilter },
    { $sort: { timestamp: 1, _id: 1 } },
    {
      $project: {
        coin_id: 1,
        numericPrice: {
          $convert: { input: '$price', to: 'double', onError: null, onNull: null }
        },
        numericMarketCap: {
          $convert: { input: '$market_cap', to: 'double', onError: null, onNull: null }
        },
        numericVolume: {
          $convert: { input: '$volume', to: 'double', onError: null, onNull: null }
        },
        numericDailyReturn: {
          $convert: { input: '$daily_return', to: 'double', onError: null, onNull: null }
        },
        numericCumulativeReturn: {
          $convert: { input: '$cumulative_return', to: 'double', onError: null, onNull: null }
        }
      }
    },
    {
      $group: {
        _id: '$coin_id',
        coinId: { $first: '$coin_id' },
        recordCount: { $sum: 1 },
        latestDailyReturnField: { $last: '$numericDailyReturn' },
        latestCumulativeReturnField: { $last: '$numericCumulativeReturn' },
        averagePrice: { $avg: '$numericPrice' },
        highestPrice: { $max: '$numericPrice' },
        lowestPrice: { $min: '$numericPrice' },
        averageMarketCap: { $avg: '$numericMarketCap' },
        averageVolume: { $avg: '$numericVolume' },
        volatility: { $stdDevPop: '$numericPrice' },
        prices: { $push: '$numericPrice' }
      }
    }
  ]);

  if (!performanceStats.length) {
    throw createServiceError(`Coin '${normalizedCoinId}' does not exist`, 404);
  }

  const stats = performanceStats[0];

  if (!stats.recordCount || !stats.prices.length) {
    throw createServiceError(`No historical dataset found for coin '${normalizedCoinId}'`, 404);
  }

  const validPrices = stats.prices.filter((price) => typeof price === 'number');

  if (!validPrices.length) {
    throw createServiceError(`No valid price data found for coin '${normalizedCoinId}'`, 404);
  }

  const latestPrice = validPrices[validPrices.length - 1];
  const previousPrice = validPrices.length > 1 ? validPrices[validPrices.length - 2] : null;
  const firstPrice = validPrices[0];

  const calculatedDailyReturn =
    previousPrice && previousPrice !== 0
      ? ((latestPrice - previousPrice) / previousPrice) * 100
      : null;

  const calculatedGrowthPercentage =
    firstPrice && firstPrice !== 0
      ? ((latestPrice - firstPrice) / firstPrice) * 100
      : null;

  const performance = {
    coinId: stats.coinId,
    averagePrice: roundMetric(stats.averagePrice),
    highestPrice: roundMetric(stats.highestPrice),
    lowestPrice: roundMetric(stats.lowestPrice),
    dailyReturn: roundMetric(
      typeof stats.latestDailyReturnField === 'number'
        ? stats.latestDailyReturnField
        : calculatedDailyReturn
    ),
    cumulativeReturn: roundMetric(
      typeof stats.latestCumulativeReturnField === 'number'
        ? stats.latestCumulativeReturnField
        : calculatedGrowthPercentage
    ),
    growthPercentage: roundMetric(calculatedGrowthPercentage),
    averageMarketCap: roundMetric(stats.averageMarketCap),
    averageVolume: roundMetric(stats.averageVolume),
    volatility: roundMetric(stats.volatility)
  };

  if (!normalizedMetric) {
    return performance;
  }

  return PERFORMANCE_METRIC_MAP[normalizedMetric].reduce((accumulator, field) => {
    accumulator[field] = performance[field];
    return accumulator;
  }, {});
};

/**
 * Fetch the latest record and performance statistics for a coin.
 * @param {String} coinId - The coin_id field (e.g., "bitcoin")
 * @returns {Object|null} - Coin comparison data or null if not found
 */
const getCoinComparisonData = async (coinId) => {
  const latestRecord = await findLatestCoinRecord(coinId);

  if (!latestRecord) {
    return null;
  }

  const performance = await getCoinPerformance(coinId);

  return {
    coinId: latestRecord.coin_id,
    latestRecord,
    performance
  };
};

/**
 * Compare the latest records and performance statistics for two coins.
 * @param {String} coin1 - First coin_id
 * @param {String} coin2 - Second coin_id
 * @returns {Array|null} - Comparison data or null if any coin is not found
 */
const compareTwoCoins = async (coin1, coin2) => {
  const coinIds = [coin1?.trim(), coin2?.trim()];

  if (coinIds.some((coinId) => !coinId)) {
    throw createServiceError('Both coin identifiers are required for comparison', 400);
  }

  if (coinIds[0].toLowerCase() === coinIds[1].toLowerCase()) {
    throw createServiceError('Comparison requires two different coin identifiers', 400);
  }

  const coins = await Promise.all([
    getCoinComparisonData(coinIds[0]),
    getCoinComparisonData(coinIds[1])
  ]);

  const missingCoins = coinIds.filter((coinId, index) => !coins[index]);

  if (missingCoins.length) {
    throw createServiceError(
      `Comparison data not found for coin_id: ${missingCoins.join(', ')}`,
      404
    );
  }

  return coins;
};

/**
 * Compare the latest records and performance statistics for three coins.
 * @param {String} coin1 - First coin_id
 * @param {String} coin2 - Second coin_id
 * @param {String} coin3 - Third coin_id
 * @returns {Array|null} - Comparison data or null if any coin is not found
 */
const compareThreeCoins = async (coin1, coin2, coin3) => {
  const coinIds = [coin1?.trim(), coin2?.trim(), coin3?.trim()];

  if (coinIds.some((coinId) => !coinId)) {
    throw createServiceError('Three coin identifiers are required for comparison', 400);
  }

  const uniqueCoinIds = new Set(coinIds.map((coinId) => coinId.toLowerCase()));

  if (uniqueCoinIds.size !== coinIds.length) {
    throw createServiceError('Comparison requires three different coin identifiers', 400);
  }

  const coins = await Promise.all([
    getCoinComparisonData(coinIds[0]),
    getCoinComparisonData(coinIds[1]),
    getCoinComparisonData(coinIds[2])
  ]);

  const missingCoins = coinIds.filter((coinId, index) => !coins[index]);

  if (missingCoins.length) {
    throw createServiceError(
      `Comparison data not found for coin_id: ${missingCoins.join(', ')}`,
      404
    );
  }

  return coins;
};

/**
 * Fetch the latest price for a specific coin.
 * @param {String} coinId - The coin_id field (e.g., "bitcoin")
 * @returns {Object|null} - Current coin price data or null if not found
 */
const getCurrentPrice = async (coinId) => {
  const latestRecord = await findLatestCoinRecord(coinId);

  if (!latestRecord) {
    throw createServiceError(`Current price not found for coin_id: '${coinId}'`, 404);
  }

  return {
    coinId: latestRecord.coin_id,
    coinName: latestRecord.coin_name,
    symbol: latestRecord.symbol,
    price: latestRecord.price,
    timestamp: latestRecord.timestamp
  };
};

/**
 * Fetch a coin's historical records filtered by month.
 * @param {String} coinId - The coin_id field (e.g., "bitcoin")
 * @param {String} month - Month string in YYYY-MM format
 * @param {Object} options - Query options (page, limit)
 * @returns {Object} - Paginated results with metadata
 */
const getCoinHistoryByMonth = async (coinId, month, { page = 1, limit = 50 } = {}) => {
  const normalizedCoinId = coinId?.trim();
  const normalizedMonth = month?.trim();

  if (!normalizedCoinId) {
    throw createServiceError('coinId is required', 400);
  }

  if (!normalizedMonth) {
    throw createServiceError('month is required', 400);
  }

  validateHistoryMonth(normalizedMonth);

  const latestRecord = await findLatestCoinRecord(normalizedCoinId);

  if (!latestRecord) {
    throw createServiceError(`Coin '${normalizedCoinId}' does not exist`, 404);
  }

  const skip = (page - 1) * limit;
  const filter = {
    ...buildCoinIdFilter(normalizedCoinId),
    month: normalizedMonth
  };

  const totalRecords = await Coin.countDocuments(filter);

  if (!totalRecords) {
    throw createServiceError(
      `No historical records found for coin '${normalizedCoinId}' in month '${normalizedMonth}'`,
      404
    );
  }

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
 * Replace a coin record by ID (fully overwrites the document).
 * @param {String} id - MongoDB document ID
 * @param {Object} replacementData - Complete replacement document data
 * @returns {Object|null} - Replaced coin document or null
 */
const replaceCoin = async (id, replacementData) => {
  const coin = await Coin.findOneAndReplace({ _id: id }, replacementData, {
    returnDocument: 'after',
    runValidators: true
  });
  return coin;
};

/**
 * Search coin records by regex match on text fields.
 * Supports q matching coin_id, coin_name, symbol, month, or date.
 * @param {String} q - Search keyword
 * @param {Object} options - Pagination (page, limit)
 * @returns {Object} - Paginated search results
 */
const searchCoins = async (q, { page = 1, limit = 50 } = {}) => {
  const query = q?.trim();
  if (!query) {
    throw createServiceError('Search query parameter q is required', 400);
  }

  const escapedQuery = escapeRegex(query);
  const skip = (page - 1) * limit;

  const filter = {
    $or: [
      { coin_id: { $regex: escapedQuery, $options: 'i' } },
      { coin_name: { $regex: escapedQuery, $options: 'i' } },
      { symbol: { $regex: escapedQuery, $options: 'i' } },
      { month: { $regex: escapedQuery, $options: 'i' } },
      { date: { $regex: escapedQuery, $options: 'i' } }
    ]
  };

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
 * Fetch coin records filtered by specific criteria.
 * Supports: high-price, low-price, bullish, bearish, profitable, loss-making
 * @param {String} filterType - Type of filter to apply
 * @param {Object} queryParams - Request query parameters for custom overrides and generic filters
 * @param {Object} options - Pagination options
 * @returns {Object} - Paginated and filtered results with metadata
 */
const getFilteredCoins = async (filterType, queryParams = {}, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const baseFilter = buildQueryFilter(queryParams);

  let specificFilter = {};
  switch (filterType) {
    case 'high-price': {
      const threshold = parseNumberParam(queryParams.threshold, 'threshold') ?? 100;
      specificFilter = { price: { $gte: threshold } };
      break;
    }
    case 'low-price': {
      const threshold = parseNumberParam(queryParams.threshold, 'threshold') ?? 1;
      specificFilter = { price: { $lt: threshold } };
      break;
    }
    case 'bullish': {
      specificFilter = {
        price_ma7: { $ne: null },
        price_ma30: { $ne: null },
        $expr: { $gt: ['$price_ma7', '$price_ma30'] }
      };
      break;
    }
    case 'bearish': {
      specificFilter = {
        price_ma7: { $ne: null },
        price_ma30: { $ne: null },
        $expr: { $lt: ['$price_ma7', '$price_ma30'] }
      };
      break;
    }
    case 'profitable': {
      specificFilter = { daily_return: { $gt: 0 } };
      break;
    }
    case 'loss-making': {
      specificFilter = { daily_return: { $lt: 0 } };
      break;
    }
    default:
      throw createServiceError(`Invalid filter type: ${filterType}`, 400);
  }

  const finalFilter = { ...baseFilter, ...specificFilter };
  const sortObject = buildSortObject(queryParams.sort);
  const projection = buildFieldProjection(queryParams.fields);

  const totalRecords = await Coin.countDocuments(finalFilter);
  let query = Coin.find(finalFilter)
    .skip(skip)
    .limit(limit)
    .sort(sortObject);

  if (projection) {
    query = query.select(projection);
  }

  const coins = await query;

  return {
    coins,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    },
    appliedFilters: finalFilter,
    appliedSort: sortObject
  };
};

/**
 * Fetch aggregation summary analytics (average/highest/lowest price & volume) grouped by coin.
 * Supports dynamic match filters, pagination, and sorting on analytical metrics.
 * @param {Object} queryParams - Query parameters for dynamic match filtering and sorting
 * @param {Object} options - Pagination parameters
 * @returns {Object} - Paginated analytical results with metadata
 */
const getAnalyticsSummary = async (queryParams = {}, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = buildQueryFilter(queryParams);

  // Parse sorting parameters
  const sortParam = queryParams.sort;
  const sortObject = {};
  if (sortParam) {
    const sortStr = Array.isArray(sortParam) ? sortParam.join(',') : String(sortParam);
    const sortFields = sortStr.split(',');
    for (const field of sortFields) {
      let trimmedField = field.trim();
      let direction = -1; // Default descending
      
      if (trimmedField.startsWith('-')) {
        direction = -1;
        trimmedField = trimmedField.slice(1);
      } else if (trimmedField.startsWith('+')) {
        direction = 1;
        trimmedField = trimmedField.slice(1);
      }
      
      if (trimmedField.includes(':')) {
        const [fieldName, dir] = trimmedField.split(':');
        trimmedField = fieldName;
        if (dir?.toLowerCase() === 'asc') direction = 1;
        else if (dir?.toLowerCase() === 'desc') direction = -1;
      }
      
      const ALLOWED_ANALYTICS_SORTS = [
        'averagePrice',
        'highestPrice',
        'lowestPrice',
        'averageVolume',
        'highestVolume',
        'lowestVolume',
        'coinId',
        'recordCount'
      ];
      
      if (ALLOWED_ANALYTICS_SORTS.includes(trimmedField)) {
        sortObject[trimmedField] = direction;
      }
    }
  }

  // Default sort by average price descending
  if (Object.keys(sortObject).length === 0) {
    sortObject.averagePrice = -1;
  }

  const pipeline = [
    // 1. Match stage
    { $match: filter },
    
    // 2. Group stage
    {
      $group: {
        _id: '$coin_id',
        coinId: { $first: '$coin_id' },
        coinName: { $first: '$coin_name' },
        symbol: { $first: '$symbol' },
        averagePrice: { $avg: '$price' },
        highestPrice: { $max: '$price' },
        lowestPrice: { $min: '$price' },
        averageVolume: { $avg: '$volume' },
        highestVolume: { $max: '$volume' },
        lowestVolume: { $min: '$volume' },
        recordCount: { $sum: 1 }
      }
    },
    
    // 3. Project stage (rounding averages and values)
    {
      $project: {
        _id: 0,
        coinId: 1,
        coinName: 1,
        symbol: 1,
        recordCount: 1,
        averagePrice: { $round: ['$averagePrice', 2] },
        highestPrice: { $round: ['$highestPrice', 2] },
        lowestPrice: { $round: ['$lowestPrice', 2] },
        averageVolume: { $round: ['$averageVolume', 2] },
        highestVolume: { $round: ['$highestVolume', 2] },
        lowestVolume: { $round: ['$lowestVolume', 2] }
      }
    },
    
    // 4. Sort stage
    { $sort: sortObject },
    
    // 5. Facet stage for pagination
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ];

  const result = await Coin.aggregate(pipeline);
  const data = result[0]?.data || [];
  const totalRecords = result[0]?.totalCount[0]?.count || 0;

  return {
    analytics: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    },
    appliedFilters: Object.keys(filter).length > 0 ? filter : undefined,
    appliedSort: sortObject
  };
};

/**
 * Fetch global market statistics (total market cap, averages, active coin counts, log counts).
 * @param {Object} queryParams - Filters to restrict scope (e.g. month, date)
 * @returns {Object} - Global aggregated statistics
 */
const getGlobalMarketStats = async (queryParams = {}) => {
  const filter = buildQueryFilter(queryParams);
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: null,
        totalMarketCap: { $sum: '$market_cap' },
        averageMarketCap: { $avg: '$market_cap' },
        totalVolume: { $sum: '$volume' },
        averageVolume: { $avg: '$volume' },
        uniqueCoins: { $addToSet: '$coin_id' },
        recordCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        totalMarketCap: { $round: ['$totalMarketCap', 2] },
        averageMarketCap: { $round: ['$averageMarketCap', 2] },
        totalVolume: { $round: ['$totalVolume', 2] },
        averageVolume: { $round: ['$averageVolume', 2] },
        uniqueCoinsCount: { $size: '$uniqueCoins' },
        recordCount: 1
      }
    }
  ];

  const result = await Coin.aggregate(pipeline);
  return result[0] || {
    totalMarketCap: 0,
    averageMarketCap: 0,
    totalVolume: 0,
    averageVolume: 0,
    uniqueCoinsCount: 0,
    recordCount: 0
  };
};

/**
 * Fetch price distribution grouping records into 5 ranges for charts.
 * @param {Object} queryParams - Dynamic match filters
 * @returns {Array} - List of 5 buckets with counts and active symbol counts
 */
const getPriceDistribution = async (queryParams = {}) => {
  const filter = buildQueryFilter(queryParams);
  const pipeline = [
    { $match: filter },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 1, 10, 100, 1000],
        default: 1000,
        output: {
          count: { $sum: 1 },
          uniqueSymbols: { $addToSet: '$symbol' }
        }
      }
    }
  ];

  const buckets = await Coin.aggregate(pipeline);

  const distributionMap = {
    0: { range: 'Under $1 (Micro)', boundaryLower: 0, count: 0, uniqueCoinsCount: 0 },
    1: { range: '$1 - $10 (Small)', boundaryLower: 1, count: 0, uniqueCoinsCount: 0 },
    10: { range: '$10 - $100 (Medium)', boundaryLower: 10, count: 0, uniqueCoinsCount: 0 },
    100: { range: '$100 - $1,000 (Large)', boundaryLower: 100, count: 0, uniqueCoinsCount: 0 },
    1000: { range: '$1,000+ (Mega)', boundaryLower: 1000, count: 0, uniqueCoinsCount: 0 }
  };

  for (const b of buckets) {
    if (distributionMap[b._id]) {
      distributionMap[b._id].count = b.count;
      distributionMap[b._id].uniqueCoinsCount = b.uniqueSymbols.length;
    }
  }

  return Object.values(distributionMap);
};

/**
 * Fetch chronological summary analytics grouped by interval (daily, monthly, yearly).
 * @param {String} interval - daily | monthly | yearly
 * @param {Object} queryParams - Match filters
 * @param {Object} options - Pagination options
 * @returns {Object} - Chronological stats and pagination info
 */
const getChronologicalSummary = async (interval, queryParams = {}, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = buildQueryFilter(queryParams);

  let groupId = '$month'; // Default monthly
  if (interval === 'daily') {
    groupId = '$date';
  } else if (interval === 'yearly') {
    groupId = { $substr: ['$date', 0, 4] };
  }

  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: groupId,
        intervalValue: { $first: groupId },
        averagePrice: { $avg: '$price' },
        totalVolume: { $sum: '$volume' },
        averageVolume: { $avg: '$volume' },
        averageMarketCap: { $avg: '$market_cap' },
        recordCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        intervalValue: '$_id',
        averagePrice: { $round: ['$averagePrice', 2] },
        totalVolume: { $round: ['$totalVolume', 2] },
        averageVolume: { $round: ['$averageVolume', 2] },
        averageMarketCap: { $round: ['$averageMarketCap', 2] },
        recordCount: 1
      }
    },
    { $sort: { intervalValue: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ];

  const result = await Coin.aggregate(pipeline);
  const data = result[0]?.data || [];
  const totalRecords = result[0]?.totalCount[0]?.count || 0;

  return {
    summary: data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    },
    appliedFilters: Object.keys(filter).length > 0 ? filter : undefined,
    interval
  };
};

export {
  getAllCoins,
  getCoinById,
  createCoin,
  updateCoin,
  replaceCoin,
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
  getCoinPerformance,
  compareTwoCoins,
  compareThreeCoins,
  getCurrentPrice,
  getCoinHistoryByMonth,
  searchCoins,
  getFilteredCoins,
  getAnalyticsSummary,
  getGlobalMarketStats,
  getPriceDistribution,
  getChronologicalSummary
};


