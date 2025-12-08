import { StoryController } from "../controller/storyController";
import { Route } from "../interfaces/Route";
import { authenticateToken } from "../middleware/autherMiddleware";
import { validateRequest } from "../middleware/responseMiddleware";

export class StoryRoute extends Route {
  protected url: string = "";
  protected Controller = new StoryController();
  constructor() {
    super();
    this.url = "/story";
    this.setRoutes();
  }

  // http://localhost:7943/story
  protected setRoutes(): void {
    this.router.get(`${this.url}`, this.Controller.test);

    // 測試Gemini API
    this.router.get(
      `${this.url}/test_gemini_api`,
      authenticateToken,
      this.Controller.testGeminiApi,
    );

    // 測試多張圖片生成
    this.router.post(
      `${this.url}/test_multiple_images`,
      authenticateToken,
      this.Controller.testMultipleImages,
    );

    // 生成一繪本（包含圖片和文字）
    this.router.post(
      `${this.url}/genstory`,
      authenticateToken,
      // TODO voice 修改完後這邊要改回來
      validateRequest(["roleform"]), // voiceModelName 改為可選
      this.Controller.GenStory,
    );

    this.router.post(
      `${this.url}/startstory`,
      this.Controller.GetStoryByStoryId,
    );
    this.router.get(
      `${this.url}/getstorylist_fdb`,
      authenticateToken,
      this.Controller.GetStorylistFDB,
    );

    // this.router.post(`${this.url}/makezhuyin`, this.Controller.makezhuyin);
  }
}
