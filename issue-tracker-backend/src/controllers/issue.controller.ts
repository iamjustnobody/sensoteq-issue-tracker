import type { Request, Response, NextFunction } from "express";
import issueService from "../services/issue.service.js";
import type {
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueStatus,
  IssueFilters,
} from "../types/issue.types.js";
import { BadRequestError } from "../utils/ApiError.js";

// Helper to build object without undefined values
function buildFilters(
  status: string | undefined,
  search: string | undefined
): IssueFilters {
  const filters: IssueFilters = {};
  if (status !== undefined) filters.status = status as IssueStatus;
  if (search !== undefined) filters.search = search;
  return filters;
}

function buildCreateDTO(
  title: string,
  description: string | undefined,
  status: IssueStatus | undefined,
  progress: number | undefined
): CreateIssueDTO {
  const dto: CreateIssueDTO = { title };
  if (description !== undefined) dto.description = description;
  if (status !== undefined) dto.status = status;
  if (progress !== undefined) dto.progress = progress;
  return dto;
}

function buildUpdateDTO(
  title: string | undefined,
  description: string | undefined,
  status: IssueStatus | undefined,
  progress: number | undefined
): UpdateIssueDTO {
  const dto: UpdateIssueDTO = {};
  if (title !== undefined) dto.title = title;
  if (description !== undefined) dto.description = description;
  if (status !== undefined) dto.status = status;
  if (progress !== undefined) dto.progress = progress;
  return dto;
}

class IssueController {
  /**
   * GET /api/issues
   * Get all issues with optional filtering
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      // Validate status if provided
      const validStatuses: IssueStatus[] = [
        "not-started",
        "in-progress",
        "completed",
      ];
      if (
        status !== undefined &&
        !validStatuses.includes(status as IssueStatus)
      ) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const filters = buildFilters(status, search);
      const issues = await issueService.findAll(filters);

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
      const body = req.body as Record<string, unknown>;

      const title = body.title as string | undefined;
      const description = body.description as string | undefined;
      const status = body.status as IssueStatus | undefined;
      const progress = body.progress as number | undefined;

      // Validation
      if (title === undefined || title.trim().length === 0) {
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
      if (status !== undefined && !validStatuses.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const dto = buildCreateDTO(
        title.trim(),
        description?.trim(),
        status,
        progress
      );

      const issue = await issueService.create(dto);

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

      if (isNaN(id)) {
        throw new BadRequestError("Invalid issue ID");
      }

      const body = req.body as Record<string, unknown>;

      const title = body.title as string | undefined;
      const description = body.description as string | undefined;
      const status = body.status as IssueStatus | undefined;
      const progress = body.progress as number | undefined;

      // Validation
      if (title !== undefined && title.trim().length === 0) {
        throw new BadRequestError("Title cannot be empty");
      }

      if (title !== undefined && title.length > 255) {
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
      if (status !== undefined && !validStatuses.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const dto = buildUpdateDTO(
        title?.trim(),
        description?.trim(),
        status,
        progress
      );

      const issue = await issueService.update(id, dto);

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
