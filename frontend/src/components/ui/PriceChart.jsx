import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceChart = ({ data }) => {
  // We use the design tokens directly for colors
  const primaryColor = '#C2410C'; // Terracotta
  const gridColor = '#D6D3D1';    // Border color

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-hover)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '12px' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            ${payload[0].value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            tickMargin={12}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            tickMargin={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={primaryColor} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: primaryColor, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
