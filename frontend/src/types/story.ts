/**
 * 故事相關類型定義
 */

export interface Story {
  storyId: string;
  [key: string]: any;
}

export interface GenStoryRequest {
  roleform: Object;
  voiceModelName: string;
}

export interface GenStoryResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface BookManageItem {
  id: string;
  title: string;
  [key: string]: any;
}

export interface BookManageList {
  books: BookManageItem[];
  total: number;
}

export interface StoryOwnershipResponse {
  success: boolean;
}

export interface GenImagePromptRequest {
  storyArray: string[];
  storyId: string;
  roleform: any;
}

export interface GenImagePromptResponse {
  success: boolean;
  message?: string;
}
