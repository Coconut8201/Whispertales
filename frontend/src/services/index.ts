/**
 * API 服務統一導出
 * 提供所有 API 服務的統一入口
 *
 * 使用方式:
 * ```typescript
 * import { UserService, StoryService, VoiceService, UtilityService } from '@/services';
 *
 * // 用戶登入
 * const result = await UserService.login(username, password);
 *
 * // 獲取故事列表
 * const stories = await StoryService.getBookList();
 *
 * // 上傳語音
 * const uploadResult = await VoiceService.uploadVoice(blob, name);
 *
 * // 轉換注音
 * const zhuyin = await UtilityService.makeZhuyin(text);
 * ```
 */

export { UserService } from './userService';
export { StoryService } from './storyService';
export { VoiceService } from './voiceService';
export { UtilityService } from './utilityService';

// 也可以導出類型
export type * from '../types/user';
export type * from '../types/story';
export type * from '../types/voice';
export type * from '../types/utility';
