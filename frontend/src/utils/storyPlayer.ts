// 故事播放相關的工具函數
import {
  StartStory_api,
  GetVoice,
  makeZhuyin,
  verifyStoryOwnership,
} from "./tools/fetch";

export interface StoryData {
  storyTale: string;
  storyInfo: string;
  image_prompt?: string[];
  image_base64?: string[];
  is_favorite: boolean;
  addDate: Date;
}

export interface AudioState {
  isPlaying: boolean;
  currentPage: number;
  audioUrls: string[];
  currentAudio: HTMLAudioElement | null;
}

/**
 * 故事數據管理類
 */
export class StoryDataManager {
  /**
   * 載入故事數據
   */
  static async loadStory(storyId: string): Promise<{
    success: boolean;
    data?: StoryData;
    message?: string;
  }> {
    try {
      // 驗證故事所有權
      const ownership = await verifyStoryOwnership(storyId);
      if (!ownership.success) {
        return {
          success: false,
          message: "無權限訪問此故事",
        };
      }

      // 載入故事數據
      const result = await StartStory_api(storyId);
      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "載入故事失敗",
        };
      }
    } catch (error) {
      console.error("載入故事錯誤:", error);
      return {
        success: false,
        message: "載入故事時發生錯誤",
      };
    }
  }

  /**
   * 處理故事文本，拆分為頁面
   */
  static processStoryText(storyTale: string): string[] {
    if (!storyTale) return [];

    // 按換行符分割故事
    const lines = storyTale.split("\n").filter((line) => line.trim() !== "");

    // 每頁顯示適當數量的文字
    const linesPerPage = 3;
    const pages: string[] = [];

    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageText = lines.slice(i, i + linesPerPage).join("\n");
      pages.push(pageText);
    }

    return pages;
  }

  /**
   * 為故事文本添加注音
   */
  static async addZhuyin(text: string): Promise<string> {
    try {
      const result = await makeZhuyin(text);
      // makeZhuyin 返回 string[][] | { error: boolean; message: string }
      if (Array.isArray(result)) {
        // 如果是 string[][]，轉換為文本
        return result.map((line) => line.join("")).join("\n");
      } else {
        // 如果是錯誤對象，返回原文本
        console.error("添加注音失敗:", result.message);
        return text;
      }
    } catch (error) {
      console.error("添加注音失敗:", error);
      return text;
    }
  }
}

/**
 * 音頻播放管理類
 */
export class AudioPlayerManager {
  private audioUrls: string[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private currentPage: number = 0;
  private isPlaying: boolean = false;
  private onStateChange?: (state: AudioState) => void;

  constructor(onStateChange?: (state: AudioState) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * 初始化音頻URLs
   */
  async initializeAudio(storyLines: string[], storyId: string): Promise<void> {
    try {
      this.audioUrls = [];

      for (let i = 0; i < storyLines.length; i++) {
        const line = storyLines[i];
        if (line.trim()) {
          const audioBlob = await GetVoice(storyId, i);
          if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            this.audioUrls.push(audioUrl);
          } else {
            this.audioUrls.push(""); // 空音頻URL
          }
        } else {
          this.audioUrls.push(""); // 空音頻URL
        }
      }

      this.notifyStateChange();
    } catch (error) {
      console.error("初始化音頻失敗:", error);
    }
  }

  /**
   * 播放指定頁面的音頻
   */
  playPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= this.audioUrls.length) return;

    this.stopCurrent();

    const audioUrl = this.audioUrls[pageIndex];
    if (!audioUrl) return;

    this.currentAudio = new Audio(audioUrl);
    this.currentPage = pageIndex;
    this.isPlaying = true;

    this.currentAudio.addEventListener("ended", () => {
      this.isPlaying = false;
      this.notifyStateChange();
    });

    this.currentAudio.addEventListener("error", (e) => {
      console.error("音頻播放錯誤:", e);
      this.isPlaying = false;
      this.notifyStateChange();
    });

    this.currentAudio.play().catch((error) => {
      console.error("播放音頻失敗:", error);
      this.isPlaying = false;
      this.notifyStateChange();
    });

    this.notifyStateChange();
  }

  /**
   * 停止當前播放
   */
  stopCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.notifyStateChange();
  }

  /**
   * 播放所有頁面
   */
  playAll(): void {
    this.playSequential(0);
  }

  /**
   * 順序播放
   */
  private playSequential(startIndex: number): void {
    if (startIndex >= this.audioUrls.length) {
      this.isPlaying = false;
      this.notifyStateChange();
      return;
    }

    const audioUrl = this.audioUrls[startIndex];
    if (!audioUrl) {
      this.playSequential(startIndex + 1);
      return;
    }

    this.stopCurrent();
    this.currentAudio = new Audio(audioUrl);
    this.currentPage = startIndex;
    this.isPlaying = true;

    this.currentAudio.addEventListener("ended", () => {
      this.playSequential(startIndex + 1);
    });

    this.currentAudio.addEventListener("error", () => {
      this.playSequential(startIndex + 1);
    });

    this.currentAudio.play().catch((error) => {
      console.error("播放音頻失敗:", error);
      this.playSequential(startIndex + 1);
    });

    this.notifyStateChange();
  }

  /**
   * 獲取當前狀態
   */
  getState(): AudioState {
    return {
      isPlaying: this.isPlaying,
      currentPage: this.currentPage,
      audioUrls: this.audioUrls,
      currentAudio: this.currentAudio,
    };
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    this.stopCurrent();
    this.audioUrls = [];
  }

  /**
   * 通知狀態變化
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}

/**
 * 創建音頻播放器的工廠函數
 */
export const createAudioPlayer = (
  onStateChange?: (state: AudioState) => void,
): AudioPlayerManager => {
  return new AudioPlayerManager(onStateChange);
};
