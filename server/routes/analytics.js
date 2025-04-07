const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const MonitoringService = require('../services/monitoringService');
const CacheService = require('../services/cacheService');

// Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const cacheKey = `analytics:${timeRange}`;

    // Try to get cached data
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get fresh data from monitoring service
    const analytics = await MonitoringService.getAnalytics();
    const suspiciousActivities = await MonitoringService.getSuspiciousActivities();

    const data = {
      analytics,
      suspiciousActivities
    };

    // Cache the data for 5 minutes
    await CacheService.set(cacheKey, data, 300);

    res.json(data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get suspicious activities
router.get('/suspicious', adminAuth, async (req, res) => {
  try {
    const activities = await MonitoringService.getSuspiciousActivities();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching suspicious activities:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious activities' });
  }
});

// Get gas usage statistics
router.get('/gas', auth, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const cacheKey = `gas:${timeRange}`;

    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const gasStats = await MonitoringService.getGasUsage(timeRange);
    await CacheService.set(cacheKey, gasStats, 300);

    res.json(gasStats);
  } catch (error) {
    console.error('Error fetching gas statistics:', error);
    res.status(500).json({ error: 'Failed to fetch gas statistics' });
  }
});

module.exports = router; 