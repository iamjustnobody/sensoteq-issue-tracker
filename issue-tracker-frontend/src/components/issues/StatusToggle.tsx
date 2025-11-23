import React from "react";
import { STATUS_CONFIG } from "../../utils/constants";
import { cn } from "../../utils/cn";
import type { Issue, IssueStatus } from "../../types";

interface StatusToggleProps {
  issue: Issue;
  onStatusChange: (id: number, status: IssueStatus) => void;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  issue,
  onStatusChange,
}) => {
  const statuses: IssueStatus[] = ["not-started", "in-progress", "completed"];

  return (
    <div className="flex gap-1">
      {statuses.map((status) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const isActive = issue.status === status;

        return (
          <button
            key={status}
            onClick={() => onStatusChange(issue.id, status)}
            className={cn(
              "p-1.5 rounded-md transition-all",
              isActive ? config.bg : "hover:bg-gray-100"
            )}
            title={config.label}
          >
            <Icon
              size={16}
              className={isActive ? config.text : "text-gray-400"}
            />
          </button>
        );
      })}
    </div>
  );
};
