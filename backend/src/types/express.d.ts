/**
 * Express Request 類型擴展
 * 為 Request 添加 user 屬性，提供完整的類型安全
 */

import { Request } from 'express';

// 用戶 JWT 載荷接口
export interface JWTUser {
  id: string;
  username: string;
  loginTime: number;
  iat?: number;
  exp?: number;
}

// 擴展 Express 的 Request 接口
declare global {
  namespace Express {
    interface Request {
      user?: JWTUser;
    }
  }
}

/**
 * 已認證請求接口
 * 當使用 authenticateToken 中間件後，user 必定存在
 */
export interface AuthenticatedRequest extends Request {
  user: JWTUser;  // 注意：這裡是必填，不是可選
}
