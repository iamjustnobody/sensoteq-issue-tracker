import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Issue } from "../../types";

interface ProgressChartProps {
  issues: Issue[];
  title: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  issues,
  title,
}) => {
  const data = issues.map((issue) => ({
    name:
      issue.title.length > 20 ? issue.title.slice(0, 20) + "..." : issue.title,
    progress: issue.progress,
  }));

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={(value: number) => [`${value}%`, "Progress"]} />
          <Bar dataKey="progress" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
