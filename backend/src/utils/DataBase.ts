import { connect } from "mongoose";
import { userModel } from "../models/userModel";
import { storyModel } from "../models/storyModel";
import { CurrentTime } from "./tools/tool";
import { userInterface } from "../interfaces/userInterface";
import { BookManageListInterface } from "../interfaces/BookManageListInterface";

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
    this.DB = await connect(url);
  }

  static async SaveNewStory_returnID(
    storyTale: string,
    storyInfo: string,
  ): Promise<any> {
    try {
      const newstory = new storyModel({
        storyTale: storyTale,
        storyInfo: storyInfo,
        is_favorite: false,
        addDate: CurrentTime(),
      });
      console.log(`save newstory success`);
      await newstory.save();

      const newStoryId = newstory._id;
      return newStoryId;
    } catch (e) {
      console.log(`SaveNewStory fail, error:${e}`);
    }
  }

  //用ID 拿書(單一一本)
  static async getStoryById(_id: string): Promise<object | any> {
    try {
      const storyTale = await storyModel.findOne({ _id });
      // console.log(typeof storyTale)
      return storyTale;
    } catch (e) {
      console.log(`getStoryById fail, ${e}`);
    }
  }

  static async getstoryList(userId: string): Promise<any> {
    try {
      let returnUserData: any = await userModel.findById(userId);
      // console.log(`returnValue: ${JSON.stringify(returnUserData)}`)
      if (!returnUserData) {
        return { success: false, message: "getstoryList fail, user not found" };
      }
      let returnUserData_booklist: userInterface["booklist"] =
        returnUserData.booklist!;
      const validBookIds = await Promise.all(
        returnUserData_booklist.map(async (bookId) => ({
          bookId,
          exists: await storyModel.exists({ _id: bookId }),
        })),
      );

      returnUserData_booklist = validBookIds
        .filter((item) => item.exists)
        .map((item) => item.bookId);

      const returnBookData: BookManageListInterface[] = await Promise.all(
        returnUserData_booklist.map(async (bookId) => {
          const bookData = await storyModel.findById(bookId);
          if (!bookData) {
            return {
              bookId: "",
              bookName: "",
              bookFirstImageBase64: "",
            };
          }
          return {
            bookId: bookData._id.toString(),
            bookName: bookData.storyTale.split("\n\n")[0] || "",
            bookFirstImageBase64: bookData.image_base64?.[0] || "",
          };
        }),
      );
      return {
        success: true,
        message: "getstoryList success",
        value: returnBookData,
      };
    } catch (e: any) {
      return { success: false, message: `getstoryList fail ${e.message}` };
    }
  }

  static async Update_StoryImagePromptSingle(
    _id: string,
    imagePrompt: string,
  ): Promise<object | any> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $push: { image_prompt: imagePrompt } },
        { new: true },
      );
      console.log(`成功在 ID ${_id} 的故事中新增一筆 image_prompt`);
    } catch (e) {
      console.log(`新增 image_prompt 失敗，錯誤：${e}`);
    }
  }

  static async Update_StoryImagePromptArray(
    _id: string,
    imagePrompt: string[],
  ): Promise<object | any> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $set: { image_prompt: imagePrompt } },
        // { new: true }
      );
      console.log(`Success update id ${_id} story's image_prompt array`);
    } catch (e) {
      console.log(`Update_StoryImagePrompt fail, ${e}`);
    }
  }

  static async Update_StoryImage_Base64(
    _id: string,
    imageBase64: string[],
  ): Promise<object | any> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $set: { image_base64: imageBase64 } },
        // { new: true }
      );
      console.log(`Success update id ${_id} story's image_base64 array`);
    } catch (e) {
      console.log(`Update_StoryImage_Base64 fail, ${e}`);
    }
  }

  static async isNameTaken(name: string): Promise<boolean> {
    const user = await userModel.findOne({ userName: name });
    return user !== null;
  }

  static async VerifyUser(
    userName: string,
    userPassword: string,
  ): Promise<{ success: boolean; userId?: string; message: string }> {
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
      console.error(`認證用戶時發生錯誤：${error.message}`);
      return { success: false, message: "認證過程中發生錯誤" };
    }
  }

  /**
   * 建立新用戶
   * Service 層方法 - 集中所有業務邏輯
   *
   * @param name 用戶名
   * @param password 密碼
   * @param permissions 用戶權限等級（預設為 'user'）
   * @returns 操作結果
   */
  static async SaveNewUser(
    name: string,
    password: string,
    permissions: string = "user",
  ): Promise<{
    success: boolean;
    message: string;
    code: number;
    data?: {
      id: string;
      userName: string;
      permissions: string;
      createdAt: Date;
    };
  }> {
    try {
      if (await DataBase.isNameTaken(name)) {
        console.error(`[SaveNewUser] 用戶名 "${name}" 已存在`);
        return {
          success: false,
          message: `用戶名 "${name}" 已被使用，請選擇其他用戶名`,
          code: 409, // Conflict
        };
      }

      if (password.length < 6) {
        console.warn(`[SaveNewUser] 密碼過短: ${name}`);
        return {
          success: false,
          message: "密碼長度至少需要 6 個字元",
          code: 400, // Bad Request
        };
      }

      const validPermissions = ["user", "admin", "moderator"];
      if (!validPermissions.includes(permissions)) {
        console.warn(`[SaveNewUser] 非法權限: ${permissions}`);
        permissions = "user"; // 默認為普通用戶
      }

      const newUser = new userModel({
        userName: name,
        userPassword: password,
        permissions: permissions,
        booklist: [],
      });

      await newUser.save();

      console.log(`[SaveNewUser] 成功建立用戶: ${name} (ID: ${newUser._id})`);

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
      const errorMessage = `SaveNewUser 失敗: ${error.message}`;
      console.error(`[SaveNewUser] ${errorMessage}`);

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

  static async DelUser(name: String) {
    try {
      const result = await userModel.deleteOne({ userName: name });
      if (result.deletedCount === 1) {
        return { success: true, message: "DelUser succeed" };
      } else {
        return { success: false, message: `找不到使用者: ${name}` };
      }
    } catch (e: any) {
      const errorMessage = `DelUser  fail: ${e.message}`;
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }

  static async AddFav(story_id: string) {
    try {
      const Book = await storyModel.findById(story_id);
      // test用
      console.log(`Received story_id: ${story_id}`);

      if (Book) {
        Book.is_favorite = true;
        await Book.save();
        console.log(`DB Successfully added book to favorite`);
      } else {
        console.error(`Can not find this book`);
      }
    } catch (e) {
      console.error(`DB Failed added book to favorite`);
    }
  }

  static async RemoveFav(story_id: string) {
    try {
      const Book = await storyModel.findById(story_id);
      // test用 console.log(`Received story_id: ${story_id}`);
      if (Book) {
        Book.is_favorite = false;
        await Book.save();
        console.log(`Successfully removed book to favorite`);
      } else {
        console.error(`Can not find this book`);
      }
    } catch (e) {
      console.error(`Failed removed book to favorite`);
    }
  }

  public static async GetUserProfile(userId: string) {
    try {
      const user = await userModel
        .findById(userId)
        .select("userName email nickname phone avatar -_id")
        .lean();

      if (!user) {
        return {
          success: false,
          message: "找不到用戶資料",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (e: any) {
      console.error(`獲取用戶資料失敗: ${e.message}`);
      throw e;
    }
  }

  public static async UpdateUserProfile(userId: string, updateData: any) {
    try {
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
        return {
          success: false,
          message: "找不到用戶資料",
        };
      }

      return {
        success: true,
        message: "更新成功",
        data: updatedUser,
      };
    } catch (e: any) {
      console.error(`更新用戶資料失敗: ${e.message}`);
      throw e;
    }
  }

  public static async saveNewBookId(storyId: string, userId: string) {
    try {
      // 將 storyId 轉換為字串
      const storyIdString = storyId.toString();

      const user = await userModel.findByIdAndUpdate(
        userId,
        { $push: { booklist: storyIdString } },
        { new: true },
      );

      if (!user) {
        return {
          success: false,
          message: "找不到用戶",
        };
      }

      return {
        success: true,
      };
    } catch (e: any) {
      console.error(`添加書本ID失敗: ${e.message}`);
      return {
        success: false,
        message: `添加書本ID失敗: ${e.message}`,
      };
    }
  }

  public static async CheckOwnership(
    userId: string,
    storyId: string,
  ): Promise<boolean> {
    try {
      const user = await userModel.findById(userId);
      if (!user || !user.booklist) return false;
      return user.booklist.some((id) => id.toString() === storyId);
    } catch (e) {
      console.error(`檢查所有權失敗: ${e}`);
      return false;
    }
  }
}
