import { Controller } from "../interfaces/Controller";
import { Request, Response } from "express";
import { storyInterface } from "../interfaces/storyInterface";
import { DataBase } from "../utils/DataBase";
import { GeminiAI } from "../utils/tools/geminiAI";
import PQueue from "p-queue";
import { getCurrentUserId } from "../utils/authHelpers";
import { asyncHandler } from "../middleware/errorMiddleware";
import { RoleForm, StoryRequestBody } from "../types/story";

export class StoryController extends Controller {
  queue = new PQueue({ concurrency: 1 }); // 限制為1個並發請求

  // 創建共用的 Gemini 實例 - 支援圖片和文字生成
  private gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: "gemini-2.5-flash-image",
    temperature: 0.9,
    responseModalities: ["TEXT", "IMAGE"], // 同時生成文字和圖片
    aspectRatio: "16:9", // 圖片比例
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
   * 使用 Gemini AI 生成繪本（包含故事文字和圖片）
   * @param Request roleform 故事角色設定, voiceModelName 語音模型名稱
   * @example POST http://localhost:7943/story/genstory
   * {
   *   "roleform": {
   *     "style": "童話風格",
   *     "mainCharacter": "小兔子",
   *     "description": "一隻勇敢的小兔子",
   *     "otherCharacters": ["小狗", "小貓"]
   *   },
   *   "voiceModelName": "default_voice"
   * }
   */
  public GenStory = asyncHandler(async (req: Request, res: Response) => {
    const { roleform, voiceModelName } = req.body as StoryRequestBody;
    const userId = getCurrentUserId(req);

    try {
      // 構建故事生成提示詞
      const prompt = this.buildStoryPrompt(roleform);

      // 使用 Gemini 生成故事和圖片
      const content = await this.gemini.generateContent(prompt);

      if (!content.text) {
        return res.error("故事生成失敗：未收到文字內容", 500);
      }

      // 處理生成的圖片
      const imageUrls: string[] = [];
      if (content.images && content.images.length > 0) {
        // TODO: 儲存圖片到檔案系統或雲端儲存
        // 暫時回傳 base64 資料
        imageUrls.push(
          ...content.images.map(
            (img) => `data:${img.mimeType};base64,${img.data}`,
          ),
        );
      }

      // 儲存到資料庫
      const storyData = {
        userId,
        title: this.extractTitleFromStory(content.text),
        content: content.text,
        images: imageUrls,
        roleform,
        voiceModelName,
        createdAt: new Date(),
      };

      // TODO: 使用 DataBase.createStory 儲存故事
      // const savedStory = await DataBase.createStory(storyData);

      return res.success(
        {
          story: content.text,
          images: imageUrls,
          metadata: {
            roleform,
            voiceModelName,
          },
        },
        "繪本生成成功",
      );
    } catch (error) {
      console.error("GenStory 錯誤:", error);
      return res.error("繪本生成失敗", 500, { error: String(error) });
    }
  });

  /**
   * 構建故事生成提示詞
   */
  private buildStoryPrompt(roleform: RoleForm): string {
    const { style, mainCharacter, description, otherCharacters } = roleform;

    return `
請創作一個兒童繪本故事，並生成一張精美的插圖。

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

插圖要求：
1. 展示故事中最精彩或最溫馨的場景
2. 色彩繽紛、風格可愛
3. 適合兒童繪本的風格

請開始創作：
    `.trim();
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
