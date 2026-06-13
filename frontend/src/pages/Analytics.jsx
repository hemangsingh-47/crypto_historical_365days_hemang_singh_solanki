import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Database, Activity, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
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
        const response = await api.get('/coins/analytics/chronological-summary');
        setAnalytics(response);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const monthlyData = analytics?.summary || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer title="Analytics Insights">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="analytics-loading"
          >
            <div className="live-pulse"></div>
            Generating macro insights...
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            className="analytics-content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <div className="analytics-overview">
              <motion.div variants={itemVariants} style={{ flex: 1 }}>
                <MetricCard 
                  title="Months Analyzed"
                  value={analytics?.pagination?.totalRecords?.toLocaleString() || 'N/A'}
                  icon={<Calendar size={24} color="var(--color-primary)" />}
                />
              </motion.div>
              <motion.div variants={itemVariants} style={{ flex: 1 }}>
                <MetricCard 
                  title="Total Records Computed"
                  value={analytics?.summary?.reduce((sum, item) => sum + item.recordCount, 0)?.toLocaleString() || '0'}
                  icon={<Database size={24} color="var(--color-primary)" />}
                />
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Card className="analytics-chart-card">
                <div className="card-header-styled">
                  <h3><BarChartIcon size={20} color="var(--color-primary)" /> Monthly Average Volume</h3>
                </div>
                <div className="analytics-chart-container">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis 
                          dataKey="intervalValue" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
                          tickMargin={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
                          tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
                        />
                        <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255, 90, 31, 0.05)' }} />
                        <Bar dataKey="averageVolume" radius={[4, 4, 0, 0]}>
                          {monthlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-chart">No volume data available</div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="analytics-table-card">
                <div className="card-header-styled">
                  <h3><Activity size={20} color="var(--color-primary)" /> Chronological Aggregates</h3>
                </div>
                <div className="data-grid-body" style={{ padding: 0 }}>
                  <div className="data-grid-header">
                    <div className="grid-col" style={{ flex: 1 }}>Period</div>
                    <div className="grid-col font-mono" style={{ flex: 1.5, justifyContent: 'flex-end' }}>Avg Price</div>
                    <div className="grid-col font-mono" style={{ flex: 1.5, justifyContent: 'flex-end' }}>Avg Volume</div>
                    <div className="grid-col" style={{ flex: 1, justifyContent: 'flex-end' }}>Data Points</div>
                  </div>
                  <div className="grid-rows-container">
                    {monthlyData.length > 0 ? (
                      monthlyData.map((row, i) => (
                        <motion.div 
                          key={row.intervalValue} 
                          className="data-grid-row"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', scale: 1.01 }}
                        >
                          <div className="grid-col"><strong>{row.intervalValue}</strong></div>
                          <div className="grid-col font-mono" style={{ flex: 1.5, justifyContent: 'flex-end' }}>
                            ${row.averagePrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="grid-col font-mono" style={{ flex: 1.5, justifyContent: 'flex-end' }}>
                            ${row.averageVolume?.toLocaleString()}
                          </div>
                          <div className="grid-col" style={{ flex: 1, justifyContent: 'flex-end', color: 'var(--color-text-secondary)' }}>
                            {row.recordCount?.toLocaleString()}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="grid-empty">No aggregate data available.</div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default Analytics;
