import express from 'express';
import { getCoins, getCoin, addCoin } from '../controllers/coinController.js';

const router = express.Router();

// GET /coins - Fetch all cryptocurrency records (paginated)
router.get('/', getCoins);

// GET /coins/:id - Fetch single cryptocurrency record by ID
router.get('/:id', getCoin);

// POST /coins - Add a new cryptocurrency record
router.post('/', addCoin);

export default router;
