/**
 * 工具類 API 服務
 * 負責所有工具類功能的 API 請求（如注音轉換等）
 */

import { apis } from '../utils/tools/api';
import type { ZhuyinResponse } from '../types/utility';

export class UtilityService {
  /**
   * 將文字轉換為注音
   * @param text - 要轉換的文字
   * @returns 注音陣列或錯誤訊息
   */
  static async makeZhuyin(text: string): Promise<ZhuyinResponse> {
    if (!text) {
      return { error: true, message: '文字不能為空' };
    }

    try {
      const response = await fetch(apis.makeZhuyin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(
          `makeZhuyin API responded with status: ${response.status}`
        );
      }

      const data = await response.json();
      return data.zhuyin;
    } catch (error) {
      console.error('makeZhuyin error:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : '轉換注音失敗',
      };
    }
  }
}
