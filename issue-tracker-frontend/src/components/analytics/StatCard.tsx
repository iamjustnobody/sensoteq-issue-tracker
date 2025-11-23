import React from "react";
// import type { LucideIcon } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  valueClassName?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  className,
  valueClassName,
  icon: Icon,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-600",
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-6 flex items-start justify-between",
        className
      )}
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={cn("text-3xl font-bold mt-1", valueClassName)}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon size={24} className={iconColor} />
        </div>
      )}
    </div>
  );
};
