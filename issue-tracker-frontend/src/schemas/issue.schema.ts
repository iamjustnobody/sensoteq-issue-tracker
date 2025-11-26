import { z } from "zod";

// Status enum
export const issueStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "completed",
]);

// Create issue schema
export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  status: issueStatusSchema.default("not-started"),
  progress: z
    .number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress must be at most 100")
    .default(0),
});

// Update issue schema (all fields optional)
export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be less than 255 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  status: issueStatusSchema.optional(),
  progress: z
    .number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress must be at most 100")
    .optional(),
});

// Infer types from schemas
export type CreateIssueFormData = z.infer<typeof createIssueSchema>;
export type UpdateIssueFormData = z.infer<typeof updateIssueSchema>;
