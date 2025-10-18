/**
 * 通用操作結果介面
 */
export interface OperationResult<T = any> {
  success: boolean;
  message: string;
  code?: number;
  data?: T;
}

/**
 * 用戶資料介面
 */
export interface UserData {
  id: string;
  userName: string;
  permissions: string;
  createdAt: Date;
}

/**
 * 用戶個人資料介面
 */
export interface UserProfile {
  userName: string;
  email?: string;
  nickname?: string;
  phone?: string;
  avatar?: string;
}

/**
 * 用戶驗證結果介面
 */
export interface VerifyResult {
  success: boolean;
  userId?: string;
  message: string;
}
