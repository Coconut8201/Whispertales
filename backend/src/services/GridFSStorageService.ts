import mongoose from "mongoose";
import { Readable } from "stream";
import { GridFSBucket, ObjectId } from "mongodb";

/**
 * GridFS 圖片存儲服務
 *
 * 設計理念：
 * 1. 使用 MongoDB GridFS 存儲圖片，突破 16MB 文檔限制
 * 2. 自動分塊存儲，高效處理大文件
 * 3. 支持按 storyId 查詢和批量刪除
 * 4. 圖片 metadata 包含 storyId、index 等信息
 *
 * GridFS 優勢：
 * - 與 MongoDB 無縫整合，統一備份策略
 * - 自動分塊（默認 255KB），適合各種大小的圖片
 * - 支持串流讀取，節省內存
 * - 可以按 metadata 查詢和索引
 *
 * @example
 * // 保存圖片
 * const fileId = await GridFSStorageService.saveImage(
 *   base64Data,
 *   "story123",
 *   0,
 *   { contentType: "image/png" }
 * );
 *
 * // 獲取圖片串流
 * const stream = await GridFSStorageService.getImageStream(fileId);
 * stream.pipe(res);
 *
 * // 刪除故事的所有圖片
 * await GridFSStorageService.deleteStoryImages("story123");
 */
export class GridFSStorageService {
  private static bucket: GridFSBucket | null = null;
  private static readonly BUCKET_NAME = "gridfs_images";

  /**
   * 初始化 GridFS Bucket
   * 必須在資料庫連接建立後調用
   */
  static initializeBucket(): void {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB 連接尚未建立，請先連接資料庫");
    }

    // 使用 any 類型斷言解決 mongoose 和 mongodb 版本兼容性問題
    this.bucket = new GridFSBucket(mongoose.connection.db as any, {
      bucketName: this.BUCKET_NAME,
    });
    
    // this.bucket = new GridFSBucket(mongoose.connection.db as any);
    

    console.log("[GridFSStorageService] GridFS Bucket 已初始化");
  }

  /**
   * 獲取 Bucket 實例
   * 提供給外部需要直接操作 GridFS 的場景
   */
  static getBucket(): GridFSBucket {
    if (!this.bucket) {
      this.initializeBucket();
    }
    return this.bucket!;
  }

  /**
   * 保存圖片（從 base64 解碼並存儲為二進制）
   * ✅ 正確模式：將 base64 解碼成二進制數據存儲，節省空間和提升性能
   *
   * @param base64Data - base64 圖片數據（可包含 data:image/png;base64, 前綴）
   * @param storyId - 故事 ID
   * @param index - 圖片在故事中的索引
   * @param additionalMetadata - 額外的 metadata
   * @returns GridFS file ID（字符串格式）
   */
  static async saveImageFromBase64(
    base64Data: string,
    storyId: string,
    index: number,
    additionalMetadata?: Record<string, any>,
  ): Promise<string> {
    try {
      // 解析 base64 數據和格式
      let contentType = "image/png"; // 默認格式
      let extension = "png";
      let base64String = base64Data;

      const base64Prefix = "data:image/";
      if (base64Data.startsWith(base64Prefix)) {
        const matches = base64Data.match(/data:image\/(\w+);base64,/);
        if (matches) {
          extension = matches[1];
          contentType = `image/${extension}`;
          // 移除 data URI 前綴，只保留純 base64 數據
          base64String = base64Data.split(",")[1];
        }
      }

      // ✅ 將 base64 解碼成二進制 Buffer（這樣文件體積會減少約 33%）
      const imageBuffer = Buffer.from(base64String, "base64");

      // 生成文件名
      const filename = `story_${storyId}_${index}.${extension}`;

      // 準備 metadata
      const metadata = {
        storyId,
        index,
        contentType,
        originalSize: base64Data.length, // 原始 base64 大小
        binarySize: imageBuffer.length, // 二進制大小
        uploadDate: new Date(),
        ...additionalMetadata,
      };

      console.log(
        `[GridFSStorageService] 開始上傳圖片，原始: ${(base64Data.length / 1024).toFixed(2)} KB -> 二進制: ${(imageBuffer.length / 1024).toFixed(2)} KB`,
      );

      // 獲取 GridFS Bucket
      const bucket = this.getBucket();

      // 將 Buffer 轉換為 Readable stream
      const readableStream = new Readable();
      readableStream.push(imageBuffer);
      readableStream.push(null); // 標記流結束

      const uploadStream = bucket.openUploadStream(filename, {
        metadata,
        contentType,
      });

      // 使用 Promise 包裝上傳流程
      const fileId = await new Promise<string>((resolve, reject) => {
        // 監聽錯誤
        uploadStream.on("error", (error) => {
          console.error("[GridFSStorageService] 上傳錯誤:", error);
          reject(error);
        });

        // 監聽完成
        uploadStream.on("finish", () => {
          console.log(
            `[GridFSStorageService] ✅ 上傳完成: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)`,
          );
          resolve(uploadStream.id.toString());
        });

        // 使用 pipe 將 readable stream 導入到 upload stream
        readableStream.pipe(uploadStream as any);
      });

      return fileId;
    } catch (error) {
      console.error(
        `[GridFSStorageService] 保存圖片失敗 (storyId: ${storyId}, index: ${index}):`,
        error,
      );
      throw new Error(`GridFS 圖片保存失敗: ${error}`);
    }
  }

  /**
   * 保存單張圖片（簡化版本，不需要 storyId）
   * ✅ 正確模式：將 base64 解碼成二進制數據存儲
   *
   * @param base64String - base64 圖片數據
   * @returns GridFS file ID
   */
  static async saveBase64Image(base64String: string): Promise<string> {
    try {
      console.log(
        `[GridFSStorageService] 開始上傳獨立圖片，原始大小: ${(base64String.length / 1024).toFixed(2)} KB`,
      );

      // 解析 base64 數據和格式
      let contentType = "image/png";
      let extension = "png";
      let base64Data = base64String;

      const base64Prefix = "data:image/";
      if (base64String.startsWith(base64Prefix)) {
        const matches = base64String.match(/data:image\/(\w+);base64,/);
        if (matches) {
          extension = matches[1];
          contentType = `image/${extension}`;
          // 移除 data URI 前綴
          base64Data = base64String.split(",")[1];
        }
      }

      // 獲取 GridFS Bucket
      const bucket = this.getBucket();

      // ✅ 將 base64 解碼成二進制 Buffer
      const imageBuffer = Buffer.from(base64Data, "base64");

      // 生成文件名
      const filename = `image_${Date.now()}.${extension}`;

      // 準備 metadata
      const metadata = {
        contentType,
        originalSize: base64String.length,
        binarySize: imageBuffer.length,
        uploadDate: new Date(),
      };

      console.log(
        `[GridFSStorageService] 二進制大小: ${(imageBuffer.length / 1024).toFixed(2)} KB (節省 ${((1 - imageBuffer.length / base64String.length) * 100).toFixed(1)}%)`,
      );

      // 創建上傳流
      const uploadStream = bucket.openUploadStream(filename, {
        metadata,
        contentType,
      });

      // 將 Buffer 轉換為 Readable stream
      const readableStream = new Readable();
      readableStream.push(imageBuffer);
      readableStream.push(null);

      // 使用 Promise 包裝上傳流程
      const fileId = await new Promise<string>((resolve, reject) => {
        uploadStream.on("error", (error) => {
          console.error("[GridFSStorageService] 上傳錯誤:", error);
          reject(error);
        });

        uploadStream.on("finish", () => {
          console.log(
            `[GridFSStorageService] ✅ 上傳完成: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)`,
          );
          resolve(uploadStream.id.toString());
        });

        // 使用 pipe 將 readable stream 導入到 upload stream
        readableStream.pipe(uploadStream as any);
      });

      return fileId;
    } catch (error) {
      console.error(`[GridFSStorageService] 保存獨立圖片失敗:`, error);
      throw new Error(`GridFS 圖片保存失敗: ${error}`);
    }
  }

  /**
   * 批量保存圖片（從 base64 數組）
   * @param base64Array - base64 圖片數組
   * @param storyId - 故事 ID
   * @returns GridFS file IDs 數組
   */
  static async saveImagesFromBase64Array(
    base64Array: string[],
    storyId: string,
  ): Promise<string[]> {
    const fileIds: string[] = [];

    for (let i = 0; i < base64Array.length; i++) {
      try {
        const fileId = await this.saveImageFromBase64(
          base64Array[i],
          storyId,
          i,
        );
        fileIds.push(fileId);
      } catch (error) {
        console.error(`[GridFSStorageService] 批量保存時跳過圖片 ${i}:`, error);
        // 可選：繼續處理其他圖片，或者拋出錯誤
        // 這裡選擇記錄錯誤但繼續處理
      }
    }

    console.log(
      `[GridFSStorageService] 批量保存完成: ${fileIds.length}/${base64Array.length} 張圖片`,
    );
    return fileIds;
  }

  /**
   * 獲取圖片 base64 字串
   * ✅ 正確模式：將二進制數據轉換為 base64，並添加 data URI 前綴
   * @param fileId - GridFS file ID（字符串或 ObjectId）
   * @returns base64 字串（包含 data:image/xxx;base64, 前綴）
   */
  static async getImageBase64(fileId: string | ObjectId): Promise<string> {
    try {
      const bucket = this.getBucket();
      const objectId =
        typeof fileId === "string" ? new ObjectId(fileId) : fileId;

      // 檢查文件是否存在並獲取 metadata
      const files = await bucket.find({ _id: objectId }).toArray();
      if (files.length === 0) {
        throw new Error(`圖片不存在: ${fileId}`);
      }

      const fileInfo = files[0];
      const contentType = fileInfo.contentType || "image/png";

      // 創建下載流
      const downloadStream = bucket.openDownloadStream(objectId);

      // 讀取流內容為二進制數據
      const chunks: any[] = [];
      for await (const chunk of downloadStream) {
        chunks.push(chunk);
      }

      // @ts-ignore - Buffer.concat 型別兼容性問題
      const imageBuffer = Buffer.concat(chunks);

      // ✅ 將二進制數據轉換為 base64
      const base64String = imageBuffer.toString("base64");

      // 添加 data URI 前綴
      const base64WithPrefix = `data:${contentType};base64,${base64String}`;

      console.log(
        `[GridFSStorageService] ✅ 獲取圖片成功: ${fileId} (二進制: ${(imageBuffer.length / 1024).toFixed(2)} KB -> base64: ${(base64WithPrefix.length / 1024).toFixed(2)} KB)`,
      );
      return base64WithPrefix;
    } catch (error) {
      console.error(
        `[GridFSStorageService] 獲取圖片失敗 (fileId: ${fileId}):`,
        error,
      );
      throw error;
    }
  }

  /**
   * 獲取圖片 metadata
   * @param fileId - GridFS file ID
   * @returns 文件信息
   */
  static async getImageMetadata(
    fileId: string | ObjectId,
  ): Promise<any | null> {
    try {
      const bucket = this.getBucket();
      const objectId =
        typeof fileId === "string" ? new ObjectId(fileId) : fileId;

      const files = await bucket.find({ _id: objectId }).toArray();
      if (files.length === 0) {
        return null;
      }

      return files[0];
    } catch (error) {
      console.error(
        `[GridFSStorageService] 獲取圖片 metadata 失敗 (fileId: ${fileId}):`,
        error,
      );
      return null;
    }
  }

  /**
   * 根據 storyId 查詢所有圖片
   * @param storyId - 故事 ID
   * @returns 文件信息數組
   */
  static async getImagesByStoryId(storyId: string): Promise<any[]> {
    try {
      const bucket = this.getBucket();

      // 查詢 metadata.storyId 匹配的所有文件
      const files = await bucket
        .find({ "metadata.storyId": storyId })
        .sort({ "metadata.index": 1 }) // 按索引排序
        .toArray();

      console.log(
        `[GridFSStorageService] 找到 ${files.length} 張圖片 (storyId: ${storyId})`,
      );
      return files;
    } catch (error) {
      console.error(
        `[GridFSStorageService] 查詢圖片失敗 (storyId: ${storyId}):`,
        error,
      );
      return [];
    }
  }

  /**
   * 刪除單張圖片
   * @param fileId - GridFS file ID
   * @returns 是否成功
   */
  static async deleteImage(fileId: string | ObjectId): Promise<boolean> {
    try {
      const bucket = this.getBucket();
      const objectId =
        typeof fileId === "string" ? new ObjectId(fileId) : fileId;

      await bucket.delete(objectId);
      console.log(`[GridFSStorageService] 圖片已刪除: ${fileId}`);
      return true;
    } catch (error) {
      console.error(
        `[GridFSStorageService] 刪除圖片失敗 (fileId: ${fileId}):`,
        error,
      );
      return false;
    }
  }

  /**
   * 刪除故事的所有圖片
   * @param storyId - 故事 ID
   * @returns 刪除的文件數量
   */
  static async deleteStoryImages(storyId: string): Promise<number> {
    try {
      const files = await this.getImagesByStoryId(storyId);

      let deletedCount = 0;
      for (const file of files) {
        const success = await this.deleteImage(file._id);
        if (success) {
          deletedCount++;
        }
      }

      console.log(
        `[GridFSStorageService] 已刪除故事 ${storyId} 的 ${deletedCount} 張圖片`,
      );
      return deletedCount;
    } catch (error) {
      console.error(
        `[GridFSStorageService] 刪除故事圖片失敗 (storyId: ${storyId}):`,
        error,
      );
      return 0;
    }
  }

  /**
   * 檢查圖片是否存在
   * @param fileId - GridFS file ID
   * @returns 是否存在
   */
  static async imageExists(fileId: string | ObjectId): Promise<boolean> {
    try {
      const bucket = this.getBucket();
      const objectId =
        typeof fileId === "string" ? new ObjectId(fileId) : fileId;

      const files = await bucket.find({ _id: objectId }).toArray();
      return files.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 獲取存儲統計信息
   * @returns 統計數據
   */
  static async getStorageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    bucketName: string;
  }> {
    try {
      const bucket = this.getBucket();
      const files = await bucket.find({}).toArray();

      let totalSize = 0;
      for (const file of files) {
        totalSize += file.length || 0;
      }

      return {
        totalImages: files.length,
        totalSize,
        bucketName: this.BUCKET_NAME,
      };
    } catch (error) {
      console.error("[GridFSStorageService] 獲取統計信息失敗:", error);
      return {
        totalImages: 0,
        totalSize: 0,
        bucketName: this.BUCKET_NAME,
      };
    }
  }

  /**
   * 清理孤立的圖片（沒有關聯 story 的圖片）
   * 慎用！建議在維護窗口執行
   * @param validStoryIds - 有效的故事 ID 列表
   * @returns 清理的文件數量
   */
  static async cleanupOrphanedImages(validStoryIds: string[]): Promise<number> {
    try {
      const bucket = this.getBucket();
      const allFiles = await bucket.find({}).toArray();

      let cleanedCount = 0;
      for (const file of allFiles) {
        const storyId = file.metadata?.storyId;
        if (storyId && !validStoryIds.includes(storyId)) {
          const success = await this.deleteImage(file._id);
          if (success) {
            cleanedCount++;
          }
        }
      }

      console.log(
        `[GridFSStorageService] 清理完成，刪除 ${cleanedCount} 張孤立圖片`,
      );
      return cleanedCount;
    } catch (error) {
      console.error("[GridFSStorageService] 清理孤立圖片失敗:", error);
      return 0;
    }
  }
}
