# 錯誤自動處理流程說明

## 🔄 完整流程圖

```
1. 用戶發送請求
   ↓
2. 路由匹配 (userRoute.ts)
   ↓
3. 中介軟體驗證 (validateRequest)
   ├─ ❌ 驗證失敗 → 返回 400 錯誤
   └─ ✅ 驗證通過
      ↓
4. Controller 處理 (Login)
   ├─ asyncHandler 包裝
   │  ├─ 業務邏輯執行
   │  ├─ throw new UnauthorizedError() → 被 asyncHandler 捕獲
   │  └─ 傳給 next(error)
   └─ 或正常返回 res.success()
      ↓
5. 全域錯誤處理器 (errorHandler)
   ├─ 識別錯誤類型
   ├─ 格式化錯誤響應
   └─ 返回統一的 JSON
      ↓
6. 用戶收到響應
```

---

## 📝 實際範例

### 範例 1：參數缺失（由 validateRequest 處理）

**請求：**
```bash
POST /user/login
Content-Type: application/json

{
  "userName": "test"
  # 缺少 userPassword
}
```

**處理流程：**
```typescript
// 1. 請求進入路由
router.post('/login',
  validateRequest(['userName', 'userPassword']),  // 👈 這裡攔截
  userController.Login
);

// 2. validateRequest 發現缺少 userPassword
// 3. 自動返回錯誤響應（Controller 根本不會執行）
```

**自動返回：**
```json
{
  "code": 400,
  "message": "缺少必填欄位",
  "details": {
    "missingFields": ["userPassword"]
  },
  "timestamp": "2024-10-18T08:00:00.000Z"
}
```

---

### 範例 2：用戶名或密碼錯誤（由 asyncHandler + errorHandler 處理）

**請求：**
```bash
POST /user/login
Content-Type: application/json

{
  "userName": "test",
  "userPassword": "wrongpassword"
}
```

**處理流程：**

```typescript
// 1. validateRequest 通過（參數都有）
// 2. 進入 Controller

public Login = asyncHandler(async (req, res) => {
  const { userName, userPassword } = req.body;
  
  const result = await DataBase.VerifyUser(userName, userPassword);
  
  if (!result.success) {
    throw new UnauthorizedError("用戶名或密碼錯誤");  // 👈 拋出錯誤
  }
  
  // 如果沒錯誤，繼續執行...
});

// 3. asyncHandler 捕獲錯誤
Promise.resolve(fn(req, res, next)).catch(next);  // 👈 這裡捕獲

// 4. 傳給 errorHandler
next(error);  // 將 UnauthorizedError 傳給下一個中介軟體

// 5. errorHandler 處理
export const errorHandler = (err, req, res, next) => {
  if (err instanceof BaseError) {  // 👈 UnauthorizedError 是 BaseError
    const response = err.toJSON();
    res.status(err.statusCode).json(response);  // 👈 返回格式化的錯誤
  }
};
```

**自動返回：**
```json
{
  "code": 401,
  "message": "用戶名或密碼錯誤",
  "timestamp": "2024-10-18T08:00:00.000Z"
}
```

---

### 範例 3：資料庫連線錯誤（未預期的錯誤）

**請求：**
```bash
POST /user/login
Content-Type: application/json

{
  "userName": "test",
  "userPassword": "password123"
}
```

**假設資料庫掛了：**

```typescript
public Login = asyncHandler(async (req, res) => {
  const { userName, userPassword } = req.body;
  
  // 資料庫連線失敗，拋出錯誤
  const result = await DataBase.VerifyUser(userName, userPassword);
  // 👆 這裡拋出 Error: Connection timeout
});

// asyncHandler 捕獲任何錯誤（包括未預期的）
Promise.resolve(fn(req, res, next)).catch(next);

// errorHandler 處理未知錯誤
export const errorHandler = (err, req, res, next) => {
  // ... 其他錯誤類型檢查
  
  // 未知錯誤 - 轉換為內部錯誤
  const internalError = new InternalError(
    process.env.NODE_ENV === 'production' 
      ? '伺服器內部錯誤'  // 生產環境：隱藏錯誤細節
      : err.message,      // 開發環境：顯示錯誤訊息
  );
  
  res.status(500).json(internalError.toJSON());
};
```

**開發環境返回：**
```json
{
  "code": 500,
  "message": "Connection timeout",
  "details": {
    "stack": "Error: Connection timeout\n    at ..."
  },
  "timestamp": "2024-10-18T08:00:00.000Z"
}
```

**生產環境返回：**
```json
{
  "code": 500,
  "message": "伺服器內部錯誤",
  "timestamp": "2024-10-18T08:00:00.000Z"
}
```

---

## 🎯 關鍵點總結

### ✅ 你需要做的

1. **使用 `asyncHandler` 包裝 Controller**
   ```typescript
   public Login = asyncHandler(async (req, res) => {
     // 你的代碼
   });
   ```

2. **拋出自定義錯誤**
   ```typescript
   if (!result.success) {
     throw new UnauthorizedError("用戶名或密碼錯誤");
   }
   ```

3. **在路由中加入驗證**
   ```typescript
   router.post('/login',
     validateRequest(['userName', 'userPassword']),
     userController.Login
   );
   ```

### ❌ 你不需要做的

1. ~~手動 try-catch~~
2. ~~手動返回錯誤 JSON~~
3. ~~手動檢查參數~~
4. ~~手動設置 HTTP 狀態碼~~

---

## 🔍 為什麼不需要 try-catch？

### 之前（需要手動處理）

```typescript
public async Login(req, res) {
  try {
    const result = await DataBase.VerifyUser(...);
    if (!result.success) {
      return res.status(401).json({ ... });  // 手動返回
    }
    return res.status(200).json({ ... });  // 手動返回
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ... });  // 手動返回
  }
}
```

### 現在（自動處理）

```typescript
public Login = asyncHandler(async (req, res) => {
  const result = await DataBase.VerifyUser(...);
  
  if (!result.success) {
    throw new UnauthorizedError("錯誤訊息");  // 👈 拋出就好
  }
  
  return res.success(data, message);  // 👈 成功就用 res.success
});

// asyncHandler 會：
// 1. 捕獲所有錯誤（包括 throw 和 Promise rejection）
// 2. 傳給 errorHandler
// 3. errorHandler 自動格式化並返回
```

---

## 🛠️ 常見錯誤類型和自動處理

| 錯誤來源 | 錯誤類型 | 自動處理方式 |
|---------|---------|------------|
| 參數缺失 | validateRequest | 返回 400 + 缺少的欄位列表 |
| 用戶認證失敗 | UnauthorizedError | 返回 401 + 錯誤訊息 |
| 資源不存在 | NotFoundError | 返回 404 + 錯誤訊息 |
| 資料驗證失敗 | ValidationError | 返回 400 + 驗證錯誤詳情 |
| MongoDB 重複鍵 | MongoError (11000) | 返回 409 + "欄位已存在" |
| JWT 無效 | JsonWebTokenError | 返回 401 + "Token 無效" |
| JWT 過期 | TokenExpiredError | 返回 401 + "Token 已過期" |
| 檔案過大 | MulterError | 返回 400 + "檔案大小超過限制" |
| CORS 錯誤 | CORS Error | 返回 403 + CORS 訊息 |
| 未知錯誤 | Error | 返回 500 + 內部錯誤 |

所有這些都在 `errorHandler` 中自動識別和格式化！

---

## 📖 實際測試範例

你可以用以下方式測試自動錯誤處理：

### 測試 1：參數缺失
```bash
curl -X POST http://localhost:7943/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "test"}'
```

**自動返回：**
```json
{
  "code": 400,
  "message": "缺少必填欄位",
  "details": { "missingFields": ["userPassword"] },
  "timestamp": "..."
}
```

### 測試 2：密碼錯誤
```bash
curl -X POST http://localhost:7943/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "test", "userPassword": "wrongpass"}'
```

**自動返回：**
```json
{
  "code": 401,
  "message": "用戶名或密碼錯誤",
  "timestamp": "..."
}
```

### 測試 3：登入成功
```bash
curl -X POST http://localhost:7943/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "test", "userPassword": "correctpass"}'
```

**自動返回：**
```json
{
  "code": 200,
  "message": "登入成功",
  "data": {
    "id": "user123",
    "username": "test"
  },
  "timestamp": "..."
}
```

---

## 💡 關鍵理解

**你只需要專注於業務邏輯：**

```typescript
public Login = asyncHandler(async (req, res) => {
  // 1. 取得資料
  const result = await DataBase.VerifyUser(...);
  
  // 2. 檢查結果，有錯就 throw
  if (!result.success) {
    throw new UnauthorizedError("錯誤訊息");
  }
  
  // 3. 處理成功邏輯
  const token = jwt.sign(...);
  res.cookie(...);
  
  // 4. 返回成功
  return res.success(data, message);
});
```

**剩下的全部自動處理：**
- ✅ 錯誤捕獲
- ✅ 錯誤格式化
- ✅ HTTP 狀態碼設定
- ✅ 統一的 JSON 結構
- ✅ 錯誤日誌記錄
- ✅ 開發/生產環境差異處理

這就是「自動錯誤處理」的意思！🎉
