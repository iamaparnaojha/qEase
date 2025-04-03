
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Queue = require('../models/Queue');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's joined queues
router.get('/queues', auth, async (req, res) => {
  try {
    // Get user with joined queues
    const user = await User.findById(req.user.id).select('joinedQueues');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If no joined queues, return empty array
    if (!user.joinedQueues || user.joinedQueues.length === 0) {
      return res.json([]);
    }

    // Get details for each joined queue
    const queueDetails = await Promise.all(
      user.joinedQueues.map(async (joinedQueue) => {
        const queue = await Queue.findById(joinedQueue.queueId);
        if (!queue) return null;

        // Get user's current position
        const position = queue.getCurrentPosition(req.user.id);
        if (position === -1) return null; // User not in queue anymore

        return {
          id: queue._id,
          name: queue.name,
          position,
          totalUsers: queue.getActiveUsersCount(),
          estimatedTimeMin: queue.getEstimatedWaitTime(position),
          joinedAt: joinedQueue.joinedAt
        };
      })
    );

    // Filter out null values (queues that don't exist anymore)
    const validQueues = queueDetails.filter(q => q !== null);

    res.json(validQueues);
  } catch (error) {
    console.error('Get user queues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
