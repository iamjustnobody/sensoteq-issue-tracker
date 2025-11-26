import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Layout } from "./components/layout/index.js";
import { Toaster } from "./components/ui/index.js";
import {
  ROUTES,
  IssuesPage,
  AnalyticsPage,
  NotFoundPage,
} from "./config/routes.js";

// Root loading fallback
const RootLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

// Error boundary fallback
// const ErrorFallback: React.FC = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gray-50">
//     <div className="text-center">
//       <h1 className="text-2xl font-bold text-gray-900 mb-2">
//         Something went wrong
//       </h1>
//       <p className="text-gray-500 mb-4">
//         Please refresh the page and try again.
//       </p>
//       <button
//         onClick={() => window.location.reload()}
//         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//       >
//         Refresh Page
//       </button>
//     </div>
//   </div>
// );

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster />

      <Suspense fallback={<RootLoader />}>
        <Routes>
          {/* Routes with layout */}
          <Route element={<Layout />}>
            {/* Default route */}
            <Route
              index
              element={
                <Suspense fallback={<RootLoader />}>
                  <IssuesPage />
                </Suspense>
              }
            />

            {/* Analytics route */}
            <Route
              path={ROUTES.ANALYTICS}
              element={
                <Suspense fallback={<RootLoader />}>
                  <AnalyticsPage />
                </Suspense>
              }
            />
          </Route>

          {/* 404 route - outside layout */}
          <Route
            path="*"
            element={
              <Suspense fallback={<RootLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
