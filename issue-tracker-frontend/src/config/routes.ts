import { lazy, type ComponentType } from "react";
import { Home, BarChart3, type LucideIcon } from "lucide-react";

// Lazy load pages
export const IssuesPage = lazy(() => import("../pages/IssuesPage.js"));
export const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage.js"));
export const NotFoundPage = lazy(() => import("../pages/NotFoundPage.js"));

// Route paths as constants (single source of truth)
export const ROUTES = {
  HOME: "/",
  ISSUES: "/",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const;

// Navigation items configuration
export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: ROUTES.ISSUES,
    icon: Home,
    label: "Issues",
    description: "Manage all issues",
  },
  {
    to: ROUTES.ANALYTICS,
    icon: BarChart3,
    label: "Analytics",
    description: "View statistics and charts",
  },
];

// Route configuration for React Router
export interface RouteConfig<T = any> {
  path: string;
  element: ComponentType<T>;
  title: string;
}

export const ROUTE_CONFIG: RouteConfig[] = [
  { path: ROUTES.ISSUES, element: IssuesPage, title: "Issues" },
  { path: ROUTES.ANALYTICS, element: AnalyticsPage, title: "Analytics" },
];
