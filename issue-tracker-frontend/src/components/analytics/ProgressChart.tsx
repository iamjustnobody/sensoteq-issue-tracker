import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { Issue } from "../../types";

interface ProgressChartProps {
  issues: Issue[];
  title: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  issues,
  title,
}) => {
  // Sort by progress and take top items for cleaner visualization
  const data = [...issues]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10)
    .map((issue) => ({
      name:
        issue.title.length > 25
          ? issue.title.slice(0, 25) + "..."
          : issue.title,
      progress: issue.progress,
      status: issue.status,
    }));

  // Color based on progress
  const getBarColor = (progress: number) => {
    if (progress === 100) return "#10b981";
    if (progress >= 60) return "#3b82f6";
    if (progress >= 30) return "#f59e0b";
    return "#94a3b8";
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-sm text-gray-600">
            Progress: <span className="font-semibold">{item.progress}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-gray-400" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="text-xs text-gray-400">Top {data.length} issues</span>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={180}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="progress" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-500">Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500">60%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-gray-500">30-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-xs text-gray-500">&lt;30%</span>
        </div>
      </div>
    </div>
  );
};
