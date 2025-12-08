import { Controller } from "../interfaces/Controller";
import { Request, Response } from "express";
import { storyInterface } from "../interfaces/storyInterface";
import { UserService } from "../database";
import { GeminiAI } from "../utils/tools/geminiAI";
import PQueue from "p-queue";
import { getCurrentUserId } from "../utils/authHelpers";
import { asyncHandler } from "../middleware/errorMiddleware";
import { StoryRequestBody } from "../types/story";
import { GridFSStorageService } from "../services/GridFSStorageService";
import { StoryService } from "../database/services/StoryService";
import { buildStoryPrompt } from "../utils/storyPrompt";

export class StoryController extends Controller {
  queue = new PQueue({ concurrency: 1 }); // 限制為1個並發請求

  // 創建共用的 Gemini 實例 - 支援圖片和文字生成
  private gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: "gemini-2.5-flash-image",
    temperature: 0.9,
    responseModalities: ["TEXT", "IMAGE"], // 同時生成文字和圖片
    aspectRatio: "1:1", // 圖片比例（橫向適合繪本）
    maxOutputTokens: 4096,
  });

  public test(req: Request, res: Response) {
    return res.success("This is storyController");
  }

  /**
   * 測試基本的Gemini API 連線是否正確
   * Controller 層方法 - 只處理 HTTP 邏輯
   */
  public testGeminiApi = asyncHandler(async (req: Request, res: Response) => {
    // 直接使用共用實例
    const result = await this.gemini.generateText("Hello, world!");
    res.success(result, "This is StoryController");
  });

  /**
   * 測試多張圖片生成功能
   * @param Request body { prompt: string, count?: number, aspectRatio?: string, stream?: boolean }
   * @example POST http://localhost:7943/story/test_multiple_images
   * {
   *   "prompt": "A beautiful sunset over mountains",
   *   "count": 3,
   *   "aspectRatio": "16:9",
   *   "stream": false
   * }
   */
  public testMultipleImages = asyncHandler(
    async (req: Request, res: Response) => {
      const {
        prompt = "A beautiful sunset over mountains",
        count = 2,
        aspectRatio = "1:1",
        stream = false,
      } = req.body;

      // 驗證參數
      const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (!validAspectRatios.includes(aspectRatio)) {
        return res.error(
          `無效的 aspectRatio，請使用: ${validAspectRatios.join(", ")}`,
          400,
        );
      }

      if (count < 1 || count > 10) {
        return res.error("count 必須在 1-10 之間", 400);
      }

      try {
        if (stream) {
          // 串流模式
          console.log(`[testMultipleImages] 開始串流生成 ${count} 張圖片`);

          // 設定 SSE headers
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("X-Accel-Buffering", "no");

          // 發送初始連接確認
          res.write(
            `data: ${JSON.stringify({
              type: "connected",
              message: `開始生成 ${count} 張圖片...`,
              config: { prompt, count, aspectRatio },
            })}\n\n`,
          );

          let imageCount = 0;
          const startTime = Date.now();

          for await (const chunk of this.gemini.generateMultipleImagesStream(
            prompt,
            count,
            aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
          )) {
            if (chunk.image) {
              imageCount++;
              const imageWithPrefix = `data:${chunk.image.mimeType};base64,${chunk.image.data}`;

              res.write(
                `data: ${JSON.stringify({
                  type: "image",
                  image: imageWithPrefix,
                  imageNumber: imageCount,
                  totalCount: count,
                  mimeType: chunk.image.mimeType,
                  dataLength: chunk.image.data.length,
                })}\n\n`,
              );

              console.log(
                `[testMultipleImages] 已發送第 ${imageCount}/${count} 張圖片`,
              );
            }

            if (chunk.isComplete) {
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
              res.write(
                `data: ${JSON.stringify({
                  type: "complete",
                  message: "所有圖片生成完成",
                  totalImages: imageCount,
                  elapsedTime: `${elapsed}秒`,
                })}\n\n`,
              );
              console.log(
                `[testMultipleImages] 串流完成，總耗時: ${elapsed}秒`,
              );
            }
          }

          res.end();
        } else {
          // 非串流模式 - 收集所有生成的圖片
          console.log(`[testMultipleImages] 開始批次生成 ${count} 張圖片`);
          const startTime = Date.now();

          const images: Array<{
            dataUri: string;
            mimeType: string;
            size: number;
          }> = [];

          // 迭代 async generator 來收集所有圖片
          for await (const chunk of this.gemini.generateMultipleImagesStream(
            prompt,
            count,
            aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
          )) {
            if (chunk.image) {
              images.push({
                dataUri: `data:${chunk.image.mimeType};base64,${chunk.image.data}`,
                mimeType: chunk.image.mimeType,
                size: chunk.image.data.length,
              });
              console.log(
                `[testMultipleImages] 已收到第 ${images.length}/${count} 張圖片`,
              );
            }
          }

          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

          console.log(
            `[testMultipleImages] 批次生成完成，總耗時: ${elapsed}秒`,
          );

          return res.success(
            {
              images,
              metadata: {
                prompt,
                count: images.length,
                aspectRatio,
                elapsedTime: `${elapsed}秒`,
                averageTimePerImage: `${(parseFloat(elapsed) / images.length).toFixed(2)}秒`,
              },
            },
            `成功生成 ${images.length} 張圖片`,
          );
        }
      } catch (error) {
        console.error("[testMultipleImages] 錯誤:", error);

        if (stream) {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: "圖片生成失敗",
              error: String(error),
            })}\n\n`,
          );
          res.end();
        } else {
          return res.error("圖片生成失敗", 500, { error: String(error) });
        }
      }
    },
  );

  /**
   * 透過storyId取得故事資訊
   */
  public GetStoryByStoryId = asyncHandler(
    async (req: Request, res: Response) => {
      // TODO 這邊可以改用param
      const { storyId } = req.body;
      const story: storyInterface = (await StoryService.getStoryByStoryId(
        storyId,
      )) as storyInterface;
      res.success(story, "成功透過 storyId 拿取故事");
    },
  );

  //拿資料庫故事
  public async GetStorylistFDB(req: Request, res: Response) {}

  /**
   * 使用 Gemini AI 生成繪本（包含故事文字和圖片）- SSE 串流版本
   * @param Request roleform 故事角色設定, voiceModelName 語音模型名稱, stream 是否使用串流模式
   * @example POST http://localhost:7943/story/genstory
   * {
   *   "roleform": {
   *     "style": "童話風格",
   *     "mainCharacter": "小兔子",
   *     "description": "一隻勇敢的小兔子",
   *     "otherCharacters": ["小狗", "小貓"]
   *   },
   *   "voiceModelName": "default_voice",
   *   "stream": true
   * }
   */
  public GenStory = asyncHandler(async (req: Request, res: Response) => {
    const {
      roleform,
      voiceModelName,
      stream = false,
    } = req.body as StoryRequestBody & { stream?: boolean };
    const userId = getCurrentUserId(req);

    try {
      // 構建故事生成提示詞
      const prompt = buildStoryPrompt(roleform);

      // 如果請求串流模式
      if (stream) {
        console.log("Stream mode enabled");

        // 設定 SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // 禁用 nginx 緩衝

        // 發送初始連接確認
        res.write(
          `data: ${JSON.stringify({ type: "connected", message: "開始生成故事..." })}\n\n`,
        );

        try {
          let fullText = "";
          const imageBase64Array: string[] = [];

          for await (const chunk of this.gemini.generateImageWithTextStream(
            prompt,
            "1:1",
          )) {
            // 處理文字片段
            if (chunk.text) {
              fullText += chunk.text;
              res.write(
                `data: ${JSON.stringify({
                  type: "story",
                  content: chunk.text,
                })}\n\n`,
              );
            }

            // 處理圖片（當 Gemini 完成圖片生成時）
            if (chunk.image) {
              const imageWithPrefix = `data:${chunk.image.mimeType};base64,${chunk.image.data}`;
              imageBase64Array.push(imageWithPrefix);

              // 立即發送圖片給前端（不等待所有圖片生成完）
              res.write(
                `data: ${JSON.stringify({
                  type: "image",
                  image: imageWithPrefix,
                  currentCount: imageBase64Array.length,
                })}\n\n`,
              );
            }

            // 完成信號
            if (chunk.isComplete) {
              console.log(
                `[GenStory Stream] 串流完成 - 文字: ${fullText.length} 字，圖片: ${imageBase64Array.length} 張`,
              );
            }
          }

          // 驗證是否有內容
          if (!fullText) {
            res.write(
              `data: ${JSON.stringify({ type: "error", message: "故事生成失敗：未收到文字內容" })}\n\n`,
            );
            res.end();
            return;
          }

          // 儲存到資料庫
          res.write(
            `data: ${JSON.stringify({ type: "status", message: "正在保存故事..." })}\n\n`,
          );

          const storyInfo = JSON.stringify({
            roleform,
            voiceModelName: voiceModelName || "default",
            title: this.extractTitleFromStory(fullText),
            createdAt: new Date().toISOString(),
          });

          // 1. 創建故事文檔
          const storyId = await StoryService.createStory(fullText, storyInfo);

          if (!storyId) {
            res.write(
              `data: ${JSON.stringify({ type: "error", message: "故事保存失敗" })}\n\n`,
            );
            res.end();
            return;
          }

          // 2. 添加到用戶書單
          const addResult = await UserService.addStoryToUser(storyId, userId);
          if (!addResult || !addResult.success) {
            res.write(
              `data: ${JSON.stringify({ type: "error", message: "無法添加到書單" })}\n\n`,
            );
            res.end();
            return;
          }

          // 3. 保存圖片到 GridFS
          if (imageBase64Array.length > 0) {
            res.write(
              `data: ${JSON.stringify({
                type: "status",
                message: `正在保存 ${imageBase64Array.length} 張圖片...`,
              })}\n\n`,
            );

            try {
              const fileIds =
                await GridFSStorageService.saveImagesFromBase64Array(
                  imageBase64Array,
                  storyId,
                );
              await StoryService.updateImageFileIds(storyId, fileIds);

              res.write(
                `data: ${JSON.stringify({
                  type: "status",
                  message: `已保存 ${fileIds.length}/${imageBase64Array.length} 張圖片`,
                })}\n\n`,
              );
            } catch (error) {
              console.error("[GenStory Stream] 保存圖片失敗:", error);
              res.write(
                `data: ${JSON.stringify({
                  type: "warning",
                  message: "圖片保存失敗，但故事已保存",
                })}\n\n`,
              );
            }
          }

          // 發送完成信號
          res.write(
            `data: ${JSON.stringify({
              type: "complete",
              message: "🎉 繪本生成完成",
              storyId,
              metadata: {
                roleform,
                voiceModelName,
                textLength: fullText.length,
                imageCount: imageBase64Array.length,
              },
            })}\n\n`,
          );

          res.end();
        } catch (error) {
          console.error("GenStory 串流錯誤:", error);
          res.write(
            `data: ${JSON.stringify({ type: "error", message: "繪本生成失敗", error: String(error) })}\n\n`,
          );
          res.end();
        }
      } else {
        // 非串流模式 - 使用同步圖文生成 API
        const content = await this.gemini.generateImageWithText(prompt, "1:1");

        if (!content.text) {
          return res.error("故事生成失敗：未收到文字內容", 500);
        }

        // 處理生成的圖片 - 轉換為 base64（帶 data URI 前綴）
        const imageBase64Array: string[] = [];
        if (content.images && content.images.length > 0) {
          imageBase64Array.push(
            ...content.images.map(
              (img) => `data:${img.mimeType};base64,${img.data}`,
            ),
          );
          console.log(`[GenStory] 生成了 ${imageBase64Array.length} 張圖片`);
        }

        // 儲存到資料庫
        const storyInfo = JSON.stringify({
          roleform,
          voiceModelName: voiceModelName || "default",
          title: this.extractTitleFromStory(content.text),
          createdAt: new Date().toISOString(),
        });

        const storyId = await StoryService.createStory(content.text, storyInfo);

        if (!storyId) {
          return res.error("故事保存失敗", 500);
        }

        // 重要：先將故事添加到用戶書單，確保權限驗證
        // 必須在返回響應前完成，否則用戶無法訪問故事
        const addResult = await UserService.addStoryToUser(storyId, userId);
        if (!addResult || !addResult.success) {
          console.error(
            `[GenStory] 無法將故事 ${storyId} 添加到用戶 ${userId} 的書單`,
          );
          // 刪除已創建的故事，避免孤立數據
          // await DataBase.deleteStory(storyId); // 可選：清理孤立故事
          return res.error("故事保存失敗：無法添加到書單", 500);
        }

        // 使用 GridFS 保存圖片
        if (imageBase64Array.length > 0) {
          try {
            console.log(
              `[GenStory] 使用 GridFS 保存 ${imageBase64Array.length} 張圖片`,
            );

            // 批量保存圖片到 GridFS
            const fileIds =
              await GridFSStorageService.saveImagesFromBase64Array(
                imageBase64Array,
                storyId,
              );

            // 更新 Story 文檔，保存 GridFS file IDs
            await StoryService.updateImageFileIds(storyId, fileIds);

            console.log(`[GenStory] 圖片保存成功: ${fileIds.length} 個文件`);
          } catch (error) {
            console.error("[GenStory] 保存圖片失敗:", error);
            // 圖片保存失敗不影響故事本身
          }
        }

        return res.success(
          {
            storyId,
            story: content.text,
            images: imageBase64Array, // 直接返回 base64
            metadata: {
              roleform,
              voiceModelName,
            },
          },
          "繪本生成成功",
        );
      }
    } catch (error) {
      console.error("GenStory 錯誤:", error);
      return res.error("繪本生成失敗", 500, { error: String(error) });
    }
  });

  /**
   * 將故事文字分割成句子陣列（用於串流傳送）
   */
  private splitStoryIntoSentences(text: string): string[] {
    // 按照句號、驚嘆號、問號分割，保留標點符號
    const sentences = text.match(/[^。！?]+[。！?]+/g) || [text];
    return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  /**
   * 從故事文字中提取標題（取前 20 個字或第一行）
   */
  private extractTitleFromStory(story: string): string {
    const firstLine = story.split("\n")[0];
    return firstLine.length > 20
      ? firstLine.substring(0, 20) + "..."
      : firstLine;
  }
}
