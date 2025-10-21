import { Controller } from "../interfaces/Controller";
import { Request, Response } from "express";
import { storyInterface } from "../interfaces/storyInterface";
import { DataBase } from "../utils/DataBase";
import { GeminiAI } from "../utils/tools/geminiAI";
import PQueue from "p-queue";
import { getCurrentUserId } from "../utils/authHelpers";
import { asyncHandler } from "../middleware/errorMiddleware";
import { RoleForm, StoryRequestBody } from "../types/story";
import { GridFSStorageService } from "../services/GridFSStorageService";
import { StoryService } from "../database/services/StoryService";

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
    res.send(result);
  });

  // 拿單一本書的資訊並回傳
  public async StartStory(Request: Request, Response: Response) {
    const { storyId } = Request.body;
    const story: storyInterface = await DataBase.getStoryById(storyId);
    Response.send(story);
  }

  //拿資料庫故事
  public async GetStorylistFDB(Request: Request, Response: Response) {
    try {
      // 使用工具函數獲取用戶 ID（自動驗證並拋出錯誤）
      const userId = getCurrentUserId(Request);
      const result = await DataBase.getstoryList(userId);
      if (result.success) {
        return Response.send({
          success: true,
          data: result.value,
        });
      } else {
        return Response.status(403).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("GetStorylistFDB fail:", error);
      return Response.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

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
      const prompt = this.buildStoryPrompt(roleform);

      // 如果請求串流模式
      if (stream) {
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
          // 使用 Gemini 生成故事（串流模式）
          const content = await this.gemini.generateContent(prompt);

          if (!content.text) {
            res.write(
              `data: ${JSON.stringify({ type: "error", message: "故事生成失敗：未收到文字內容" })}\n\n`,
            );
            res.end();
            return;
          }

          // 將故事文字分段傳送
          const sentences = this.splitStoryIntoSentences(content.text);
          for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            res.write(
              `data: ${JSON.stringify({
                type: "story",
                content: sentence,
                progress: Math.round(((i + 1) / sentences.length) * 100),
              })}\n\n`,
            );

            // 模擬漸進式生成效果（可選）
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // 處理生成的圖片
          const imageBase64Array: string[] = [];
          if (content.images && content.images.length > 0) {
            res.write(
              `data: ${JSON.stringify({ type: "status", message: "正在處理圖片..." })}\n\n`,
            );

            imageBase64Array.push(
              ...content.images.map(
                (img) => `data:${img.mimeType};base64,${img.data}`,
              ),
            );

            // 傳送圖片數據（前端立即顯示）
            res.write(
              `data: ${JSON.stringify({ type: "images", images: imageBase64Array })}\n\n`,
            );
          }

          // 儲存到資料庫
          res.write(
            `data: ${JSON.stringify({ type: "status", message: "正在保存故事..." })}\n\n`,
          );

          const storyInfo = JSON.stringify({
            roleform,
            voiceModelName: voiceModelName || "default",
            title: this.extractTitleFromStory(content.text),
            createdAt: new Date().toISOString(),
          });

          // 1. 創建故事文檔
          const storyId = await DataBase.SaveNewStory_returnID(
            content.text,
            storyInfo,
          );

          if (!storyId) {
            res.write(
              `data: ${JSON.stringify({ type: "error", message: "故事保存失敗" })}\n\n`,
            );
            res.end();
            return;
          }

          // 2. 添加到用戶書單
          const addResult = await DataBase.saveNewBookId(storyId, userId);
          if (!addResult || !addResult.success) {
            res.write(
              `data: ${JSON.stringify({ type: "error", message: "無法添加到書單" })}\n\n`,
            );
            res.end();
            return;
          }

          // 3. 保存圖片到 GridFS（後台執行，不阻塞前端渲染）
          if (imageBase64Array.length > 0) {
            res.write(
              `data: ${JSON.stringify({ type: "status", message: "正在保存圖片..." })}\n\n`,
            );

            try {
              const fileIds =
                await GridFSStorageService.saveImagesFromBase64Array(
                  imageBase64Array,
                  storyId,
                );
              await StoryService.updateImageFileIds(storyId, fileIds);

              res.write(
                `data: ${JSON.stringify({ type: "status", message: `已保存 ${fileIds.length} 張圖片` })}\n\n`,
              );
            } catch (error) {
              console.error("[GenStory Stream] 保存圖片失敗:", error);
              // 圖片保存失敗不影響主流程
            }
          }

          // 發送完成信號
          res.write(
            `data: ${JSON.stringify({
              type: "complete",
              message: "繪本生成完成",
              storyId, // 返回 storyId，前端可以用於導航
              metadata: {
                roleform,
                voiceModelName,
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
        // 非串流模式（保留原有邏輯）
        const content = await this.gemini.generateContent(prompt);

        if (!content.text) {
          return res.error("故事生成失敗：未收到文字內容", 500);
        }

        // 處理生成的圖片 - 轉換為 base64
        const imageBase64Array: string[] = [];
        if (content.images && content.images.length > 0) {
          imageBase64Array.push(
            ...content.images.map(
              (img) => `data:${img.mimeType};base64,${img.data}`,
            ),
          );
        }

        // 儲存到資料庫
        const storyInfo = JSON.stringify({
          roleform,
          voiceModelName: voiceModelName || "default",
          title: this.extractTitleFromStory(content.text),
          createdAt: new Date().toISOString(),
        });

        // 使用 DataBase.SaveNewStory_returnID 儲存故事文本
        const storyId = await DataBase.SaveNewStory_returnID(
          content.text,
          storyInfo,
        );

        if (!storyId) {
          return res.error("故事保存失敗", 500);
        }

        // ⚠️ 重要：先將故事添加到用戶書單，確保權限驗證
        // 必須在返回響應前完成，否則用戶無法訪問故事
        const addResult = await DataBase.saveNewBookId(storyId, userId);
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
   * 構建故事生成提示詞
   * 注意：圖片生成必須使用英文提示詞，中文提示詞不會觸發圖片生成
   */
  private buildStoryPrompt(roleform: RoleForm): string {
    const { style, mainCharacter, description, otherCharacters } = roleform;

    // 故事內容用中文（支援良好）
    // TODO 沒有用到新的架構，要修改一下
    const storyPromptChinese = `
請創作一個兒童繪本故事：

故事設定：
- 風格：${style || "童話風格"}
- 主角：${mainCharacter || "小動物"}
- 主角描述：${description || "善良可愛"}
- 其他角色：${otherCharacters?.join("、") || "無"}

故事要求：
1. 適合 5-10 歲兒童閱讀
2. 長度約 300-500 字
3. 包含生動的對話和動作描寫
4. 傳達正面的價值觀（如友誼、勇氣、善良等）
5. 結局溫馨圓滿
    `.trim();

    // 圖片生成指令必須用英文（實測中文無法觸發圖片生成）
    const imagePromptEnglish = `

After writing the story, please create an illustration for this children's book:

Image Requirements:
- Show the most exciting or heartwarming scene from the story
- Feature the main character "${mainCharacter}" ${otherCharacters && otherCharacters.length > 0 ? `and other characters: ${otherCharacters.join(", ")}` : ""}
- Style: ${style} art style
- Use warm, bright colors to create a fairy-tale atmosphere
- The scene should be vibrant and lively, suitable for children's books
- Show interaction and emotion between characters
- Use soft lighting and delicate brushstrokes to create a magical and cozy feeling
- Make it engaging and age-appropriate for 5-10 year old children

Please write the complete story first in Chinese, then generate one beautiful illustration.
    `.trim();

    return storyPromptChinese + "\n" + imagePromptEnglish;
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
