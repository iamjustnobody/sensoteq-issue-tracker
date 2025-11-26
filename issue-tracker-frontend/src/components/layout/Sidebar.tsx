import React from "react";
import { NavLink } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { NAV_ITEMS } from "../../config/routes.js";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  totalIssues: number;
  completionRate: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  totalIssues,
  completionRate,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r z-50",
          "transform transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Issue Tracker</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation - using centralized NAV_ITEMS */}
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={16} className="ml-auto" />
            </NavLink>
          ))}
        </nav>

        {/* Stats footer */}
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">
            Total Issues:{" "}
            <span className="font-semibold text-gray-900">{totalIssues}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Completion:{" "}
            <span className="font-semibold text-emerald-600">
              {completionRate}%
            </span>
          </p>
        </div>
      </aside>
    </>
  );
};
