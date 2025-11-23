import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ProgressBar } from "../ui";
import { StatusToggle } from "./StatusToggle";
import type { Issue, IssueStatus } from "../../types";

interface IssueTableProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: IssueStatus) => void;
}

export const IssueTable: React.FC<IssueTableProps> = ({
  issues,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
              Title
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">
              Description
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-32">
              Progress
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
              Status
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">{issue.title}</td>
              <td className="px-4 py-3 text-gray-600 text-sm hidden md:table-cell">
                <span className="line-clamp-1 max-w-xs">
                  {issue.description || "-"}
                </span>
              </td>
              <td className="px-4 py-3">
                <ProgressBar progress={issue.progress} status={issue.status} />
              </td>
              <td className="px-4 py-3">
                <StatusToggle issue={issue} onStatusChange={onStatusChange} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(issue)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg inline-block"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(issue.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg inline-block ml-1"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {issues.length === 0 && (
        <div className="p-8 text-center text-gray-500">No issues found</div>
      )}
    </div>
  );
};
