const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');

// Create a new queue (Admin only)
router.post('/create', auth, async (req, res) => {
  try {
    const { name, perUserTimeMin } = req.body;
    
    if (!name || !perUserTimeMin) {
      return res.status(400).json({
        success: false,
        message: 'Name and time per user are required'
      });
    }

    // Generate unique queue ID
    const queueId = 'Q-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Generate QR code with full URL
    const qrCodeData = `${process.env.CLIENT_URL || 'http://localhost:3000'}/join/${queueId}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);
    
    const queue = new Queue({
      queueId,
      name,
      adminId: req.user._id,
      perUserTimeMin: Number(perUserTimeMin),
      qrCode
    });
    
    const savedQueue = await queue.save();
    
    res.status(201).json({
      success: true,
      queue: {
        id: savedQueue.queueId,
        name: savedQueue.name,
        perUserTimeMin: savedQueue.perUserTimeMin,
        qrCode: savedQueue.qrCode,
        createdAt: savedQueue.createdAt,
        usersCount: 0
      }
    });
  } catch (error) {
    console.error('Queue creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating queue',
      error: error.message
    });
  }
});

// Get all active queues for an admin
router.get('/admin/queues', auth, async (req, res) => {
  try {
    const queues = await Queue.find({ 
      adminId: req.user._id,
      status: 'active'
    });
    
    const formattedQueues = queues.map(queue => ({
      id: queue.queueId,
      name: queue.name,
      perUserTimeMin: queue.perUserTimeMin,
      qrCode: queue.qrCode,
      createdAt: queue.createdAt,
      usersCount: queue.users.filter(u => u.status === 'waiting').length
    }));
    
    res.json({
      success: true,
      queues: formattedQueues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queues',
      error: error.message
    });
  }
});

// Join a queue (User)
router.post('/join', auth, async (req, res) => {
  try {
    const { queueId } = req.body;
    
    const queue = await Queue.findOne({ queueId, status: 'active' });
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found or inactive'
      });
    }
    
    // Check if user is already in queue
    const existingUser = queue.users.find(u => 
      u.userId.toString() === req.user._id.toString() && 
      u.status === 'waiting'
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this queue'
      });
    }
    
    // Calculate estimated wait time
    const estimatedTime = queue.calculateEstimatedTime();
    
    // Add user to queue
    queue.users.push({
      userId: req.user._id,
      estimatedTime
    });
    
    await queue.save();
    
    res.json({
      success: true,
      message: 'Successfully joined queue',
      estimatedTime,
      position: queue.users.filter(u => u.status === 'waiting').length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining queue',
      error: error.message
    });
  }
});

// End queue (Admin only)
router.post('/end/:queueId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ 
      queueId: req.params.queueId,
      adminId: req.user._id,
      status: 'active'
    });
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    queue.status = 'ended';
    queue.endedAt = new Date();
    await queue.save();
    
    res.json({
      success: true,
      message: 'Queue ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending queue',
      error: error.message
    });
  }
});

// Get queue details
router.get('/:queueId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ queueId: req.params.queueId })
      .populate('users.userId', 'name email');
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    res.json({
      success: true,
      queue: {
        id: queue.queueId,
        name: queue.name,
        perUserTimeMin: queue.perUserTimeMin,
        status: queue.status,
        qrCode: queue.qrCode,
        createdAt: queue.createdAt,
        endedAt: queue.endedAt,
        users: queue.users.map(u => ({
          id: u.userId._id,
          name: u.userId.name,
          status: u.status,
          joinedAt: u.joinedAt,
          estimatedTime: u.estimatedTime
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queue details',
      error: error.message
    });
  }
});

module.exports = router; 