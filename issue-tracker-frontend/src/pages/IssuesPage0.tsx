import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, Table, Plus, Loader2 } from "lucide-react";
import { Button, Input } from "../components/ui";
import { IssueCard, IssueTable } from "../components/issues";
import { IssueForm } from "../components/issues/IssueForm";
import { STATUS_CONFIG } from "../utils/constants";
import { useDebounce } from "../hooks/useDebounce";
import type {
  Issue,
  IssueStatus,
  CreateIssueDTO,
  UpdateIssueDTO,
} from "../types";

interface IssuesPageProps {
  issues: Issue[];
  isLoading: boolean;
  onCreateIssue: (data: CreateIssueDTO) => Promise<void>;
  onUpdateIssue: (id: number, data: UpdateIssueDTO) => Promise<void>;
  onDeleteIssue: (id: number) => Promise<void>;
  onStatusChange: (id: number, status: IssueStatus) => Promise<void>;
}

type ViewMode = "card" | "table";

export const IssuesPage: React.FC<IssuesPageProps> = ({
  issues,
  isLoading,
  onCreateIssue,
  onUpdateIssue,
  onDeleteIssue,
  onStatusChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

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

  const handleOpenForm = (issue?: Issue) => {
    setEditingIssue(issue || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIssue(null);
  };

  const handleSubmit = async (data: CreateIssueDTO | UpdateIssueDTO) => {
    if (editingIssue) {
      await onUpdateIssue(editingIssue.id, data);
    } else {
      await onCreateIssue(data as CreateIssueDTO);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      await onDeleteIssue(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
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

        {/* View toggle & Add button */}
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

          <Button onClick={() => handleOpenForm()}>
            <Plus size={18} className="mr-2" />
            <span className="hidden sm:inline">Add Issue</span>
          </Button>
        </div>
      </div>

      {/* Issues display */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(["not-started", "in-progress", "completed"] as IssueStatus[]).map(
            (status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;

              return (
                <div key={status} className="space-y-4">
                  {/* Column header */}
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

                  {/* Cards */}
                  <div className="space-y-3">
                    {groupedIssues[status].map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onEdit={handleOpenForm}
                        onDelete={handleDelete}
                        onStatusChange={onStatusChange}
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <IssueTable
          issues={filteredIssues}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
          onStatusChange={onStatusChange}
        />
      )}

      {/* Issue form modal */}
      <IssueForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        issue={editingIssue}
      />
    </div>
  );
};
