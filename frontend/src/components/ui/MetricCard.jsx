import React from 'react';
import Card from './Card';
import './MetricCard.css';

const MetricCard = ({ title, value, subtitle, trend, trendValue, icon }) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  
  return (
    <Card className="metric-card">
      <div className="metric-header">
        <h4 className="metric-title">{title}</h4>
        {icon && <span className="metric-icon">{icon}</span>}
      </div>
      <div className="metric-body">
        <h2 className="metric-value">{value}</h2>
        {trendValue && (
          <div className={`metric-trend ${isPositive ? 'trend-up' : isNegative ? 'trend-down' : 'trend-neutral'}`}>
            {isPositive ? '▲' : isNegative ? '▼' : '−'} {trendValue}
          </div>
        )}
      </div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}
    </Card>
  );
};

export default MetricCard;
