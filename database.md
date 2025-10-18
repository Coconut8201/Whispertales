# MongoDB 資料庫設定指南

本文件說明如何在 Whispertales 專案中設定和連接 MongoDB 資料庫。

## 目錄
- [透過 Docker 架設 MongoDB](#透過-docker-架設-mongodb)
- [MongoDB 連線](#mongodb-連線)
- [環境變數配置](#環境變數配置)
- [資料庫結構](#資料庫結構)

---

## 透過 Docker 架設 MongoDB

使用專案提供的 `database.dockerfile` 快速架設 MongoDB：

```bash
# 構建 Docker 映像
docker build -t mongodb-whispertales -f database.dockerfile .

# 啟動 MongoDB 容器
docker run -d -p 27017:27017 --name mongodb-container mongodb-whispertales
```

**參數說明：**
- `-d`: 後臺執行容器
- `-p 27017:27017`: 映射連接埠（主機:容器）
- `--name mongodb-container`: 容器名稱

**驗證容器是否正在運行：**
```bash
docker ps | grep mongodb-container
```

**查看容器日誌：**
```bash
docker logs mongodb-container
```

**停止容器：**
```bash
docker stop mongodb-container
```

**移除容器：**
```bash
docker rm mongodb-container
```

---

## MongoDB 連線

### 本地連線字串

```bash
mongodb://admin:p@ssw0rd123@localhost:27017/whispertales?authSource=admin
```

### 連線參數說明

| 參數 | 值 | 說明 |
|------|-----|------|
| 用戶名 | `admin` | MongoDB 管理員帳號 |
| 密碼 | `p@ssw0rd123` | MongoDB 管理員密碼 |
| 主機 | `localhost` | 連接地址（本地） |
| 連接埠 | `27017` | MongoDB 預設連接埠 |
| 資料庫 | `whispertales` | 專案資料庫名稱 |
| `authSource` | `admin` | 認證資料庫（必填） |

### 使用 MongoDB 客戶端連線

**安裝 MongoDB Shell（mongosh）：**
```bash
# macOS
brew install mongosh

# 或從官網下載：https://www.mongodb.com/try/download/shell
```

**連線到資料庫：**
```bash
mongosh "mongodb://admin:p@ssw0rd123@localhost:27017/whispertales?authSource=admin"
```

**常用命令：**
```javascript
// 查看所有資料庫
show databases

// 切換到 whispertales 資料庫
use whispertales

// 查看所有集合
show collections

// 查看使用者集合的資料
db.users.find()

// 查看故事集合的資料
db.stories.find()

// 統計集合中的文件數量
db.users.countDocuments()
db.stories.countDocuments()

// 刪除集合（謹慎操作）
db.users.drop()
```

---

## 環境變數配置

### 1. 複製環境變數範例檔案

```bash
cp .env.example .env
```

### 2. 編輯 `.env` 檔案

在 `.env` 中設定 MongoDB 連接 URI：

```env
# MongoDB 連線設定
mongoDB_api=mongodb://admin:p@ssw0rd123@localhost:27017/whispertales?authSource=admin
```

### 3. 在程式中使用

後端會自動從環境變數載入 MongoDB 連接字串：

```typescript
// src/app.ts
import { DataBase } from './utils/DataBase';

const mongoDB_URI = process.env.mongoDB_api!;
new DataBase(mongoDB_URI);
```

---

## 資料庫結構

### Collections（集合）

專案使用兩個主要集合：

#### 1. users 集合

儲存用戶資料和身份驗證資訊

```javascript
{
  _id: ObjectId,
  userName: String,           // 用戶名（唯一）
  userPassword: String,       // 密碼
  email: String,              // 電子郵件
  nickname: String,           // 暱稱
  phone: String,              // 電話
  avatar: String,             // 頭像
  booklist: [ObjectId],       // 故事 ID 列表
  voiceList: [String],        // 聲音列表
  createdAt: Date,            // 創建日期
  updatedAt: Date             // 更新日期
}
```

#### 2. stories 集合

儲存故事內容和相關媒體資料

```javascript
{
  _id: ObjectId,
  storyTale: String,          // 故事內容
  storyInfo: String,          // 故事資訊
  image_prompt: [String],     // 圖片生成提示詞
  image_base64: [String],     // Base64 編碼圖片
  is_favorite: Boolean,       // 是否為最愛
  addDate: Date               // 添加日期
}
```

### 關聯關係

- `users.booklist` 包含多個 `stories._id` 的參照
- 一個用戶可以擁有多個故事

---

## 常見問題

### Q: 連接失敗 "connection refused"

**原因：** MongoDB 容器未啟動

**解決方案：**
```bash
# 檢查容器狀態
docker ps -a | grep mongodb

# 啟動容器
docker run -d -p 27017:27017 --name mongodb-container mongodb-whispertales
```

### Q: 認證失敗 "Authentication failed"

**原因：** 連接字串錯誤或缺少 `authSource` 參數

**解決方案：**
確認連接字串包含 `?authSource=admin`：
```
mongodb://admin:p@ssw0rd123@localhost:27017/whispertales?authSource=admin
```

### Q: 如何備份資料庫

```bash
# 從 Docker 容器備份
docker exec mongodb-container mongodump --authenticationDatabase admin -u admin -p p@ssw0rd123 --out /backup

# 將備份複製到主機
docker cp mongodb-container:/backup ./mongo-backup
```

### Q: 如何還原資料庫

```bash
# 將備份複製到容器
docker cp ./mongo-backup mongodb-container:/restore

# 在容器內還原
docker exec mongodb-container mongorestore --authenticationDatabase admin -u admin -p p@ssw0rd123 /restore
```

---

## 參考資料

- [MongoDB 官方文檔](https://docs.mongodb.com/)
- [Mongoose 官方文檔](https://mongoosejs.com/)
- [Docker Hub - MongoDB](https://hub.docker.com/_/mongo)
