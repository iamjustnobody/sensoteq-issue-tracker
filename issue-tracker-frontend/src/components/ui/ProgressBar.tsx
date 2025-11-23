import React from "react";
import { cn } from "../../utils/cn";
import { STATUS_CONFIG } from "../../utils/constants";
import type { IssueStatus } from "../../types";

interface ProgressBarProps {
  progress: number;
  status: IssueStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  showLabel = false,
  size = "sm",
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-200 rounded-full",
          size === "sm" ? "h-2" : "h-3"
        )}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-300",
            config.bar,
            size === "sm" ? "h-2" : "h-3"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
