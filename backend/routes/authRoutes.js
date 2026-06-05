import express from 'express';
import { registerUser, verifyEmail, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword, changePassword, refreshToken, revokeToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate, registerSchema, loginSchema, changePasswordSchema } from '../middlewares/validateMiddleware.js';

const router = express.Router();

// POST /auth/register - Register a new user
router.post('/register', validate(registerSchema), registerUser);

// POST /auth/verify-email - Verify email address using token
router.post('/verify-email', verifyEmail);

// POST /auth/login - User login
router.post('/login', validate(loginSchema), loginUser);

// POST /auth/logout - User logout
router.post('/logout', logoutUser);

// GET /auth/profile - Fetch user profile (protected)
router.get('/profile', protect, getUserProfile);

// POST /auth/forgot-password - Request password reset link
router.post('/forgot-password', forgotPassword);

// POST /auth/reset-password/:resetToken - Reset password with token
router.post('/reset-password/:resetToken', resetPassword);

// POST /auth/change-password - Change logged-in user password (protected)
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);

// POST /auth/refresh-token - Refresh expired access token
router.post('/refresh-token', refreshToken);

// POST /auth/revoke-token - Revoke refresh token
router.post('/revoke-token', revokeToken);

export default router;
