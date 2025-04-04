import mongoose from 'mongoose';

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
    ref: 'User',
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
  users: [
    {
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
      notificationSent: {
        type: Boolean,
        default: false
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
});

// Calculate estimated wait time for a new user
queueSchema.methods.calculateEstimatedTime = function () {
  const waitingUsers = this.users.filter((user) => user.status === 'waiting').length;
  return waitingUsers * this.perUserTimeMin;
};

const Queue = mongoose.model('Queue', queueSchema);

export default Queue;

