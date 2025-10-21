export interface storyInterface {
  storyTale: string;
  storyInfo: string;
  image_file_ids?: string[]; // GridFS file IDs（新增）
  is_favorite: boolean;
  addDate: Date;
}
