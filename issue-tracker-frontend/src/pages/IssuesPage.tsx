import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, Table, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button, SkeletonCard, SkeletonTable } from "../components/ui/index.js";
import { IssueCard, IssueTable } from "../components/issues/index.js";
import { IssueForm } from "../components/issues/IssueForm.js";
import { STATUS_CONFIG } from "../utils/constants.js";
import { useIssues, useDebounce, useIssues_custom } from "../hooks/index.js";
import type { IssueStatus } from "../types/index.js";
import { useIssuesQuery } from "../hooks/useIssueQuery.js";

type ViewMode = "card" | "table";

const IssuesPage: React.FC = () => {
  // const { issues, isLoading, updateStatus, deleteIssue, refetch } =
  //   useIssues_custom();
  // const { issues, isLoading, updateStatus, deleteIssue, refetch } =
  //   useIssuesQuery();
  const { issues, isLoading, updateStatus, deleteIssue, refetch } = useIssues();

  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter issues based on search
  const filteredIssues = useMemo(() => {
    if (!debouncedSearch) return issues;
    const query = debouncedSearch.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query)
    );
  }, [issues, debouncedSearch]);

  // Group issues by status for card view
  const groupedIssues = useMemo(
    () => ({
      "not-started": filteredIssues.filter((i) => i.status === "not-started"),
      "in-progress": filteredIssues.filter((i) => i.status === "in-progress"),
      completed: filteredIssues.filter((i) => i.status === "completed"),
    }),
    [filteredIssues]
  );

  const handleOpenCreate = () => {
    setEditingIssueId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (id: number) => {
    setEditingIssueId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIssueId(null);
  };

  const handleFormSuccess = () => {
    refetch(); // Refetch issues after create/update
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await deleteIssue(id);
      } catch {
        // Error already handled in hook with toast
      }
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        {/* Toolbar skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 h-11 bg-gray-200 animate-pulse rounded-xl" />
          <div className="flex gap-2">
            <div className="h-11 w-24 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-11 w-32 bg-gray-200 animate-pulse rounded-xl" />
          </div>
        </div>

        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[0, 1, 2].map((col) => (
              <div key={col} className="space-y-4">
                <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <SkeletonTable rows={6} />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "card" ? "bg-white shadow" : ""
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table" ? "bg-white shadow" : ""
              }`}
            >
              <Table size={18} />
            </button>
          </div>

          <Button onClick={handleOpenCreate}>
            <Plus size={18} className="mr-2" />
            <span className="hidden sm:inline">Add Issue</span>
          </Button>
        </div>
      </div>

      {/* Issues display */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(["not-started", "in-progress", "completed"] as IssueStatus[]).map(
            (status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;

              return (
                <div key={status} className="space-y-4">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}
                  >
                    <Icon size={18} className={config.text} />
                    <span className={`font-medium ${config.text}`}>
                      {config.label}
                    </span>
                    <span className={`ml-auto text-sm ${config.text}`}>
                      {groupedIssues[status].length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groupedIssues[status].map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onEdit={() => handleOpenEdit(issue.id)}
                        onDelete={() => handleDelete(issue.id)}
                        onStatusChange={updateStatus}
                      />
                    ))}
                    {groupedIssues[status].length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">
                        No issues
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <IssueTable
          issues={filteredIssues}
          onEdit={(issue) => handleOpenEdit(issue.id)}
          onDelete={handleDelete}
          onStatusChange={updateStatus}
        />
      )}

      {/* Issue form modal */}
      <IssueForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        issueId={editingIssueId}
      />
    </div>
  );
};

export default IssuesPage;
