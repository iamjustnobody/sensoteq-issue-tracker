import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ProgressBar } from "../ui";
import { StatusToggle } from "./StatusToggle";
import type { Issue, IssueStatus } from "../../types";

interface IssueCardProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: IssueStatus) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 flex-1 line-clamp-1">
          {issue.title}
        </h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onEdit(issue)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <Pencil size={14} className="text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(issue.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {issue.description || "No description"}
      </p>

      {/* Progress */}
      <div className="mb-3">
        <ProgressBar
          progress={issue.progress}
          status={issue.status}
          showLabel
        />
      </div>

      {/* Status toggle */}
      <StatusToggle issue={issue} onStatusChange={onStatusChange} />
    </div>
  );
};
