import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient.ts";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryProvider } from "./providers/QueryProvider.tsx";

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <App />
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   </StrictMode>
// );

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);
