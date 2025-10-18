import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errorCodes';
import { BaseError } from './BaseErrors';
import { ApiResponse } from '../types/response';

export class BadRequestError extends BaseError {
  readonly statusCode = ERROR_CODES.BAD_REQUEST;
  readonly code = ERROR_CODES.BAD_REQUEST;

  constructor(message: string = ERROR_MESSAGES.VALIDATION_FAILED, details?: Record<string, any>) {
    super(message, details);
  }
}

export class ValidationError extends BaseError {
  readonly statusCode = ERROR_CODES.BAD_REQUEST;
  readonly code = ERROR_CODES.BAD_REQUEST;

  constructor(
    public errors: Record<string, string>,
    message: string = ERROR_MESSAGES.VALIDATION_FAILED
  ) {
    super(message);
  }

  toJSON(): ApiResponse {
    return {
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
      errors: this.errors,
    };
  }
}

export class UnauthorizedError extends BaseError {
  readonly statusCode = ERROR_CODES.UNAUTHORIZED;
  readonly code = ERROR_CODES.UNAUTHORIZED;

  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED, details?: Record<string, any>) {
    super(message, details);
  }
}

export class ForbiddenError extends BaseError {
  readonly statusCode = ERROR_CODES.FORBIDDEN;
  readonly code = ERROR_CODES.FORBIDDEN;

  constructor(message: string = ERROR_MESSAGES.FORBIDDEN, details?: Record<string, any>) {
    super(message, details);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = ERROR_CODES.NOT_FOUND;
  readonly code = ERROR_CODES.NOT_FOUND;

  constructor(message: string = ERROR_MESSAGES.NOT_FOUND, details?: Record<string, any>) {
    super(message, details);
  }
}

export class ConflictError extends BaseError {
  readonly statusCode = ERROR_CODES.CONFLICT;
  readonly code = ERROR_CODES.CONFLICT;

  constructor(message: string = 'Conflict', details?: Record<string, any>) {
    super(message, details);
  }
}

export class RateLimitError extends BaseError {
  readonly statusCode = ERROR_CODES.RATE_LIMIT;
  readonly code = ERROR_CODES.RATE_LIMIT;

  constructor(message: string = 'Too many requests', details?: Record<string, any>) {
    super(message, details);
  }
}

export class InternalError extends BaseError {
  readonly statusCode = ERROR_CODES.INTERNAL_ERROR;
  readonly code = ERROR_CODES.INTERNAL_ERROR;

  constructor(message: string = ERROR_MESSAGES.INTERNAL_ERROR, details?: Record<string, any>) {
    super(message, details);
  }
}