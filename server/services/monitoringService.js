const { ethers } = require('ethers');
const winston = require('winston');
const mongoose = require('mongoose');
const { logTransaction } = require('./auditService');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Activity schema
const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Activity = mongoose.model('Activity', activitySchema);

// Transaction schema
const transactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['vote', 'registration', 'verification'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  details: {
    type: Object
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Log activity
const logActivity = async (userId, action, details = {}, ipAddress) => {
  try {
    const activity = new Activity({
      userId,
      action,
      details,
      ipAddress
    });
    await activity.save();
    logger.info('Activity logged', { userId, action, details });
  } catch (error) {
    logger.error('Error logging activity:', error);
  }
};

// Update transaction status
const updateTransactionStatus = async (txHash, status, details = {}) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { txHash },
      { status, details },
      { new: true }
    );
    logger.info('Transaction status updated', { txHash, status, details });
    return transaction;
  } catch (error) {
    logger.error('Error updating transaction status:', error);
    throw error;
  }
};

// Get user activities
const getUserActivities = async (userId, limit = 10) => {
  try {
    return await Activity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    logger.error('Error getting user activities:', error);
    throw error;
  }
};

// Get user transactions
const getUserTransactions = async (userId, limit = 10) => {
  try {
    return await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    logger.error('Error getting user transactions:', error);
    throw error;
  }
};

class MonitoringService {
  constructor(provider, contract) {
    this.provider = provider;
    this.contract = contract;
    this.suspiciousActivities = [];
  }

  async startMonitoring() {
    // Start monitoring blockchain events
    this.contract.on('VoteCast', async (voter, candidate, electionId, event) => {
      try {
        await this.checkSuspiciousActivity(voter, event);
        await logTransaction(
          event.transactionHash,
          voter,
          'vote',
          { candidate, electionId }
        );
      } catch (error) {
        logger.error('Error monitoring vote:', error);
      }
    });

    this.contract.on('VoterRegistered', async (voter, event) => {
      try {
        await logTransaction(
          event.transactionHash,
          voter,
          'registration',
          { voter }
        );
      } catch (error) {
        logger.error('Error monitoring registration:', error);
      }
    });
  }

  async checkSuspiciousActivity(address, event) {
    const recentVotes = await this.getRecentVotes(address);
    if (recentVotes.length > 3) {
      this.suspiciousActivities.push({
        address,
        type: 'multiple_votes',
        timestamp: new Date(),
        details: { recentVotes }
      });
      logger.warn('Suspicious activity detected:', { address, type: 'multiple_votes' });
    }
  }

  async getRecentVotes(address) {
    const filter = this.contract.filters.VoteCast(address);
    const events = await this.contract.queryFilter(filter, -1000);
    return events.map(event => ({
      candidate: event.args.candidate,
      electionId: event.args.electionId,
      timestamp: new Date(event.blockTimestamp * 1000)
    }));
  }

  getAnalytics() {
    return {
      suspiciousActivities: this.suspiciousActivities,
      totalVotes: this.contract.totalVotes(),
      activeElections: this.contract.activeElections()
    };
  }

  getSuspiciousActivities() {
    return this.suspiciousActivities;
  }
}

module.exports = {
  logActivity,
  updateTransactionStatus,
  getUserActivities,
  getUserTransactions,
  MonitoringService
}; 