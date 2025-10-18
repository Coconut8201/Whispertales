# Database 模組使用指南

## 📖 概述

這個模組提供了結構化的資料庫操作服務，使用單例模式管理資料庫連線，並將用戶和故事相關的操作分離到不同的服務類中。

## 🏗️ 架構

```
database/
├── index.ts                    # 統一導出入口
├── connection/
│   └── ConnectionManager.ts    # 資料庫連線管理（單例）
├── services/
│   ├── UserService.ts          # 用戶相關操作
│   └── StoryService.ts         # 故事相關操作
└── types/
    └── responses.ts            # 共享類型定義
```

## 🚀 快速開始

### 1. 初始化資料庫連線（僅在 app.ts 中執行一次）

```typescript
import { ConnectionManager } from './database';

const connectionManager = ConnectionManager.getInstance();
await connectionManager.connect(process.env.MONGO_DB_Connect!);
```

**重要**: 由於使用了單例模式，整個應用程式只需要連線一次。之後所有的 Service 都會自動使用這個連線。

### 2. 在 Controller 中使用服務

```typescript
import { UserService, StoryService } from '../database';

// 不需要再次連線，直接使用服務即可！
const result = await UserService.createUser('username', 'password');
const story = await StoryService.createStory('tale', 'info');
```

## 📚 服務類方法

### UserService

#### 用戶認證
```typescript
// 檢查用戶名是否已被使用
const isTaken = await UserService.isNameTaken('username');

// 驗證用戶登入
const result = await UserService.verifyUser('username', 'password');
// 返回: { success: boolean, userId?: string, message: string }
```

#### 用戶管理
```typescript
// 建立新用戶
const result = await UserService.createUser('username', 'password', 'user');
// 返回: OperationResult<UserData>

// 刪除用戶
const result = await UserService.deleteUser('username');
// 返回: OperationResult
```

#### 用戶資料
```typescript
// 獲取用戶個人資料
const profile = await UserService.getUserProfile(userId);
// 返回: OperationResult<UserProfile>

// 更新用戶個人資料
const updated = await UserService.updateUserProfile(userId, {
  nickname: '新暱稱',
  email: 'new@email.com'
});
// 返回: OperationResult<UserProfile>
```

#### 用戶故事管理
```typescript
// 獲取用戶的故事列表
const storyList = await UserService.getUserStoryList(userId);
// 返回: OperationResult<BookManageListInterface[]>

// 添加故事到用戶書單
const result = await UserService.addStoryToUser(storyId, userId);

// 檢查用戶是否擁有某個故事
const hasOwnership = await UserService.checkOwnership(userId, storyId);
// 返回: boolean
```

### StoryService

#### 故事基本操作
```typescript
// 建立新故事
const storyId = await StoryService.createStory('storyTale', 'storyInfo');
// 返回: string | null

// 根據ID獲取故事
const story = await StoryService.getStoryById(storyId);
// 返回: object | null

// 檢查故事是否存在
const exists = await StoryService.exists(storyId);
// 返回: boolean

// 刪除故事
const result = await StoryService.deleteStory(storyId);
// 返回: OperationResult
```

#### 圖片處理
```typescript
// 添加單個圖片提示詞
await StoryService.addImagePrompt(storyId, 'prompt text');

// 更新圖片提示詞陣列
await StoryService.updateImagePromptArray(storyId, ['prompt1', 'prompt2']);

// 更新圖片Base64陣列
await StoryService.updateImageBase64(storyId, ['base64_1', 'base64_2']);
```

#### 我的最愛
```typescript
// 添加到我的最愛
const result = await StoryService.addToFavorite(storyId);
// 返回: OperationResult

// 從我的最愛移除
const result = await StoryService.removeFromFavorite(storyId);
// 返回: OperationResult
```

## 🔄 向後兼容

如果你的現有代碼使用了舊的 `DataBase` 類，不需要修改任何東西，它會自動委託給新的服務：

```typescript
import { DataBase } from '../utils/DataBase';

// 舊代碼完全可以繼續使用
const result = await DataBase.SaveNewUser('username', 'password');
const story = await DataBase.getStoryById(storyId);
```

但我們**建議逐步遷移到新的服務類**，因為它們提供了：
- 更清晰的 API
- 更好的類型支援
- 統一的錯誤處理
- 更詳細的日誌

## 🎯 最佳實踐

### ✅ 推薦做法

```typescript
// 1. 在 controller 中導入需要的服務
import { UserService, StoryService } from '../database';

// 2. 直接使用服務方法（不需要再次連線）
const user = await UserService.createUser(name, password);

// 3. 使用類型安全的返回值
if (user.success) {
  console.log('用戶ID:', user.data?.id);
} else {
  console.error('錯誤:', user.message);
}
```

### ❌ 避免做法

```typescript
// ❌ 不要在每個文件中重新連線
const connectionManager = ConnectionManager.getInstance();
await connectionManager.connect(url); // 只在 app.ts 中執行一次！

// ❌ 不要直接操作 model（使用 Service 代替）
import { userModel } from '../models/userModel';
const user = await userModel.findOne({ userName: name }); // 不推薦
```

## 📊 類型定義

```typescript
// 通用操作結果
interface OperationResult<T = any> {
  success: boolean;
  message: string;
  code?: number;
  data?: T;
}

// 用戶資料
interface UserData {
  id: string;
  userName: string;
  permissions: string;
  createdAt: Date;
}

// 用戶個人資料
interface UserProfile {
  userName: string;
  email?: string;
  nickname?: string;
  phone?: string;
  avatar?: string;
}

// 驗證結果
interface VerifyResult {
  success: boolean;
  userId?: string;
  message: string;
}
```

## 🐛 錯誤處理

所有服務方法都包含內建的錯誤處理和日誌記錄：

```typescript
try {
  const result = await UserService.createUser(name, password);
  if (result.success) {
    // 成功處理
  } else {
    // 業務邏輯錯誤（如用戶名已存在）
    console.log(result.message, result.code);
  }
} catch (error) {
  // 系統錯誤（如資料庫連線失敗）
  console.error('系統錯誤:', error);
}
```

## 📝 遷移指南

從舊的 `DataBase` 類遷移到新服務：

| 舊方法 | 新方法 |
|--------|--------|
| `DataBase.SaveNewUser()` | `UserService.createUser()` |
| `DataBase.DelUser()` | `UserService.deleteUser()` |
| `DataBase.VerifyUser()` | `UserService.verifyUser()` |
| `DataBase.GetUserProfile()` | `UserService.getUserProfile()` |
| `DataBase.SaveNewStory_returnID()` | `StoryService.createStory()` |
| `DataBase.getStoryById()` | `StoryService.getStoryById()` |
| `DataBase.AddFav()` | `StoryService.addToFavorite()` |
| `DataBase.RemoveFav()` | `StoryService.removeFromFavorite()` |

## 💡 常見問題

**Q: 我需要在每個 controller 中都連線資料庫嗎？**  
A: 不需要！只在 `app.ts` 中連線一次即可，ConnectionManager 使用單例模式會自動管理連線。

**Q: 如何知道資料庫是否已連線？**  
A: 使用 `connectionManager.isDBConnected()` 方法檢查。

**Q: 可以同時使用新舊方法嗎？**  
A: 可以！舊的 `DataBase` 類會自動委託給新服務，完全向後兼容。

**Q: 如何添加新的資料庫操作？**  
A: 在對應的 Service 類中添加靜態方法即可，記得加上日誌和錯誤處理。

## 🔗 相關文件

- [ConnectionManager 單例模式實現](./connection/ConnectionManager.ts)
- [UserService API](./services/UserService.ts)
- [StoryService API](./services/StoryService.ts)
- [類型定義](./types/responses.ts)
