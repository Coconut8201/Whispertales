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
   * 生成故事 - 串流版本（推薦使用）
   * 使用 Server-Sent Events (SSE) 即時接收生成的故事內容
   * @param roleForm - 角色表單數據
   * @param voiceModelName - 語音模型名稱（可選，語音功能開發中）
   * @param callbacks - 回調函數
   * @param callbacks.onStory - 收到故事片段時觸發 (content: string, progress: number)
   * @param callbacks.onImages - 收到圖片時觸發 (images: string[])
   * @param callbacks.onStatus - 收到狀態更新時觸發 (message: string)
   * @param callbacks.onComplete - 生成完成時觸發 (metadata: any)
   * @param callbacks.onError - 發生錯誤時觸發 (error: string)
   * @returns 返回一個 abort 函數，可用於取消請求
   * @example
   * const abort = await StoryService.generateStoryStream(
   *   roleForm,
   *   voiceModelName,
   *   {
   *     onStory: (content, progress) => {
   *       setStoryContent(prev => prev + content);
   *       setProgress(progress);
   *     },
   *     onImages: (images) => setImages(images),
   *     onComplete: (metadata) => console.log('完成', metadata),
   *     onError: (error) => console.error('錯誤', error)
   *   }
   * );
   */
  static async generateStoryStream(
    roleForm: Object,
    voiceModelName: string | undefined,
    callbacks: {
      onStory?: (content: string, progress: number) => void;
      onImages?: (images: string[]) => void;
      onStatus?: (message: string) => void;
      onComplete?: (metadata: any) => void;
      onError?: (error: string) => void;
    },
  ): Promise<() => void> {
    const payload: any = {
      roleform: roleForm,
      stream: true, // 啟用串流模式
    };

    // 只有在提供 voiceModelName 時才加入
    if (voiceModelName) {
      payload.voiceModelName = voiceModelName;
    }

    const controller = new AbortController();

    try {
      const response = await fetch(apis.LLMGenStory, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("無法建立 stream reader");
      }

      // 在背景處理串流數據
      (async () => {
        try {
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // 解碼數據並加到緩衝區
            buffer += decoder.decode(value, { stream: true });

            // 處理完整的 SSE 訊息 (以 \n\n 分隔)
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || ""; // 保留未完成的訊息

            for (const message of messages) {
              if (!message.trim() || !message.startsWith("data: ")) {
                continue;
              }

              try {
                const jsonStr = message.replace(/^data: /, "");
                const data = JSON.parse(jsonStr);

                switch (data.type) {
                  case "connected":
                    callbacks.onStatus?.(data.message);
                    break;

                  case "story":
                    callbacks.onStory?.(data.content, data.progress);
                    break;

                  case "images":
                    callbacks.onImages?.(data.images);
                    break;

                  case "status":
                    callbacks.onStatus?.(data.message);
                    break;

                  case "complete":
                    callbacks.onComplete?.(data.metadata);
                    break;

                  case "error":
                    callbacks.onError?.(data.message);
                    break;
                }
              } catch (parseError) {
                console.error("解析 SSE 訊息失敗:", parseError, message);
              }
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("讀取串流時出錯:", error);
            callbacks.onError?.(error.message);
          }
        } finally {
          reader.releaseLock();
        }
      })();
    } catch (error) {
      console.error("建立串流連接時出錯:", error);
      callbacks.onError?.(error instanceof Error ? error.message : "未知錯誤");
    }

    // 返回 abort 函數
    return () => controller.abort();
  }

  /**
   * 生成故事 - 非串流版本（保留相容性）
   * @param roleForm - 角色表單數據
   * @param voiceModelName - 語音模型名稱（可選，語音功能開發中）
   * @returns 生成的故事數據
   */
  static async generateStory(
    roleForm: Object,
    voiceModelName?: string,
  ): Promise<any> {
    const payload: any = {
      roleform: roleForm,
      stream: false, // 使用非串流模式
    };

    // 只有在提供 voiceModelName 時才加入
    if (voiceModelName) {
      payload.voiceModelName = voiceModelName;
    }

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
