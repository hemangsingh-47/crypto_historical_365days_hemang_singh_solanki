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

export {
  getAllCoins,
  getCoinById,
  createCoin,
  updateCoin,
  deleteCoin,
  checkCoinExists,
  bulkCreateCoins,
  bulkUpdateCoins,
  bulkDeleteCoins
};
