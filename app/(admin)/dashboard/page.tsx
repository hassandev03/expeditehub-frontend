'use client';

import React, { useState } from 'react';
import type { Metadata } from 'next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnalyticsSummaryData, getAnalyticsByCategoryData } from '@/lib/api/analyticsApiClient';
import KpiSummaryCard from '@/components/admin/KpiSummaryCard';
import RevenueTrendChart from '@/components/admin/RevenueTrendChart';
import CategoryBreakdownChart from '@/components/admin/CategoryBreakdownChart';
import ActiveOrdersBanner from '@/components/admin/ActiveOrdersBanner';

export default function AdminDashboardPage(): React.JSX.Element {
  const { data: analyticsSummaryData, isLoading: isAnalyticsSummaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummaryData,
    refetchInterval: 60_000,
  });

  const { data: analyticsCategoryData, isLoading: isAnalyticsCategoryLoading } = useQuery({
    queryKey: ['analytics', 'by-category'],
    queryFn: getAnalyticsByCategoryData,
    refetchInterval: 60_000,
  });

  const todayRevenueValue = analyticsSummaryData?.today.revenue ?? 0;
  const todayOrdersCount = analyticsSummaryData?.today.orders ?? 0;
  const weekRevenueValue = analyticsSummaryData?.week.revenue ?? 0;
  const monthRevenueValue = analyticsSummaryData?.month.revenue ?? 0;

  const revenueTrendDataPoints = [
    { revenuePeriodLabel: 'Today', revenuePeriodAmount: todayRevenueValue },
    { revenuePeriodLabel: 'This Week', revenuePeriodAmount: weekRevenueValue },
    { revenuePeriodLabel: 'This Month', revenuePeriodAmount: monthRevenueValue },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page header */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '26px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Today&apos;s performance at a glance.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <KpiSummaryCard
          kpiCardLabel="Today's Revenue"
          kpiCardValue={`₨${todayRevenueValue.toLocaleString()}`}
          kpiCardAccentColor="var(--tenant-accent)"
          kpiCardIsLoading={isAnalyticsSummaryLoading}
        />
        <KpiSummaryCard
          kpiCardLabel="Orders Today"
          kpiCardValue={todayOrdersCount.toString()}
          kpiCardAccentColor="var(--status-received)"
          kpiCardIsLoading={isAnalyticsSummaryLoading}
        />
        <KpiSummaryCard
          kpiCardLabel="Weekly Revenue"
          kpiCardValue={`₨${weekRevenueValue.toLocaleString()}`}
          kpiCardAccentColor="var(--status-preparing)"
          kpiCardIsLoading={isAnalyticsSummaryLoading}
        />
        <KpiSummaryCard
          kpiCardLabel="Monthly Revenue"
          kpiCardValue={`₨${monthRevenueValue.toLocaleString()}`}
          kpiCardAccentColor="var(--status-ready)"
          kpiCardIsLoading={isAnalyticsSummaryLoading}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        <RevenueTrendChart
          revenueChartTitle="Revenue Overview"
          revenueTrendDataPointList={revenueTrendDataPoints}
          revenueChartIsLoading={isAnalyticsSummaryLoading}
        />
        <CategoryBreakdownChart
          categoryRevenueDataList={analyticsCategoryData?.categories ?? []}
          categoryChartIsLoading={isAnalyticsCategoryLoading}
        />
      </div>

      {/* Active Orders Banner */}
      <ActiveOrdersBanner />
    </div>
  );
}
