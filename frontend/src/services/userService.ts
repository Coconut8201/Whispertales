/**
 * 用戶相關 API 服務
 * 負責所有與用戶認證、註冊、登出相關的 API 請求
 */

import { ResponseHandler } from "../utils/responseHandler";
import { apis } from "../utils/tools/api";
import type {
  User,
  UserLoginResponse,
  UserRegisterResponse,
  AuthStatus,
} from "../types/user";

export class UserService {
  /**
   * 用戶登入
   * @param userName - 用戶名
   * @param userPassword - 密碼
   * @returns 登入結果
   */
  static async login(
    userName: string,
    userPassword: string,
  ): Promise<UserLoginResponse> {
    const result = await ResponseHandler.post<User>(apis.userLogin, {
      userName,
      userPassword,
    });

    if (result.success && result.data) {
      console.log("登入成功");
      return {
        success: true,
        user: result.data,
      };
    } else {
      console.error("登入失敗：", result.message);
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
    const result = await ResponseHandler.get(apis.userLogout);

    // 無論後端響應如何，都清除本地 cookie（防止後端故障導致前端無法登出）
    this.clearAuthCookies();

    if (result.success) {
      console.log("登出成功");
      return { success: true };
    } else {
      console.error("登出請求失敗：", result.message);
      // 即使後端返回失敗，但 cookie 已清除，視為登出成功
      return { success: true };
    }
  }

  /**
   * 清除認證 Cookie（私有方法）
   * 清除多個可能的 domain 和 path 組合
   */
  private static clearAuthCookies(): void {
    const domains = ["", ".localhost", window.location.hostname];
    const paths = ["/", "/api"];

    domains.forEach((domain) => {
      paths.forEach((path) => {
        document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? `; domain=${domain}` : ""}; samesite=lax;`;
      });
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[前端] 已清除所有認證 Cookie");
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
    userPassword: string,
  ): Promise<UserRegisterResponse> {
    try {
      const response = await fetch(apis.userRegister, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, userPassword }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.success) {
          return { success: true, code: 200, message: "註冊成功" };
        } else {
          console.error(`註冊失敗：HTTP狀態碼 ${data.status} ${data.message}`);
          return { success: false, code: data.status, message: data.message };
        }
      } else {
        if (response.status === 200) {
          const textResponse = await response.text();
          if (
            textResponse.includes("SaveNewUser") &&
            textResponse.includes("success")
          ) {
            return { success: true, code: 200, message: "註冊成功" };
          }
        }
        const textResponse = await response.text();
        console.error(
          `註冊失敗：非JSON回應 ${response.status} ${textResponse}`,
        );
        return { success: false, code: response.status, message: textResponse };
      }
    } catch (error) {
      console.error("註冊過程中發生錯誤：", error);
      return {
        success: false,
        code: 500,
        message: error instanceof Error ? error.message : "未知錯誤",
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
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return { isAuthenticated: true };
      }
      return { isAuthenticated: false };
    } catch (error) {
      console.error("verifyAuth fail:", error);
      return { isAuthenticated: false };
    }
  }
}
