import express from 'express';
import { registerUser, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/register - Register a new user
router.post('/register', registerUser);

// POST /auth/verify-email - Verify email address using token
router.post('/verify-email', verifyEmail);

export default router;
