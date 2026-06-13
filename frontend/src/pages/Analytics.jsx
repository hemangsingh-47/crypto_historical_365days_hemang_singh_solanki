import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';
import api from '../services/api';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Using the base api instance directly for this endpoint
        const response = await api.get('/coins/analytics/chronological-summary');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <PageContainer title="Analytics Insights">
        <div className="analytics-loading">Generating insights...</div>
      </PageContainer>
    );
  }

  // The chronological summary returns daily, monthly, yearly stats.
  // We will display the monthly aggregates if available.
  const monthlyData = analytics?.summary || [];

  return (
    <PageContainer title="Analytics Insights">
      <div className="analytics-overview">
        <MetricCard 
          title="Total Records Analyzed"
          value={analytics?.summaryStats?.totalRecords?.toLocaleString() || 'N/A'}
          icon="📚"
        />
        <MetricCard 
          title="Avg Daily Volume (Market)"
          value={`$${(analytics?.summaryStats?.averageDailyVolume || 0).toLocaleString()}`}
          icon="🌊"
        />
      </div>

      <Card className="analytics-table-card">
        <h3>Monthly Averages</h3>
        <p className="analytics-subtitle">Aggregated average prices and volumes grouped by month.</p>
        
        <div className="table-responsive" style={{ marginTop: '16px' }}>
          <table className="coin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Avg Price</th>
                <th>Avg Volume</th>
                <th>Records Count</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.length > 0 ? (
                monthlyData.map((row) => (
                  <tr key={row._id}>
                    <td><strong>{row._id}</strong></td>
                    <td>${row.avgPrice?.toFixed(4)}</td>
                    <td>${row.avgVolume?.toLocaleString()}</td>
                    <td>{row.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No monthly data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Analytics;
