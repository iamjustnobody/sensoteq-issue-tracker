import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/ApiError.js";

// Generic validation middleware factory
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body as Record<string, unknown>;
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      throw new BadRequestError(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    next();
  };
};

// Validate ID parameter
export const validateIdParam = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const id = parseInt(req.params.id!);

  if (isNaN(id) || id <= 0) {
    throw new BadRequestError("Invalid ID parameter");
  }

  next();
};
