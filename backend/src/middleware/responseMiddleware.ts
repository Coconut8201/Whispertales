import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/responseHandler';
import { ApiResponse } from '../types/response';

/**
 * 擴展 Express Response 物件，添加統一的響應方法
 */
declare global {
  namespace Express {
    interface Response {
      success<T = any>(data?: T, message?: string): Response;
      error(message: string, code?: number, details?: Record<string, any>): Response;
      paginated<T = any>(
        data: T[],
        page: number,
        limit: number,
        total: number,
        message?: string
      ): Response;
    }
  }
}

/**
 * 響應處理中介軟體
 * 為 Response 物件添加統一的響應方法
 *
 * 使用方式:
 * @example
 * // 成功響應
 * res.success({ userId: 123 }, '登入成功');
 *
 * // 錯誤響應
 * res.error('用戶名或密碼錯誤', 401);
 *
 * // 分頁響應
 * res.paginated(stories, 1, 10, 100, '獲取故事列表成功');
 */
export const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  /**
   * 成功響應
   * @param data - 響應資料
   * @param message - 成功訊息
   */
  res.success = function <T = any>(
    data?: T,
    message: string = 'Success'
  ): Response {
    const response = ResponseHandler.success(data, message);
    return this.status(200).json(response);
  };

  /**
   * 錯誤響應
   * @param message - 錯誤訊息
   * @param code - HTTP 狀態碼
   * @param details - 詳細資訊
   */
  res.error = function (
    message: string,
    code: number = 500,
    details?: Record<string, any>
  ): Response {
    const response: ApiResponse = {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    };
    return this.status(code).json(response);
  };

  /**
   * 分頁響應
   * @param data - 資料陣列
   * @param page - 當前頁碼
   * @param limit - 每頁筆數
   * @param total - 總筆數
   * @param message - 成功訊息
   */
  res.paginated = function <T = any>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response: ApiResponse = {
      code: 200,
      message,
      data,
      details: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return this.status(200).json(response);
  };

  next();
};

/**
 * 請求日誌中介軟體
 * 記錄所有進入的請求
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // 記錄請求開始
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // 監聽響應完成
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

/**
 * 請求驗證中介軟體工廠函數
 * 用於驗證請求體中的必填欄位
 *
 * @param requiredFields - 必填欄位陣列
 * @example
 * router.post('/login',
 *   validateRequest(['userName', 'userPassword']),
 *   loginController
 * );
 */
export const validateRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.error(
        '缺少必填欄位',
        400,
        { missingFields }
      );
      return;
    }

    next();
  };
};

/**
 * 查詢參數驗證中介軟體工廠函數
 * 用於驗證 URL 查詢參數
 *
 * @param requiredParams - 必填參數陣列
 * @example
 * router.get('/story',
 *   validateQuery(['storyId']),
 *   getStoryController
 * );
 */
export const validateQuery = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingParams: string[] = [];

    for (const param of requiredParams) {
      if (!req.query[param]) {
        missingParams.push(param);
      }
    }

    if (missingParams.length > 0) {
      res.error(
        '缺少必填查詢參數',
        400,
        { missingParams }
      );
      return;
    }

    next();
  };
};
