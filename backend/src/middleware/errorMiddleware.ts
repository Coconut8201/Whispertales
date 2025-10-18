import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/BaseErrors';
import { InternalError } from '../errors/AppErrors';
import { ApiResponse } from '../types/response';

/**
 * 全域錯誤處理中介軟體
 *
 * 使用方式:
 * - 在 controller 中拋出自定義錯誤: throw new BadRequestError('錯誤訊息')
 * - 或使用 next(error) 傳遞錯誤
 * - 所有錯誤都會被統一格式化並返回
 *
 * @example
 * // In controller:
 * if (!userId) {
 *   throw new BadRequestError('用戶ID不能為空');
 * }
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 記錄錯誤到控制台
  console.error('=== Error Handler ===');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('====================');

  // 處理自定義錯誤
  if (err instanceof BaseError) {
    const response: ApiResponse = err.toJSON();
    res.status(err.statusCode).json(response);
    return;
  }

  // 處理 MongoDB 錯誤
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    const mongoError = err as any;
    if (mongoError.code === 11000) {
      // 重複鍵錯誤
      const field = Object.keys(mongoError.keyPattern || {})[0];
      res.status(409).json({
        code: 409,
        message: `${field || '欄位'} 已存在`,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // 處理 JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      code: 401,
      message: 'Token 無效',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      code: 401,
      message: 'Token 已過期',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 處理 Multer 錯誤 (檔案上傳)
  if (err.name === 'MulterError') {
    const multerError = err as any;
    let message = '檔案上傳失敗';

    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        message = '檔案大小超過限制';
        break;
      case 'LIMIT_FILE_COUNT':
        message = '檔案數量超過限制';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = '不允許的檔案欄位';
        break;
    }

    res.status(400).json({
      code: 400,
      message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 處理驗證錯誤
  if (err.name === 'ValidationError') {
    const validationError = err as any;
    const errors: Record<string, string> = {};

    if (validationError.errors) {
      Object.keys(validationError.errors).forEach(key => {
        errors[key] = validationError.errors[key].message;
      });
    }

    res.status(400).json({
      code: 400,
      message: '資料驗證失敗',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 處理 CORS 錯誤
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      code: 403,
      message: 'CORS 政策不允許此請求',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 未知錯誤 - 轉換為內部錯誤
  const internalError = new InternalError(
    process.env.NODE_ENV === 'production'
      ? '伺服器內部錯誤'
      : err.message,
    process.env.NODE_ENV === 'production'
      ? undefined
      : { stack: err.stack }
  );

  const response: ApiResponse = internalError.toJSON();
  res.status(internalError.statusCode).json(response);
};

/**
 * 404 Not Found 處理中介軟體
 * 用於捕獲所有未匹配的路由
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    code: 404,
    message: `找不到路由: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async 錯誤包裝器
 * 用於自動捕獲 async/await controller 中的錯誤
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsers();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
