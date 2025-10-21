import { storyModel } from "../../models/storyModel";
import { currentTimestamp } from "../../utils/tools/tool";
import { OperationResult } from "../types/responses";

/**
 * 故事服務類
 * 負責所有與故事相關的資料庫操作
 */
export class StoryService {
  /**
   * 儲存新故事並返回ID
   * @param storyTale 故事內容
   * @param storyInfo 故事資訊
   * @returns 新故事的ID
   */
  static async createStory(
    storyTale: string,
    storyInfo: string,
  ): Promise<string | null> {
    try {
      const newStory = new storyModel({
        storyTale: storyTale,
        storyInfo: storyInfo,
        is_favorite: false,
        addDate: currentTimestamp(),
      });

      await newStory.save();
      const newStoryId = newStory._id.toString();

      console.log(`[StoryService.createStory] 成功建立故事，ID: ${newStoryId}`);
      return newStoryId;
    } catch (e) {
      console.error(`[StoryService.createStory] 建立故事失敗: ${e}`);
      return null;
    }
  }

  /**
   * 根據ID獲取故事
   * @param _id 故事ID
   * @returns 故事資料
   */
  static async getStoryById(_id: string): Promise<object | null> {
    try {
      const story = await storyModel.findOne({ _id });
      if (story) {
        console.log(`[StoryService.getStoryById] 成功獲取故事: ${_id}`);
      } else {
        console.warn(`[StoryService.getStoryById] 找不到故事: ${_id}`);
      }
      return story;
    } catch (e) {
      console.error(`[StoryService.getStoryById] 獲取故事失敗: ${e}`);
      return null;
    }
  }

  /**
   * 新增單個圖片提示詞到故事
   * @param _id 故事ID
   * @param imagePrompt 圖片提示詞
   */
  static async addImagePrompt(_id: string, imagePrompt: string): Promise<void> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $push: { image_prompt: imagePrompt } },
        { new: true },
      );
      console.log(
        `[StoryService.addImagePrompt] 成功在故事 ${_id} 中新增 image_prompt`,
      );
    } catch (e) {
      console.error(
        `[StoryService.addImagePrompt] 新增 image_prompt 失敗: ${e}`,
      );
    }
  }

  /**
   * 更新故事的圖片提示詞陣列
   * @param _id 故事ID
   * @param imagePrompt 圖片提示詞陣列
   */
  static async updateImagePromptArray(
    _id: string,
    imagePrompt: string[],
  ): Promise<void> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $set: { image_prompt: imagePrompt } },
      );
      console.log(
        `[StoryService.updateImagePromptArray] 成功更新故事 ${_id} 的 image_prompt 陣列`,
      );
    } catch (e) {
      console.error(
        `[StoryService.updateImagePromptArray] 更新 image_prompt 陣列失敗: ${e}`,
      );
    }
  }

  /**
   * 更新故事的圖片Base64陣列
   * @param _id 故事ID
   * @param imageBase64 圖片Base64陣列
   * @deprecated 建議使用 GridFS，使用 updateImageFileIds 方法
   */
  static async updateImageBase64(
    _id: string,
    imageBase64: string[],
  ): Promise<void> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $set: { image_base64: imageBase64 } },
      );
      console.log(
        `[StoryService.updateImageBase64] 成功更新故事 ${_id} 的 image_base64 陣列`,
      );
    } catch (e) {
      console.error(
        `[StoryService.updateImageBase64] 更新 image_base64 失敗: ${e}`,
      );
    }
  }

  /**
   * 更新故事的 GridFS 圖片文件 IDs
   * @param _id 故事ID
   * @param imageFileIds GridFS file IDs 陣列
   */
  static async updateImageFileIds(
    _id: string,
    imageFileIds: string[],
  ): Promise<void> {
    try {
      await storyModel.findOneAndUpdate(
        { _id },
        { $set: { image_file_ids: imageFileIds } },
      );
      console.log(
        `[StoryService.updateImageFileIds] 成功更新故事 ${_id} 的 image_file_ids 陣列 (${imageFileIds.length} 個文件)`,
      );
    } catch (e) {
      console.error(
        `[StoryService.updateImageFileIds] 更新 image_file_ids 失敗: ${e}`,
      );
    }
  }

  /**
   * 檢查故事是否存在
   * @param storyId 故事ID
   * @returns 是否存在
   */
  static async exists(storyId: string): Promise<boolean> {
    try {
      const exists = await storyModel.exists({ _id: storyId });
      return exists !== null;
    } catch (e) {
      console.error(`[StoryService.exists] 檢查故事存在失敗: ${e}`);
      return false;
    }
  }

  /**
   * 刪除故事
   * @param storyId 故事ID
   * @returns 操作結果
   */
  static async deleteStory(storyId: string): Promise<OperationResult> {
    try {
      const result = await storyModel.deleteOne({ _id: storyId });

      if (result.deletedCount === 1) {
        console.log(`[StoryService.deleteStory] 成功刪除故事: ${storyId}`);
        return {
          success: true,
          message: "刪除故事成功",
        };
      } else {
        console.warn(`[StoryService.deleteStory] 找不到故事: ${storyId}`);
        return {
          success: false,
          message: "找不到此故事",
        };
      }
    } catch (e: any) {
      console.error(`[StoryService.deleteStory] 刪除故事失敗: ${e.message}`);
      return {
        success: false,
        message: `刪除故事失敗: ${e.message}`,
      };
    }
  }
}
