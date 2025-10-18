import { ApiResponse } from '../types/response';

export abstract class BaseError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: number;

  constructor(
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ApiResponse {
    return {
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
      ...(this.details && Object.keys(this.details).length > 0 && { details: this.details }),
    };
  }
}