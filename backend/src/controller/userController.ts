import { Controller } from "../interfaces/Controller";
import { Request, Response } from "express";
import { UserService } from "../database";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/errorMiddleware";
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from "../errors/AppErrors";
import { getCurrentUserId, getCurrentUsername } from "../utils/authHelpers";

export class UserController extends Controller {
  public test(Request: Request, Response: Response) {
    Response.send(`This is userController`);
  }

  /**
   * 用戶登入
   * 使用統一的錯誤處理和響應格式
   * 提供詳細的錯誤訊息以便調試
   */
  public Login = asyncHandler(async (req: Request, res: Response) => {
    const { userName, userPassword } = req.body;

    // 記錄登入嘗試（開發環境）
    if (process.env.NODE_ENV !== "production") {
      console.log(`[登入嘗試] 用戶名: ${userName}`);
    }

    // 驗證用戶
    const result = await UserService.verifyUser(userName, userPassword);

    if (!result.success) {
      // 記錄詳細錯誤資訊
      console.error(`[登入失敗] 用戶名: ${userName}, 原因: ${result.message}`);

      // 根據不同的錯誤原因拋出不同的錯誤
      if (result.message === "用戶不存在") {
        throw new UnauthorizedError(
          process.env.NODE_ENV === "production"
            ? "用戶名或密碼錯誤" // 生產環境：不透露具體原因（安全考量）
            : "用戶不存在", // 開發環境：顯示詳細資訊
          {
            reason: "USER_NOT_FOUND",
            userName: userName,
          },
        );
      } else if (result.message === "密碼錯誤") {
        throw new UnauthorizedError(
          process.env.NODE_ENV === "production"
            ? "用戶名或密碼錯誤" // 生產環境：不透露具體原因（安全考量）
            : "密碼錯誤", // 開發環境：顯示詳細資訊
          {
            reason: "WRONG_PASSWORD",
            userName: userName,
          },
        );
      } else {
        // 其他認證錯誤
        throw new UnauthorizedError(result.message, {
          reason: "AUTH_ERROR",
        });
      }
    }

    console.log(`[登入成功] 用戶: ${userName}, ID: ${result.userId}`);

    // 創建 JWT token
    const user = {
      id: result.userId,
      username: userName,
      loginTime: Date.now(),
    };

    const token = jwt.sign(user, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    // 設置 HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 小時
    });

    return res.success(
      {
        id: user.id,
        username: user.username,
      },
      "登入成功",
    );
  });

  /**
   * 用戶登出
   * 清除認證 cookie，使用統一的響應格式
   */
  public Logout = asyncHandler(async (req: Request, res: Response) => {
    // 從認證中介軟體獲取用戶資訊（如果有的話）
    const userId = getCurrentUserId(req);
    const userName = getCurrentUsername(req);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[登出請求] 用戶ID: ${userId || "未知用戶"}`);
    }

    // 清除 cookie 的配置
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    };

    // 清除認證 cookie
    res.clearCookie("authToken", cookieOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[登出成功] 用戶: ${userName || "未知用戶"}`);
    }

    return res.success(
      userId ? { id: userId, username: userName } : undefined,
      "登出成功",
    );
  });

  /**
   * 用戶註冊
   * Controller 層方法 - 只處理 HTTP 邏輯
   * 業務邏輯由 Service 層（DataBase）處理
   */
  public AddUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, userPassword, permissions } = req.body;

    if (process.env.NODE_ENV !== "production") {
      console.log(`[AddUser Controller] 註冊嘗試: ${userName}`);
    }

    const result = await UserService.createUser(
      userName,
      userPassword,
      permissions || "user", // 默認為普通用戶
    );

    if (!result.success) {
      console.error(`[AddUser Controller] 註冊失敗: ${result.message}`);

      switch (result.code) {
        case 409:
          // Conflict - 用戶名已存在
          throw new ConflictError(result.message, {
            userName,
            suggestion: "請選擇其他用戶名",
          });
        case 400:
          // Bad Request - 密碼不符合要求
          throw new BadRequestError(result.message, { userName });
        default:
          // 其他錯誤
          throw new InternalError(result.message);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[AddUser Controller] 註冊成功: ${userName} (ID: ${result.data?.id})`,
      );
    }

    return res.success(
      {
        id: result.data?.id,
        userName: result.data?.userName,
        permissions: result.data?.permissions,
        createdAt: result.data?.createdAt,
      },
      "註冊成功",
    );
  });

  /**
   * 刪除用戶
   * Controller 層方法 - 只處理 HTTP 邏輯
   * 業務邏輯由 Service 層（UserService）處理
   */
  public DeleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
      throw new BadRequestError("用戶名不能為空", {
        field: "username",
        suggestion: "請提供要刪除的用戶名",
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DeleteUser Controller] 刪除請求: ${username}`);
    }

    const result = await UserService.deleteUser(username);

    if (!result.success) {
      console.error(`[DeleteUser Controller] 刪除失敗: ${result.message}`);

      // 根據錯誤信息判斷錯誤類型
      if (result.message.includes("找不到")) {
        throw new BadRequestError(result.message, {
          username,
          suggestion: "請確認用戶名是否正確",
        });
      } else {
        throw new InternalError(result.message);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DeleteUser Controller] 刪除成功: ${username}`);
    }

    return res.success(
      {
        username: username,
      },
      "刪除用戶成功",
    );
  });

  /**
   * 獲取用戶資料
   * Controller 層方法 - 只處理 HTTP 邏輯
   * 業務邏輯由 Service 層（UserService）處理
   */
  public GetUserProfile = asyncHandler(async (req: Request, res: Response) => {
    // 使用工具函數獲取用戶 ID（自動驗證並拋出錯誤）
    const userId = getCurrentUserId(req);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[GetUserProfile Controller] 獲取請求: 用戶ID ${userId}`);
    }

    const result = await UserService.getUserProfile(userId);

    if (!result.success) {
      console.error(`[GetUserProfile Controller] 請求失敗: ${result.message}`);

      if (result.message.includes("找不到")) {
        throw new NotFoundError("找不到用戶資料", {
          userId,
          suggestion: "用戶可能已被刪除，請聯繫管理員",
        });
      } else {
        throw new InternalError("獲取用戶資料時發生錯誤", {
          userId,
          suggestion: "請稍後再試",
        });
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[GetProfile Controller] 請求成功: 用戶ID ${userId}`);
    }

    return res.success(result.data, "獲取用戶資料成功");
  });

  /**
   * 更新用戶資料
   * Controller 層方法 - 只處理 HTTP 邏輯
   * 業務邏輯由 Service 層（UserService）處理
   */
  public UpdateUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
      // 使用工具函數獲取用戶 ID（自動驗證並拋出錯誤）
      const userId = getCurrentUserId(req);
      const updateData = req.body;

      // 驗證更新數據
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new BadRequestError("更新數據不能為空", {
          field: "updateData",
          suggestion: "請提供要更新的欄位",
        });
      }

      // 驗證更新數據的欄位是否有效
      if (!this.validateProfileData(updateData)) {
        throw new BadRequestError("包含無效的更新欄位", {
          field: "updateData",
          allowedFields: ["nickname", "email", "phone", "avatar"],
          suggestion: "只能更新: nickname, email, phone, avatar",
        });
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[UpdateProfile Controller] 更新請求: 用戶${userId}, 欄位${Object.keys(
            updateData,
          ).join(", ")}`,
        );
      }

      const result = await UserService.updateUserProfile(userId, updateData);

      if (!result.success) {
        console.error(`[UpdateProfile Controller] 更新失敗: ${result.message}`);

        throw new InternalError("更新用戶資料時發生錯誤", {
          userId,
          suggestion: result.message || "請稍後再試",
        });
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[UpdateProfile Controller] 更新成功: 用戶${userId}, 更新欄位${Object.keys(
            updateData,
          ).join(", ")}`,
        );
      }

      return res.success(result.data, "用戶資料更新成功");
    },
  );

  /**
   * 驗證用戶資料的欄位（私有方法）
   * 檢查提交的資料是否只包含允許的欄位
   * @param data - 要驗證的資料
   * @returns 是否為有效的用戶資料
   */
  private validateProfileData(data: any): boolean {
    if (!data || typeof data !== "object") {
      return false;
    }

    // 定義允許更新的欄位
    const allowedFields = ["nickname", "email", "phone", "avatar"];

    // 檢查是否所有 key 都在允許列表中
    const isValid = Object.keys(data).every((key) =>
      allowedFields.includes(key),
    );

    // 檢查是否至少有一個欄位要更新
    const hasData = Object.keys(data).length > 0;

    return isValid && hasData;
  }

  /**
   * 驗證用戶認證狀態
   * 檢查用戶是否已登入（是否擁有有效的認證令牌）
   */
  public VerifyAuth = asyncHandler(async (req: Request, res: Response) => {
    // 檢查 cookie 中是否存在認證令牌
    const hasAuthToken = !!req.cookies.authToken;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[VerifyAuth Controller] 認證檢查: ${
          hasAuthToken ? "已認證" : "未認證"
        }`,
      );
    }

    // 返回統一格式的響應
    return res.success(
      {
        isAuthenticated: hasAuthToken,
      },
      hasAuthToken ? "用戶已認證" : "用戶未認證",
    );
  });

  /**
   * 驗證故事所有權
   * 檢查當前用戶是否擁有指定的故事
   */
  public VerifyOwnership = asyncHandler(async (req: Request, res: Response) => {
    // 使用工具函數獲取用戶 ID（自動驗證並拋出錯誤）
    const userId = getCurrentUserId(req);
    const storyId = req.query.storyId as string;

    if (!storyId) {
      throw new BadRequestError("缺少必要的故事ID", {
        field: "storyId",
        suggestion: "請提供要驗證的故事ID",
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[VerifyOwnership Controller] 驗證請求: 用戶${userId}, 故事${storyId}`,
      );
    }

    // 調用資料庫方法驗證所有權
    const result = await UserService.checkOwnership(userId, storyId);

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[VerifyOwnership Controller] 驗證結果: ${result ? "擁有" : "不擁有"}`,
      );
    }

    // 返回統一格式的響應
    return res.success(
      {
        success: result,
        userId,
        storyId,
      },
      result ? "用戶擁有此故事" : "用戶不擁有此故事",
    );
  });
}
