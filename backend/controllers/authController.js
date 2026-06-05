import crypto from 'crypto';
import User from '../models/User.js';

/**
 * @desc    Register a new user and generate email verification token
 * @route   POST /auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already registered with this email address'
      });
    }

    // Generate email verification token and expiration (24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create the user (unverified by default)
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires
    });

    // Email simulator log output
    console.log(`\n======================================================================`);
    console.log(`📬 [EMAIL SIMULATOR] Email verification link for ${user.email}:`);
    console.log(`👉 http://127.0.0.1:5000/auth/verify-email (Token: ${verificationToken})`);
    console.log(`======================================================================\n`);

    // In non-production envs, return the token in response to support automated testing.
    const responsePayload = {
      success: true,
      message: 'Registration successful! Please verify your email.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.data.verificationToken = verificationToken;
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * @desc    Verify user email address using token
 * @route   POST /auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user by verification token and check expiration
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token'
      });
    }

    // Update user verification state
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};
