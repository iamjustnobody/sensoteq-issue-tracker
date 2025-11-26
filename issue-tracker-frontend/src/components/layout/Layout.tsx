import React, { useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Sidebar } from "./Sidebar.js";
import { Header } from "./Header.js";
import { NAV_ITEMS } from "../../config/routes.js";
// import { useIssuesQuery } from "../../hooks/useIssueQuery.js";
import {
  selectCompletionRate,
  selectTotalIssues,
  useIssuesStore,
} from "../../stores/useIssuesStore.js";

// Page loading fallback
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  // const { data: issues } = useIssuesQuery();
  // Get stats from Zustand store instead of fetching
  const totalIssues = useIssuesStore(selectTotalIssues);
  const completionRate = useIssuesStore(selectCompletionRate);

  // Get page title from nav items
  const currentNav = NAV_ITEMS.find((item) => item.to === location.pathname);
  const pageTitle = currentNav?.label || "Page";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalIssues={totalIssues}
        completionRate={completionRate}
      />

      <div className="lg:ml-64">
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
