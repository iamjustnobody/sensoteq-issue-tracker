import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
// import { LucideIcon } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { CHART_COLORS } from "../../utils/constants";

interface StatusData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StatusChartProps {
  data: StatusData[];
  type: "bar" | "pie";
  title: string;
  icon?: LucideIcon;
}

export const StatusChart: React.FC<StatusChartProps> = ({
  data,
  type,
  title,
  icon: Icon,
}) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 border rounded-lg shadow-lg">
          <p className="font-medium">
            {payload[0].name || payload[0].payload.name}
          </p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={20} className="text-gray-400" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        {type === "bar" ? (
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#e5e7eb" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
