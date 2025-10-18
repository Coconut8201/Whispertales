# API 重構遷移指南

本文檔說明如何將現有代碼從舊的 `fetch.ts` 遷移到新的服務層架構。

## 📁 新的架構

```
frontend/src/
├── services/              # API 服務層（新增）
│   ├── userService.ts     # 用戶相關 API
│   ├── storyService.ts    # 故事相關 API
│   ├── voiceService.ts    # 語音相關 API
│   ├── utilityService.ts  # 工具類 API
│   └── index.ts           # 統一導出
├── types/                 # 類型定義
│   ├── response.ts        # API 響應類型
│   ├── user.ts           # 用戶類型
│   ├── story.ts          # 故事類型
│   ├── voice.ts          # 語音類型
│   └── utility.ts        # 工具類型
└── utils/
    ├── responseHandler.ts # 響應處理器
    └── tools/
        └── api.ts         # API 端點配置
```

## 🔄 API 映射表

### 用戶相關 (UserService)

| 舊函數 | 新函數 | 說明 |
|--------|--------|------|
| `userLogin(username, password)` | `UserService.login(username, password)` | 用戶登入 |
| `userLogout()` | `UserService.logout()` | 用戶登出 |
| `userRegister(username, password)` | `UserService.register(username, password)` | 用戶註冊 |
| `verifyAuth()` | `UserService.verifyAuth()` | 驗證認證狀態 |

### 故事相關 (StoryService)

| 舊函數 | 新函數 | 說明 |
|--------|--------|------|
| `GenStory(roleForm, voiceModelName)` | `StoryService.generateStory(roleForm, voiceModelName)` | 生成故事 |
| `StartStory_api(storyId)` | `StoryService.startStory(storyId)` | 開始/獲取故事 |
| `getBookList()` | `StoryService.getBookList()` | 獲取故事列表 |
| `verifyStoryOwnership(storyId)` | `StoryService.verifyOwnership(storyId)` | 驗證故事所有權 |
| `genImagePrompt(storyArray, storyId, roleform)` | `StoryService.generateImagePrompt(storyArray, storyId, roleform)` | 生成圖片提示詞 |
| `GetALLSDModel()` | `StoryService.getAllSDModels()` | 獲取所有 SD 模型 |

### 語音相關 (VoiceService)

| 舊函數 | 新函數 | 說明 |
|--------|--------|------|
| `GetVoice(storyId, pageIndex)` | `VoiceService.getVoice(storyId, pageIndex)` | 獲取語音 |
| `UploadVoice(audioBlob, audioName)` | `VoiceService.uploadVoice(audioBlob, audioName)` | 上傳語音 |
| `getVoiceList()` | `VoiceService.getVoiceList()` | 獲取語音列表 |

### 工具類 (UtilityService)

| 舊函數 | 新函數 | 說明 |
|--------|--------|------|
| `makeZhuyin(text)` | `UtilityService.makeZhuyin(text)` | 轉換注音 |

## 📝 遷移示例

### 1. 用戶登入

**舊代碼:**
```typescript
import { userLogin } from "../utils/tools/fetch";

const result = await userLogin(username, password);
if (result.success) {
  console.log("登入成功", result.user);
}
```

**新代碼:**
```typescript
import { UserService } from "../services";

const result = await UserService.login(username, password);
if (result.success) {
  console.log("登入成功", result.user);
}
```

### 2. 獲取故事列表

**舊代碼:**
```typescript
import { getBookList } from "../utils/tools/fetch";

const bookList = await getBookList();
```

**新代碼:**
```typescript
import { StoryService } from "../services";

const bookList = await StoryService.getBookList();
```

### 3. 上傳語音

**舊代碼:**
```typescript
import { UploadVoice } from "../utils/tools/fetch";

const result = await UploadVoice(audioBlob, audioName);
if (result.result) {
  console.log("上傳成功");
}
```

**新代碼:**
```typescript
import { VoiceService } from "../services";

const result = await VoiceService.uploadVoice(audioBlob, audioName);
if (result.result) {
  console.log("上傳成功");
}
```

### 4. 轉換注音

**舊代碼:**
```typescript
import { makeZhuyin } from "../utils/tools/fetch";

const zhuyin = await makeZhuyin(text);
```

**新代碼:**
```typescript
import { UtilityService } from "../services";

const zhuyin = await UtilityService.makeZhuyin(text);
```

## ✨ 新架構的優勢

1. **模塊化**: 功能按照領域劃分，更易於維護
2. **類型安全**: 完整的 TypeScript 類型定義
3. **統一的響應處理**: 所有 API 使用相同的響應格式
4. **清晰的命名**: 使用服務類和方法，更符合面向對象的設計
5. **易於測試**: 每個服務可以獨立測試
6. **易於擴展**: 新增 API 只需在對應的服務中添加方法

## 🚀 遷移步驟

1. **逐步遷移**: 不需要一次性遷移所有代碼
2. **保持舊代碼**: 在遷移完成前，保留 `fetch.ts` 文件
3. **更新導入**: 將組件中的導入語句改為使用新的服務
4. **測試功能**: 每次遷移後測試相關功能
5. **刪除舊代碼**: 所有組件遷移完成後，可以刪除 `fetch.ts`

## 📌 注意事項

- 新的服務使用 `static` 方法，無需實例化
- 響應格式保持一致，減少代碼修改
- 所有服務都通過 `services/index.ts` 統一導出
- 類型定義可以直接從 `services` 導入

## 🔍 需要更新的文件

以下是可能需要更新的組件列表：

- [x] `components/Login.tsx` - 已更新使用 `UserService.login`
- [ ] `components/Register.tsx` - 需更新使用 `UserService.register`
- [ ] `components/Voice.tsx` - 需更新使用 `VoiceService`
- [ ] `components/Generate.tsx` - 需更新使用 `StoryService.generateStory`
- [ ] 其他使用 `fetch.ts` 的組件...

## 💡 最佳實踐

```typescript
// ✅ 推薦：使用統一的服務導入
import { UserService, StoryService, VoiceService } from "@/services";

// ❌ 避免：從多個文件分別導入
import { UserService } from "@/services/userService";
import { StoryService } from "@/services/storyService";

// ✅ 推薦：使用類型定義
import type { User, Story } from "@/services";

// ✅ 推薦：處理錯誤
const result = await UserService.login(username, password);
if (!result.success) {
  console.error("登入失敗", result.message);
  return;
}
// 使用 result.user
```

## 🎯 完成標準

遷移完成後，應該達到以下標準：

- [ ] 所有組件都使用新的服務 API
- [ ] 沒有組件直接導入 `utils/tools/fetch.ts`
- [ ] 所有功能正常運作
- [ ] TypeScript 編譯無錯誤
- [ ] 可以安全刪除 `utils/tools/fetch.ts`（或將其標記為廢棄）
