# Services 層架構說明

本目錄包含所有前端 API 服務，按照業務領域劃分為不同的服務類。

## 📚 服務列表

### UserService (用戶服務)
負責用戶認證、註冊、登出等功能。

**方法:**
- `login(username, password)` - 用戶登入
- `logout()` - 用戶登出
- `register(username, password)` - 用戶註冊
- `verifyAuth()` - 驗證認證狀態

**使用示例:**
```typescript
import { UserService } from '@/services';

// 登入
const result = await UserService.login('username', 'password');
if (result.success) {
  console.log('登入成功', result.user);
}

// 驗證認證
const authStatus = await UserService.verifyAuth();
if (authStatus.isAuthenticated) {
  console.log('用戶已認證');
}
```

### StoryService (故事服務)
負責故事生成、獲取、管理等功能。

**方法:**
- `generateStory(roleForm, voiceModelName)` - 生成新故事
- `startStory(storyId)` - 開始/獲取故事
- `getBookList()` - 獲取故事列表
- `verifyOwnership(storyId)` - 驗證故事所有權
- `generateImagePrompt(storyArray, storyId, roleform)` - 生成圖片提示詞
- `getAllSDModels()` - 獲取所有 Stable Diffusion 模型

**使用示例:**
```typescript
import { StoryService } from '@/services';

// 獲取故事列表
const bookList = await StoryService.getBookList();

// 開始故事
const story = await StoryService.startStory('story-id-123');

// 驗證所有權
const ownership = await StoryService.verifyOwnership('story-id-123');
if (ownership.success) {
  console.log('用戶擁有此故事');
}
```

### VoiceService (語音服務)
負責語音上傳、獲取、列表等功能。

**方法:**
- `getVoice(storyId, pageIndex)` - 獲取語音文件
- `uploadVoice(audioBlob, audioName)` - 上傳語音文件
- `getVoiceList()` - 獲取語音列表

**使用示例:**
```typescript
import { VoiceService } from '@/services';

// 獲取語音
const audioBlob = await VoiceService.getVoice('story-id', 0);
if (audioBlob) {
  // 播放音頻
}

// 上傳語音
const result = await VoiceService.uploadVoice(blob, 'my-voice');
if (result.result) {
  console.log('上傳成功');
}

// 獲取語音列表
const voiceList = await VoiceService.getVoiceList();
if (voiceList.success) {
  console.log('語音列表', voiceList.data);
}
```

### UtilityService (工具服務)
負責各種工具類功能。

**方法:**
- `makeZhuyin(text)` - 將文字轉換為注音

**使用示例:**
```typescript
import { UtilityService } from '@/services';

// 轉換注音
const zhuyin = await UtilityService.makeZhuyin('你好世界');
if (!('error' in zhuyin)) {
  console.log('注音結果', zhuyin);
} else {
  console.error('轉換失敗', zhuyin.message);
}
```

## 🏗️ 架構設計原則

### 1. 單一職責
每個服務只負責特定領域的 API 請求，不混雜其他邏輯。

### 2. 統一響應
所有服務使用 `ResponseHandler` 進行統一的響應處理，確保錯誤處理一致。

### 3. 類型安全
每個服務都有對應的 TypeScript 類型定義，確保類型安全。

### 4. 靜態方法
所有服務使用靜態方法，無需實例化，使用更方便。

### 5. 可測試性
每個服務可以獨立測試，不依賴其他服務。

## 📦 統一導出

所有服務和類型通過 `services/index.ts` 統一導出：

```typescript
// ✅ 推薦：統一導入
import { UserService, StoryService, VoiceService, UtilityService } from '@/services';
import type { User, Story, VoiceItem } from '@/services';

// ❌ 避免：分散導入
import { UserService } from '@/services/userService';
import { User } from '@/types/user';
```

## 🔧 響應處理

所有 API 請求都經過 `ResponseHandler` 處理，確保：

1. **統一的響應格式**: 
```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  details?: Record<string, any>;
}
```

2. **自動的錯誤處理**: 捕獲網絡錯誤、JSON 解析錯誤等
3. **Cookie 管理**: 自動攜帶認證 Cookie
4. **類型推斷**: TypeScript 自動推斷響應數據類型

## 🎯 最佳實踐

### 1. 錯誤處理

```typescript
// ✅ 推薦：總是檢查 success
const result = await UserService.login(username, password);
if (!result.success) {
  // 處理錯誤
  showError(result.message || '登入失敗');
  return;
}
// 使用 result.data
```

### 2. 類型使用

```typescript
// ✅ 推薦：使用類型定義
import type { User, UserLoginResponse } from '@/services';

const handleLogin = async (): Promise<UserLoginResponse> => {
  return await UserService.login(username, password);
};
```

### 3. 異步處理

```typescript
// ✅ 推薦：使用 async/await
const loadData = async () => {
  setLoading(true);
  try {
    const result = await StoryService.getBookList();
    if (result) {
      setBooks(result.books);
    }
  } catch (error) {
    console.error('載入失敗', error);
  } finally {
    setLoading(false);
  }
};
```

### 4. 組件中使用

```typescript
import React, { useState, useEffect } from 'react';
import { UserService } from '@/services';

const MyComponent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const status = await UserService.verifyAuth();
      setIsAuthenticated(status.isAuthenticated);
    };
    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const result = await UserService.login(username, password);
    if (result.success) {
      setIsAuthenticated(true);
      // 導航到其他頁面
    } else {
      // 顯示錯誤訊息
    }
  };

  return <div>{/* UI */}</div>;
};
```

## 🚀 擴展服務

如需添加新的 API 方法：

1. 在對應的服務文件中添加靜態方法
2. 在 `types/` 目錄添加相應的類型定義
3. 使用 `ResponseHandler` 進行請求處理
4. 在 `services/index.ts` 中導出（如果添加了新服務）

**示例：添加新方法**

```typescript
// userService.ts
export class UserService {
  // 現有方法...

  /**
   * 更新用戶資料
   * @param userId - 用戶 ID
   * @param data - 更新數據
   * @returns 更新結果
   */
  static async updateProfile(
    userId: string,
    data: Partial<User>
  ): Promise<ResponseResult<User>> {
    return await ResponseHandler.put<User>(
      `${apis.userProfile}/${userId}`,
      data
    );
  }
}
```

## 📖 相關文檔

- [ResponseHandler 使用指南](../utils/responseHandler.ts)
- [API 端點配置](../utils/tools/api.ts)
- [類型定義](../types/)
- [遷移指南](../../MIGRATION_GUIDE.md)
