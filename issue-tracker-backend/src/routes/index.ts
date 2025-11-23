import { Router } from "express";
import type { Request, Response } from "express";
import issueRoutes from "./issue.routes.js";

const router = Router();

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount issue routes
router.use("/issues", issueRoutes);

export default router;
