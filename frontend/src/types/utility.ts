/**
 * 工具類型定義
 */

export interface ZhuyinResult {
  zhuyin: string[][];
}

export interface ZhuyinError {
  error: boolean;
  message: string;
}

export type ZhuyinResponse = string[][] | ZhuyinError;
