# 認證系統使用指南

本文檔說明如何在 Whispertales 後端中正確處理用戶認證和獲取用戶資料。

## 目錄

1. [系統架構](#系統架構)
2. [快速開始](#快速開始)
3. [類型定義](#類型定義)
4. [工具函數](#工具函數)
5. [最佳實踐](#最佳實踐)
6. [完整示例](#完整示例)
7. [常見問題](#常見問題)

---

## 系統架構

### 認證流程

```
客戶端請求
    ↓
authenticateToken 中間件驗證 JWT
    ↓
將用戶資料注入 req.user (類型安全)
    ↓
Controller 使用工具函數獲取用戶資料
    ↓
業務邏輯處理
```

### 核心組件

| 組件 | 位置 | 功能 |
|------|------|------|
| **類型定義** | `src/types/express.d.ts` | 擴展 Express Request，提供類型安全 |
| **認證中間件** | `src/middleware/autherMiddleware.ts` | 驗證 JWT 並注入用戶資料 |
| **工具函數** | `src/utils/authHelpers.ts` | 便捷的用戶資料獲取函數 |

---

## 快速開始

### 1. 在路由中使用認證中間件

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/autherMiddleware';
import { StoryController } from '../controller/storyController';

const router = Router();
const controller = new StoryController();

// 需要認證的路由
router.get('/list', authenticateToken, controller.GetStorylistFDB);
router.post('/create', authenticateToken, controller.LLMGenStory);

// 不需要認證的路由
router.get('/public', controller.GetPublicStories);

export default router;
```

### 2. 在 Controller 中獲取用戶資料

**❌ 錯誤方式（舊代碼）**

```typescript
public async GetStoryList(req: Request, res: Response) {
  // 問題：需要手動類型轉換，容易出錯
  const userId = (req as any).user?.id;
  
  // 問題：需要手動驗證
  if (!userId) {
    return res.status(401).json({ message: '未認證' });
  }
  
  // 業務邏輯...
}
```

**✅ 正確方式（新代碼）**

```typescript
import { getCurrentUserId } from '../utils/authHelpers';

public async GetStoryList(req: Request, res: Response) {
  // 簡潔、類型安全、自動驗證
  const userId = getCurrentUserId(req);
  
  // 業務邏輯...
}
```

---

## 類型定義

### JWTUser 接口

定義了 JWT 令牌中包含的用戶資料結構：

```typescript
// src/types/express.d.ts

export interface JWTUser {
  id: string;           // 用戶 ID
  username: string;     // 用戶名
  loginTime: number;    // 登入時間戳
  iat?: number;         // JWT 簽發時間
  exp?: number;         // JWT 過期時間
}
```

### Express Request 擴展

擴展了 Express 的 Request 接口，使 `req.user` 具有完整的類型支持：

```typescript
// 全局擴展
declare global {
  namespace Express {
    interface Request {
      user?: JWTUser;  // 可選，因為不是所有路由都需要認證
    }
  }
}
```

### AuthenticatedRequest 接口

用於明確標記已認證的請求：

```typescript
export interface AuthenticatedRequest extends Request {
  user: JWTUser;  // 必填，表示已經過認證
}
```

**使用場景：**

```typescript
// 明確要求已認證的函數
function processUserData(req: AuthenticatedRequest) {
  // TypeScript 知道 req.user 必定存在
  console.log(req.user.id);  // 不需要可選鏈
}
```

---

## 工具函數

### getCurrentUser()

獲取完整的用戶資料對象。

```typescript
import { getCurrentUser } from '../utils/authHelpers';

public async GetProfile(req: Request, res: Response) {
  const user = getCurrentUser(req);
  
  console.log(user.id);         // string
  console.log(user.username);   // string
  console.log(user.loginTime);  // number
}
```

**拋出錯誤：** 如果用戶未認證，自動拋出 `UnauthorizedError`

---

### getCurrentUserId()

獲取當前用戶的 ID（最常用）。

```typescript
import { getCurrentUserId } from '../utils/authHelpers';

public async GetStoryList(req: Request, res: Response) {
  const userId = getCurrentUserId(req);
  const stories = await StoryService.getStoriesByUserId(userId);
  
  return res.success(stories);
}
```

**優勢：**
- 簡潔明瞭
- 類型安全（返回 `string`）
- 自動驗證和錯誤處理

---

### getCurrentUsername()

獲取當前用戶的用戶名。

```typescript
import { getCurrentUsername } from '../utils/authHelpers';

public async LogAction(req: Request, res: Response) {
  const username = getCurrentUsername(req);
  console.log(`用戶 ${username} 執行了操作`);
}
```

---

### isAuthenticated()

檢查請求是否已認證（布爾值）。

```typescript
import { isAuthenticated } from '../utils/authHelpers';

public async GetStory(req: Request, res: Response) {
  if (isAuthenticated(req)) {
    // 顯示完整內容（包括用戶私有故事）
    const userId = getCurrentUserId(req);
    return await StoryService.getFullStories(userId);
  } else {
    // 僅顯示公開內容
    return await StoryService.getPublicStories();
  }
}
```

---

### isAuthenticatedRequest()

類型守衛函數，用於 TypeScript 類型收窄。

```typescript
import { isAuthenticatedRequest } from '../utils/authHelpers';

public async ProcessRequest(req: Request, res: Response) {
  if (isAuthenticatedRequest(req)) {
    // TypeScript 知道 req.user 必定存在
    const userId = req.user.id;  // 不需要可選鏈 ?.
  } else {
    // req.user 不存在
  }
}
```

---

### requireOwnership()

驗證當前用戶是否為資源的擁有者。

```typescript
import { requireOwnership, getCurrentUserId } from '../utils/authHelpers';

public async DeleteStory(req: Request, res: Response) {
  const { storyId } = req.params;
  
  // 獲取故事資料
  const story = await StoryService.getStoryById(storyId);
  
  // 驗證所有權（如果不是擁有者，會自動拋出錯誤）
  requireOwnership(req, story.userId);
  
  // 確認是擁有者後，執行刪除
  await StoryService.deleteStory(storyId);
  return res.success({ message: '刪除成功' });
}
```

**自動錯誤處理：**
- 未認證 → `UnauthorizedError`
- 不是擁有者 → `UnauthorizedError` (包含詳細信息)

---

### isOwner()

檢查用戶是否為資源擁有者（不拋出錯誤）。

```typescript
import { isOwner, getCurrentUserId } from '../utils/authHelpers';

public async GetStory(req: Request, res: Response) {
  const { storyId } = req.params;
  const story = await StoryService.getStoryById(storyId);
  
  if (isOwner(req, story.userId)) {
    // 擁有者可以看到完整資料（包括草稿）
    return res.success(story);
  } else {
    // 非擁有者只能看到已發布的內容
    return res.success(story.publishedContent);
  }
}
```

---

## 最佳實踐

### 1. 使用工具函數而非手動獲取

**❌ 避免**

```typescript
const userId = (req as any).user?.id;
if (!userId) {
  return res.status(401).json({ message: '未認證' });
}
```

**✅ 推薦**

```typescript
const userId = getCurrentUserId(req);
```

---

### 2. 在路由層添加認證中間件

確保敏感路由都使用 `authenticateToken` 中間件：

```typescript
// ✅ 正確
router.get('/profile', authenticateToken, controller.GetProfile);

// ❌ 錯誤：忘記添加中間件
router.get('/profile', controller.GetProfile);  // req.user 會是 undefined
```

---

### 3. 驗證資源所有權

對於修改或刪除操作，始終驗證所有權：

```typescript
public async UpdateStory(req: Request, res: Response) {
  const { storyId } = req.params;
  const story = await StoryService.getStoryById(storyId);
  
  // 驗證所有權
  requireOwnership(req, story.userId);
  
  // 執行更新
  await StoryService.updateStory(storyId, req.body);
}
```

---

### 4. 使用 asyncHandler 包裝異步函數

確保錯誤能被統一的錯誤處理中間件捕獲：

```typescript
import { asyncHandler } from '../middleware/errorMiddleware';

public GetStoryList = asyncHandler(async (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);  // 如果拋出錯誤，會被 asyncHandler 捕獲
  const stories = await StoryService.getStoriesByUserId(userId);
  return res.success(stories);
});
```

---

### 5. 記錄用戶操作（開發環境）

```typescript
public CreateStory = asyncHandler(async (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const username = getCurrentUsername(req);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[CreateStory] 用戶 ${username} (${userId}) 正在創建故事`);
  }
  
  // 業務邏輯...
});
```

---

## 完整示例

### 示例 1：獲取用戶故事列表

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { getCurrentUserId } from '../utils/authHelpers';
import { StoryService } from '../database';

export class StoryController {
  public GetStoryList = asyncHandler(async (req: Request, res: Response) => {
    // 1. 獲取當前用戶 ID
    const userId = getCurrentUserId(req);
    
    // 2. 調用服務層
    const result = await StoryService.getStoriesByUserId(userId);
    
    // 3. 返回結果
    if (result.success) {
      return res.success(result.data, '獲取故事列表成功');
    } else {
      throw new InternalError('獲取故事列表失敗');
    }
  });
}
```

**對應路由：**

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/autherMiddleware';
import { StoryController } from '../controller/storyController';

const router = Router();
const controller = new StoryController();

router.get('/list', authenticateToken, controller.GetStoryList);

export default router;
```

---

### 示例 2：刪除故事（驗證所有權）

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { getCurrentUserId, requireOwnership } from '../utils/authHelpers';
import { StoryService } from '../database';
import { NotFoundError } from '../errors/AppErrors';

export class StoryController {
  public DeleteStory = asyncHandler(async (req: Request, res: Response) => {
    const { storyId } = req.params;
    
    // 1. 獲取故事資料
    const story = await StoryService.getStoryById(storyId);
    
    if (!story) {
      throw new NotFoundError('故事不存在', { storyId });
    }
    
    // 2. 驗證所有權（如果不是擁有者，會自動拋出錯誤）
    requireOwnership(req, story.userId);
    
    // 3. 執行刪除
    const result = await StoryService.deleteStory(storyId);
    
    if (result.success) {
      return res.success({ storyId }, '刪除故事成功');
    } else {
      throw new InternalError('刪除故事失敗');
    }
  });
}
```

---

### 示例 3：條件性認證（公開 + 私有內容）

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { isAuthenticated, getCurrentUserId } from '../utils/authHelpers';
import { StoryService } from '../database';

export class StoryController {
  /**
   * 獲取故事詳情
   * - 未登入：只能看公開故事
   * - 已登入：可以看自己的私有故事
   */
  public GetStory = asyncHandler(async (req: Request, res: Response) => {
    const { storyId } = req.params;
    
    // 獲取故事
    const story = await StoryService.getStoryById(storyId);
    
    if (!story) {
      throw new NotFoundError('故事不存在', { storyId });
    }
    
    // 判斷訪問權限
    if (story.isPublic) {
      // 公開故事，任何人都可以訪問
      return res.success(story);
    } else if (isAuthenticated(req)) {
      // 私有故事，檢查是否為擁有者
      const userId = getCurrentUserId(req);
      if (userId === story.userId) {
        return res.success(story);
      }
    }
    
    // 無權訪問
    throw new UnauthorizedError('無權訪問此故事');
  });
}
```

**對應路由（不需要認證中間件）：**

```typescript
// 這個路由不需要 authenticateToken，因為 Controller 內部處理了條件性認證
router.get('/:storyId', controller.GetStory);
```

---

## 常見問題

### Q1: 為什麼要使用工具函數而不是直接訪問 `req.user`？

**答：** 工具函數提供以下優勢：

1. **類型安全**：自動類型推斷，避免 `as any`
2. **自動驗證**：自動檢查並拋出統一的錯誤
3. **代碼簡潔**：減少重複代碼
4. **易於維護**：如果認證邏輯改變，只需修改工具函數

---

### Q2: 何時使用 `getCurrentUserId()` vs `getCurrentUser()`？

**答：**

- **`getCurrentUserId()`**：大部分情況（90%）只需要用戶 ID
- **`getCurrentUser()`**：需要用戶名或登入時間等其他資料

```typescript
// 大部分情況
const userId = getCurrentUserId(req);
const stories = await StoryService.getStoriesByUserId(userId);

// 需要更多用戶資料
const user = getCurrentUser(req);
console.log(`用戶 ${user.username} 於 ${new Date(user.loginTime)} 登入`);
```

---

### Q3: `requireOwnership()` 和 `isOwner()` 有什麼區別？

**答：**

| 函數 | 不是擁有者時的行為 | 使用場景 |
|------|-------------------|---------|
| `requireOwnership()` | **拋出錯誤** | 必須是擁有者才能繼續（如刪除、修改） |
| `isOwner()` | **返回 false** | 根據是否為擁有者顯示不同內容 |

```typescript
// 必須是擁有者
requireOwnership(req, story.userId);
await StoryService.deleteStory(storyId);

// 條件性處理
if (isOwner(req, story.userId)) {
  return story;  // 完整資料
} else {
  return story.publicContent;  // 僅公開部分
}
```

---

### Q4: 如何處理可選認證（某些路由需要認證，某些不需要）？

**答：** 使用 `isAuthenticated()` 進行條件判斷：

```typescript
public GetStoryList = asyncHandler(async (req: Request, res: Response) => {
  if (isAuthenticated(req)) {
    // 已登入：顯示個人故事
    const userId = getCurrentUserId(req);
    return await StoryService.getUserStories(userId);
  } else {
    // 未登入：顯示公開故事
    return await StoryService.getPublicStories();
  }
});
```

**路由配置：**

```typescript
// 不添加 authenticateToken 中間件
router.get('/list', controller.GetStoryList);
```

---

### Q5: 遇到 "用戶未認證" 錯誤怎麼辦？

**檢查清單：**

1. ✅ 路由是否添加了 `authenticateToken` 中間件？
2. ✅ 客戶端是否發送了 `authToken` Cookie？
3. ✅ JWT 是否過期？
4. ✅ `JWT_SECRET` 環境變量是否正確？

**調試技巧：**

```typescript
// 在 autherMiddleware.ts 中取消註釋調試代碼
console.log('===== Auth Debug =====');
console.log('Authorization:', req.headers.authorization);
console.log('Cookies:', req.cookies);
console.log('Token:', token);
console.log('====================');
```

---

### Q6: 如何在非 Controller 層（如 Service 層）使用用戶資料？

**答：** 將用戶 ID 作為參數傳遞給 Service 層：

```typescript
// ❌ 錯誤：Service 層不應該訪問 Request
class StoryService {
  static async getStories(req: Request) {
    const userId = getCurrentUserId(req);  // 錯誤！
  }
}

// ✅ 正確：Controller 層提取用戶 ID，傳遞給 Service 層
class StoryService {
  static async getStories(userId: string) {
    // 業務邏輯...
  }
}

// Controller 層
public GetStories = asyncHandler(async (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const stories = await StoryService.getStories(userId);  // 傳遞用戶 ID
  return res.success(stories);
});
```

---

### Q7: TypeScript 提示 `req.user` 可能為 undefined 怎麼辦？

**答：** 這是正常的，因為不是所有路由都需要認證。使用以下方法解決：

**方法 1：使用工具函數（推薦）**

```typescript
const userId = getCurrentUserId(req);  // 工具函數會自動處理
```

**方法 2：使用類型守衛**

```typescript
if (isAuthenticatedRequest(req)) {
  const userId = req.user.id;  // TypeScript 知道 user 存在
}
```

**方法 3：明確使用 AuthenticatedRequest 類型**

```typescript
import { AuthenticatedRequest } from '../types/express';

function processUser(req: AuthenticatedRequest) {
  const userId = req.user.id;  // user 必定存在
}
```

---

## 總結

### 核心原則

1. **類型安全**：使用 TypeScript 類型擴展和工具函數
2. **自動驗證**：讓工具函數處理驗證邏輯
3. **統一錯誤**：使用 `asyncHandler` 和自定義錯誤類
4. **關注點分離**：Controller 處理 HTTP，Service 處理業務邏輯

### 記住這個模式

```typescript
// 1. 導入工具函數
import { getCurrentUserId } from '../utils/authHelpers';
import { asyncHandler } from '../middleware/errorMiddleware';

// 2. 使用 asyncHandler 包裝
public YourMethod = asyncHandler(async (req: Request, res: Response) => {
  // 3. 獲取用戶 ID
  const userId = getCurrentUserId(req);
  
  // 4. 調用 Service 層
  const result = await YourService.doSomething(userId);
  
  // 5. 返回結果
  return res.success(result);
});

// 6. 路由添加認證中間件
router.post('/your-route', authenticateToken, controller.YourMethod);
```

---

## 相關文檔

- [Express Request 類型擴展](/backend/src/types/express.d.ts)
- [認證中間件](/backend/src/middleware/autherMiddleware.ts)
- [認證工具函數](/backend/src/utils/authHelpers.ts)
- [錯誤處理系統](/backend/src/errors/AppErrors.ts)
- [統一響應格式](/backend/src/middleware/errorMiddleware.ts)

---

**最後更新：** 2025-10-19  
**版本：** 1.0.0
