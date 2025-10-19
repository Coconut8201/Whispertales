/**
 * 故事相關 API 服務
 * 負責所有與故事生成、獲取、管理相關的 API 請求
 */

import { apis } from "../utils/tools/api";
import type {
  Story,
  BookManageList,
  StoryOwnershipResponse,
  GenImagePromptResponse,
} from "../types/story";

export class StoryService {
  /**
   * 生成故事
   * @param roleForm - 角色表單數據
   * @param voiceModelName - 語音模型名稱
   * @returns 生成的故事數據
   */
  static async generateStory(
    roleForm: Object,
    voiceModelName: string,
  ): Promise<any> {
    const payload = {
      roleform: roleForm,
      voiceModelName: voiceModelName,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10分鐘超時

      const response = await fetch(apis.LLMGenStory, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json();
        return responseData;
      } else {
        console.error("提交失敗:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("提交時出錯:", error);
      return null;
    }
  }

  /**
   * 開始/獲取故事
   * @param storyId - 故事 ID
   * @returns 故事數據
   */
  static async startStory(storyId: string): Promise<Story | null> {
    try {
      const response = await fetch(apis.startStory, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId }),
      });

      if (!response.ok) {
        throw new Error(`StartStory error! status: ${response.status}`);
      }

      const storyData: Story = await response.json();
      return storyData;
    } catch (error) {
      console.error("StartStory, Failed to fetch story:", error);
      throw error;
    }
  }

  /**
   * 獲取故事列表
   * @returns 故事列表
   */
  static async getBookList(): Promise<BookManageList | null> {
    try {
      const response = await fetch(apis.GetStoryList, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData: {
        success: boolean;
        data?: BookManageList;
        message: string;
      } = await response.json();

      if (!response.ok || !responseData.data) {
        return null;
      }

      return responseData.data;
    } catch (error) {
      console.error("getBookList fail:", error);
      return null;
    }
  }

  /**
   * 驗證故事所有權
   * @param storyId - 故事 ID
   * @returns 驗證結果
   */
  static async verifyOwnership(
    storyId: string,
  ): Promise<StoryOwnershipResponse> {
    try {
      const response = await fetch(
        `${apis.verifyStoryOwnership}?storyId=${storyId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const responseData: { success: boolean; message: string } =
        await response.json();

      if (!response.ok || !responseData.success) {
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("verifyStoryOwnership fail:", error);
      return { success: false };
    }
  }

  /**
   * 生成圖片提示詞
   * @param storyArray - 故事文本陣列
   * @param storyId - 故事 ID
   * @param roleform - 角色表單
   * @returns 生成結果
   */
  static async generateImagePrompt(
    storyArray: string[],
    storyId: string,
    roleform: any,
  ): Promise<GenImagePromptResponse> {
    try {
      const response = await fetch(apis.GenImagePrompt, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyArray,
          storyId,
          roleform,
        }),
      });

      const responseData: { success: boolean; message: string } =
        await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          message: responseData.message || `HTTP Error: ${response.status}`,
        };
      }

      return { success: true, message: responseData.message };
    } catch (error) {
      console.error("genImagePrompt fail:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "生成圖片提示詞失敗",
      };
    }
  }

  // 註：getAllSDModels 方法已移除，因為不再使用 Stable Diffusion 模型
  // 圖片風格現在使用本地定義的 picStyleList
}
