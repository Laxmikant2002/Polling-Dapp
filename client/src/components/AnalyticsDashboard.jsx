import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    votes: 0,
    transactions: 0,
    gasUsed: 0,
    activeUsers: 0,
    suspiciousActivities: 0
  });
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalytics(data.analytics);
      setSuspiciousActivities(data.suspiciousActivities);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const voteData = {
    labels: ['Votes', 'Transactions', 'Active Users'],
    datasets: [{
      label: 'Activity',
      data: [analytics.votes, analytics.transactions, analytics.activeUsers],
      backgroundColor: ['#4F46E5', '#10B981', '#F59E0B']
    }]
  };

  const gasData = {
    labels: ['Gas Used'],
    datasets: [{
      label: 'Gas Usage',
      data: [analytics.gasUsed],
      backgroundColor: '#4F46E5'
    }]
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
          <Bar data={voteData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gas Usage</h3>
          <Bar data={gasData} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Suspicious Activities</h3>
        {suspiciousActivities.length > 0 ? (
          <div className="space-y-4">
            {suspiciousActivities.map((activity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-gray-600">Address: {activity.address}</p>
                <p className="text-sm text-gray-600">Time: {new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No suspicious activities detected</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Votes</p>
          <p className="text-2xl font-bold">{analytics.votes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="text-2xl font-bold">{analytics.transactions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold">{analytics.activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Suspicious Activities</p>
          <p className="text-2xl font-bold">{analytics.suspiciousActivities}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 