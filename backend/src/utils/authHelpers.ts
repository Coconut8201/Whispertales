/**
 * 認證輔助工具函數
 * 提供便捷的方法來處理已認證請求中的用戶資料
 */

import { Request } from 'express';
import { AuthenticatedRequest, JWTUser } from '../types/express';
import { UnauthorizedError } from '../errors/AppErrors';

/**
 * 獲取當前已認證用戶的資料
 *
 * @param req - Express Request 對象
 * @returns 用戶資料
 * @throws UnauthorizedError 如果用戶未認證
 *
 * @example
 * // 在需要認證的路由中使用
 * const user = getCurrentUser(req);
 * console.log(user.id, user.username);
 */
export function getCurrentUser(req: Request): JWTUser {
  if (!req.user) {
    throw new UnauthorizedError('用戶未認證', {
      reason: 'MISSING_USER',
      suggestion: '請確保使用了 authenticateToken 中間件',
    });
  }
  return req.user;
}

/**
 * 獲取當前已認證用戶的 ID
 *
 * @param req - Express Request 對象
 * @returns 用戶 ID
 * @throws UnauthorizedError 如果用戶未認證
 *
 * @example
 * const userId = getCurrentUserId(req);
 * const stories = await StoryService.getStoriesByUserId(userId);
 */
export function getCurrentUserId(req: Request): string {
  return getCurrentUser(req).id;
}

/**
 * 獲取當前已認證用戶的用戶名
 *
 * @param req - Express Request 對象
 * @returns 用戶名
 * @throws UnauthorizedError 如果用戶未認證
 *
 * @example
 * const username = getCurrentUsername(req);
 * console.log(`當前用戶：${username}`);
 */
export function getCurrentUsername(req: Request): string {
  return getCurrentUser(req).username;
}

/**
 * 檢查請求是否已認證
 *
 * @param req - Express Request 對象
 * @returns 是否已認證
 *
 * @example
 * if (isAuthenticated(req)) {
 *   // 處理已認證的邏輯
 * }
 */
export function isAuthenticated(req: Request): boolean {
  return !!req.user;
}

/**
 * 類型守衛：檢查請求是否為已認證請求
 *
 * @param req - Express Request 對象
 * @returns 是否為 AuthenticatedRequest
 *
 * @example
 * if (isAuthenticatedRequest(req)) {
 *   // TypeScript 知道 req.user 必定存在
 *   const userId = req.user.id;
 * }
 */
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return !!req.user;
}

/**
 * 驗證用戶是否為資源的擁有者
 *
 * @param req - Express Request 對象
 * @param resourceOwnerId - 資源擁有者的 ID
 * @returns 是否為擁有者
 * @throws UnauthorizedError 如果用戶未認證或不是擁有者
 *
 * @example
 * const story = await StoryService.getStoryById(storyId);
 * requireOwnership(req, story.userId);
 * // 如果不是擁有者，會自動拋出錯誤
 */
export function requireOwnership(req: Request, resourceOwnerId: string): void {
  const currentUserId = getCurrentUserId(req);

  if (currentUserId !== resourceOwnerId) {
    throw new UnauthorizedError('無權訪問此資源', {
      reason: 'NOT_OWNER',
      currentUserId,
      resourceOwnerId,
      suggestion: '您只能訪問自己的資源',
    });
  }
}

/**
 * 檢查用戶是否為資源的擁有者（不拋出錯誤）
 *
 * @param req - Express Request 對象
 * @param resourceOwnerId - 資源擁有者的 ID
 * @returns 是否為擁有者
 *
 * @example
 * const story = await StoryService.getStoryById(storyId);
 * if (isOwner(req, story.userId)) {
 *   // 擁有者可以執行的操作
 * } else {
 *   // 非擁有者的處理
 * }
 */
export function isOwner(req: Request, resourceOwnerId: string): boolean {
  if (!isAuthenticated(req)) {
    return false;
  }
  return getCurrentUserId(req) === resourceOwnerId;
}
