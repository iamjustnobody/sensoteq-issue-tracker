import React, { useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { ProgressBar } from "../ui";
import { StatusToggle } from "./StatusToggle";
import { cn } from "../../utils/cn";
import type { Issue, IssueStatus } from "../../types";

interface VirtualizedIssueTableProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: IssueStatus) => void;
}

type SortField =
  | "title"
  | "description"
  | "progress"
  | "status"
  | "created_at"
  | "updated_at";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const statusOrder: Record<IssueStatus, number> = {
  "not-started": 0,
  "in-progress": 1,
  completed: 2,
};

export const VirtualizedIssueTable: React.FC<VirtualizedIssueTableProps> = ({
  issues,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Sort issues
  const sortedIssues = useMemo(() => {
    if (!sortConfig) return issues;

    return [...issues].sort((a, b) => {
      const { field, direction } = sortConfig;
      let comparison = 0;

      switch (field) {
        case "title":
        case "description":
          const aVal = (a[field] || "").toLowerCase();
          const bVal = (b[field] || "").toLowerCase();
          comparison = aVal.localeCompare(bVal);
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
        case "status":
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "created_at":
        case "updated_at":
          comparison =
            new Date(a[field]).getTime() - new Date(b[field]).getTime();
          break;
      }

      return direction === "asc" ? comparison : -comparison;
    });
  }, [issues, sortConfig]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: sortedIssues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5, // Number of items to render outside visible area
  });

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        if (prev.direction === "asc") return { field, direction: "desc" };
        if (prev.direction === "desc") return null;
      }
      return { field, direction: "asc" };
    });
  };

  const SortIndicator: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortConfig?.field !== field) {
      return <ArrowUpDown size={14} className="text-gray-300" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className }) => (
    <th
      className={cn(
        "text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer",
        "hover:bg-gray-100 transition-colors select-none sticky top-0 bg-gray-50 z-10",
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIndicator field={field} />
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Fixed header */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="border-b">
            <tr>
              <SortableHeader field="title">Title</SortableHeader>
              <SortableHeader
                field="description"
                className="hidden md:table-cell"
              >
                Description
              </SortableHeader>
              <SortableHeader field="progress" className="w-40">
                Progress
              </SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader
                field="created_at"
                className="hidden lg:table-cell"
              >
                Created
              </SortableHeader>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 w-24 sticky top-0 bg-gray-50 z-10">
                Actions
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        style={{ height: "600px", overflow: "auto" }}
        className="relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const issue = sortedIssues[virtualRow.index];

            return (
              <div
                key={issue.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <table className="w-full min-w-[700px]">
                  <tbody>
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium w-[25%]">
                        {issue.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm hidden md:table-cell w-[25%]">
                        <span className="line-clamp-1 max-w-xs">
                          {issue.description || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <ProgressBar
                              progress={issue.progress}
                              status={issue.status}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium w-10 text-right",
                              issue.progress === 100
                                ? "text-emerald-600"
                                : issue.progress >= 50
                                ? "text-blue-600"
                                : "text-gray-500"
                            )}
                          >
                            {issue.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-[15%]">
                        <StatusToggle
                          issue={issue}
                          onStatusChange={onStatusChange}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell w-[15%]">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right w-24">
                        <button
                          onClick={() => onEdit(issue)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg inline-block"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(issue.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg inline-block ml-1"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {issues.length === 0 && (
        <div className="p-8 text-center text-gray-500">No issues found</div>
      )}

      {/* Row count indicator */}
      {issues.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
          Showing{" "}
          {Math.min(
            rowVirtualizer.getVirtualItems().length + 5,
            sortedIssues.length
          )}{" "}
          of {sortedIssues.length} issues
        </div>
      )}
    </div>
  );
};
