import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTUser } from "../types/express";

/**
 * JWT 認證中間件
 * 驗證請求中的 JWT token，並將用戶資料注入到 req.user
 *
 * @description
 * - 從 Cookie 或 Authorization header 中提取 token
 * - 驗證 token 的有效性
 * - 將解碼後的用戶資料注入到 req.user（類型安全）
 *
 * @example
 * router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
 *   const userId = req.user.id;  // 類型安全，不需要 as any
 * });
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies.authToken || req.headers.authorization?.split(" ")[1];

    // console.log('===== Auth Debug =====');
    // console.log('Authorization:', req.headers.authorization);
    // console.log('Cookies:', req.cookies);
    // console.log('Token:', token);
    // console.log('====================');

    if (!token || token === "undefined") {
      return res.error("請重新登入", 401, { needRelogin: true });
    }

    try {
      // 使用類型安全的轉換
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTUser;
      req.user = decoded;
      // console.log(`req.user: ${JSON.stringify(req.user)}`);
      next();
    } catch (error) {
      res.clearCookie("authToken");
      return res.error("登入已過期，請重新登入", 401, { needRelogin: true });
    }
  } catch (error) {
    console.error("Token 驗證錯誤:", error);
    return res.error("無效的認證令牌", 403);
  }
};
