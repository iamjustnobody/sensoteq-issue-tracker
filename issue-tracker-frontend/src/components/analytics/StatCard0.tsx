import React from "react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  valueClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  className,
  valueClassName,
}) => {
  return (
    <div className={cn("bg-white rounded-xl border p-6", className)}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={cn("text-3xl font-bold mt-1", valueClassName)}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};
