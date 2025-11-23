import { Router } from "express";
import issueController from "../controllers/issue.controller.js";

const router = Router();

// GET /api/issues - Get all issues (with optional filters)
router.get("/", issueController.getAll);

// GET /api/issues/analytics - Get analytics data
// NOTE: This must come BEFORE /:id route!
router.get("/analytics", issueController.getAnalytics);

// GET /api/issues/:id - Get single issue
router.get("/:id", issueController.getById);

// POST /api/issues - Create new issue
router.post("/", issueController.create);

// PUT /api/issues/:id - Update issue
router.put("/:id", issueController.update);

// DELETE /api/issues/:id - Delete issue
router.delete("/:id", issueController.delete);

export default router;
