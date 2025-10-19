/**
 * 用戶相關類型定義
 */

/**
 * 用戶資料結構
 */
export interface User {
  _id?: string;
  userName: string;
  userPassword?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 用戶登入響應
 */
export interface UserLoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * 用戶註冊響應
 */
export interface UserRegisterResponse {
  success: boolean;
  code: number;
  message: string;
}

/**
 * 認證狀態
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  user?: User;
}
