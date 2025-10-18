import { Controller } from "../interfaces/Controller";
import { Request, Response } from "express";
import { UserService } from '../database';
import { DataBase } from "../utils/DataBase";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/errorMiddleware";
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  InternalError,
} from "../errors/AppErrors";
import { userModel } from "../models/userModel";

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

  public async Logout(req: Request, res: Response) {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      };
      res.clearCookie("authToken", cookieOptions);

      res.cookie("authToken", "", cookieOptions);

      res.setHeader(
        "Set-Cookie",
        "authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      );

      return res.status(200).json({
        success: true,
        message: "登出成功",
      });
    } catch (error) {
      console.error("登出過程發生錯誤:", error);
      return res.status(500).json({
        success: false,
        message: "登出過程中發生錯誤",
      });
    }
  }

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

    // ✅ 3. 根據 Service 層結果處理錯誤
    if (!result.success) {
      console.error(`[AddUser Controller] 註冊失敗: ${result.message}`);

      // 根據錯誤代碼拋出對應的錯誤類別
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

    // ✅ 4. 記錄成功（開發環境）
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[AddUser Controller] 註冊成功: ${userName} (ID: ${result.data?.id})`,
      );
    }

    // ✅ 5. 返回統一格式的成功響應
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

  public DeleteUser(Request: Request, Response: Response) {
    const { username } = Request.body;
    if (!username) {
      console.error("userName is required to delete a user");
      return Response.status(400).send("userName is required");
    }
    DataBase.DelUser(username)
      .then((result: any) => {
        if (result.success) {
          console.log(result.message);
          return Response.status(200).send(result.message);
        } else {
          console.error(result.message);
          return Response.status(404).send(result.message);
        }
      })
      .catch((e: any) => {
        console.error(`DeleteUser fail: ${e.message}`);
        return Response.status(403).send("AddUser fail");
      });
  }

  public AddFavorite(Request: Request, Response: Response) {
    //let Book: storyInterface = Request.body;
    const BookID = Request.query.bookid;
    if (!BookID) {
      Response.status(403).send(`wrong bookID`);
    }
    DataBase.AddFav(BookID as string)
      .then(() => {
        // console.log(`Successfully added book to favorite`);
        Response.send(`Successfully added book to favorite`);
      })
      .catch((e) => {
        console.error(`Failed added book to favorite`);
      });
  }

  public RemoveFavorite(Request: Request, Response: Response) {
    //let Book: storyInterface = Request.body;
    const BookID = Request.query.bookid;
    if (!BookID) {
      Response.status(403).send(`wrong bookID`);
    }
    DataBase.RemoveFav(BookID as string)
      .then(() => {
        // console.log(`Successfully removed book to favorite`);
        Response.send(`Successfully removed book to favorite`);
      })
      .catch((e) => {
        console.error(`Failed removed book to favorite`);
      });
  }

  public async GetProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await DataBase.GetUserProfile(userId);

      if (result.success) {
        return res.json({
          success: true,
          profile: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "找不到用戶資料",
        });
      }
    } catch (e: any) {
      console.error(`獲取用戶資料失敗: ${e.message}`);
      return res.status(500).json({
        success: false,
        message: "獲取用戶資料時發生錯誤",
      });
    }
  }

  public async UpdateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const updateData = req.body;

      // 驗證更新數據
      if (!this.validateProfileData(updateData)) {
        return res.status(400).json({
          success: false,
          message: "無效的更新數據",
        });
      }

      const result = await DataBase.UpdateUserProfile(userId, updateData);

      if (result.success) {
        return res.json({
          success: true,
          message: "用戶資料更新成功",
          profile: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (e: any) {
      console.error(`更新用戶資料失敗: ${e.message}`);
      return res.status(500).json({
        success: false,
        message: "更新用戶資料時發生錯誤",
      });
    }
  }

  private validateProfileData(data: any): boolean {
    // 實作資料驗證邏輯
    const allowedFields = ["nickname", "email", "phone", "avatar"];
    const hasValidFields = Object.keys(data).every((key) =>
      allowedFields.includes(key),
    );

    return hasValidFields;
  }

  public verifyAuth(req: Request, res: Response) {
    // console.log(`req.cookies.authToken: ${req.cookies.authToken}`)
    if (req.cookies.authToken) {
      return res.status(200).json({ isAuthenticated: true });
    } else {
      return res.status(401).json({ isAuthenticated: false });
    }
  }

  public async verifyOwnership(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const storyId = req.query.storyId;
    const result = await DataBase.CheckOwnership(userId, storyId as string);
    return res.json({ success: result });
  }
}
