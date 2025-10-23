import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorMiddleware";
import { userModel } from "../models/userModel";
import { storyModel } from "../models/storyModel";
import { GridFSStorageService } from "../services/GridFSStorageService";

/**
 * 調試控制器
 * 僅在開發環境中使用
 * 提供各種調試和檢查功能
 */
export class DebugController {
  /**
   * 檢查用戶是否存在
   * GET /debug/check-user?userName=xxx
   */
  public checkUser = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    const { userName } = req.query;

    if (!userName) {
      return res.error("請提供 userName 參數", 400);
    }

    const user = await userModel.findOne({ userName: userName as string });

    if (!user) {
      return res.success(
        {
          exists: false,
          userName: userName,
          message: "用戶不存在",
        },
        "查詢完成",
      );
    }

    return res.success(
      {
        exists: true,
        userId: user._id.toString(),
        userName: user.userName,
        hasPassword: !!user.userPassword,
        passwordLength: user.userPassword?.length || 0,
        booklistCount: user.booklist?.length || 0,
        createdAt: user.createdAt,
      },
      "用戶存在",
    );
  });

  /**
   * 列出所有用戶
   * GET /debug/list-users
   */
  public listUsers = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    const users = await userModel
      .find()
      .select("_id userName userPassword booklist createdAt")
      .lean();

    const userList = users.map((user) => ({
      id: user._id.toString(),
      userName: user.userName,
      passwordHash: user.userPassword
        ? `${user.userPassword.substring(0, 5)}...`
        : "N/A",
      passwordLength: user.userPassword?.length || 0,
      bookCount: user.booklist?.length || 0,
      createdAt: user.createdAt,
    }));

    return res.success(
      {
        totalUsers: userList.length,
        users: userList,
      },
      `找到 ${userList.length} 個用戶`,
    );
  });

  /**
   * 驗證登入憑證
   * POST /debug/verify-credentials
   * Body: { userName, userPassword }
   */
  public verifyCredentials = asyncHandler(
    async (req: Request, res: Response) => {
      if (process.env.NODE_ENV === "production") {
        return res.error("此功能僅在開發環境中可用", 403);
      }

      const { userName, userPassword } = req.body;

      if (!userName || !userPassword) {
        return res.error("請提供 userName 和 userPassword", 400);
      }

      const user = await userModel.findOne({ userName: userName });

      if (!user) {
        return res.success(
          {
            step: 1,
            result: "FAIL",
            reason: "USER_NOT_FOUND",
            message: "用戶不存在於資料庫中",
            suggestion: "請檢查用戶名是否正確，或先註冊用戶",
          },
          "驗證失敗",
        );
      }

      console.log(`[調試] 找到用戶: ${userName}`);
      console.log(`[調試] 資料庫密碼: ${user.userPassword}`);
      console.log(`[調試] 輸入密碼: ${userPassword}`);
      console.log(`[調試] 密碼匹配: ${user.userPassword === userPassword}`);

      if (user.userPassword !== userPassword) {
        return res.success(
          {
            step: 2,
            result: "FAIL",
            reason: "WRONG_PASSWORD",
            message: "密碼不正確",
            details: {
              storedPasswordLength: user.userPassword?.length || 0,
              inputPasswordLength: userPassword.length,
              storedPasswordPreview: user.userPassword.substring(0, 3) + "...",
              inputPasswordPreview: userPassword.substring(0, 3) + "...",
            },
            suggestion: "請檢查密碼是否正確，注意大小寫和空格",
          },
          "密碼驗證失敗",
        );
      }

      return res.success(
        {
          step: 3,
          result: "SUCCESS",
          message: "驗證成功！用戶名和密碼都正確",
          userId: user._id.toString(),
        },
        "驗證成功",
      );
    },
  );

  /**
   * 資料庫狀態檢查
   * GET /debug/db-status
   */
  public dbStatus = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    const userCount = await userModel.countDocuments();
    const storyCount = await storyModel.countDocuments();

    return res.success(
      {
        database: {
          connected: true,
          collections: {
            users: {
              count: userCount,
              model: "userModel",
            },
            stories: {
              count: storyCount,
              model: "storyModel",
            },
          },
        },
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      },
      "資料庫狀態正常",
    );
  });

  /**
   * 獲取 GridFS 統計信息
   * GET /debug/gridfs-stats
   */
  public gridfsStats = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    try {
      const stats = await GridFSStorageService.getStorageStats();

      return res.success(
        {
          totalImages: stats.totalImages,
          totalSize: stats.totalSize,
          totalSizeFormatted: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
          bucketName: stats.bucketName,
          averageSize:
            stats.totalImages > 0
              ? `${(stats.totalSize / stats.totalImages / 1024).toFixed(2)} KB`
              : "N/A",
        },
        "GridFS 統計信息",
      );
    } catch (error: any) {
      return res.error(`獲取 GridFS 統計失敗: ${error.message}`, 500, {
        error: error.message,
      });
    }
  });

  /**
   * 測試 GridFS 文本儲存功能
   * POST /debug/save-txt
   * Body: { text?: string, filename?: string }
   *
   * 使用原生 GridFSBucket 直接儲存文本文件
   * 這個方法展示如何使用 Stream 方式寫入 GridFS
   */
  public saveTxt = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    console.log("\n========== GridFS 文本儲存測試開始 ==========");
    const startTime = Date.now();

    try {
      // 引入 Readable stream
      const { Readable } = await import("stream");

      // 從 request body 獲取文本內容和檔名，或使用預設值
      const fileData = "這是一個測試文本檔案\n用於驗證 GridFS 設定是否正常\n當前時間: " +
          new Date().toISOString();
      const filename = `test-${Date.now()}.txt`;

      console.log(`[測試] 準備儲存文本: ${fileData.substring(0, 50)}...`);
      console.log(`[測試] 檔名: ${filename}`);
      console.log(`[測試] 文件大小: ${fileData.length} bytes`);

      // 將文本轉換為 Buffer
      const fileBuffer = Buffer.from(fileData, "utf-8");

      // 獲取 GridFS bucket（使用現有的 GridFSStorageService）
      const bucket = GridFSStorageService.getBucket();

      if (!bucket) {
        throw new Error("GridFS bucket 未初始化");
      }

      // 創建上傳 stream
      const uploadStream = bucket.openUploadStream(filename);

      console.log(`[測試] 開始寫入 GridFS...`);

      // 將 Buffer 轉換為 Readable stream
      const readable = new Readable();
      readable.push(fileBuffer);
      readable.push(null); // 表示 stream 結束

      // 使用 pipe 將數據寫入 GridFS（使用 any 來避免類型問題）
      readable.pipe(uploadStream as any);

      uploadStream.on("close", (file: any) => {
        console.log(filename + " Write to DB");
      });

      let gridFsResponse = {
        id: uploadStream.id,
        filename: uploadStream.filename,
      };

      console.log(JSON.stringify(gridFsResponse, null, 2));

      return res.success(gridFsResponse, "文本儲存成功");
    } catch (error: any) {
      const failTime = Date.now() - startTime;
      console.error(`[測試] ❌ 測試失敗:`, error);
      console.log(`[測試] 失敗耗時: ${failTime}ms`);
      console.log("========== GridFS 文本儲存測試失敗 ==========\n");

      return res.error(`GridFS 文本儲存失敗: ${error.message}`, 500, {
        error: error.message,
        failTime: `${failTime}ms`,
        stack: error.stack,
      });
    }
  });

  /**
   * 列出所有 GridFS 文件
   * GET /debug/gridfs-list
   */
  public gridFSList = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    try {
      const bucket = GridFSStorageService.getBucket();

      if (!bucket) {
        throw new Error("GridFS bucket 未初始化");
      }

      const files: any[] = [];
      const cursor = bucket.find({});

      for await (const file of cursor) {
        files.push({
          id: file._id.toString(),
          filename: file.filename,
          length: file.length,
          uploadDate: file.uploadDate,
          contentType: file.contentType,
          metadata: file.metadata,
        });
      }

      return res.success(
        {
          totalFiles: files.length,
          files: files,
        },
        `找到 ${files.length} 個 GridFS 文件`,
      );
    } catch (error: any) {
      return res.error(`列出 GridFS 文件失敗: ${error.message}`, 500, {
        error: error.message,
      });
    }
  });
  
  public getImage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.body;
    
    console.log(`正在獲取圖片 ${id}`);
    
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }
    
    const result = await GridFSStorageService.getImageBase64(id);
    
    if (!result) {
      return res.error("找不到圖片", 404);
    }
    
    return res.send(result);
    
  });
}
