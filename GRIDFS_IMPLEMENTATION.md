# GridFS 圖片存儲系統實作文檔

## 📋 概述

本文檔詳細說明了 Whispertales 項目中使用 MongoDB GridFS 實現的圖片存儲系統。這是一個專業的、可擴展的解決方案，用於解決圖片 base64 直接存儲到 MongoDB 導致的性能和容量問題。

## 🎯 解決的問題

### 原始問題
1. **圖片無法保存**：base64 圖片直接存入 MongoDB 超過 16MB 文檔限制
2. **權限驗證失敗**：故事創建後用戶無法訪問（`saveNewBookId` 時序問題）
3. **性能問題**：大量 base64 數據影響查詢效率
4. **存儲浪費**：base64 比原始二進制大約 33%

### GridFS 優勢
| 特性 | GridFS | Base64 存儲 |
|------|--------|-------------|
| 文件大小限制 | 理論上無限 | 16MB |
| 存儲效率 | 100% | 133% (base64 overhead) |
| 查詢性能 | 高（索引支持） | 低（大文檔） |
| 串流支持 | ✅ 是 | ❌ 否 |
| 分塊存儲 | ✅ 自動 | ❌ 無 |
| 備份一致性 | ✅ 與 MongoDB 統一 | ✅ 與 MongoDB 統一 |

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  圖片顯示: <img src="/api/images/{fileId}" />           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Request
                     ↓
┌─────────────────────────────────────────────────────────┐
│                Backend (Express)                         │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ImageRoute (/api/images/*)                      │  │
│  │  - 驗證用戶權限                                   │  │
│  │  - 調用 ImageController                          │  │
│  └──────────────────────────────────────────────────┘  │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ImageController                                 │  │
│  │  - 權限檢查 (checkOwnership)                     │  │
│  │  - 調用 GridFSStorageService                     │  │
│  └──────────────────────────────────────────────────┘  │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GridFSStorageService                            │  │
│  │  - saveImageFromBase64()                         │  │
│  │  - getImageStream()                              │  │
│  │  - deleteStoryImages()                           │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   MongoDB                                │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GridFS Collections (images bucket)             │   │
│  │                                                  │   │
│  │  images.files: (metadata)                       │   │
│  │  {                                               │   │
│  │    _id: ObjectId("..."),                        │   │
│  │    filename: "story_abc123_0.png",              │   │
│  │    length: 524288,                              │   │
│  │    chunkSize: 261120,                           │   │
│  │    uploadDate: ISODate("..."),                  │   │
│  │    metadata: {                                   │   │
│  │      storyId: "abc123",                         │   │
│  │      index: 0,                                  │   │
│  │      contentType: "image/png"                   │   │
│  │    }                                             │   │
│  │  }                                               │   │
│  │                                                  │   │
│  │  images.chunks: (實際數據分塊，每塊 255KB)      │   │
│  │  {                                               │   │
│  │    _id: ObjectId("..."),                        │   │
│  │    files_id: ObjectId("..."),                   │   │
│  │    n: 0,  // 塊索引                             │   │
│  │    data: Binary("...")  // 圖片數據             │   │
│  │  }                                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  stories Collection:                            │   │
│  │  {                                               │   │
│  │    _id: "abc123",                               │   │
│  │    storyTale: "...",                            │   │
│  │    image_file_ids: [                            │   │
│  │      "507f1f77bcf86cd799439011",  // fileId    │   │
│  │      "507f1f77bcf86cd799439012"                │   │
│  │    ]                                             │   │
│  │  }                                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📁 文件結構

```
backend/src/
├── services/
│   └── GridFSStorageService.ts      # GridFS 存儲服務（核心）
├── controller/
│   ├── storyController.ts           # 故事控制器（已更新使用 GridFS）
│   └── imageController.ts           # 圖片控制器（新增）
├── routers/
│   └── imageRoute.ts                # 圖片路由（新增）
├── models/
│   └── storyModel.ts                # 故事模型（新增 image_file_ids）
├── interfaces/
│   └── storyInterface.ts            # 故事接口（新增 image_file_ids）
├── database/services/
│   └── StoryService.ts              # 新增 updateImageFileIds 方法
├── utils/
│   └── DataBase.ts                  # 新增 Update_StoryImageFileIds 包裝器
├── app.ts                           # 初始化 GridFS Bucket
└── Routers.ts                       # 註冊 ImageRoute
```

## 🔧 核心組件

### 1. GridFSStorageService

**位置**: `backend/src/services/GridFSStorageService.ts`

**職責**:
- 管理 GridFS Bucket
- 保存圖片（base64 → GridFS）
- 獲取圖片串流
- 刪除圖片
- 查詢圖片 metadata

**關鍵方法**:

```typescript
// 初始化（在 app.ts 中調用）
GridFSStorageService.initializeBucket();

// 保存單張圖片
const fileId = await GridFSStorageService.saveImageFromBase64(
  base64Data,
  storyId,
  index
);
// 返回: "507f1f77bcf86cd799439011"

// 批量保存圖片
const fileIds = await GridFSStorageService.saveImagesFromBase64Array(
  base64Array,
  storyId
);
// 返回: ["fileId1", "fileId2", ...]

// 獲取圖片串流（用於 HTTP 響應）
const stream = await GridFSStorageService.getImageStream(fileId);
stream.pipe(res);

// 刪除故事的所有圖片
await GridFSStorageService.deleteStoryImages(storyId);
```

### 2. ImageController

**位置**: `backend/src/controller/imageController.ts`

**職責**:
- 處理圖片相關的 HTTP 請求
- 驗證用戶權限
- 串流返回圖片

**API 端點**:

| 方法 | 路徑 | 描述 | 權限 |
|------|------|------|------|
| GET | `/api/images/:fileId` | 獲取單張圖片 | 需要故事擁有權 |
| GET | `/api/images/story/:storyId` | 獲取故事的所有圖片列表 | 需要故事擁有權 |
| DELETE | `/api/images/:fileId` | 刪除圖片 | 需要故事擁有權 |
| GET | `/api/images/stats` | 獲取存儲統計 | 需要認證 |

**權限驗證流程**:
```typescript
1. 獲取 fileId 的 metadata
2. 從 metadata 中取得 storyId
3. 調用 DataBase.CheckOwnership(userId, storyId)
4. 如果擁有權限 → 返回圖片
5. 如果沒有權限 → 返回 403 錯誤
```

### 3. StoryController 更新

**位置**: `backend/src/controller/storyController.ts`

**關鍵修改**:

```typescript
// GenStory 方法中的圖片處理流程

// 1. 先將故事添加到用戶書單（確保權限）⚠️ 關鍵！
const addResult = await DataBase.saveNewBookId(storyId, userId);
if (!addResult || !addResult.success) {
  return res.error("故事保存失敗：無法添加到書單", 500);
}

// 2. 使用 GridFS 保存圖片
const imageFileIds = await GridFSStorageService.saveImagesFromBase64Array(
  imageBase64Array,
  storyId
);

// 3. 生成圖片訪問 URL
const imageUrls = imageFileIds.map(fileId => `/api/images/${fileId}`);

// 4. 更新故事記錄
await DataBase.Update_StoryImageFileIds(storyId, imageFileIds);

// 5. 返回響應
return res.success({
  storyId,
  story: content.text,
  images: imageUrls,  // 前端用這個顯示圖片
  imageFileIds
});
```

## 🔐 安全機制

### 權限驗證流程

```typescript
// ImageController.getImage 中的權限檢查

1. 用戶請求: GET /api/images/507f1f77bcf86cd799439011
2. authenticateToken 中間件驗證 JWT
3. 獲取 fileId 的 metadata
4. 從 metadata.storyId 獲取故事 ID
5. 檢查 userId 是否在 user.booklist 中包含 storyId
6. 如果是 → 串流返回圖片
7. 如果否 → 返回 403 Forbidden
```

### 關鍵安全特性

1. **JWT 認證**: 所有圖片 API 都需要 `authenticateToken` 中間件
2. **所有權驗證**: 只有故事擁有者可以訪問圖片
3. **Metadata 追蹤**: 每張圖片的 metadata 包含 storyId，便於權限檢查
4. **時序保證**: 先添加到書單，再返回響應，確保用戶能立即訪問

## 📊 數據庫結構

### GridFS Collections

#### images.files (metadata)
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "filename": "story_abc123_0.png",
  "length": 524288,  // 文件大小（字節）
  "chunkSize": 261120,  // 每塊大小（默認 255KB）
  "uploadDate": ISODate("2025-10-20T10:30:00Z"),
  "metadata": {
    "storyId": "abc123",  // 關聯的故事 ID ⚠️ 重要
    "index": 0,  // 圖片在故事中的順序
    "contentType": "image/png",
    "size": 524288,
    "uploadDate": "2025-10-20T10:30:00.000Z"
  }
}
```

#### images.chunks (實際數據)
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "files_id": ObjectId("507f1f77bcf86cd799439011"),
  "n": 0,  // 塊索引（0, 1, 2, ...）
  "data": BinData(0, "iVBORw0KGgoAAAA...")  // 圖片數據塊
}
```

### stories Collection (更新)

```json
{
  "_id": "abc123",
  "storyTale": "故事文本...",
  "storyInfo": "{...}",
  "image_file_ids": [  // ✅ 新增欄位
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "image_base64": [],  // ⚠️ 已棄用，保留向後兼容
  "is_favorite": false,
  "addDate": ISODate("2025-10-20T10:30:00Z")
}
```

## 🚀 使用指南

### 後端使用

#### 1. 保存圖片到 GridFS

```typescript
import { GridFSStorageService } from "../services/GridFSStorageService";

// 方法 1: 從 base64 保存
const fileId = await GridFSStorageService.saveImageFromBase64(
  "data:image/png;base64,iVBORw0KGgoAAAA...",
  storyId,
  0  // index
);

// 方法 2: 批量保存
const fileIds = await GridFSStorageService.saveImagesFromBase64Array(
  [base64_1, base64_2, base64_3],
  storyId
);

// 方法 3: 從 Buffer 保存
const fileId = await GridFSStorageService.saveImageFromBuffer(
  buffer,
  storyId,
  0,
  "png"
);
```

#### 2. 獲取圖片

```typescript
// 獲取圖片串流
const stream = await GridFSStorageService.getImageStream(fileId);

// 設置響應頭並串流返回
res.setHeader("Content-Type", "image/png");
stream.pipe(res);
```

#### 3. 刪除圖片

```typescript
// 刪除單張圖片
await GridFSStorageService.deleteImage(fileId);

// 刪除故事的所有圖片
await GridFSStorageService.deleteStoryImages(storyId);
```

### 前端使用

```typescript
// 顯示圖片（從 API 響應獲取）
const response = await StoryService.generateStory(formData);

if (response.success) {
  const { images } = response;
  // images: ["/api/images/507f1f...", "/api/images/507f1f..."]
  
  // 在 React 中使用
  images.map((url, index) => (
    <img 
      key={index}
      src={url}  // 自動包含認證 cookie
      alt={`Story image ${index + 1}`}
    />
  ));
}
```

**注意**: 前端請求圖片時，瀏覽器會自動帶上認證 cookie（`credentials: "include"`），後端驗證 JWT 後返回圖片。

## 🔄 遷移指南

### 從舊系統遷移

如果你的數據庫中已經有使用 `image_base64` 存儲的故事，可以使用以下腳本遷移：

```typescript
// 遷移腳本（後端）
import { storyModel } from "./models/storyModel";
import { GridFSStorageService } from "./services/GridFSStorageService";

async function migrateImagesToGridFS() {
  const stories = await storyModel.find({ 
    image_base64: { $exists: true, $ne: [] } 
  });

  for (const story of stories) {
    if (!story.image_base64 || story.image_base64.length === 0) {
      continue;
    }

    console.log(`遷移故事 ${story._id}...`);

    // 保存到 GridFS
    const fileIds = await GridFSStorageService.saveImagesFromBase64Array(
      story.image_base64,
      story._id.toString()
    );

    // 更新故事記錄
    await storyModel.findByIdAndUpdate(story._id, {
      $set: { image_file_ids: fileIds },
      $unset: { image_base64: "" }  // 刪除舊數據（可選）
    });

    console.log(`✅ 故事 ${story._id} 遷移完成`);
  }
}
```

## 📈 性能優化

### 1. 索引建議

```javascript
// MongoDB Shell
use whispertales;

// 為 metadata.storyId 建立索引（加速查詢）
db.images.files.createIndex({ "metadata.storyId": 1 });

// 為 metadata.index 建立索引（加速排序）
db.images.files.createIndex({ "metadata.storyId": 1, "metadata.index": 1 });
```

### 2. 緩存策略

```typescript
// ImageController 中的緩存設置
res.setHeader("Cache-Control", "public, max-age=31536000"); // 緩存 1 年

// 圖片一旦創建就不會改變，可以長時間緩存
```

### 3. CDN 整合（未來擴展）

```typescript
// 可以輕鬆擴展到 CDN
// 1. 保存圖片到 GridFS
// 2. 異步上傳到 CDN (S3/Cloudflare)
// 3. 更新 image_file_ids 為 CDN URLs
// 4. 刪除 GridFS 中的圖片（可選）
```

## 🐛 故障排除

### 問題 1: 圖片無法顯示（403 Forbidden）

**原因**: 權限驗證失敗

**解決方案**:
1. 檢查 `saveNewBookId` 是否成功執行
2. 檢查用戶的 `booklist` 是否包含 `storyId`
3. 檢查 JWT token 是否有效

```typescript
// 調試代碼
const user = await userModel.findById(userId);
console.log("用戶書單:", user.booklist);
console.log("故事 ID:", storyId);
console.log("是否擁有:", user.booklist.includes(storyId));
```

### 問題 2: GridFS 初始化失敗

**原因**: MongoDB 連接未建立

**解決方案**:
確保 GridFS 初始化在資料庫連接成功後：

```typescript
// app.ts
connectionManager.connect(...)
  .then(() => {
    GridFSStorageService.initializeBucket();  // ✅ 正確時機
  });
```

### 問題 3: 類型兼容性錯誤

**原因**: mongoose 和 mongodb 包版本不一致

**解決方案**:
使用類型斷言（已在代碼中實現）：

```typescript
this.bucket = new GridFSBucket(mongoose.connection.db as any, {
  bucketName: this.BUCKET_NAME,
});
```

## 📝 API 文檔

### GET /api/images/:fileId

獲取單張圖片

**請求**:
```
GET /api/images/507f1f77bcf86cd799439011
Authorization: Bearer {jwt_token}
```

**響應**:
```
200 OK
Content-Type: image/png
Cache-Control: public, max-age=31536000

{圖片二進制數據}
```

**錯誤**:
- `400 Bad Request`: 無效的 fileId
- `403 Forbidden`: 無權訪問此圖片
- `404 Not Found`: 圖片不存在

### GET /api/images/story/:storyId

獲取故事的所有圖片列表

**請求**:
```
GET /api/images/story/abc123
Authorization: Bearer {jwt_token}
```

**響應**:
```json
{
  "code": 200,
  "message": "獲取圖片列表成功",
  "data": [
    {
      "fileId": "507f1f77bcf86cd799439011",
      "url": "/api/images/507f1f77bcf86cd799439011",
      "index": 0,
      "contentType": "image/png",
      "size": 524288,
      "uploadDate": "2025-10-20T10:30:00.000Z"
    }
  ]
}
```

## 🎓 最佳實踐

### 1. 圖片大小限制

建議前端在上傳前壓縮圖片：

```typescript
// 前端壓縮圖片示例
async function compressImage(base64: string, maxWidth: number = 1024): Promise<string> {
  const img = new Image();
  img.src = base64;
  
  await new Promise(resolve => img.onload = resolve);
  
  const canvas = document.createElement('canvas');
  const scale = Math.min(maxWidth / img.width, 1);
  
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
}
```

### 2. 錯誤處理

```typescript
try {
  const fileIds = await GridFSStorageService.saveImagesFromBase64Array(
    images,
    storyId
  );
} catch (error) {
  console.error("保存圖片失敗:", error);
  // 不阻塞故事創建，記錄錯誤即可
}
```

### 3. 清理孤立圖片

定期清理沒有關聯故事的圖片：

```typescript
// 維護腳本
const allStories = await storyModel.find().select('_id');
const validStoryIds = allStories.map(s => s._id.toString());

await GridFSStorageService.cleanupOrphanedImages(validStoryIds);
```

## 📚 參考資料

- [MongoDB GridFS 官方文檔](https://docs.mongodb.com/manual/core/gridfs/)
- [MongoDB Node.js Driver - GridFS](https://mongodb.github.io/node-mongodb-native/api-generated/gridfs.html)
- [Mongoose 與 GridFS 整合](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-mongo)

## 🎉 總結

GridFS 實作完成後，你的系統現在擁有：

✅ **突破 MongoDB 16MB 限制**：可以存儲任意大小的圖片  
✅ **高性能**：串流讀取，節省內存  
✅ **安全**：完整的權限驗證機制  
✅ **可擴展**：易於遷移到 CDN  
✅ **易維護**：清晰的分層架構  
✅ **向後兼容**：保留 `image_base64` 欄位  

現在可以開始測試完整的故事生成和圖片顯示流程了！
