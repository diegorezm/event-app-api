import { HTTPException } from "hono/http-exception";

import { z } from "zod";

export const paginatedRequestSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  size: z.coerce.number().default(10),
});

export type PaginatedRequest = z.infer<typeof paginatedRequestSchema>;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

// ERRORS
export class NotFoundError extends HTTPException {
  constructor(message = "Resource not found.") {
    super(404, {
      message,
    });
  }
}

export class BadRequestError extends HTTPException {
  constructor(message = "Bad request.") {
    super(400, {
      message,
    });
  }
}

export class InternalServerError extends HTTPException {
  constructor(message = "Internal server error.") {
    super(500, {
      message,
    });
  }
}

export class UnauthorizedError extends HTTPException {
  constructor(message = "Unauthorized.") {
    super(401, {
      message,
    });
  }
}

export class ForbiddenError extends HTTPException {
  constructor(message = "Forbidden.") {
    super(403, {
      message,
    });
  }
}

export class ConflictError extends HTTPException {
  constructor(message = "Conflict.") {
    super(409, {
      message,
    });
  }
}

