import express from 'express';
import { getCoins, getCoin, addCoin, updateCoin, removeCoin, checkCoinExists, bulkAddCoins, bulkModifyCoins, bulkRemoveCoins } from '../controllers/coinController.js';

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
