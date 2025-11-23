import React from "react";
import { Loader2 } from "lucide-react";
import { StatCard, StatusChart, ProgressChart } from "../components/analytics";
import { useAnalytics } from "../hooks/useAnalytics";
import { useIssues } from "../hooks/useIssues";

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { issues, isLoading: issuesLoading } = useIssues();

  const isLoading = analyticsLoading || issuesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

  // Transform status distribution for charts
  const statusChartData = analytics.statusDistribution.map((item) => ({
    name: item.status
      .replace("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Issues" value={analytics.totalIssues} />
        <StatCard
          title="Average Progress"
          value={`${analytics.averageProgress}%`}
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          valueClassName="text-emerald-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusChart
          data={statusChartData}
          type="bar"
          title="Status Distribution"
        />
        <StatusChart
          data={statusChartData}
          type="pie"
          title="Issues by Status"
        />
      </div>

      {/* Progress chart */}
      <ProgressChart issues={issues} title="Progress by Issue" />
    </div>
  );
};
