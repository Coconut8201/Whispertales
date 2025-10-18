/**
 * 前端 API 響應類型定義
 * 與後端 response.ts 保持一致
 */

/**
 * 統一的 API 響應格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  details?: Record<string, any>;
  timestamp?: string;
}

/**
 * 分頁資訊
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 分頁響應
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  details: {
    pagination: PaginationInfo;
  };
}

/**
 * 響應處理結果
 */
export interface ResponseResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  details?: Record<string, any>;
}
