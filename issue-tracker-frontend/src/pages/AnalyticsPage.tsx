import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

import { SkeletonStats } from "../components/ui/index.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import {
  StatCard,
  StatusChart,
  ProgressChart,
} from "../components/analytics/index.js";

import { useAnalyticsQuery } from "../hooks/useAnalyticQuery.js";
import {
  selectIsLoading,
  selectIssues,
  useIssuesStore,
} from "../stores/useIssuesStore.js";

const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsQuery();
  // const { issues, isLoading: issuesLoading } = useIssuesQuery();
  // Get issues from Zustand store instead of fetching again
  const issues = useIssuesStore(selectIssues);
  const issuesLoading = useIssuesStore(selectIsLoading);

  const isLoading = analyticsLoading || issuesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-xl border p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-5 bg-white rounded-xl border p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-12 bg-white rounded-xl border p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load analytics data
      </div>
    );
  }

  const statusChartData = analytics.statusDistribution.map((item) => ({
    name: item.status
      .replace("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Issues"
          value={analytics.totalIssues}
          icon={BarChart3}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Average Progress"
          value={`${analytics.averageProgress}%`}
          icon={TrendingUp}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          valueClassName="text-emerald-600"
          icon={CheckCircle2}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <StatusChart
            data={statusChartData}
            type="bar"
            title="Status Distribution"
            icon={BarChart3}
          />
        </div>
        <div className="lg:col-span-5">
          <StatusChart
            data={statusChartData}
            type="pie"
            title="Issues Breakdown"
            icon={PieChartIcon}
          />
        </div>
        <div className="lg:col-span-12">
          <ProgressChart issues={issues} title="Progress by Issue" />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
