# Middleware 使用指南

本專案已整合統一的錯誤處理和響應處理中介軟體，讓你的 Controller 代碼更簡潔、統一。

## 📁 檔案結構

```
backend/src/
├── middleware/
│   ├── errorMiddleware.ts      # 錯誤處理中介軟體
│   ├── responseMiddleware.ts   # 響應處理中介軟體
│   ├── autherMiddleware.ts     # 身份驗證中介軟體
│   └── multerMiddleware.ts     # 檔案上傳中介軟體
├── errors/
│   ├── BaseErrors.ts           # 基礎錯誤類別
│   └── AppErrors.ts            # 應用錯誤類別
└── types/
    └── response.ts             # 響應類型定義
```

---

## 🎯 1. 響應處理 (responseMiddleware)

### 1.1 成功響應 - `res.success()`

**基本用法：**
```typescript
// 之前
return res.status(200).json({ 
  success: true, 
  message: '登入成功',
  user: { id: 123, username: 'test' }
});

// 現在
return res.success(
  { id: 123, username: 'test' },
  '登入成功'
);
```

**完整範例：**
```typescript
public async Login(req: Request, res: Response) {
  const { userName, userPassword } = req.body;
  
  const result = await DataBase.VerifyUser(userName, userPassword);
  
  if (result.success) {
    const token = jwt.sign(
      { id: result.userId, username: userName },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    res.cookie('authToken', token, { httpOnly: true });
    
    return res.success(
      { id: result.userId, username: userName },
      '登入成功'
    );
  }
  
  throw new UnauthorizedError('用戶名或密碼錯誤');
}
```

**響應格式：**
```json
{
  "code": 200,
  "message": "登入成功",
  "data": {
    "id": 123,
    "username": "test"
  },
  "timestamp": "2024-10-18T07:00:00.000Z"
}
```

---

### 1.2 錯誤響應 - `res.error()`

**基本用法：**
```typescript
// 之前
return res.status(400).json({ 
  success: false, 
  message: '請提供用戶名和密碼' 
});

// 現在
return res.error('請提供用戶名和密碼', 400);

// 帶詳細資訊
return res.error(
  '驗證失敗',
  400,
  { missingFields: ['userName', 'userPassword'] }
);
```

---

### 1.3 分頁響應 - `res.paginated()`

**基本用法：**
```typescript
public async GetStories(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { stories, total } = await DataBase.GetStories(page, limit);
  
  return res.paginated(
    stories,
    page,
    limit,
    total,
    '獲取故事列表成功'
  );
}
```

**響應格式：**
```json
{
  "code": 200,
  "message": "獲取故事列表成功",
  "data": [...],
  "details": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "timestamp": "2024-10-18T07:00:00.000Z"
}
```

---

## 🚨 2. 錯誤處理 (errorMiddleware)

### 2.1 使用自定義錯誤類別

**可用的錯誤類別：**
```typescript
import {
  BadRequestError,      // 400 - 請求錯誤
  ValidationError,      // 400 - 驗證錯誤
  UnauthorizedError,    // 401 - 未授權
  ForbiddenError,       // 403 - 禁止訪問
  NotFoundError,        // 404 - 找不到資源
  ConflictError,        // 409 - 衝突（如重複註冊）
  RateLimitError,       // 429 - 請求過於頻繁
  InternalError,        // 500 - 伺服器錯誤
} from '../errors/AppErrors';
```

**範例 1：基本錯誤**
```typescript
public async GetStory(req: Request, res: Response) {
  const { storyId } = req.query;
  
  if (!storyId) {
    throw new BadRequestError('故事 ID 不能為空');
  }
  
  const story = await DataBase.GetStory(storyId as string);
  
  if (!story) {
    throw new NotFoundError('找不到該故事');
  }
  
  return res.success(story, '獲取故事成功');
}
```

**範例 2：驗證錯誤（帶多個欄位）**
```typescript
public async UpdateProfile(req: Request, res: Response) {
  const errors: Record<string, string> = {};
  
  if (!req.body.email || !isValidEmail(req.body.email)) {
    errors.email = '電子郵件格式不正確';
  }
  
  if (req.body.phone && !isValidPhone(req.body.phone)) {
    errors.phone = '電話號碼格式不正確';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors, '資料驗證失敗');
  }
  
  // 繼續處理...
}
```

**範例 3：帶詳細資訊的錯誤**
```typescript
public async CreateStory(req: Request, res: Response) {
  const { title, content } = req.body;
  
  if (content.length > 10000) {
    throw new BadRequestError(
      '故事內容過長',
      { maxLength: 10000, currentLength: content.length }
    );
  }
  
  // 繼續處理...
}
```

---

### 2.2 使用 asyncHandler 包裝器

**自動捕獲 async 函數的錯誤：**

```typescript
import { asyncHandler } from '../middleware/errorMiddleware';

// 在路由中使用
router.get('/story', asyncHandler(async (req, res) => {
  const story = await DataBase.GetStory(req.query.storyId as string);
  
  if (!story) {
    throw new NotFoundError('找不到該故事');
  }
  
  return res.success(story);
}));
```

**或在 Controller 中：**
```typescript
export class StoryController extends Controller {
  public GetStory = asyncHandler(async (req: Request, res: Response) => {
    const story = await DataBase.GetStory(req.query.storyId as string);
    
    if (!story) {
      throw new NotFoundError('找不到該故事');
    }
    
    return res.success(story);
  });
}
```

---

## 🔐 3. 請求驗證中介軟體

### 3.1 驗證請求體 - `validateRequest()`

**在路由中使用：**
```typescript
import { validateRequest } from '../middleware/responseMiddleware';

router.post('/login', 
  validateRequest(['userName', 'userPassword']),
  userController.Login.bind(userController)
);

router.post('/story/create',
  authMiddleware,
  validateRequest(['title', 'content', 'genre']),
  storyController.CreateStory.bind(storyController)
);
```

**效果：**
- 自動檢查請求體中是否包含必填欄位
- 如果缺少欄位，自動返回 400 錯誤
- 無需在 Controller 中手動驗證

---

### 3.2 驗證查詢參數 - `validateQuery()`

**在路由中使用：**
```typescript
import { validateQuery } from '../middleware/responseMiddleware';

router.get('/story',
  validateQuery(['storyId']),
  storyController.GetStory.bind(storyController)
);

router.delete('/favorite',
  authMiddleware,
  validateQuery(['bookid']),
  userController.RemoveFavorite.bind(userController)
);
```

---

## 📝 4. 完整改寫範例

### 改寫前（userController.ts）

```typescript
public async Login(req: Request, res: Response) {
  const { userName, userPassword } = req.body;
  
  if (!userName || !userPassword) {
    console.error('用戶名或密碼缺失');
    return res.status(400).json({ 
      success: false, 
      message: '請提供用戶名和密碼' 
    });
  }

  try {
    const result = await DataBase.VerifyUser(userName, userPassword);
    
    if (result.success) {
      const token = jwt.sign(
        { id: result.userId, username: userName },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );
      
      res.cookie('authToken', token, { httpOnly: true });
      
      return res.status(200).json({ 
        success: true, 
        message: '登入成功',
        user: { id: result.userId, username: userName }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤'
      });
    }
  } catch (e: any) {
    console.error(`登入失敗:`, e);
    return res.status(500).json({ 
      success: false, 
      message: '登入過程中發生錯誤' 
    });
  }
}
```

### 改寫後（使用新的 middleware）

```typescript
import { asyncHandler } from '../middleware/errorMiddleware';
import { UnauthorizedError } from '../errors/AppErrors';

public Login = asyncHandler(async (req: Request, res: Response) => {
  const { userName, userPassword } = req.body;
  
  const result = await DataBase.VerifyUser(userName, userPassword);
  
  if (!result.success) {
    throw new UnauthorizedError('用戶名或密碼錯誤');
  }
  
  const token = jwt.sign(
    { id: result.userId, username: userName },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
  
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });
  
  return res.success(
    { id: result.userId, username: userName },
    '登入成功'
  );
});
```

**在路由中加上驗證：**
```typescript
router.post('/login',
  validateRequest(['userName', 'userPassword']),
  userController.Login.bind(userController)
);
```

**改進點：**
1. ✅ 不需要手動 try-catch
2. ✅ 不需要手動檢查必填欄位（移到 middleware）
3. ✅ 統一的錯誤格式
4. ✅ 統一的成功響應格式
5. ✅ 代碼減少約 60%
6. ✅ 更容易閱讀和維護

---

## 🎨 5. 路由整合範例

### userRoute.ts 完整範例

```typescript
import { Router } from 'express';
import { UserController } from '../controller/userController';
import { authMiddleware } from '../middleware/autherMiddleware';
import { validateRequest, validateQuery } from '../middleware/responseMiddleware';

const router = Router();
const userController = new UserController();

// 不需要驗證的路由
router.post('/register',
  validateRequest(['userName', 'userPassword']),
  userController.AddUser.bind(userController)
);

router.post('/login',
  validateRequest(['userName', 'userPassword']),
  userController.Login.bind(userController)
);

// 需要驗證的路由
router.post('/logout',
  authMiddleware,
  userController.Logout.bind(userController)
);

router.get('/profile',
  authMiddleware,
  userController.GetProfile.bind(userController)
);

router.put('/profile',
  authMiddleware,
  validateRequest(['nickname']),  // 至少需要 nickname
  userController.UpdateProfile.bind(userController)
);

router.post('/favorite',
  authMiddleware,
  validateQuery(['bookid']),
  userController.AddFavorite.bind(userController)
);

router.delete('/favorite',
  authMiddleware,
  validateQuery(['bookid']),
  userController.RemoveFavorite.bind(userController)
);

export default router;
```

---

## ⚡ 6. 最佳實踐

### ✅ DO（推薦做法）

```typescript
// 1. 使用 asyncHandler 包裝 async 函數
public GetStory = asyncHandler(async (req, res) => {
  const story = await DataBase.GetStory(req.query.storyId);
  return res.success(story);
});

// 2. 使用自定義錯誤類別
if (!story) {
  throw new NotFoundError('找不到該故事');
}

// 3. 在路由層驗證參數
router.post('/login',
  validateRequest(['userName', 'userPassword']),
  controller.Login
);

// 4. 使用統一的響應方法
return res.success(data, message);
return res.paginated(data, page, limit, total);
```

### ❌ DON'T（避免做法）

```typescript
// 1. 不要手動 try-catch（除非有特殊邏輯）
try {
  const result = await someFunction();
  return res.json(result);
} catch (e) {
  return res.status(500).json({ error: e.message });
}

// 2. 不要直接使用 res.status().json()
return res.status(200).json({ success: true, data: ... });

// 3. 不要在 controller 中驗證參數
if (!req.body.userName) {
  return res.status(400).json({ error: '...' });
}

// 4. 不要使用不一致的響應格式
return res.json({ ok: true, result: ... });  // ❌
return res.send('Success');                   // ❌
```

---

## 🐛 7. 錯誤處理流程

```
1. Controller 拋出錯誤
   ↓
2. asyncHandler 捕獲錯誤
   ↓
3. 傳遞給 errorHandler middleware
   ↓
4. 識別錯誤類型（自定義錯誤、MongoDB 錯誤、JWT 錯誤等）
   ↓
5. 格式化錯誤響應
   ↓
6. 返回統一格式的 JSON 響應
```

**所有錯誤都會被自動處理並格式化為：**
```json
{
  "code": 400,
  "message": "錯誤訊息",
  "errors": { ... },      // 可選，用於驗證錯誤
  "details": { ... },     // 可選，用於額外資訊
  "timestamp": "2024-10-18T07:00:00.000Z"
}
```

---

## 📊 8. 日誌記錄

**requestLogger 會自動記錄：**
```
[2024-10-18T07:00:00.000Z] POST /user/login
[2024-10-18T07:00:00.123Z] POST /user/login - 200 (123ms)
```

**errorHandler 會記錄詳細錯誤：**
```
=== Error Handler ===
Path: /user/login
Method: POST
Error: UnauthorizedError: 用戶名或密碼錯誤
Stack: ...
====================
```

---

## 🔄 9. 遷移清單

如果要將現有的 Controller 遷移到新的 middleware 系統：

- [ ] 將所有 async 函數用 `asyncHandler` 包裝
- [ ] 移除手動的 try-catch（除非有特殊業務邏輯）
- [ ] 將 `res.status().json()` 改為 `res.success()` 或 `res.error()`
- [ ] 將錯誤檢查改為拋出自定義錯誤
- [ ] 在路由中加上 `validateRequest` 或 `validateQuery`
- [ ] 移除 controller 中的參數驗證代碼
- [ ] 確保所有響應格式一致

---

## 📚 參考資料

- **錯誤類別定義**: `/backend/src/errors/AppErrors.ts`
- **錯誤代碼常數**: `/backend/src/constants/errorCodes.ts`
- **響應類型**: `/backend/src/types/response.ts`
- **中介軟體實作**: `/backend/src/middleware/`
