import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export interface GeminiConfig {
  model?: string; // 預設使用 gemini-2.5-flash-image
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseModalities?: ("TEXT" | "IMAGE")[]; // 回應模態：文字、圖片或兩者
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"; // 圖片長寬比
}

export interface ImagePart {
  mimeType: string;
  data: string; // base64 編碼的圖片資料
}

export interface GeneratedContent {
  text?: string;
  images?: ImagePart[];
}

export interface StreamChunk {
  text?: string;
  image?: ImagePart;
  isComplete: boolean;
}

export class GeminiAI {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private defaultModel: string = "gemini-2.5-flash-image";
  private config?: GeminiConfig;

  constructor(apiKey: string, config?: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.config = config;
    const modelName = config?.model || this.defaultModel;

    // 構建 generationConfig（不包含 imageGenerationConfig，因為 API 不支援）
    const generationConfig: any = {
      temperature: config?.temperature ?? 0.9,
      topK: config?.topK ?? 1,
      topP: config?.topP ?? 1,
      maxOutputTokens: config?.maxOutputTokens ?? 2048,
    };

    // 添加 responseModalities（如果有設定）
    if (config?.responseModalities) {
      generationConfig.responseModalities = config.responseModalities;
    }

    // 注意：aspectRatio 參數目前不被 API 支援，暫時移除
    // 圖片會使用預設尺寸生成

    // 初始化模型
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });
  }

  /**
   * 生成文字回應
   * @param prompt 使用者提示詞
   * @returns 生成的文字內容
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini AI 生成失敗: ${error}`);
    }
  }

  /**
   * 生成內容（文字 + 圖片）
   * @param prompt 使用者提示詞
   * @returns 包含文字和圖片的生成內容
   */
  async generateContent(prompt: string): Promise<GeneratedContent> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      const content: GeneratedContent = {};

      // 提取文字部分
      try {
        content.text = response.text();
      } catch (e) {
        // 如果沒有文字部分，忽略錯誤
      }

      // 提取圖片部分
      const images: ImagePart[] = [];
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
          if ("inlineData" in part && part.inlineData) {
            images.push({
              mimeType: part.inlineData.mimeType || "image/png",
              data: part.inlineData.data,
            });
          }
        }
      }

      if (images.length > 0) {
        content.images = images;
      }

      return content;
    } catch (error) {
      throw new Error(`Gemini AI 生成內容失敗: ${error}`);
    }
  }

  /**
   * 串流生成文字回應
   * @param prompt 使用者提示詞
   * @returns 生成的文字串流
   */
  async *generateTextStream(prompt: string): AsyncGenerator<string> {
    try {
      const result = await this.model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error) {
      throw new Error(`Gemini AI 串流生成失敗: ${error}`);
    }
  }

  /**
   * 串流生成內容（文字 + 圖片）
   * 文字會逐步串流，圖片會在生成完成時一次性返回
   * @param prompt 使用者提示詞
   * @returns 串流區塊
   */
  async *generateContentStream(prompt: string): AsyncGenerator<StreamChunk> {
    try {
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const streamChunk: StreamChunk = { isComplete: false };

        // 提取文字
        try {
          const text = chunk.text();
          if (text) {
            streamChunk.text = text;
          }
        } catch (e) {
          // 某些 chunk 可能沒有文字
        }

        // 檢查是否有圖片
        for (const candidate of chunk.candidates || []) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData) {
              streamChunk.image = {
                mimeType: part.inlineData.mimeType || "image/png",
                data: part.inlineData.data,
              };
            }
          }
        }

        yield streamChunk;
      }

      // 發送完成信號
      yield { isComplete: true };
    } catch (error) {
      throw new Error(`Gemini AI 串流生成內容失敗: ${error}`);
    }
  }

  /**
   * 多輪對話
   * @param history 對話歷史記錄
   * @returns 聊天會話
   */
  startChat(history?: Array<{ role: string; parts: string }>) {
    return this.model.startChat({
      history: history?.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    });
  }

  /**
   * 計算 token 數量
   * @param prompt 提示詞
   * @returns token 數量
   */
  async countTokens(prompt: string): Promise<number> {
    try {
      const result = await this.model.countTokens(prompt);
      return result.totalTokens;
    } catch (error) {
      throw new Error(`計算 token 失敗: ${error}`);
    }
  }

  /**
   * 儲存圖片到檔案
   * @param imageData base64 編碼的圖片資料
   * @param filePath 儲存路徑
   */
  saveImage(imageData: string, filePath: string): void {
    const fs = require("fs");
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync(filePath, buffer);
  }
}
