import { ApiResponse, ResponseResult } from '../types/response';

/**
 * 統一的前端響應處理工具
 * 用於處理所有來自後端的 API 響應
 */
export class ResponseHandler {
  /**
   * 處理 API 響應
   * @param response - Fetch Response 對象
   * @returns 處理後的結果
   */
  static async handleResponse<T = any>(response: Response): Promise<ResponseResult<T>> {
    try {
      const data: ApiResponse<T> = await response.json();

      // 成功響應 (HTTP 200-299)
      if (response.ok) {
        // 檢查後端的 code 欄位 (統一響應格式)
        if (data.code >= 200 && data.code < 300) {
          return {
            success: true,
            data: data.data,
            message: data.message,
            details: data.details
          };
        }
      }

      // 失敗響應
      return {
        success: false,
        message: data.message || `請求失敗 (HTTP ${response.status})`,
        errors: data.errors,
        details: data.details
      };

    } catch (error) {
      // JSON 解析錯誤或其他錯誤
      console.error('響應處理錯誤:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '未知錯誤'
      };
    }
  }

  /**
   * 執行 API 請求並處理響應
   * @param url - API URL
   * @param options - Fetch 選項
   * @returns 處理後的結果
   */
  static async request<T = any>(
    url: string,
    options?: RequestInit
  ): Promise<ResponseResult<T>> {
    try {
      const response = await fetch(url, {
        credentials: 'include', // 默認攜帶 cookie
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      });

      return await this.handleResponse<T>(response);

    } catch (error) {
      console.error('API 請求錯誤:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '網路請求失敗'
      };
    }
  }

  /**
   * GET 請求
   */
  static async get<T = any>(url: string, options?: RequestInit): Promise<ResponseResult<T>> {
    return this.request<T>(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST 請求
   */
  static async post<T = any>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<ResponseResult<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    });
  }

  /**
   * PUT 請求
   */
  static async put<T = any>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<ResponseResult<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    });
  }

  /**
   * DELETE 請求
   */
  static async delete<T = any>(url: string, options?: RequestInit): Promise<ResponseResult<T>> {
    return this.request<T>(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * 檢查響應是否成功
   */
  static isSuccess<T>(result: ResponseResult<T>): result is ResponseResult<T> & { success: true; data: T } {
    return result.success === true && result.data !== undefined;
  }

  /**
   * 取得錯誤訊息
   */
  static getErrorMessage(result: ResponseResult): string {
    if (result.message) {
      return result.message;
    }

    if (result.errors) {
      return Object.values(result.errors).join(', ');
    }

    return '操作失敗';
  }
}
