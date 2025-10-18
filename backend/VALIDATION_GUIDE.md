# 參數驗證指南

## ❓ validateRequest 怎麼知道需要哪些參數？

**答案：你需要在路由中明確告訴它！**

`validateRequest` 和 `validateQuery` 不會自動檢測，你必須手動配置每個路由需要的參數。

---

## 📝 基本用法

### 1. validateRequest - 驗證請求體參數

用於驗證 POST/PUT/DELETE 請求的 **body** 參數：

```typescript
router.post(
  '/login',
  validateRequest(['userName', 'userPassword']),  // 👈 明確指定需要這 2 個參數
  controller.Login
);
```

**這會檢查：**
```json
// ✅ 通過驗證
{
  "userName": "test",
  "userPassword": "123456"
}

// ❌ 驗證失敗 - 缺少 userPassword
{
  "userName": "test"
}

// ✅ 通過驗證 - 多餘的參數會被忽略
{
  "userName": "test",
  "userPassword": "123456",
  "extraField": "ignored"  // 不會報錯
}
```

---

### 2. validateQuery - 驗證查詢參數

用於驗證 GET/DELETE 請求的 **URL 查詢參數**：

```typescript
router.get(
  '/story',
  validateQuery(['storyId']),  // 👈 明確指定需要 storyId
  controller.GetStory
);
```

**這會檢查：**
```bash
# ✅ 通過驗證
GET /story?storyId=123

# ❌ 驗證失敗 - 缺少 storyId
GET /story

# ✅ 通過驗證 - 多餘的參數會被忽略
GET /story?storyId=123&page=1&limit=10
```

---

## 🎯 實際範例

### 範例 1：登入路由（2 個必填參數）

```typescript
// 在 userRoute.ts 中
router.post(
  '/login',
  validateRequest(['userName', 'userPassword']),  // 只要這 2 個
  controller.Login
);
```

**測試：**
```bash
# ✅ 成功
curl -X POST http://localhost:7943/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "test", "userPassword": "123456"}'

# ❌ 失敗 - 缺少 userPassword
curl -X POST http://localhost:7943/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "test"}'

# 返回：
{
  "code": 400,
  "message": "缺少必填欄位",
  "details": {
    "missingFields": ["userPassword"]
  },
  "timestamp": "..."
}
```

---

### 範例 2：註冊路由（2 個必填參數）

```typescript
router.post(
  '/adduser',
  validateRequest(['userName', 'userPassword']),  // 只要這 2 個
  controller.AddUser
);
```

---

### 範例 3：收藏功能（查詢參數）

```typescript
router.post(
  '/addfav',
  authMiddleware,                // 先驗證登入
  validateQuery(['bookid']),     // 然後驗證查詢參數
  controller.AddFavorite
);
```

**測試：**
```bash
# ✅ 成功
curl -X POST http://localhost:7943/user/addfav?bookid=123 \
  -H "Cookie: authToken=..."

# ❌ 失敗 - 缺少 bookid
curl -X POST http://localhost:7943/user/addfav \
  -H "Cookie: authToken=..."

# 返回：
{
  "code": 400,
  "message": "缺少必填查詢參數",
  "details": {
    "missingParams": ["bookid"]
  },
  "timestamp": "..."
}
```

---

### 範例 4：更新資料（多個參數，但有些可選）

```typescript
// 如果你想要 1 個必填 + 其他選填：
router.put(
  '/profile',
  authenticateToken,
  validateRequest(['nickname']),  // 只驗證 nickname 是必填
  controller.UpdateProfile
);
```

**測試：**
```bash
# ✅ 成功 - 只有 nickname
curl -X PUT http://localhost:7943/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=..." \
  -d '{"nickname": "NewName"}'

# ✅ 成功 - nickname + 其他選填欄位
curl -X PUT http://localhost:7943/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=..." \
  -d '{"nickname": "NewName", "email": "test@example.com", "phone": "123456789"}'

# ❌ 失敗 - 缺少 nickname
curl -X PUT http://localhost:7943/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=..." \
  -d '{"email": "test@example.com"}'
```

---

## 🔄 中介軟體執行順序

中介軟體是**從左到右**依序執行：

```typescript
router.post(
  '/addfav',
  authMiddleware,              // 1️⃣ 先執行：檢查是否登入
  validateQuery(['bookid']),   // 2️⃣ 再執行：檢查參數
  controller.AddFavorite       // 3️⃣ 最後執行：業務邏輯
);
```

**執行流程：**
```
1. authMiddleware
   ├─ ❌ 沒登入 → 返回 401，後面不執行
   └─ ✅ 已登入 → 繼續
      ↓
2. validateQuery(['bookid'])
   ├─ ❌ 缺少參數 → 返回 400，controller 不執行
   └─ ✅ 參數完整 → 繼續
      ↓
3. controller.AddFavorite
   └─ 執行業務邏輯
```

---

## 💡 常見問題

### Q1: 如果我想要 3 個參數怎麼辦？

A: 直接在陣列中加入：

```typescript
validateRequest(['userName', 'userPassword', 'email'])
```

### Q2: 如果參數是選填的怎麼辦？

A: **不要在 validateRequest 中列出選填參數！**

```typescript
// 只驗證必填的
validateRequest(['userName', 'userPassword'])

// 在 Controller 中處理選填參數
public Register = asyncHandler(async (req, res) => {
  const { userName, userPassword, email, phone } = req.body;
  // userName 和 userPassword 已經被驗證過了
  // email 和 phone 是選填的，可能是 undefined
});
```

### Q3: 如果同時需要 body 參數和 query 參數？

A: 兩個都用：

```typescript
router.post(
  '/create-story',
  authenticateToken,
  validateRequest(['title', 'content']),  // 驗證 body
  validateQuery(['category']),            // 驗證 query
  controller.CreateStory
);

// 請求範例：
// POST /create-story?category=fairy-tale
// Body: { "title": "...", "content": "..." }
```

### Q4: validateRequest 會阻止多餘的參數嗎？

A: **不會！** 它只檢查必填參數是否存在，不會阻止多餘參數。

```typescript
validateRequest(['userName', 'userPassword'])

// ✅ 這個會通過，extraField 會被忽略（但仍可在 req.body 中訪問）
{
  "userName": "test",
  "userPassword": "123456",
  "extraField": "ignored"
}
```

如果你想阻止多餘參數，需要在 Controller 中自己處理。

### Q5: 如何驗證參數格式（如 email 格式、密碼長度）？

A: `validateRequest` 只檢查參數是否存在，**不檢查格式**。

格式驗證應該在 Controller 中使用 `ValidationError`：

```typescript
public Register = asyncHandler(async (req, res) => {
  const { userName, userPassword, email } = req.body;
  
  const errors: Record<string, string> = {};
  
  // 驗證 email 格式
  if (email && !isValidEmail(email)) {
    errors.email = '電子郵件格式不正確';
  }
  
  // 驗證密碼長度
  if (userPassword.length < 8) {
    errors.userPassword = '密碼至少需要 8 個字元';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors, '資料驗證失敗');
  }
  
  // 繼續處理...
});
```

---

## 📋 快速參考表

| 驗證類型 | 使用場景 | 語法 |
|---------|---------|------|
| 請求體參數 | POST/PUT body | `validateRequest(['field1', 'field2'])` |
| 查詢參數 | GET/DELETE ?param=value | `validateQuery(['param1', 'param2'])` |
| 必填參數 | 一定要有的參數 | 列在陣列中 |
| 選填參數 | 可有可無的參數 | 不要列在陣列中 |
| 格式驗證 | 檢查格式、長度等 | 在 Controller 中用 ValidationError |

---

## ✅ 最佳實踐

### 1. 在路由層驗證必填參數
```typescript
router.post('/login',
  validateRequest(['userName', 'userPassword']),
  controller.Login
);
```

### 2. 在 Controller 中驗證格式和業務邏輯
```typescript
public Login = asyncHandler(async (req, res) => {
  // validateRequest 已經確保 userName 和 userPassword 存在
  const { userName, userPassword } = req.body;
  
  // 這裡只需要處理業務邏輯
  const result = await DataBase.VerifyUser(userName, userPassword);
  
  if (!result.success) {
    throw new UnauthorizedError("用戶名或密碼錯誤");
  }
  
  // ...
});
```

### 3. 保持驗證規則清晰
```typescript
// ✅ 好 - 清楚明瞭
validateRequest(['userName', 'userPassword'])

// ❌ 不好 - 不要驗證不需要的參數
validateRequest(['userName', 'userPassword', 'optionalField'])
```

---

## 🎓 總結

> **validateRequest 需要你明確告訴它要驗證哪些參數，它不會自動猜測！**

1. **你決定**每個路由需要哪些參數
2. **你配置**在路由中加入 `validateRequest([...])`
3. **中介軟體自動**檢查這些參數是否存在
4. **缺少參數**自動返回 400 錯誤，Controller 不會執行
5. **參數完整**繼續執行 Controller

這樣的設計讓你對每個 API 的參數需求有完全的控制權！
