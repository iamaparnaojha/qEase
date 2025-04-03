import express from 'express';
import User from '../models/User.js';
import Queue from '../models/Queue.js';
import auth from '../middleware/auth.js';

const router = express.Router();

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
    const user = await User.findById(req.user.id).select('joinedQueues');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.joinedQueues || user.joinedQueues.length === 0) {
      return res.json([]);
    }

    const queueDetails = await Promise.all(
      user.joinedQueues.map(async (joinedQueue) => {
        const queue = await Queue.findById(joinedQueue.queueId);
        if (!queue) return null;

        const position = queue.getCurrentPosition(req.user.id);
        if (position === -1) return null;

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

    const validQueues = queueDetails.filter(q => q !== null);

    res.json(validQueues);
  } catch (error) {
    console.error('Get user queues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;