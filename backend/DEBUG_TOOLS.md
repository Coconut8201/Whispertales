# 調試工具使用指南

## 🎯 概述

當你遇到登入問題時，現在有詳細的錯誤訊息和調試工具幫助你快速定位問題。

---

## 📊 改進的錯誤訊息

### 開發環境 vs 生產環境

#### 開發環境（詳細錯誤訊息）
```json
// 用戶不存在
{
  "code": 401,
  "message": "用戶不存在",
  "details": {
    "reason": "USER_NOT_FOUND",
    "userName": "test123"
  },
  "timestamp": "2024-10-18T08:00:00.000Z"
}

// 密碼錯誤
{
  "code": 401,
  "message": "密碼錯誤",
  "details": {
    "reason": "WRONG_PASSWORD",
    "userName": "test123"
  },
  "timestamp": "2024-10-18T08:00:00.000Z"
}
```

#### 生產環境（安全考量）
```json
// 所有認證失敗都返回相同訊息
{
  "code": 401,
  "message": "用戶名或密碼錯誤",
  "details": {
    "reason": "USER_NOT_FOUND"  // 或 "WRONG_PASSWORD"
  },
  "timestamp": "2024-10-18T08:00:00.000Z"
}
```

### 控制台日誌

**登入嘗試：**
```
[登入嘗試] 用戶名: test123
```

**登入失敗：**
```
[登入失敗] 用戶名: test123, 原因: 用戶不存在
```
或
```
[登入失敗] 用戶名: test123, 原因: 密碼錯誤
```

**登入成功：**
```
[登入成功] 用戶: test123, ID: 507f1f77bcf86cd799439011
```

---

## 🛠️ 調試工具 API

所有調試 API 只在**開發環境**中可用（`NODE_ENV !== 'production'`）。

### 1️⃣ 檢查用戶是否存在

**用途：**確認用戶名是否在資料庫中

**請求：**
```bash
GET http://localhost:7943/debug/check-user?userName=test123
```

**成功響應（用戶存在）：**
```json
{
  "code": 200,
  "message": "用戶存在",
  "data": {
    "exists": true,
    "userId": "507f1f77bcf86cd799439011",
    "userName": "test123",
    "hasPassword": true,
    "passwordLength": 8,
    "booklistCount": 5,
    "createdAt": "2024-10-18T08:00:00.000Z"
  },
  "timestamp": "..."
}
```

**成功響應（用戶不存在）：**
```json
{
  "code": 200,
  "message": "查詢完成",
  "data": {
    "exists": false,
    "userName": "test123",
    "message": "用戶不存在"
  },
  "timestamp": "..."
}
```

---

### 2️⃣ 列出所有用戶

**用途：**查看資料庫中所有用戶的基本資訊

**請求：**
```bash
GET http://localhost:7943/debug/list-users
```

**響應：**
```json
{
  "code": 200,
  "message": "找到 3 個用戶",
  "data": {
    "totalUsers": 3,
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userName": "test123",
        "passwordHash": "passw...",
        "passwordLength": 8,
        "bookCount": 5,
        "createdAt": "2024-10-18T08:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "userName": "alice",
        "passwordHash": "12345...",
        "passwordLength": 6,
        "bookCount": 0,
        "createdAt": "2024-10-17T10:00:00.000Z"
      }
    ]
  },
  "timestamp": "..."
}
```

---

### 3️⃣ 驗證登入憑證（最重要！）

**用途：**詳細檢查用戶名和密碼是否正確

**請求：**
```bash
POST http://localhost:7943/debug/verify-credentials
Content-Type: application/json

{
  "userName": "test123",
  "userPassword": "password123"
}
```

**響應（用戶不存在）：**
```json
{
  "code": 200,
  "message": "驗證失敗",
  "data": {
    "step": 1,
    "result": "FAIL",
    "reason": "USER_NOT_FOUND",
    "message": "用戶不存在於資料庫中",
    "suggestion": "請檢查用戶名是否正確，或先註冊用戶"
  },
  "timestamp": "..."
}
```

**響應（密碼錯誤）：**
```json
{
  "code": 200,
  "message": "密碼驗證失敗",
  "data": {
    "step": 2,
    "result": "FAIL",
    "reason": "WRONG_PASSWORD",
    "message": "密碼不正確",
    "details": {
      "storedPasswordLength": 8,
      "inputPasswordLength": 7,
      "storedPasswordPreview": "pas...",
      "inputPasswordPreview": "pas..."
    },
    "suggestion": "請檢查密碼是否正確，注意大小寫和空格"
  },
  "timestamp": "..."
}
```

**響應（驗證成功）：**
```json
{
  "code": 200,
  "message": "驗證成功",
  "data": {
    "step": 3,
    "result": "SUCCESS",
    "message": "驗證成功！用戶名和密碼都正確",
    "userId": "507f1f77bcf86cd799439011"
  },
  "timestamp": "..."
}
```

**控制台輸出（詳細調試資訊）：**
```
[調試] 找到用戶: test123
[調試] 資料庫密碼: password123
[調試] 輸入密碼: password123
[調試] 密碼匹配: true
```

---

### 4️⃣ 資料庫狀態檢查

**用途：**確認資料庫連線正常

**請求：**
```bash
GET http://localhost:7943/debug/db-status
```

**響應：**
```json
{
  "code": 200,
  "message": "資料庫狀態正常",
  "data": {
    "database": {
      "connected": true,
      "collections": {
        "users": {
          "count": 5,
          "model": "userModel"
        },
        "stories": {
          "count": 23,
          "model": "storyModel"
        }
      }
    },
    "environment": "development",
    "timestamp": "2024-10-18T08:00:00.000Z"
  },
  "timestamp": "..."
}
```

---

### 5️⃣ 創建測試用戶

**用途：**快速創建測試用戶進行調試

**請求：**
```bash
POST http://localhost:7943/debug/create-test-user
Content-Type: application/json

{
  "userName": "testuser",
  "userPassword": "test123"
}
```

**響應（成功）：**
```json
{
  "code": 200,
  "message": "測試用戶 \"testuser\" 創建成功",
  "data": {
    "userId": "507f1f77bcf86cd799439013",
    "userName": "testuser",
    "created": true
  },
  "timestamp": "..."
}
```

**響應（用戶已存在）：**
```json
{
  "code": 409,
  "message": "用戶 \"testuser\" 已存在",
  "details": {
    "userId": "507f1f77bcf86cd799439013",
    "suggestion": "請使用不同的用戶名，或使用 /debug/check-user 查看現有用戶"
  },
  "timestamp": "..."
}
```

---

## 🔍 調試流程範例

### 場景：登入失敗，不知道原因

#### Step 1: 檢查用戶是否存在
```bash
curl http://localhost:7943/debug/check-user?userName=test123
```

**結果：**
- ✅ 用戶存在 → 繼續 Step 2
- ❌ 用戶不存在 → 問題找到了！需要先註冊

#### Step 2: 驗證完整憑證
```bash
curl -X POST http://localhost:7943/debug/verify-credentials \
  -H "Content-Type: application/json" \
  -d '{"userName": "test123", "userPassword": "mypassword"}'
```

**可能的結果：**

1. **用戶不存在**
   ```json
   {
     "reason": "USER_NOT_FOUND",
     "suggestion": "請檢查用戶名是否正確，或先註冊用戶"
   }
   ```
   **解決方案：**使用正確的用戶名或先註冊

2. **密碼錯誤**
   ```json
   {
     "reason": "WRONG_PASSWORD",
     "details": {
       "storedPasswordLength": 8,
       "inputPasswordLength": 7  // 長度不同！
     },
     "suggestion": "請檢查密碼是否正確，注意大小寫和空格"
   }
   ```
   **解決方案：**
   - 檢查密碼長度
   - 檢查是否有多餘空格
   - 檢查大小寫

3. **驗證成功**
   ```json
   {
     "result": "SUCCESS",
     "message": "驗證成功！用戶名和密碼都正確"
   }
   ```
   **結論：**憑證正確，問題可能在其他地方（如 JWT、Cookie 設置）

#### Step 3: 檢查資料庫狀態
```bash
curl http://localhost:7943/debug/db-status
```

確認資料庫連線正常。

---

## 📝 使用 curl 測試範例

### 檢查用戶
```bash
curl "http://localhost:7943/debug/check-user?userName=test123"
```

### 列出所有用戶
```bash
curl http://localhost:7943/debug/list-users
```

### 驗證憑證
```bash
curl -X POST http://localhost:7943/debug/verify-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "test123",
    "userPassword": "password123"
  }'
```

### 創建測試用戶
```bash
curl -X POST http://localhost:7943/debug/create-test-user \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "userPassword": "test123"
  }'
```

### 資料庫狀態
```bash
curl http://localhost:7943/debug/db-status
```

---

## 🎨 使用 Postman/Thunder Client 測試

### 設置環境變數
```
BASE_URL = http://localhost:7943
```

### 創建請求集合

**1. Check User**
- Method: GET
- URL: `{{BASE_URL}}/debug/check-user?userName=test123`

**2. Verify Credentials**
- Method: POST
- URL: `{{BASE_URL}}/debug/verify-credentials`
- Body (JSON):
  ```json
  {
    "userName": "test123",
    "userPassword": "password123"
  }
  ```

**3. List Users**
- Method: GET
- URL: `{{BASE_URL}}/debug/list-users`

---

## 🚨 常見問題診斷

### 問題 1: "用戶不存在"

**可能原因：**
1. 用戶名拼寫錯誤
2. 大小寫不符
3. 用戶確實未註冊

**診斷步驟：**
```bash
# 1. 列出所有用戶
curl http://localhost:7943/debug/list-users

# 2. 檢查具體用戶
curl "http://localhost:7943/debug/check-user?userName=YOUR_USERNAME"
```

---

### 問題 2: "密碼錯誤"

**可能原因：**
1. 密碼拼寫錯誤
2. 有多餘空格
3. 大小寫不符

**診斷步驟：**
```bash
# 使用 verify-credentials 查看詳細資訊
curl -X POST http://localhost:7943/debug/verify-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "YOUR_USERNAME",
    "userPassword": "YOUR_PASSWORD"
  }'

# 查看控制台輸出的詳細比對資訊
```

**檢查重點：**
- `storedPasswordLength` vs `inputPasswordLength` - 長度是否相同？
- `storedPasswordPreview` vs `inputPasswordPreview` - 前幾個字元是否相同？

---

### 問題 3: 資料庫中沒有用戶

**解決方案：**創建測試用戶
```bash
curl -X POST http://localhost:7943/debug/create-test-user \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "userPassword": "test123"
  }'
```

---

## 🔒 安全提醒

⚠️ **重要：調試路由僅在開發環境中可用！**

在生產環境中：
- 所有 `/debug/*` 路由會返回 403 錯誤
- 錯誤訊息不會透露具體原因（用戶不存在 vs 密碼錯誤）
- 這是為了防止攻擊者枚舉用戶名

**環境變數設置：**
```bash
# 開發環境
NODE_ENV=development

# 生產環境
NODE_ENV=production
```

---

## 📋 快速參考

| API | 方法 | 用途 |
|-----|------|------|
| `/debug/check-user` | GET | 檢查用戶是否存在 |
| `/debug/list-users` | GET | 列出所有用戶 |
| `/debug/verify-credentials` | POST | 驗證登入憑證 |
| `/debug/db-status` | GET | 資料庫狀態 |
| `/debug/create-test-user` | POST | 創建測試用戶 |

---

## 💡 最佳實踐

1. **先用 `check-user` 確認用戶存在**
2. **再用 `verify-credentials` 檢查密碼**
3. **查看控制台日誌的詳細資訊**
4. **使用 `create-test-user` 快速創建測試數據**
5. **定期用 `db-status` 確認資料庫連線**

---

## 🎯 下一步

現在你可以：
1. ✅ 快速定位登入問題
2. ✅ 查看詳細的錯誤原因
3. ✅ 檢查資料庫狀態
4. ✅ 創建測試用戶
5. ✅ 驗證憑證是否正確

享受順暢的調試體驗！🚀
