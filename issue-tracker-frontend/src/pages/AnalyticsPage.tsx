import React from "react";
import {
  Loader2,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  PieChart,
} from "lucide-react";
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
      {/* ============================================
          STAT CARDS - Creative responsive grid
          Mobile: 1 col stacked
          Tablet: 3 cols in a row
          Desktop: 3 cols with larger size
          ============================================ */}
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

      {/* ============================================
          CHARTS SECTION - Creative Bento Grid Layout
          Mobile: Stack vertically
          Tablet/Desktop: 2x2 grid with progress chart spanning full width
          Large Desktop: Creative asymmetric layout
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart - Takes 7 cols on large screens */}
        <div className="lg:col-span-7">
          <StatusChart
            data={statusChartData}
            type="bar"
            title="Status Distribution"
            icon={BarChart3}
          />
        </div>

        {/* Pie Chart - Takes 5 cols on large screens */}
        <div className="lg:col-span-5">
          <StatusChart
            data={statusChartData}
            type="pie"
            title="Issues Breakdown"
            icon={PieChart}
          />
        </div>

        {/* Progress Chart - Full width */}
        <div className="lg:col-span-12">
          <ProgressChart issues={issues} title="Progress by Issue" />
        </div>
      </div>

      {/* ============================================
          ADDITIONAL STATS ROW - Only on larger screens
          Shows more detailed breakdown
          ============================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.statusDistribution.map((item) => {
          const statusName = item.status
            .replace("-", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const percentage =
            analytics.totalIssues > 0
              ? Math.round((item.count / analytics.totalIssues) * 100)
              : 0;

          return (
            <div
              key={item.status}
              className="bg-white rounded-xl border p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {statusName}
                </p>
                <p className="text-2xl font-bold mt-1">{item.count}</p>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-semibold ${
                    item.status === "completed"
                      ? "text-emerald-600"
                      : item.status === "in-progress"
                      ? "text-blue-600"
                      : "text-slate-600"
                  }`}
                >
                  {percentage}%
                </div>
                <p className="text-xs text-gray-400">of total</p>
              </div>
            </div>
          );
        })}

        {/* Active ratio card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-xs uppercase tracking-wide opacity-80">
            Active Ratio
          </p>
          <p className="text-2xl font-bold mt-1">
            {analytics.totalIssues -
              (analytics.statusDistribution.find(
                (s) => s.status === "completed"
              )?.count || 0)}
            <span className="text-base font-normal opacity-80">
              /{analytics.totalIssues}
            </span>
          </p>
          <p className="text-xs opacity-80 mt-1">issues in progress</p>
        </div>
      </div>
    </div>
  );
};
