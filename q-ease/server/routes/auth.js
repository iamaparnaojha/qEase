import express from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

// Create a router instance
const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('userType').isIn(['user', 'admin']).withMessage('User type must be either user or admin')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        userType: req.body.userType
      });

      await user.save();

      // Generate token
      const token = user.generateAuthToken();

      // Set token as cookie
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user exists
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = user.generateAuthToken();

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      };

      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Export the router
export default router;