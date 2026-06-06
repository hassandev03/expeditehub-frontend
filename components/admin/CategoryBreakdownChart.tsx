'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import type { AnalyticsCategoryRevenueRecord } from '@/lib/types/analyticsTypes';

interface CategoryBreakdownChartProperties {
  categoryRevenueDataList: AnalyticsCategoryRevenueRecord[];
  categoryChartIsLoading: boolean;
}

const categoryColorPalette = [
  'var(--tenant-accent)',
  'var(--status-received)',
  'var(--status-preparing)',
  'var(--status-ready)',
  'var(--status-closed)',
  '#A78BFA',
];

export default function CategoryBreakdownChart({
  categoryRevenueDataList,
  categoryChartIsLoading,
}: CategoryBreakdownChartProperties): React.JSX.Element {
  const totalRevenue = categoryRevenueDataList.reduce(
    (runningTotal, categoryRecord) => runningTotal + categoryRecord.revenue,
    0
  );

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        flex: 1,
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
        Revenue by Category
      </h2>

      {categoryChartIsLoading ? (
        <LoadingSkeleton skeletonWidth="100%" skeletonHeight="200px" />
      ) : categoryRevenueDataList.length === 0 ? (
        <div
          style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}
        >
          No category data for today.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoryRevenueDataList}
              dataKey="revenue"
              nameKey="name"
              cx="40%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              strokeWidth={2}
              stroke="var(--bg-main)"
            >
              {categoryRevenueDataList.map((categoryEntry, categoryIndex) => (
                <Cell
                  key={categoryEntry.name}
                  fill={categoryColorPalette[categoryIndex % categoryColorPalette.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                `₨${Number(value).toLocaleString()} (${totalRevenue > 0 ? ((Number(value) / totalRevenue) * 100).toFixed(1) : 0}%)`,
                'Revenue',
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(categoryName: string) => (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {categoryName}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
