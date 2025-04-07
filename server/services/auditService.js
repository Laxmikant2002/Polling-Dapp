const mongoose = require('mongoose');
const winston = require('winston');

const auditSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['vote', 'register', 'verify', 'admin_action']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model('AuditLog', auditSchema);

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const logTransaction = async (transactionData) => {
  try {
    const auditLog = new AuditLog({
      transactionHash: transactionData.hash,
      blockNumber: transactionData.blockNumber,
      from: transactionData.from,
      to: transactionData.to,
      action: transactionData.action,
      metadata: transactionData.metadata
    });

    await auditLog.save();

    // Log to Winston
    logger.info('Transaction logged', {
      transactionHash: transactionData.hash,
      action: transactionData.action,
      metadata: transactionData.metadata
    });

    return auditLog;
  } catch (error) {
    logger.error('Error logging transaction:', error);
    throw error;
  }
};

const getTransactionLogs = async (filters = {}) => {
  try {
    const logs = await AuditLog.find(filters)
      .sort({ timestamp: -1 })
      .limit(100);
    return logs;
  } catch (error) {
    logger.error('Error retrieving transaction logs:', error);
    throw error;
  }
};

const verifyTransaction = async (transactionHash) => {
  try {
    const log = await AuditLog.findOne({ transactionHash });
    if (!log) {
      throw new Error('Transaction not found in audit logs');
    }
    return log;
  } catch (error) {
    logger.error('Error verifying transaction:', error);
    throw error;
  }
};

module.exports = {
  logTransaction,
  getTransactionLogs,
  verifyTransaction
}; 