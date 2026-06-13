import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.5} />
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 90, 31, 0.4)', strokeWidth: 2, strokeDasharray: '5 5' }} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={primaryColor} 
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            activeDot={{ r: 8, fill: primaryColor, stroke: '#fff', strokeWidth: 3, style: { filter: 'drop-shadow(0px 4px 10px rgba(255, 90, 31, 0.5))' } }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
