import { Request, Response } from "express";
import { Controller } from "../interfaces/Controller";
import { GridFSStorageService } from "../services/GridFSStorageService";
import { asyncHandler } from "../middleware/errorMiddleware";
import { getCurrentUserId } from "../utils/authHelpers";
import { DataBase } from "../utils/DataBase";

/**
 * 圖片控制器
 * 負責處理圖片的獲取和權限驗證
 */
export class ImageController extends Controller {
  // 實現抽象方法
  public test(req: Request, res: Response): Response {
    return res.send("ImageController is working");
  }
  /**
   * 獲取圖片
   * GET /api/images/:fileId
   *
   * 安全機制：
   * 1. 驗證用戶是否登入
   * 2. 驗證用戶是否擁有該圖片所屬的故事
   * 3. 使用 GridFS 串流返回圖片
   *
   * @example
   * GET /api/images/507f1f77bcf86cd799439011
   */
  public getImage = asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    // 驗證 fileId 格式
    if (!fileId || fileId.length !== 24) {
      return res.error("無效的圖片 ID", 400);
    }

    try {
      // 獲取圖片 metadata
      const metadata = await GridFSStorageService.getImageMetadata(fileId);

      if (!metadata) {
        return res.error("圖片不存在", 404);
      }

      // 驗證用戶權限
      const userId = getCurrentUserId(req);
      const storyId = metadata.metadata?.storyId;

      if (storyId) {
        const hasOwnership = await DataBase.CheckOwnership(userId, storyId);
        if (!hasOwnership) {
          return res.error("無權訪問此圖片", 403);
        }
      }

      // 設置響應頭
      const contentType = metadata.metadata?.contentType || "image/png";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 緩存 1 年
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${metadata.filename}"`,
      );

      // 串流返回圖片
      const stream = await GridFSStorageService.getImageStream(fileId);
      stream.pipe(res);

      stream.on("error", (error) => {
        console.error(
          `[ImageController] 串流圖片失敗 (fileId: ${fileId}):`,
          error,
        );
        if (!res.headersSent) {
          res.status(500).send("圖片讀取失敗");
        }
      });
    } catch (error) {
      console.error(
        `[ImageController] 獲取圖片失敗 (fileId: ${fileId}):`,
        error,
      );
      return res.error("圖片讀取失敗", 500);
    }
  });

  /**
   * 獲取故事的所有圖片列表
   * GET /api/images/story/:storyId
   *
   * 返回格式：
   * {
   *   code: 200,
   *   data: [
   *     { fileId: "...", url: "/api/images/...", index: 0 },
   *     { fileId: "...", url: "/api/images/...", index: 1 }
   *   ]
   * }
   */
  public getStoryImages = asyncHandler(async (req: Request, res: Response) => {
    const { storyId } = req.params;

    // 驗證用戶權限
    const userId = getCurrentUserId(req);
    const hasOwnership = await DataBase.CheckOwnership(userId, storyId);

    if (!hasOwnership) {
      return res.error("無權訪問此故事", 403);
    }

    try {
      // 獲取故事的所有圖片
      const files = await GridFSStorageService.getImagesByStoryId(storyId);

      const images = files.map((file) => ({
        fileId: file._id.toString(),
        url: `/api/images/${file._id.toString()}`,
        index: file.metadata?.index || 0,
        contentType: file.metadata?.contentType || "image/png",
        size: file.length,
        uploadDate: file.uploadDate,
      }));

      return res.success(images, "獲取圖片列表成功");
    } catch (error) {
      console.error(
        `[ImageController] 獲取故事圖片列表失敗 (storyId: ${storyId}):`,
        error,
      );
      return res.error("獲取圖片列表失敗", 500);
    }
  });

  /**
   * 刪除圖片（管理功能）
   * DELETE /api/images/:fileId
   *
   * 僅允許圖片所屬故事的擁有者刪除
   */
  public deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    try {
      // 獲取圖片 metadata
      const metadata = await GridFSStorageService.getImageMetadata(fileId);

      if (!metadata) {
        return res.error("圖片不存在", 404);
      }

      // 驗證用戶權限
      const userId = getCurrentUserId(req);
      const storyId = metadata.metadata?.storyId;

      if (storyId) {
        const hasOwnership = await DataBase.CheckOwnership(userId, storyId);
        if (!hasOwnership) {
          return res.error("無權刪除此圖片", 403);
        }
      }

      // 刪除圖片
      const success = await GridFSStorageService.deleteImage(fileId);

      if (success) {
        return res.success(null, "圖片已刪除");
      } else {
        return res.error("刪除圖片失敗", 500);
      }
    } catch (error) {
      console.error(
        `[ImageController] 刪除圖片失敗 (fileId: ${fileId}):`,
        error,
      );
      return res.error("刪除圖片失敗", 500);
    }
  });

  /**
   * 獲取 GridFS 存儲統計信息（調試用）
   * GET /api/images/stats
   */
  public getStorageStats = asyncHandler(async (req: Request, res: Response) => {
    try {
      const stats = await GridFSStorageService.getStorageStats();
      return res.success(stats, "獲取統計信息成功");
    } catch (error) {
      console.error("[ImageController] 獲取統計信息失敗:", error);
      return res.error("獲取統計信息失敗", 500);
    }
  });
}
