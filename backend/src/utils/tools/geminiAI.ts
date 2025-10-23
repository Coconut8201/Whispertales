import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export interface GeminiConfig {
  model?: string; // 預設使用 gemini-2.5-flash-image
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseModalities?: ("TEXT" | "IMAGE")[];
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

    // 構建 generationConfig
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

    // 添加 imageConfig（圖片生成配置）
    if (config?.aspectRatio) {
      generationConfig.imageConfig = {
        aspectRatio: config.aspectRatio,
      };
    }

    console.log("[GeminiAI] 初始化配置:", {
      model: modelName,
      config: generationConfig,
    });

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
      console.log("[GeminiAI] 開始生成內容，提示詞長度:", prompt.length);

      const result = await this.model.generateContent(prompt);
      const response = result.response;

      console.log(
        "[GeminiAI] 收到回應，candidates 數量:",
        response.candidates?.length,
      );

      // 🔍 詳細檢查回應結構
      if (response.candidates && response.candidates.length > 0) {
        console.log(
          "[GeminiAI] 第一個 candidate 的 parts 數量:",
          response.candidates[0].content.parts.length,
        );

        // 打印每個 part 的類型
        response.candidates[0].content.parts.forEach((part, idx) => {
          const partKeys = Object.keys(part);
          console.log(`[GeminiAI] Part ${idx} 包含的鍵:`, partKeys);

          if ("text" in part) {
            console.log(
              `[GeminiAI] Part ${idx} 是文字，長度:`,
              part.text?.length,
            );
          }
          if ("inlineData" in part) {
            console.log(
              `[GeminiAI] Part ${idx} 是 inlineData，mimeType:`,
              part.inlineData?.mimeType,
            );
          }
        });
      }

      const content: GeneratedContent = {};

      // 提取文字部分
      try {
        content.text = response.text();
        console.log("[GeminiAI] 文字內容長度:", content.text.length);
      } catch (e) {
        console.log("[GeminiAI] 無文字內容");
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
            console.log(
              "[GeminiAI] 找到圖片，mimeType:",
              part.inlineData.mimeType,
              "，data 長度:",
              part.inlineData.data.length,
            );
          }
        }
      }

      if (images.length > 0) {
        content.images = images;
        console.log("[GeminiAI] ✅ 總共生成", images.length, "張圖片");
      } else {
        console.log("[GeminiAI] ⚠️ 沒有生成圖片");
        console.log(
          "[GeminiAI] 完整 response 結構:",
          JSON.stringify(response, null, 2),
        );
      }

      return content;
    } catch (error) {
      console.error("[GeminiAI] 生成內容失敗:", error);
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
   * 同時生成圖片和文字
   * 根據 Google Gemini 官方文檔配置，設定 responseModalities 為 ["TEXT", "IMAGE"]
   *
   * 最佳實踐：
   * - 使用敘事性描述，而不是關鍵字列表
   * - 提供圖片用途的上下文資訊
   * - 使用攝影術語（如：鏡頭類型、燈光、景深等）
   * - 避免負面描述，改用正面描述
   *
   * @param prompt 提示詞（同時要求文字描述和圖片生成）
   * @param aspectRatio 圖片長寬比（預設 1:1，支援 3:4, 4:3, 9:16, 16:9）
   * @returns 包含文字和圖片的內容物件
   */
  async generateImageWithText(
    prompt: string,
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
  ): Promise<GeneratedContent> {
    try {
      console.log("[GeminiAI] 🎨 開始同時生成圖片和文字");
      console.log("[GeminiAI] 提示詞長度:", prompt.length);
      console.log("[GeminiAI] 圖片長寬比:", aspectRatio);

      const generationConfig: any = {
        temperature: this.config?.temperature ?? 0.9,
        topK: this.config?.topK ?? 1,
        topP: this.config?.topP ?? 1,
        maxOutputTokens: this.config?.maxOutputTokens ?? 2048,
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      };

      const multiModalModel = this.genAI.getGenerativeModel({
        model: this.config?.model || this.defaultModel,
        generationConfig,
      });

      const result = await multiModalModel.generateContent(prompt);
      const response = result.response;

      console.log(
        "[GeminiAI] 收到回應，candidates 數量:",
        response.candidates?.length,
      );

      const content: GeneratedContent = {};

      try {
        content.text = response.text();
        console.log("[GeminiAI] 文字長度:", content.text.length);
      } catch (e) {
        console.log("[GeminiAI] ⚠️ 無法提取文字內容", e);
      }

      const images: ImagePart[] = [];
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
          if ("inlineData" in part && part.inlineData) {
            const image: ImagePart = {
              mimeType: part.inlineData.mimeType || "image/png",
              data: part.inlineData.data,
            };
            images.push(image);
            console.log(
              "[GeminiAI] 找到圖片，類型:",
              image.mimeType,
              "，Base64 長度:",
              image.data.length,
            );
          }
        }
      }

      if (images.length > 0) {
        content.images = images;
        console.log("[GeminiAI] ✅ 成功生成", images.length, "張圖片");
      } else {
        console.log("[GeminiAI] ⚠️ 未生成圖片");
      }

      // ✅ 驗證至少有內容返回
      if (!content.text && (!content.images || content.images.length === 0)) {
        console.error(
          "[GeminiAI] ❌ 完整 response:",
          JSON.stringify(response, null, 2),
        );
        throw new Error("Gemini AI 未返回任何內容（無文字也無圖片）");
      }

      console.log(
        "[GeminiAI] 🎉 生成完成 - 文字:",
        !!content.text,
        "，圖片:",
        content.images?.length || 0,
        "張",
      );

      return content;
    } catch (error) {
      console.error("[GeminiAI] ❌ 同時生成圖片和文字失敗:", error);
      throw new Error(`Gemini AI 圖文生成失敗: ${error}`);
    }
  }

  /**
   * 🌊 串流同時生成圖片和文字
   * 文字會逐步串流輸出，圖片會在生成完成時一次性返回
   *
   * 📌 使用場景：
   * - 需要即時顯示文字內容給使用者
   * - 圖片生成時間較長，希望先看到文字描述
   *
   * @param prompt 提示詞（同時要求文字描述和圖片生成）
   * @param aspectRatio 圖片長寬比（預設 1:1）
   * @returns 串流區塊（包含逐步文字和最終圖片）
   *
   * @example
   * ```typescript
   * for await (const chunk of gemini.generateImageWithTextStream(
   *   "描述一個美麗的日落場景，並生成對應的插圖",
   *   "16:9"
   * )) {
   *   if (chunk.text) {
   *     console.log("文字片段:", chunk.text);
   *   }
   *   if (chunk.image) {
   *     console.log("收到圖片:", chunk.image.mimeType);
   *   }
   *   if (chunk.isComplete) {
   *     console.log("生成完成！");
   *   }
   * }
   * ```
   */
  async *generateImageWithTextStream(
    prompt: string,
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
  ): AsyncGenerator<StreamChunk> {
    try {
      console.log("[GeminiAI] 🌊 開始串流生成圖片和文字");
      console.log("[GeminiAI] 提示詞長度:", prompt.length);
      console.log("[GeminiAI] 圖片長寬比:", aspectRatio);

      // 🔑 創建專門的模型實例，配置為同時返回文字和圖片
      const generationConfig: any = {
        temperature: this.config?.temperature ?? 0.9,
        topK: this.config?.topK ?? 1,
        topP: this.config?.topP ?? 1,
        maxOutputTokens: this.config?.maxOutputTokens ?? 2048,
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      };

      const multiModalModel = this.genAI.getGenerativeModel({
        model: this.config?.model || this.defaultModel,
        generationConfig,
      });

      const result = await multiModalModel.generateContentStream(prompt);

      let textChunkCount = 0;
      let imageCount = 0;

      for await (const chunk of result.stream) {
        const streamChunk: StreamChunk = { isComplete: false };

        try {
          const text = chunk.text();
          if (text) {
            streamChunk.text = text;
            textChunkCount++;
            console.log(
              `[GeminiAI] 文字片段 #${textChunkCount}，長度:`,
              text.length,
            );
          }
        } catch (error) {
          // 某些 chunk 可能沒有文字
          console.error(`[GeminiAI] error: ${error}`);
        }

        for (const candidate of chunk.candidates || []) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData) {
              streamChunk.image = {
                mimeType: part.inlineData.mimeType || "image/png",
                data: part.inlineData.data,
              };
              imageCount++;
            }
          }
        }

        yield streamChunk;
      }

      // 發送完成信號
      console.log(
        `[GeminiAI] 🎉 串流完成 - 文字片段: ${textChunkCount}，圖片: ${imageCount}`,
      );
      yield { isComplete: true };
    } catch (error) {
      console.error("[GeminiAI] 串流生成圖片和文字失敗:", error);
      throw new Error(`Gemini AI 串流圖文生成失敗: ${error}`);
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
