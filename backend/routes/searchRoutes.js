import express from 'express';
import { searchCoins } from '../controllers/coinController.js';

const router = express.Router();

// GET /search/coins - Search coins by regex keyword match
router.get('/coins', searchCoins);

export default router;
