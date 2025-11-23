import { Circle, Clock, CheckCircle2 } from "lucide-react";

export const STATUS_CONFIG = {
  "not-started": {
    label: "Not Started",
    bg: "bg-slate-100",
    text: "text-slate-700",
    bar: "bg-slate-400",
    icon: Circle,
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
    bar: "bg-blue-500",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
} as const;

export const CHART_COLORS = ["#64748b", "#3b82f6", "#10b981"];

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];
