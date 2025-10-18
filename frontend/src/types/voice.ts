/**
 * 語音相關類型定義
 */

export interface VoiceItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface VoiceListResponse {
  success: boolean;
  code: number;
  message: string;
  data?: VoiceItem[];
}

export interface GetVoiceRequest {
  storyId: string;
  pageIndex: number;
}

export interface UploadVoiceRequest {
  audioBlob: Blob;
  audioName: string;
}

export interface UploadVoiceResponse {
  result: boolean;
  message: string;
}
