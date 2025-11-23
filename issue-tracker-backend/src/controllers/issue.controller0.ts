import type { Request, Response, NextFunction } from "express";
import issueService from "../services/issue.service.js";
import type {
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueStatus,
} from "../types/issue.types.js";
import { BadRequestError } from "../utils/ApiError.js";

class IssueController {
  /**
   * GET /api/issues
   * Get all issues with optional filtering
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search } = req.query;

      // Validate status if provided
      const validStatuses: IssueStatus[] = [
        "not-started",
        "in-progress",
        "completed",
      ];
      if (status && !validStatuses.includes(status as IssueStatus)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const issues = await issueService.findAll({
        status: status as IssueStatus | undefined,
        search: search as string | undefined,
      });

      res.json({
        success: true,
        data: issues,
        count: issues.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/issues/analytics
   * Get analytics data
   */
  async getAnalytics(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const analytics = await issueService.getAnalytics();

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/issues/:id
   * Get single issue by ID
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id!);

      if (isNaN(id)) {
        throw new BadRequestError("Invalid issue ID");
      }

      const issue = await issueService.findById(id);

      res.json({
        success: true,
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/issues
   * Create new issue
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, status, progress } =
        req.body as CreateIssueDTO;

      // Validation
      if (!title || title.trim().length === 0) {
        throw new BadRequestError("Title is required");
      }

      if (title.length > 255) {
        throw new BadRequestError("Title must be less than 255 characters");
      }

      if (progress !== undefined && (progress < 0 || progress > 100)) {
        throw new BadRequestError("Progress must be between 0 and 100");
      }

      const validStatuses: IssueStatus[] = [
        "not-started",
        "in-progress",
        "completed",
      ];
      if (status && !validStatuses.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const issue = await issueService.create({
        title: title.trim(),
        description: description?.trim(),
        status,
        progress,
      });

      res.status(201).json({
        success: true,
        data: issue,
        message: "Issue created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/issues/:id
   * Update existing issue
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const { title, description, status, progress } =
        req.body as UpdateIssueDTO;

      if (isNaN(id)) {
        throw new BadRequestError("Invalid issue ID");
      }

      // Validation
      if (title !== undefined && title.trim().length === 0) {
        throw new BadRequestError("Title cannot be empty");
      }

      if (title && title.length > 255) {
        throw new BadRequestError("Title must be less than 255 characters");
      }

      if (progress !== undefined && (progress < 0 || progress > 100)) {
        throw new BadRequestError("Progress must be between 0 and 100");
      }

      const validStatuses: IssueStatus[] = [
        "not-started",
        "in-progress",
        "completed",
      ];
      if (status && !validStatuses.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const issue = await issueService.update(id, {
        title: title?.trim(),
        description: description?.trim(),
        status,
        progress,
      });

      res.json({
        success: true,
        data: issue,
        message: "Issue updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/issues/:id
   * Delete issue
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id!);

      if (isNaN(id)) {
        throw new BadRequestError("Invalid issue ID");
      }

      const issue = await issueService.delete(id);

      res.json({
        success: true,
        data: issue,
        message: "Issue deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

const issueController = new IssueController();
export default issueController;
