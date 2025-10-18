import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorMiddleware";
import { userModel } from "../models/userModel";
import { storyModel } from "../models/storyModel";

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
              model: 'userModel',
            },
            stories: {
              count: storyCount,
              model: 'storyModel',
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
   * 創建測試用戶
   * POST /debug/create-test-user
   * Body: { userName, userPassword }
   */
  public createTestUser = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.error("此功能僅在開發環境中可用", 403);
    }

    const { userName, userPassword } = req.body;

    if (!userName || !userPassword) {
      return res.error("請提供 userName 和 userPassword", 400);
    }

    // 檢查用戶是否已存在
    const existingUser = await userModel.findOne({ userName });
    if (existingUser) {
      return res.error(`用戶 "${userName}" 已存在`, 409, {
        userId: existingUser._id.toString(),
        suggestion: "請使用不同的用戶名，或使用 /debug/check-user 查看現有用戶",
      });
    }

    // 創建新用戶
    const newUser = new userModel({
      userName,
      userPassword,
      booklist: [],
    });

    await newUser.save();

    return res.success(
      {
        userId: newUser._id.toString(),
        userName: newUser.userName,
        created: true,
      },
      `測試用戶 "${userName}" 創建成功`,
    );
  });
}
