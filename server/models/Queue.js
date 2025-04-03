const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  queueId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  perUserTimeMin: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active',
  },
  qrCode: {
    type: String,
    required: true,
  },
  users: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['waiting', 'processing', 'completed'],
      default: 'waiting',
    },
    estimatedTime: Number,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
});

// Generate queue ID before saving
queueSchema.pre('save', function(next) {
  if (!this.queueId) {
    // Generate a unique queue ID (e.g., Q-123456)
    this.queueId = 'Q-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

// Calculate estimated wait time for a new user
queueSchema.methods.calculateEstimatedTime = function() {
  const waitingUsers = this.users.filter(user => user.status === 'waiting').length;
  return waitingUsers * this.perUserTimeMin;
};

const Queue = mongoose.model('Queue', queueSchema);

module.exports = Queue;
