import express from 'express';
import { getCoins, getCoin, addCoin, updateCoin, removeCoin } from '../controllers/coinController.js';

const router = express.Router();

// GET /coins - Fetch all cryptocurrency records (paginated)
router.get('/', getCoins);

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
