import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, Table, Plus } from "lucide-react";

import { Button, SkeletonCard, SkeletonTable } from "../components/ui/index.js";
import { IssueCard, IssueTable } from "../components/issues/index.js";
import { IssueForm } from "../components/issues/IssueForm.js";
import { STATUS_CONFIG } from "../utils/constants.js";
import { useDebounce } from "../hooks/index.js";
import type {
  CreateIssueDTO,
  IssueStatus,
  UpdateIssueDTO,
} from "../types/index.js";
import { useIssuesMutations } from "../hooks/useIssueQuery.js";
import { VirtualizedIssueTable } from "../components/issues/VirtualizedIssueTable.js";
import {
  selectIsLoading,
  selectIssues,
  useIssuesStore,
} from "../stores/useIssuesStore.js";
import type {
  CreateIssueFormData,
  UpdateIssueFormData,
} from "../schemas/issue.schema.js";

type ViewMode = "card" | "table" | "virtual";

const IssuesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // const {
  //   issues,
  //   isLoading,
  //   updateStatus,
  //   deleteIssue,
  //   refetch,
  //   isCreating,
  //   isUpdating,
  //   isDeleting,
  // } = useIssuesQuery({ search: debouncedSearch });

  // Read issues from Zustand store (no API call)
  const issues = useIssuesStore(selectIssues);
  const isLoading = useIssuesStore(selectIsLoading);
  // Get only mutation functions (no additional fetch)
  const {
    createIssue,
    updateIssue,
    deleteIssue,
    updateStatus,
    isCreating,
    isUpdating,
    isDeleting,
  } = useIssuesMutations();
  // useIssuesQuery(
  //   { search: debouncedSearch },
  //   { skipFetch: !!debouncedSearch }
  // ); //useIssuesMutations();

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
    // refetch(); // Refetch issues after create/update
    // No need to refetch - Zustand store is automatically updated by the mutation
  };

  // ==============================================
  // API CALL HANDLERS - Called from IssueForm
  // ==============================================
  const handleFormSubmit = async (
    data: CreateIssueFormData | UpdateIssueFormData
  ) => {
    try {
      if (editingIssueId) {
        // Update existing issue
        await updateIssue(
          editingIssueId,
          data as UpdateIssueFormData | UpdateIssueDTO
        );
        // toast.success("Issue updated successfully");
        handleFormSuccess(); //opt
      } else {
        // Create new issue
        await createIssue(data as CreateIssueFormData | CreateIssueDTO);
        // toast.success("Issue created successfully");
      }

      // Close modal on success
      handleCloseForm(); //opt
    } catch (err) {
      // const message = err instanceof Error ? err.message : "Something went wrong";
      // toast.error(message);
      // error handling is done in the mutation hooks
      // Don't close modal on error - let user retry
    }
  };

  // ==============================================
  // ISSUE ACTION HANDLERS
  // ==============================================
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      await deleteIssue(id);
      // toast.success("Issue deleted successfully");
    } catch (err) {
      // const message = err instanceof Error ? err.message : "Failed to delete issue";
      // toast.error(message);
      // error handling is done in the mutation hooks
    }
  };

  // const handleStatusChange = async (id: number, status: string) => {
  //   try {
  //     await updateStatus(id, status as any);
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : "Failed to update status";
  //     toast.error(message);
  //   }
  // };

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
            <button
              onClick={() => setViewMode("virtual")}
              className={`px-2 rounded-md transition-colors text-xs font-medium ${
                viewMode === "virtual" ? "bg-white shadow" : ""
              }`}
              title="Virtualized Table (for large lists)"
            >
              Virtual
            </button>
          </div>

          <Button onClick={handleOpenCreate}>
            <Plus size={18} className="mr-2 text-blue-700" />
            <span className="hidden sm:inline text-blue-700">Add Issue</span>
          </Button>
        </div>
      </div>

      {/* Loading indicator for mutations */}
      {(isCreating || isUpdating || isDeleting) && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
          {isCreating && "Creating issue..."}
          {isUpdating && "Updating issue..."}
          {isDeleting && "Deleting issue..."}
        </div>
      )}

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
                        submitting={isCreating || isUpdating}
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
      ) : viewMode === "virtual" ? (
        <VirtualizedIssueTable
          issues={filteredIssues}
          onEdit={(issue) => handleOpenEdit(issue.id)}
          onDelete={handleDelete}
          onStatusChange={updateStatus}
          submitting={isCreating || isUpdating}
        />
      ) : (
        <IssueTable
          issues={filteredIssues}
          onEdit={(issue) => handleOpenEdit(issue.id)}
          onDelete={handleDelete}
          onStatusChange={updateStatus}
          submitting={isCreating || isUpdating}
        />
      )}

      {/* Empty state */}
      {issues.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No issues yet</p>
          <Button onClick={handleOpenCreate}>
            <Plus size={18} className="mr-2" />
            Create your first issue
          </Button>
        </div>
      )}
      {/* No search results */}
      {issues.length > 0 && filteredIssues.length === 0 && debouncedSearch && (
        <div className="text-center py-16">
          <Search size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No matching issues
          </h3>
          <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Issue form modal */}
      <IssueForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        issueId={editingIssueId}
        submitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default IssuesPage;
