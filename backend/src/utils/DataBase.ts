import { ConnectionManager, UserService, StoryService } from "../database";

/**
 * DataBase 類 - 向後兼容的包裝器
 * 此類保持原有的 API 接口，內部委託給新的模組化服務
 *
 * @deprecated 建議直接使用 database 模組中的服務類：
 * - ConnectionManager: 資料庫連線管理
 * - UserService: 用戶相關操作
 * - StoryService: 故事相關操作
 */
export class DataBase {
  DB!: typeof import("mongoose");

  constructor(url: string) {
    this.init(url)
      .then(() => {
        console.log(`success: connect to  ${url}`);
      })
      .catch((error) => {
        console.log(`error: can't connect to ${url}, ${error}`);
      });
  }

  async init(url: string): Promise<void> {
    const connectionManager = ConnectionManager.getInstance();
    await connectionManager.connect(url);
    this.DB = connectionManager.getDB();
  }

  // ==================== Story 相關方法 ====================

  static async SaveNewStory_returnID(
    storyTale: string,
    storyInfo: string,
  ): Promise<any> {
    return await StoryService.createStory(storyTale, storyInfo);
  }

  static async getStoryById(_id: string): Promise<object | any> {
    return await StoryService.getStoryByStoryId(_id);
  }

  static async getstoryList(userId: string): Promise<any> {
    // TODO: getUserStoryList 尚未實作，暫時返回空列表
    return {
      success: true,
      message: "獲取故事列表（功能待實作）",
      value: [],
    };
  }

  static async Update_StoryImagePromptSingle(
    _id: string,
    imagePrompt: string,
  ): Promise<object | any> {
    return await StoryService.addImagePrompt(_id, imagePrompt);
  }

  static async Update_StoryImagePromptArray(
    _id: string,
    imagePrompt: string[],
  ): Promise<object | any> {
    return await StoryService.updateImagePromptArray(_id, imagePrompt);
  }

  static async Update_StoryImage_Base64(
    _id: string,
    imageBase64: string[],
  ): Promise<object | any> {
    return await StoryService.updateImageBase64(_id, imageBase64);
  }

  static async Update_StoryImageFileIds(
    _id: string,
    imageFileIds: string[],
  ): Promise<object | any> {
    return await StoryService.updateImageFileIds(_id, imageFileIds);
  }

  // ==================== User 相關方法 ====================

  static async isNameTaken(name: string): Promise<boolean> {
    return await UserService.isNameTaken(name);
  }

  static async VerifyUser(
    userName: string,
    userPassword: string,
  ): Promise<{ success: boolean; userId?: string; message: string }> {
    return await UserService.verifyUser(userName, userPassword);
  }

  static async SaveNewUser(
    name: string,
    password: string,
    permissions: string = "user",
  ): Promise<{
    success: boolean;
    message: string;
    code?: number;
    data?: {
      id: string;
      userName: string;
      permissions: string;
      createdAt: Date;
    };
  }> {
    return await UserService.createUser(name, password, permissions);
  }

  static async DelUser(name: String) {
    return await UserService.deleteUser(name as string);
  }

  public static async GetUserProfile(userId: string) {
    return await UserService.getUserProfile(userId);
  }

  public static async UpdateUserProfile(userId: string, updateData: any) {
    return await UserService.updateUserProfile(userId, updateData);
  }

  public static async saveNewBookId(storyId: string, userId: string) {
    return await UserService.addStoryToUser(storyId, userId);
  }

  public static async CheckOwnership(
    userId: string,
    storyId: string,
  ): Promise<boolean> {
    return await UserService.checkOwnership(userId, storyId);
  }
}
