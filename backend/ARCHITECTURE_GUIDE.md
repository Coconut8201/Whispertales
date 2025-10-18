# 後端架構設計指南

## 🏗️ 問題：應該在哪裡寫邏輯代碼？

你提出的問題非常重要！這涉及到**層次化架構（Layered Architecture）**的設計原則。

### ❓ 比較：Controller 中 vs DataBase 中

#### ❌ 不推薦（直接在 Controller 中）
```typescript
// userController.ts
public AddUser = asyncHandler(async (req: Request, res: Response) => {
  const user = new userModel({
    userName,
    userPassword,
    booklist: [],
  });
  
  await user.save();  // ❌ 數據操作邏輯混在 Controller 中
  
  return res.success(...);
});
```

**問題：**
- Controller 應該只處理 HTTP 邏輯（請求/響應）
- 數據庫操作邏輯散佈在不同地方
- 難以測試和維護
- 代碼重複

---

#### ✅ 推薦（使用 DataBase service）
```typescript
// userController.ts
public AddUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await DataBase.SaveNewUser(userName, userPassword);
  
  if (!result.success) {
    throw new ConflictError(result.message);
  }
  
  return res.success(result.data, '註冊成功');
});

// DataBase.ts
static async SaveNewUser(name: string, password: string) {
  const user = new userModel({
    userName: name,
    userPassword: password,
    booklist: [],
  });
  
  await user.save();  // ✅ 數據操作邏輯集中在 Service 層
  
  return { success: true, data: user };
}
```

**優點：**
- 職責分離清晰
- 易於測試
- 代碼重複度低
- 易於維護和修改

---

## 🎯 標準的層次化架構

### Express 應用的典型層次結構

```
User Request
    ↓
┌─────────────────────────────┐
│      Routing Layer          │  ← userRoute.ts
│   - URL 路由匹配            │
│   - 參數驗證                │
│   - 中介軟體               │
└────────────┬────────────────┘
             ↓
┌─────────────────────────────┐
│    Controller Layer         │  ← userController.ts
│   - 處理 HTTP 請求         │
│   - 調用 Service 方法      │
│   - 返回 HTTP 響應         │
│   - 不涉及業務邏輯        │
└────────────┬────────────────┘
             ↓
┌─────────────────────────────┐
│     Service Layer           │  ← DataBase.ts
│   - 核心業務邏輯           │
│   - 數據庫操作             │
│   - 資料驗證和轉換         │
│   - 呼叫 Model            │
└────────────┬────────────────┘
             ↓
┌─────────────────────────────┐
│      Model Layer            │  ← userModel.ts
│   - Mongoose Schema         │
│   - 資料庫連線             │
│   - 原始 CRUD 操作         │
└─────────────────────────────┘
             ↓
       MongoDB
```

---

## 📚 每一層的責任

### 1️⃣ **Routing Layer** (`userRoute.ts`)

**責任：**
- 定義 URL 路由
- 應用中介軟體（驗證、授權、日誌）
- 參數驗證
- 錯誤捕獲

**範例：**
```typescript
router.post(
  '/adduser',
  validateRequest(['userName', 'userPassword']),  // ✅ 路由層驗證
  authMiddleware,                                  // ✅ 路由層應用中介軟體
  userController.AddUser                           // ← 傳給 Controller
);
```

**不應該做的事：**
- ❌ 直接操作數據庫
- ❌ 執行業務邏輯
- ❌ 數據轉換

---

### 2️⃣ **Controller Layer** (`userController.ts`)

**責任：**
- 接收 HTTP 請求
- 解析請求參數
- 呼叫 Service 層方法
- 處理響應和錯誤
- 返回 HTTP 響應

**範例：**
```typescript
public AddUser = asyncHandler(async (req: Request, res: Response) => {
  // ✅ 1. 解析請求
  const { userName, userPassword } = req.body;
  
  // ✅ 2. 呼叫 Service 層
  const result = await DataBase.SaveNewUser(userName, userPassword);
  
  // ✅ 3. 處理錯誤
  if (!result.success) {
    throw new ConflictError(result.message);
  }
  
  // ✅ 4. 返回響應
  return res.success(result.data, '註冊成功');
});
```

**不應該做的事：**
- ❌ 直接操作數據庫
- ❌ 複雜的業務邏輯
- ❌ 數據查詢邏輯

---

### 3️⃣ **Service Layer** (`DataBase.ts`)

**責任：**
- 實現核心業務邏輯
- 數據庫操作（CRUD）
- 資料驗證和轉換
- 呼叫 Model 層
- 錯誤處理和日誌

**範例：**
```typescript
static async SaveNewUser(name: string, password: string) {
  // ✅ 1. 業務邏輯驗證
  if (await DataBase.isNameTaken(name)) {
    return { success: false, message: '用戶名已存在' };
  }
  
  // ✅ 2. 密碼驗證
  if (password.length < 6) {
    return { success: false, message: '密碼太短' };
  }
  
  // ✅ 3. 創建用戶物件
  const user = new userModel({
    userName: name,
    userPassword: password,
    permissions: 'user',  // 默認權限
    booklist: [],
  });
  
  // ✅ 4. 保存到數據庫
  await user.save();
  
  // ✅ 5. 返回結果
  return { 
    success: true, 
    data: {
      id: user._id.toString(),
      userName: user.userName,
    }
  };
}
```

**不應該做的事：**
- ❌ 直接返回 HTTP 響應
- ❌ 處理 HTTP 狀態碼
- ❌ 呼叫 res.json() 等 Express 方法

---

### 4️⃣ **Model Layer** (`userModel.ts`)

**責任：**
- 定義數據結構（Schema）
- Mongoose 配置
- 基礎驗證規則

**範例：**
```typescript
const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  userPassword: { type: String, required: true },
  permissions: { type: String, default: 'user' },
  booklist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
}, {
  timestamps: true,
  collection: 'user'
});

export const userModel = mongoose.model('User', userSchema);
```

**應該做的事：**
- ✅ 定義 schema
- ✅ 設置索引
- ✅ 設置基本驗證

**不應該做的事：**
- ❌ 複雜的業務邏輯
- ❌ 多表連接邏輯
- ❌ 數據轉換

---

## 📊 數據流示例

### 用戶註冊完整流程

```
POST /user/adduser
{
  "userName": "test123",
  "userPassword": "password123"
}
  ↓
┌─ Routing Layer ────────────────────┐
│ 1. 匹配路由                        │
│ 2. validateRequest() 驗證參數      │
│ 3. 檢查參數是否存在               │
└─────────┬──────────────────────────┘
          ↓ 參數驗證通過
┌─ Controller Layer ─────────────────┐
│ 1. 接收 request                    │
│ 2. 提取 userName, userPassword     │
│ 3. 呼叫 DataBase.SaveNewUser()    │
│ 4. 檢查結果                        │
│ 5. 返回 response                   │
└─────────┬──────────────────────────┘
          ↓ 呼叫 Service 層
┌─ Service Layer (DataBase) ────────┐
│ 1. 檢查用戶名是否已存在           │
│ 2. 驗證密碼強度                   │
│ 3. 創建用戶物件                   │
│ 4. 調用 userModel.save()          │
│ 5. 返回結果給 Controller          │
└─────────┬──────────────────────────┘
          ↓ 呼叫 Model 層
┌─ Model Layer (userModel) ────────┐
│ 1. Mongoose Schema 驗證           │
│ 2. 執行基本驗證規則              │
│ 3. 連接到 MongoDB                │
│ 4. 插入文檔                       │
└─────────┬──────────────────────────┘
          ↓
      MongoDB
      
Controller 收到結果
  ↓
返回 HTTP 響應
{
  "code": 200,
  "message": "註冊成功",
  "data": { "id": "...", "userName": "test123" }
}
```

---

## 🎯 改進方案

### 當前狀態 ❌

```typescript
// userController.ts - 混合了多個責任
public AddUser = asyncHandler(async (req, res) => {
  // 1. HTTP 邏輯
  const { userName, userPassword } = req.body;
  
  // 2. 業務邏輯（不應該在這裡）
  const isNameTaken = await DataBase.isNameTaken(userName);
  if (isNameTaken) {
    throw new ConflictError(...);
  }
  
  // 3. 數據庫操作（不應該在這裡）
  const user = new userModel({ userName, userPassword });
  await user.save();
  
  // 4. 響應
  return res.success(...);
});
```

**問題：**
- Controller 變成「大雜燴」
- 難以重複使用業務邏輯
- 難以測試
- 混亂的職責

---

### 改進方案 ✅

#### Step 1: 改進 DataBase.ts（Service 層）

```typescript
// DataBase.ts - 集中所有數據操作邏輯
static async SaveNewUser(
  name: string, 
  password: string,
  permissions: string = 'user'
) {
  try {
    // ✅ 業務邏輯驗證
    if (await DataBase.isNameTaken(name)) {
      return { 
        success: false, 
        message: '用戶名已存在',
        code: 409
      };
    }
    
    if (password.length < 6) {
      return { 
        success: false, 
        message: '密碼長度至少需要 6 個字元',
        code: 400
      };
    }
    
    // ✅ 創建用戶
    const user = new userModel({
      userName: name,
      userPassword: password,
      permissions,
      booklist: [],
    });
    
    await user.save();
    
    // ✅ 返回結果（不涉及 HTTP）
    return {
      success: true,
      code: 200,
      data: {
        id: user._id.toString(),
        userName: user.userName,
        permissions: user.permissions,
        createdAt: user.createdAt,
      }
    };
  } catch (error: any) {
    console.error(`SaveNewUser 失敗: ${error.message}`);
    return {
      success: false,
      code: 500,
      message: '創建用戶過程中發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}
```

#### Step 2: 簡化 Controller

```typescript
// userController.ts - 只處理 HTTP 邏輯
public AddUser = asyncHandler(async (req: Request, res: Response) => {
  const { userName, userPassword, permissions } = req.body;
  
  // ✅ 只負責呼叫 Service 層
  const result = await DataBase.SaveNewUser(
    userName, 
    userPassword,
    permissions || 'user'
  );
  
  // ✅ 只負責錯誤処理和响應
  if (!result.success) {
    // 根據業務邏輯結果拋出對應的錯誤
    switch (result.code) {
      case 409:
        throw new ConflictError(result.message);
      case 400:
        throw new BadRequestError(result.message);
      default:
        throw new InternalError(result.message);
    }
  }
  
  // ✅ 統一的成功響應
  return res.success(result.data, '註冊成功');
});
```

---

## 🏆 最佳實踐

### ✅ DO（推薦）

```typescript
// 1. Service 層集中業務邏輯
// DataBase.ts
static async SaveNewUser(name: string, password: string) {
  // 驗證業務規則
  if (await DataBase.isNameTaken(name)) {
    return { success: false, message: '...' };
  }
  
  // 創建數據
  const user = new userModel({ ... });
  await user.save();
  
  // 返回結果（不涉及 HTTP）
  return { success: true, data: user };
}

// 2. Controller 層簡化
// userController.ts
const result = await DataBase.SaveNewUser(userName, password);
if (!result.success) {
  throw new ConflictError(result.message);
}
return res.success(result.data);

// 3. 測試 Service 層
const result = await DataBase.SaveNewUser('test', 'password123');
expect(result.success).toBe(true);
```

---

### ❌ DON'T（避免）

```typescript
// 1. 不要在 Controller 中混合業務邏輯
public AddUser = asyncHandler(async (req, res) => {
  // ❌ 混合了數據操作和 HTTP 邏輯
  const user = new userModel({ ... });
  await user.save();
  return res.json({ ... });
});

// 2. 不要在 Model 中寫業務邏輯
// userModel.ts
export const userModel = mongoose.model('User', userSchema);
// ❌ 不要在這裡添加自定義方法

// 3. 不要在多個地方重複相同邏輯
public CreateUser() { new userModel(...).save(); }
public AddUser() { new userModel(...).save(); }
public RegisterUser() { new userModel(...).save(); }
// ❌ 代碼重複，難以維護
```

---

## 📋 檢查清單

使用這個清單確保你的代碼遵循分層架構：

### Controller 檢查清單
- [ ] 只包含 HTTP 邏輯
- [ ] 不涉及數據庫操作
- [ ] 呼叫 Service 層方法
- [ ] 根據結果返回適當的 HTTP 響應
- [ ] 錯誤處理和轉換

### Service 層檢查清單
- [ ] 集中所有業務邏輯
- [ ] 數據庫操作邏輯
- [ ] 數據驗證
- [ ] 返回結果（不涉及 HTTP）
- [ ] 自己處理 try-catch

### Model 層檢查清單
- [ ] 定義 Schema
- [ ] 基本驗證規則
- [ ] 索引設置
- [ ] 不包含業務邏輯

### Route 層檢查清單
- [ ] 定義 URL 路由
- [ ] 應用中介軟體
- [ ] 參數驗證
- [ ] 呼叫 Controller

---

## 🔄 完整範例：用戶登入

### 1. Route 層
```typescript
router.post(
  '/login',
  validateRequest(['userName', 'userPassword']),
  userController.Login
);
```

### 2. Controller 層
```typescript
public Login = asyncHandler(async (req, res) => {
  const { userName, userPassword } = req.body;
  
  // 呼叫 Service
  const result = await DataBase.VerifyUser(userName, userPassword);
  
  if (!result.success) {
    throw new UnauthorizedError(result.message);
  }
  
  // 設置 Cookie
  res.cookie('authToken', token, {...});
  
  return res.success(
    { id: result.userId, username: userName },
    '登入成功'
  );
});
```

### 3. Service 層
```typescript
static async VerifyUser(
  userName: string, 
  userPassword: string
) {
  try {
    // 查詢用戶
    const user = await userModel.findOne({ userName });
    
    if (!user) {
      return { success: false, message: '用戶不存在' };
    }
    
    // 驗證密碼
    if (user.userPassword !== userPassword) {
      return { success: false, message: '密碼錯誤' };
    }
    
    return { 
      success: true, 
      userId: user._id.toString(),
      message: '認證成功' 
    };
  } catch (error) {
    return { success: false, message: '認證過程出錯' };
  }
}
```

---

## 💡 總結

| 層次 | 位置 | 責任 | 不應該做 |
|------|------|------|---------|
| Route | userRoute.ts | URL 匹配、中介軟體、驗證 | 業務邏輯、數據操作 |
| Controller | userController.ts | HTTP 邏輯、請求/響應 | 數據庫操作、複雜業務邏輯 |
| Service | DataBase.ts | 業務邏輯、數據操作 | HTTP 邏輯、響應 |
| Model | userModel.ts | Schema 定義、基本驗證 | 業務邏輯 |

---

## ✨ 下一步

1. ✅ **理解分層架構** - 已完成
2. 📝 **改進 DataBase.ts** - 確保所有業務邏輯都在這裡
3. 🔄 **簡化 Controller** - 只保留 HTTP 邏輯
4. 🧪 **編寫單元測試** - 測試 Service 層邏輯
5. 📚 **建立文檔** - 記錄每層的職責

現在你明白了吧？需要我幫你重構代碼嗎？
