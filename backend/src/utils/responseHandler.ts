import { ApiResponse } from '../types/response';

export class ResponseHandler {
  static success<T = any>(data?: T, message: string = 'Success'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}