const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const monitoringService = require('../services/monitoringService');

// Get user activities (authenticated users can view their own activities)
router.get('/activities', auth, async (req, res) => {
  try {
    const activities = await monitoringService.getUserActivities(req.user._id);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get user transactions (authenticated users can view their own transactions)
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await monitoringService.getUserTransactions(req.user._id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Admin-only endpoints
router.use(adminAuth);

// Get all activities (admin only)
router.get('/admin/activities', async (req, res) => {
  try {
    const activities = await monitoringService.getUserActivities(req.query.userId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get all transactions (admin only)
router.get('/admin/transactions', async (req, res) => {
  try {
    const transactions = await monitoringService.getUserTransactions(req.query.userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

module.exports = router; 