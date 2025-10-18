export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  details?: Record<string, any>;
  timestamp?: string; // 可選字段
}
