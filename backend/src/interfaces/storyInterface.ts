export interface storyInterface {
  storyTale: string;
  storyInfo: string;
  image_prompt?: string[]; // 圖片生成提示詞（選填）
  image_base64?: string[]; // 已棄用，保留向後兼容
  image_file_ids?: string[]; // GridFS file IDs（新增）
  is_favorite: boolean;
  addDate: Date;
}
