import { z } from "zod";

// Status enum
export const issueStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "completed",
]);

// Create issue schema
export const createIssueSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (data.status === "not-started" && data.progress !== 0) {
      ["status", "progress"].forEach((path) =>
        ctx.addIssue({
          path: [path],
          code: "custom",
          message: "When status is not-started, progress must be 0",
        })
      );
    }
    if (data.status === "completed" && data.progress !== 100) {
      ["status", "progress"].forEach((path) =>
        ctx.addIssue({
          path: [path],
          code: "custom",
          message: "When status is completed, progress must be 100",
        })
      );
    }
  });
// .superRefine((data, ctx) => {
//   if (data.status === "not-started" && data.progress !== 0) {
//     ctx.addIssue({
//       path: ["status"], // attach to status
//       code: "custom",
//       message: "When status is not-started, progress must be 0",
//     });
//     ctx.addIssue({
//       path: ["progress"], // also attach to progress
//       code: "custom",
//       message: "Progress must be 0 when status is not-started",
//     });
//   }
//   if (data.status === "completed" && data.progress !== 100) {
//     ctx.addIssue({
//       path: ["status"],
//       code: "custom",
//       message: "When status is completed, progress must be 100",
//     });
//     ctx.addIssue({
//       path: ["progress"],
//       code: "custom",
//       message: "Progress must be 100 when status is completed",
//     });
//   }
// });
// .refine((data) => !(data.status === "not-started" && data.progress !== 0), {
//   message: "Progress must be 0 when status is not-started",
//   path: ["progress"],
// })
// .refine((data) => !(data.status === "completed" && data.progress !== 100), {
//   message: "Progress must be 100 when status is completed",
//   path: ["progress"],
// });

// Update issue schema (all fields optional)
export const updateIssueSchema = z.preprocess(
  (raw) => {
    const data = raw as any;
    if (data.status === "not-started") {
      data.progress = 0;
    }
    if (data.status === "completed") {
      data.progress = 100;
    }
    return data;
  },
  z.object({
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
  })
);

// Infer types from schemas
export type CreateIssueFormData = z.infer<typeof createIssueSchema>;
export type UpdateIssueFormData = z.infer<typeof updateIssueSchema>;
