/**
 * 語音相關 API 服務
 * 負責所有與語音上傳、獲取、列表相關的 API 請求
 */

import { apis } from '../utils/tools/api';
import type {
  VoiceListResponse,
  UploadVoiceResponse,
} from '../types/voice';

export class VoiceService {
  /**
   * 獲取語音
   * @param storyId - 故事 ID
   * @param pageIndex - 頁面索引
   * @returns 語音 Blob 或 null
   */
  static async getVoice(
    storyId: string,
    pageIndex: number
  ): Promise<Blob | null> {
    try {
      const payload = {
        storyId,
        pageIndex,
      };

      console.log(`獲取語音請求: ${JSON.stringify(payload)}`);

      const response = await fetch(apis.GetVoice, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // 如果狀態碼是 404，返回 null
      if (response.status === 404) {
        console.log('找不到對應的音頻文件');
        return null;
      }

      if (!response.ok) {
        throw new Error(`GetVoice error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('GetVoice, Failed to fetch audio:', error);
      return null;
    }
  }

  /**
   * 上傳語音
   * @param audioBlob - 音頻 Blob
   * @param audioName - 音頻名稱
   * @returns 上傳結果
   */
  static async uploadVoice(
    audioBlob: Blob,
    audioName: string
  ): Promise<UploadVoiceResponse> {
    const formData = new FormData();
    formData.append('files', audioBlob, `${audioName}.wav`);
    formData.append('audioName', audioName);

    try {
      const response = await fetch(apis.uploadVoice, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        return { result: true, message: 'UploadVoice success' };
      } else {
        const errorMessage = `UploadVoice failed with status: ${response.status}`;
        console.error(errorMessage);
        return { result: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = `UploadVoice failed: ${error}`;
      console.error(errorMessage);
      return { result: false, message: errorMessage };
    }
  }

  /**
   * 獲取語音列表
   * @returns 語音列表
   */
  static async getVoiceList(): Promise<VoiceListResponse> {
    try {
      const response = await fetch(apis.getVoiceList, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('語音列表數據:', data.listData);
        return {
          success: true,
          code: 200,
          message: '獲取語音列表成功',
          data: data.listData,
        };
      } else {
        const errorMessage = `獲取語音列表失敗：HTTP狀態碼 ${response.status}`;
        console.error(errorMessage);
        return { success: false, code: response.status, message: errorMessage };
      }
    } catch (error) {
      console.error('獲取語音列表過程中發生錯誤：', error);
      return {
        success: false,
        code: 500,
        message: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }
}
