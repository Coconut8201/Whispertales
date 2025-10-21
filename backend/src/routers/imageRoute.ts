import { Route } from "../interfaces/Route";
import { ImageController } from "../controller/imageController";
import { authenticateToken } from "../middleware/autherMiddleware";

/**
 * 圖片路由
 * 處理所有圖片相關的 API 請求
 *
 * 路由列表：
 * - GET  /api/images/:fileId          - 獲取單張圖片（需要權限驗證）
 * - GET  /api/images/story/:storyId   - 獲取故事的所有圖片列表
 * - DELETE /api/images/:fileId        - 刪除圖片（需要擁有者權限）
 * - GET  /api/images/stats            - 獲取存儲統計（調試用）
 */
export class ImageRoute extends Route {
  protected url: string = "/api/images";
  protected Controller = new ImageController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes(): void {
    // 獲取統計信息（調試用）
    this.router.get(
      `${this.url}/stats`,
      authenticateToken,
      this.Controller.getStorageStats,
    );

    // 獲取故事的所有圖片列表
    this.router.get(
      `${this.url}/story/:storyId`,
      authenticateToken,
      this.Controller.getStoryImages,
    );

    // 獲取單張圖片（必須最後註冊，避免被 /stats 和 /story/:storyId 攔截）
    this.router.get(
      `${this.url}/:fileId`,
      authenticateToken,
      this.Controller.getImage,
    );

    // 刪除圖片
    this.router.delete(
      `${this.url}/:fileId`,
      authenticateToken,
      this.Controller.deleteImage,
    );
  }
}
