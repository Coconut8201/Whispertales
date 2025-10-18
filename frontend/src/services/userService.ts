/**
 * 用戶相關 API 服務
 * 負責所有與用戶認證、註冊、登出相關的 API 請求
 */

import { ResponseHandler } from '../utils/responseHandler';
import { apis } from '../utils/tools/api';
import type {
  User,
  UserLoginResponse,
  UserRegisterResponse,
  AuthStatus,
} from '../types/user';

export class UserService {
  /**
   * 用戶登入
   * @param userName - 用戶名
   * @param userPassword - 密碼
   * @returns 登入結果
   */
  static async login(
    userName: string,
    userPassword: string
  ): Promise<UserLoginResponse> {
    const result = await ResponseHandler.post<User>(apis.userLogin, {
      userName,
      userPassword,
    });

    if (result.success && result.data) {
      console.log('登入成功');
      return {
        success: true,
        user: result.data,
      };
    } else {
      console.error('登入失敗：', result.message);
      return {
        success: false,
      };
    }
  }

  /**
   * 用戶登出
   * @returns 登出結果
   */
  static async logout(): Promise<{ success: boolean }> {
    try {
      // 發送登出請求
      const response = await fetch(apis.userLogout, {
        method: 'GET',
        credentials: 'include',
      });

      // 清除本地 cookie
      const domains = ['', '.localhost', window.location.hostname];
      const paths = ['/', '/api'];

      domains.forEach((domain) => {
        paths.forEach((path) => {
          document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? `; domain=${domain}` : ''}; samesite=lax;`;
        });
      });

      if (!response.ok) {
        console.error('登出請求失敗：', response.statusText);
        return { success: false };
      }

      const data = await response.json();
      return { success: data.success || false };
    } catch (error) {
      console.error('登出過程中發生錯誤：', error);
      return { success: false };
    }
  }

  /**
   * 用戶註冊
   * @param userName - 用戶名
   * @param userPassword - 密碼
   * @returns 註冊結果
   */
  static async register(
    userName: string,
    userPassword: string
  ): Promise<UserRegisterResponse> {
    try {
      const response = await fetch(apis.userRegister, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, userPassword }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        if (data.success) {
          return { success: true, code: 200, message: '註冊成功' };
        } else {
          console.error(`註冊失敗：HTTP狀態碼 ${data.status} ${data.message}`);
          return { success: false, code: data.status, message: data.message };
        }
      } else {
        if (response.status === 200) {
          const textResponse = await response.text();
          if (
            textResponse.includes('SaveNewUser') &&
            textResponse.includes('success')
          ) {
            return { success: true, code: 200, message: '註冊成功' };
          }
        }
        const textResponse = await response.text();
        console.error(`註冊失敗：非JSON回應 ${response.status} ${textResponse}`);
        return { success: false, code: response.status, message: textResponse };
      }
    } catch (error) {
      console.error('註冊過程中發生錯誤：', error);
      return {
        success: false,
        code: 500,
        message: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 驗證用戶認證狀態
   * @returns 認證狀態
   */
  static async verifyAuth(): Promise<AuthStatus> {
    try {
      const response = await fetch(apis.verifyAuth, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { isAuthenticated: true };
      }
      return { isAuthenticated: false };
    } catch (error) {
      console.error('verifyAuth fail:', error);
      return { isAuthenticated: false };
    }
  }
}
