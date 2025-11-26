// import './App.css'
import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar, Header } from "./components/layout";
// import { IssuesPage } from "./pages/IssuesPage1";
// import { AnalyticsPage } from "./pages/AnalyticsPage1";
import IssuesPage from "./pages/IssuesPage1";
import AnalyticsPage from "./pages/AnalyticsPage1";
import { useIssues } from "./hooks/useIssues";

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const {
    issues,
    isLoading,
    createIssue,
    updateIssue,
    deleteIssue,
    updateStatus,
  } = useIssues();

  // Calculate stats for sidebar
  const stats = useMemo(() => {
    const total = issues.length;
    const completed = issues.filter((i) => i.status === "completed").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completionRate };
  }, [issues]);

  // Get page title from route
  const pageTitle = location.pathname === "/analytics" ? "Analytics" : "Issues";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalIssues={stats.total}
        completionRate={stats.completionRate}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Routes>
            <Route
              path="/"
              element={
                <IssuesPage
                  issues={issues}
                  isLoading={isLoading}
                  onCreateIssue={createIssue}
                  onUpdateIssue={updateIssue}
                  onDeleteIssue={deleteIssue}
                  onStatusChange={updateStatus}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
