import { userModel } from "../../models/userModel";
import { storyModel } from "../../models/storyModel";
import { userInterface } from "../../interfaces/userInterface";
import { BookManageListInterface } from "../../interfaces/BookManageListInterface";
import {
  OperationResult,
  UserData,
  UserProfile,
  VerifyResult,
} from "../types/responses";

/**
 * 用戶服務類
 * 負責所有與用戶相關的資料庫操作
 */
export class UserService {
  /**
   * 檢查用戶名是否已被使用
   * @param name 用戶名
   * @returns 是否已被使用
   */
  static async isNameTaken(name: string): Promise<boolean> {
    const user = await userModel.findOne({ userName: name });
    return user !== null;
  }

  /**
   * 驗證用戶登入
   * @param userName 用戶名
   * @param userPassword 密碼
   * @returns 驗證結果
   */
  static async verifyUser(
    userName: string,
    userPassword: string,
  ): Promise<VerifyResult> {
    try {
      const user = await userModel.findOne({ userName: userName });
      if (!user) {
        return { success: false, message: "用戶不存在" };
      }

      if (user.userPassword !== userPassword) {
        return { success: false, message: "密碼錯誤" };
      }

      return {
        success: true,
        userId: user._id.toString(),
        message: "認證成功",
      };
    } catch (error: any) {
      console.error(`[UserService.verifyUser] 認證用戶時發生錯誤：${error.message}`);
      return { success: false, message: "認證過程中發生錯誤" };
    }
  }

  /**
   * 建立新用戶
   * @param name 用戶名
   * @param password 密碼
   * @param permissions 用戶權限等級（預設為 'user'）
   * @returns 操作結果
   */
  static async createUser(
    name: string,
    password: string,
    permissions: string = "user",
  ): Promise<OperationResult<UserData>> {
    try {
      // 檢查用戶名是否已存在
      if (await UserService.isNameTaken(name)) {
        console.error(`[UserService.createUser] 用戶名 "${name}" 已存在`);
        return {
          success: false,
          message: `用戶名 "${name}" 已被使用，請選擇其他用戶名`,
          code: 409, // Conflict
        };
      }

      // 密碼長度驗證
      if (password.length < 6) {
        console.warn(`[UserService.createUser] 密碼過短: ${name}`);
        return {
          success: false,
          message: "密碼長度至少需要 6 個字元",
          code: 400, // Bad Request
        };
      }

      // 權限驗證
      const validPermissions = ["user", "admin", "moderator"];
      if (!validPermissions.includes(permissions)) {
        console.warn(`[UserService.createUser] 非法權限: ${permissions}`);
        permissions = "user"; // 默認為普通用戶
      }

      // 建立新用戶
      const newUser = new userModel({
        userName: name,
        userPassword: password,
        permissions: permissions,
        booklist: [],
      });

      await newUser.save();

      console.log(
        `[UserService.createUser] 成功建立用戶: ${name} (ID: ${newUser._id})`,
      );

      return {
        success: true,
        message: "用戶建立成功",
        code: 201, // Created
        data: {
          id: newUser._id.toString(),
          userName: newUser.userName,
          permissions: newUser.permissions,
          createdAt: newUser.createdAt as Date,
        },
      };
    } catch (error: any) {
      const errorMessage = `createUser 失敗: ${error.message}`;
      console.error(`[UserService.createUser] ${errorMessage}`);

      // 根據錯誤類型返回對應的狀態碼
      if (error.code === 11000) {
        // MongoDB 重複鍵錯誤
        return {
          success: false,
          message: "用戶名已存在",
          code: 409,
        };
      }

      return {
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "建立用戶過程中發生錯誤"
            : errorMessage,
        code: 500, // Internal Server Error
      };
    }
  }

  /**
   * 刪除用戶
   * @param name 用戶名
   * @returns 操作結果
   */
  static async deleteUser(name: string): Promise<OperationResult> {
    try {
      const result = await userModel.deleteOne({ userName: name });
      if (result.deletedCount === 1) {
        console.log(`[UserService.deleteUser] 成功刪除用戶: ${name}`);
        return { success: true, message: "刪除用戶成功" };
      } else {
        console.warn(`[UserService.deleteUser] 找不到使用者: ${name}`);
        return { success: false, message: `找不到使用者: ${name}` };
      }
    } catch (e: any) {
      const errorMessage = `deleteUser 失敗: ${e.message}`;
      console.error(`[UserService.deleteUser] ${errorMessage}`);
      return { success: false, message: errorMessage };
    }
  }

  /**
   * 獲取用戶個人資料
   * @param userId 用戶ID
   * @returns 用戶資料
   */
  static async getUserProfile(
    userId: string,
  ): Promise<OperationResult<UserProfile>> {
    try {
      const user = await userModel
        .findById(userId)
        .select("userName email nickname phone avatar -_id")
        .lean();

      if (!user) {
        console.warn(`[UserService.getUserProfile] 找不到用戶: ${userId}`);
        return {
          success: false,
          message: "找不到用戶資料",
        };
      }

      return {
        success: true,
        message: "獲取用戶資料成功",
        data: user as UserProfile,
      };
    } catch (e: any) {
      console.error(`[UserService.getUserProfile] 錯誤: ${e.message}`);
      throw e;
    }
  }

  /**
   * 更新用戶個人資料
   * @param userId 用戶ID
   * @param updateData 要更新的資料
   * @returns 更新後的用戶資料
   */
  static async updateUserProfile(
    userId: string,
    updateData: Partial<UserProfile>,
  ): Promise<OperationResult<UserProfile>> {
    try {
      // 過濾允許更新的欄位
      const allowedFields = ["nickname", "email", "phone", "avatar"];
      const filteredData = Object.entries(updateData)
        .filter(([key]) => allowedFields.includes(key))
        .reduce(
          (obj, [key, value]) => ({
            ...obj,
            [key]: value,
          }),
          {},
        );

      const updatedUser = await userModel
        .findByIdAndUpdate(
          userId,
          { $set: filteredData },
          {
            new: true, // 返回更新後的文檔
            select: "userName email nickname phone avatar -_id",
          },
        )
        .lean();

      if (!updatedUser) {
        console.warn(`[UserService.updateUserProfile] 找不到用戶: ${userId}`);
        return {
          success: false,
          message: "找不到用戶資料",
        };
      }

      console.log(`[UserService.updateUserProfile] 成功更新用戶: ${userId}`);
      return {
        success: true,
        message: "更新成功",
        data: updatedUser as UserProfile,
      };
    } catch (e: any) {
      console.error(`[UserService.updateUserProfile] 錯誤: ${e.message}`);
      throw e;
    }
  }

  /**
   * 獲取用戶的故事列表
   * @param userId 用戶ID
   * @returns 故事列表
   */
  static async getUserStoryList(
    userId: string,
  ): Promise<void> {
    
  }

  /**
   * 將新書本ID添加到用戶的書單
   * @param storyId 故事ID
   * @param userId 用戶ID
   * @returns 操作結果
   */
  static async addStoryToUser(
    storyId: string,
    userId: string,
  ): Promise<OperationResult> {
    try {
      const storyIdString = storyId.toString();

      const user = await userModel.findByIdAndUpdate(
        userId,
        { $push: { booklist: storyIdString } },
        { new: true },
      );

      if (!user) {
        console.warn(`[UserService.addStoryToUser] 找不到用戶: ${userId}`);
        return {
          success: false,
          message: "找不到用戶",
        };
      }

      console.log(
        `[UserService.addStoryToUser] 成功添加故事 ${storyId} 到用戶 ${userId}`,
      );
      return {
        success: true,
        message: "添加書本成功",
      };
    } catch (e: any) {
      console.error(`[UserService.addStoryToUser] 錯誤: ${e.message}`);
      return {
        success: false,
        message: `添加書本ID失敗: ${e.message}`,
      };
    }
  }

  /**
   * 檢查用戶是否擁有某個故事
   * @param userId 用戶ID
   * @param storyId 故事ID
   * @returns 是否擁有
   */
  static async checkOwnership(
    userId: string,
    storyId: string,
  ): Promise<boolean> {
    try {
      const user = await userModel.findById(userId);
      if (!user || !user.booklist) {
        console.warn(
          `[UserService.checkOwnership] 用戶 ${userId} 不存在或沒有書單`,
        );
        return false;
      }
      const hasOwnership = user.booklist.some(
        (id) => id.toString() === storyId,
      );
      console.log(
        `[UserService.checkOwnership] 用戶 ${userId} ${hasOwnership ? "擁有" : "不擁有"} 故事 ${storyId}`,
      );
      return hasOwnership;
    } catch (e) {
      console.error(`[UserService.checkOwnership] 檢查所有權失敗: ${e}`);
      return false;
    }
  }
}
