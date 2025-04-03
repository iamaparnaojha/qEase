
const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');

// Create a new queue (Admin only)
router.post(
  '/',
  [
    auth,
    body('name').notEmpty().withMessage('Queue name is required'),
    body('perUserTimeMinutes').isNumeric().withMessage('Per user time must be a number')
  ],
  async (req, res) => {
    // Verify admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Create new queue
      const queue = new Queue({
        name: req.body.name,
        perUserTimeMinutes: req.body.perUserTimeMinutes,
        admin: req.user.id
      });

      await queue.save();

      // Generate QR code for the queue
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

// Get all queues for an admin
router.get('/admin', auth, async (req, res) => {
  // Verify admin
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    const queues = await Queue.find({ admin: req.user.id }).sort({ createdAt: -1 });
    
    // Transform data for client
    const queueData = await Promise.all(queues.map(async (queue) => {
      const qrCodeDataUrl = await QRCode.toDataURL(queue.queueCode);
      return {
        id: queue._id,
        name: queue.name,
        queueCode: queue.queueCode,
        perUserTimeMinutes: queue.perUserTimeMinutes,
        active: queue.active,
        totalUsers: queue.getActiveUsersCount(),
        qrCode: qrCodeDataUrl,
        createdAt: queue.createdAt
      };
    }));

    res.json(queueData);
  } catch (error) {
    console.error('Get admin queues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get queue details by ID (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Verify admin is the owner
    if (req.user.userType === 'admin' && queue.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Not your queue.' });
    }

    // For users, verify they are in the queue
    if (req.user.userType === 'user') {
      const userInQueue = queue.users.some(u => 
        u.userId.toString() === req.user.id && u.status === 'waiting'
      );

      if (!userInQueue) {
        return res.status(403).json({ message: 'Access denied. You are not in this queue.' });
      }
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(queue.queueCode);

    // Transform data based on user type
    if (req.user.userType === 'admin') {
      res.json({
        id: queue._id,
        name: queue.name,
        queueCode: queue.queueCode,
        perUserTimeMinutes: queue.perUserTimeMinutes,
        active: queue.active,
        users: queue.users.filter(u => u.status === 'waiting').map(u => ({
          id: u.userId,
          name: u.name,
          joinedAt: u.joinedAt,
          position: u.position
        })),
        qrCode: qrCodeDataUrl,
        createdAt: queue.createdAt
      });
    } else {
      // For user, return their position and wait time
      const position = queue.getCurrentPosition(req.user.id);
      const estimatedTimeMin = queue.getEstimatedWaitTime(position);
      
      res.json({
        id: queue._id,
        name: queue.name,
        position,
        totalUsers: queue.getActiveUsersCount(),
        estimatedTimeMin,
        joinedAt: queue.users.find(u => 
          u.userId.toString() === req.user.id && u.status === 'waiting'
        ).joinedAt
      });
    }
  } catch (error) {
    console.error('Get queue details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a queue (User only)
router.post('/join', auth, async (req, res) => {
  // Verify user
  if (req.user.userType !== 'user') {
    return res.status(403).json({ message: 'Access denied. User only.' });
  }

  try {
    // Find queue by code
    const queue = await Queue.findOne({ queueCode: req.body.queueCode });
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (!queue.active) {
      return res.status(400).json({ message: 'This queue is no longer active' });
    }

    // Check if user is already in the queue
    const isUserInQueue = queue.users.some(u => 
      u.userId.toString() === req.user.id && u.status === 'waiting'
    );

    if (isUserInQueue) {
      return res.status(400).json({ message: 'You are already in this queue' });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    
    // Add user to queue
    const position = queue.users.filter(u => u.status === 'waiting').length + 1;
    
    queue.users.push({
      userId: req.user.id,
      name: user.name,
      position,
      status: 'waiting'
    });
    
    await queue.save();

    // Add queue to user's joined queues
    user.joinedQueues.push({
      queueId: queue._id,
      position
    });
    
    await user.save();

    // Calculate estimated wait time
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

// Leave a queue (User only)
router.post('/:id/leave', auth, async (req, res) => {
  // Verify user
  if (req.user.userType !== 'user') {
    return res.status(403).json({ message: 'Access denied. User only.' });
  }

  try {
    // Find queue
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Find user in queue
    const userIndex = queue.users.findIndex(u => 
      u.userId.toString() === req.user.id && u.status === 'waiting'
    );

    if (userIndex === -1) {
      return res.status(400).json({ message: 'You are not in this queue' });
    }

    // Update user status to 'left'
    queue.users[userIndex].status = 'left';
    
    // Update positions for users behind the leaving user
    const userPosition = queue.users[userIndex].position;
    queue.users.forEach(u => {
      if (u.status === 'waiting' && u.position > userPosition) {
        u.position -= 1;
      }
    });
    
    await queue.save();

    // Remove queue from user's joined queues
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { joinedQueues: { queueId: queue._id } } }
    );

    res.json({
      success: true,
      message: `You have left ${queue.name}`
    });
  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve a user in the queue (Admin only)
router.post('/:id/serve/:userId', auth, async (req, res) => {
  // Verify admin
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    // Find queue
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Verify admin is the owner
    if (queue.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Not your queue.' });
    }

    // Find user in queue
    const userIndex = queue.users.findIndex(u => 
      u.userId.toString() === req.params.userId && u.status === 'waiting'
    );

    if (userIndex === -1) {
      return res.status(400).json({ message: 'User not found in queue' });
    }

    // Update user status to 'served'
    queue.users[userIndex].status = 'served';
    
    // Update positions for users behind the served user
    const userPosition = queue.users[userIndex].position;
    queue.users.forEach(u => {
      if (u.status === 'waiting' && u.position > userPosition) {
        u.position -= 1;
      }
    });
    
    await queue.save();

    // Remove queue from user's joined queues
    await User.updateOne(
      { _id: req.params.userId },
      { $pull: { joinedQueues: { queueId: queue._id } } }
    );

    // TODO: Send notification to the user (using Twilio API)

    res.json({
      success: true,
      message: 'User served successfully'
    });
  } catch (error) {
    console.error('Serve user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
