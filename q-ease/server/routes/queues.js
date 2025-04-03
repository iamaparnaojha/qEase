import express from 'express';
import Queue from '../models/Queue.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import QRCode from 'qrcode';

const router = express.Router();

router.post(
  '/',
  [
    auth,
    body('name').notEmpty().withMessage('Queue name is required'),
    body('perUserTimeMinutes').isNumeric().withMessage('Per user time must be a number')
  ],
  async (req, res) => {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const queue = new Queue({
        name: req.body.name,
        perUserTimeMinutes: req.body.perUserTimeMinutes,
        admin: req.user.id
      });

      await queue.save();

      const qrCodeDataUrl = await QRCode.toDataURL(queue.queueCode);

      res.status(201).json({
        message: 'Queue created successfully',
        queue: {
          id: queue._id,
          name: queue.name,
          queueCode: queue.queueCode,
          perUserTimeMinutes: queue.perUserTimeMinutes,
          qrCode: qrCodeDataUrl
        }
      });
    } catch (error) {
      console.error('Queue creation error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/admin', auth, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    const queues = await Queue.find({ admin: req.user.id }).sort({ createdAt: -1 });
    
    const queueData = await Promise.all(queues.map(async (queue) => {
      // Transform data for client
    }));

    res.json(queueData);
  } catch (error) {
    console.error('Get admin queues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      // Handle queue not found
    }

    if (req.user.userType === 'admin' && queue.admin.toString() !== req.user.id) {
      // Handle unauthorized access
    }

    if (req.user.userType === 'user') {
      // Handle user access
    }

    const qrCodeDataUrl = await QRCode.toDataURL(queue.queueCode);

    if (req.user.userType === 'admin') {
      // Transform data for admin
    } else {
      // Transform data for user
    }
  } catch (error) {
    console.error('Get queue details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/join', auth, async (req, res) => {
  if (req.user.userType !== 'user') {
    return res.status(403).json({ message: 'Access denied. User only.' });
  }

  try {
    const queue = await Queue.findOne({ queueCode: req.body.queueCode });
    
    if (!queue) {
      // Handle queue not found
    }

    if (!queue.active) {
      // Handle inactive queue
    }

    const isUserInQueue = queue.users.some(u => 
      u.userId.toString() === req.user.id && u.status === 'waiting'
    );

    if (isUserInQueue) {
      // Handle user already in queue
    }

    const user = await User.findById(req.user.id);
    
    const position = queue.users.filter(u => u.status === 'waiting').length + 1;
    
    queue.users.push({
      userId: req.user.id,
      name: user.name,
      position,
      status: 'waiting'
    });
    
    await queue.save();

    user.joinedQueues.push({
      queueId: queue._id,
      position
    });
    
    await user.save();

    const estimatedTimeMin = queue.getEstimatedWaitTime(position);

    res.json({
      success: true,
      message: `You have joined ${queue.name}`,
      queue: {
        id: queue._id,
        name: queue.name,
        position,
        totalUsers: position,
        estimatedTimeMin,
        joinedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/leave', auth, async (req, res) => {
  if (req.user.userType !== 'user') {
    // Handle unauthorized access
  }

  try {
    // Handle leave queue logic
  } catch (error) {
    // Handle error
  }
});

router.post('/:id/serve/:userId', auth, async (req, res) => {
  if (req.user.userType !== 'admin') {
    // Handle unauthorized access
  }

  try {
    // Handle serve user logic
  } catch (error) {
    // Handle error
  }
});

export default router;