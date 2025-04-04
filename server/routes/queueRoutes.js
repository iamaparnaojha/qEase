import express from 'express';
import Queue from '../models/Queue.js';
import QRCode from 'qrcode';
import * as authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import { sendSMS } from '../utils/twilioService.js';

const router = express.Router();

// Create a new queue (Admin only)
router.post('/create', authMiddleware.authUser, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Auth user:', req.user);
    
    const { name, perUserTimeMin } = req.body;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const adminId = req.user.id;
    console.log('Admin ID:', adminId);

    // Generate queueId
    const queueId = 'Q-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log('Generated queue ID:', queueId);
    
    // Generate QR code
    const qrUrl = `http://localhost:3000/join/${queueId}`;
    const qrCode = await QRCode.toDataURL(qrUrl);
    console.log('Generated QR code');
    
    // Create queue with all required fields
    const newQueue = new Queue({
      name,
      perUserTimeMin: Number(perUserTimeMin),
      adminId,
      queueId,
      qrCode
    });
    console.log('New queue object:', newQueue);

    // Save queue
    const savedQueue = await newQueue.save();
    console.log('Saved queue:', savedQueue);

    res.status(201).json({
      success: true,
      message: 'Queue created successfully',
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
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: error.message
    });
  }
});

// Get all active queues for an admin
router.get('/admin/queues', authMiddleware.authUser, async (req, res) => {
  try {
    const queues = await Queue.find({ 
      adminId: req.user.id,
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

// Join a queue
router.post('/join', authMiddleware.authUser, async (req, res) => {
  try {
    console.log('Join queue request:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });
    
    const { queueId } = req.body;
    
    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'Queue ID is required'
      });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    console.log('Looking for queue with ID:', queueId);
    const queue = await Queue.findOne({ 
      queueId,
      status: 'active'
    }).populate('adminId', 'name');
    
    console.log('Found queue:', queue);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found or is not active'
      });
    }
    
    // Check if user is already in queue
    const existingUser = queue.users.find(u => {
      const userId = u.userId._id ? u.userId._id : u.userId;
      return userId.toString() === req.user._id.toString() && u.status === 'waiting';
    });
    
    console.log('Existing user in queue:', existingUser);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this queue'
      });
    }
    
    // Calculate position and estimated time
    const waitingUsers = queue.users.filter(u => u.status === 'waiting').length;
    const position = waitingUsers + 1; // New user will be at this position
    const estimatedTime = position * queue.perUserTimeMin; // Calculate based on position
    
    console.log('Queue stats:', {
      waitingUsers,
      position,
      perUserTimeMin: queue.perUserTimeMin,
      calculatedEstimatedTime: estimatedTime
    });
    
    // Add user to queue with calculated estimated time
    queue.users.push({
      userId: req.user._id,
      status: 'waiting',
      joinedAt: new Date(),
      estimatedTime: estimatedTime // Store calculated time
    });
    
    const savedQueue = await queue.save();
    console.log('Saved queue:', savedQueue);
    
    res.json({
      success: true,
      message: 'Successfully joined queue',
      queue: {
        id: queue.queueId,
        name: queue.name,
        admin: queue.adminId.name,
        perUserTimeMin: queue.perUserTimeMin,
        status: queue.status,
        createdAt: queue.createdAt,
        userPosition: position,
        userEstimatedTime: estimatedTime,
        estimatedTime: estimatedTime, // Add calculated time
        totalWaiting: waitingUsers + 1,
        joinedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error joining queue:', {
      error: error.message,
      stack: error.stack,
      user: req.user?._id
    });
    res.status(500).json({
      success: false,
      message: 'Error joining queue',
      error: error.message
    });
  }
});

// End queue (Admin only)
router.put('/end/:queueId', authMiddleware.authUser, async (req, res) => {
  try {
    // console.log(req.user.id)
    const queue = await Queue.findOne({ 
      _id: req.params.queueId,
      adminId: req.user.id,
      status: 'active'
    });

    console.log(queue)
    
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
router.get('/:queueId', authMiddleware.authUser, async (req, res) => {
  try {
    console.log('Fetching queue details for:', req.params.queueId);
    
    const queue = await Queue.findOne({ queueId: req.params.queueId })
      .populate('users.userId', 'name email')
      .populate('adminId', 'name');
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    // Find user's position if they are in the queue
    let userPosition = null;
    let userEstimatedTime = null;
    
    if (req.user) {
      const userInQueue = queue.users.find(u => 
        u.userId._id.toString() === req.user._id.toString() &&
        u.status === 'waiting'
      );
      
      if (userInQueue) {
        userPosition = queue.users.filter(u => 
          u.status === 'waiting' && 
          new Date(u.joinedAt) <= new Date(userInQueue.joinedAt)
        ).length;
        userEstimatedTime = userInQueue.estimatedTime;
      }
    }

    // Format users array
    const formattedUsers = queue.users.map(user => ({
      _id: user._id,
      userId: user.userId._id,
      name: user.userId.name,
      email: user.userId.email,
      joinedAt: user.joinedAt,
      status: user.status,
      estimatedTime: user.estimatedTime,
      servedAt: user.servedAt
    }));
    
    res.json({
      success: true,
      queue: {
        id: queue.queueId,
        name: queue.name,
        admin: queue.adminId.name,
        perUserTimeMin: queue.perUserTimeMin,
        status: queue.status,
        createdAt: queue.createdAt,
        endedAt: queue.endedAt,
        userPosition,
        userEstimatedTime,
        totalWaiting: queue.users.filter(u => u.status === 'waiting').length,
        users: formattedUsers,
        qrCode: queue.qrCode
      }
    });
  } catch (error) {
    console.error('Error fetching queue details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue details',
      error: error.message
    });
  }
});

// Get user's joined queues
router.get('/joined', authMiddleware.authUser, async (req, res) => {
  try {
    console.log('Fetching joined queues for user:', req.user._id);
    
    const queues = await Queue.find({
      users: {
        $elemMatch: {
          userId: req.user._id,
          status: 'waiting'
        }
      },
      status: 'active'
    }).populate('adminId', 'name')
      .populate('users.userId', 'name email');

    console.log('Found queues:', queues.length);
    
    const formattedQueues = queues.map(queue => {
      // Find user's entry in this queue
      const userInQueue = queue.users.find(u => 
        u.userId._id.toString() === req.user._id.toString() && 
        u.status === 'waiting'
      );

      if (!userInQueue) {
        console.log('User not found in queue:', queue.queueId);
        return null;
      }

      // Calculate position - count how many waiting users joined before this user
      const position = queue.users.filter(u => 
        u.status === 'waiting' && 
        new Date(u.joinedAt) <= new Date(userInQueue.joinedAt)
      ).length;

      // Calculate estimated time based on position
      // If user is 1st in queue (position 1), they wait perUserTimeMin
      // If user is 2nd, they wait 2 * perUserTimeMin
      // If user is 3rd, they wait 3 * perUserTimeMin, and so on...
      const estimatedTime = position * queue.perUserTimeMin;

      console.log('Queue stats for', queue.queueId, {
        position,
        perUserTimeMin: queue.perUserTimeMin,
        calculatedEstimatedTime: estimatedTime,
        totalWaiting: queue.users.filter(u => u.status === 'waiting').length,
        joinedAt: userInQueue.joinedAt
      });

      return {
        id: queue.queueId,
        name: queue.name,
        admin: queue.adminId.name,
        joinedAt: userInQueue.joinedAt,
        position,
        totalWaiting: queue.users.filter(u => u.status === 'waiting').length,
        estimatedTime: estimatedTime, // Use calculated time based on position
        perUserTimeMin: queue.perUserTimeMin,
        qrCode: queue.qrCode
      };
    }).filter(Boolean);

    console.log('Final formatted queues:', formattedQueues);

    res.json({
      success: true,
      queues: formattedQueues
    });
  } catch (error) {
    console.error('Error fetching joined queues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching joined queues',
      error: error.message
    });
  }
});

// Delete queue (Admin only)
router.delete('/:queueId', authMiddleware.authUser, async (req, res) => {
  try {
    console.log('Delete queue request:', {
      queueId: req.params.queueId,
      adminId: req.user.id
    });

    // Find queue by queueId and check if admin owns it
    const queue = await Queue.findOne({ 
      queueId: req.params.queueId,
      adminId: req.user.id
    });
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found or you do not have permission to delete it'
      });
    }

    // Delete the queue
    await Queue.deleteOne({ _id: queue._id });
    
    res.json({
      success: true,
      message: 'Queue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting queue',
      error: error.message
    });
  }
});

router.post('/check-notifications', async (req, res) => {
  try {
    // Find all active queues
    const activeQueues = await Queue.find({ 
      status: 'active' 
    }).populate({
      path: 'users.userId',
      select: 'name phoneNumber'
    });

    for (const queue of activeQueues) {
      const waitingUsers = queue.users.filter(u => u.status === 'waiting');
      
      for (let i = 0; i < waitingUsers.length; i++) {
        const user = waitingUsers[i];
        
        // Calculate current position
        const position = i + 1;
        const estimatedTime = position * queue.perUserTimeMin;

        // Check if estimated time is 5 minutes or less and notification hasn't been sent
        if (estimatedTime <= 5 && !user.notificationSent && user.userId.phoneNumber) {
          // Send SMS notification
          const message = `Your turn in ${queue.name} queue is coming up in about ${estimatedTime} minutes! Please be ready.`;
          
          const smsSent = await sendSMS(user.userId.phoneNumber, message);
          
          if (smsSent) {
            // Mark notification as sent
            user.notificationSent = true;
            await queue.save();
            
            console.log(`Notification sent to user ${user.userId.name} for queue ${queue.name}`);
          }
        }
      }
    }

    res.json({ success: true, message: 'Notifications checked and sent' });
  } catch (error) {
    console.error('Error in notification check:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking notifications',
      error: error.message 
    });
  }
});

export default router
