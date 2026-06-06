'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import LoadingSkeleton from '../shared/LoadingSkeleton';

interface RevenueTrendDataPoint {
  revenuePeriodLabel: string;
  revenuePeriodAmount: number;
}

interface RevenueTrendChartProperties {
  revenueChartTitle: string;
  revenueTrendDataPointList: RevenueTrendDataPoint[];
  revenueChartIsLoading: boolean;
}

export default function RevenueTrendChart({
  revenueChartTitle,
  revenueTrendDataPointList,
  revenueChartIsLoading,
}: RevenueTrendChartProperties): React.JSX.Element {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        flex: '0 0 58%',
        minWidth: 0,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '16px',
          color: 'var(--text-primary)',
          marginBottom: '20px',
        }}
      >
        {revenueChartTitle}
      </h2>

      {revenueChartIsLoading ? (
        <LoadingSkeleton skeletonWidth="100%" skeletonHeight="200px" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={revenueTrendDataPointList}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="revenuePeriodLabel"
              tick={{ fontFamily: 'var(--font-body)', fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: 'var(--font-display)', fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `₨${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`₨${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Bar
              dataKey="revenuePeriodAmount"
              fill="var(--tenant-accent)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
