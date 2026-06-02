import { getAllCoins, getCoinById, createCoin, updateCoin as updateCoinService, deleteCoin as deleteCoinService, checkCoinExists as checkCoinExistsService, bulkCreateCoins, bulkUpdateCoins, bulkDeleteCoins } from '../services/coinService.js';

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

export { getCoins, getCoin, addCoin, updateCoin, removeCoin, checkCoinExists, bulkAddCoins, bulkModifyCoins, bulkRemoveCoins };
