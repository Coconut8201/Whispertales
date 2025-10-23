# GenStory 功能完整性報告

**日期**: 2025-10-23  
**檢查項目**: 圖片和文字串流生成 + 保存功能

---

## ✅ 已完成的功能

### 1. 圖片和文字生成 (geminiAI.ts)

#### 核心方法
- ✅ `generateImageWithText()` - 同步生成文字和圖片
- ✅ `generateImageWithTextStream()` - 串流生成文字和圖片
- ✅ 支援自訂圖片比例 (`1:1`, `3:4`, `4:3`, `9:16`, `16:9`)
- ✅ 圖片以 base64 格式返回（包含 mimeType）

#### 配置選項
```typescript
{
  model: "gemini-2.5-flash-image",
  temperature: 0.9,
  responseModalities: ["TEXT", "IMAGE"],
  aspectRatio: "1:1",
  maxOutputTokens: 4096
}
```

### 2. 故事生成控制器 (storyController.ts)

#### 串流模式 (`stream: true`)
1. ✅ **SSE 連接設置**
   - Content-Type: text/event-stream
   - 禁用緩衝，確保即時傳輸

2. ✅ **實時文字串流**
   - 使用 `generateImageWithTextStream()`
   - 逐字逐句發送到前端
   - 事件類型: `{ type: "story", content: "..." }`

3. ✅ **即時圖片傳輸**
   - 圖片生成完立即發送（不等待所有圖片）
   - 事件類型: `{ type: "image", image: "data:image/png;base64,...", currentCount: N }`

4. ✅ **進度提示**
   - 連接確認: `{ type: "connected" }`
   - 狀態更新: `{ type: "status", message: "..." }`
   - 完成信號: `{ type: "complete", storyId, metadata }`

5. ✅ **錯誤處理**
   - 生成失敗: `{ type: "error", message: "..." }`
   - 保存失敗警告: `{ type: "warning", message: "..." }`

#### 非串流模式 (`stream: false`)
1. ✅ 使用 `generateImageWithText()` 同步生成
2. ✅ 一次性返回完整故事和所有圖片
3. ✅ JSON 格式響應

### 3. 圖片存儲服務 (GridFSStorageService.ts)

#### 核心功能
- ✅ **Base64 → 二進制轉換**（節省約 33% 空間）
- ✅ **批量保存**: `saveImagesFromBase64Array()`
- ✅ **按 storyId 查詢**: `getImagesByStoryId()`
- ✅ **二進制 → Base64 讀取**: `getImageBase64()`

#### Metadata 記錄
```typescript
{
  storyId: string,
  index: number,
  contentType: string,
  originalSize: number,  // base64 大小
  binarySize: number,    // 實際存儲大小
  uploadDate: Date
}
```

### 4. 資料庫服務 (StoryService.ts)

- ✅ `createStory()` - 創建故事文檔
- ✅ `updateImageFileIds()` - 保存 GridFS file IDs 到 story 文檔
- ✅ `getStoryById()` - 讀取故事
- ✅ `deleteStory()` - 刪除故事

---

## 📋 完整流程

### 串流模式工作流程

```
前端請求 (stream: true)
    ↓
SSE 連接建立
    ↓
開始串流生成
    ├─→ 文字片段 → 立即發送 → 前端逐步顯示
    ├─→ 圖片生成 → 立即發送 → 前端立即渲染
    └─→ 完成信號
         ↓
保存到資料庫
    ├─→ 創建 Story 文檔
    ├─→ 添加到用戶書單
    └─→ 保存圖片到 GridFS
         ↓
返回 storyId 和 metadata
```

### 非串流模式工作流程

```
前端請求 (stream: false)
    ↓
同步生成文字和圖片
    ↓
保存到資料庫
    ├─→ 創建 Story 文檔
    ├─→ 添加到用戶書單
    └─→ 保存圖片到 GridFS
         ↓
一次性返回完整結果
```

---

## 🎯 改進項目 (已完成)

### 1. 串流 API 使用修正 ✅
**問題**: 原先使用 `generateContent()` 非串流 API  
**解決**: 改用 `generateImageWithTextStream()` 真正串流生成

### 2. 圖片即時傳輸 ✅
**問題**: 圖片批量返回（等待所有圖片生成）  
**解決**: 每張圖片生成後立即發送給前端

### 3. 錯誤提示優化 ✅
**問題**: 圖片保存失敗時前端無感知  
**解決**: 新增 `warning` 類型事件，告知前端異常狀況

### 4. API 統一性 ✅
**問題**: 串流和非串流使用不同的 Gemini API  
**解決**: 統一使用 `generateImageWithText*` 系列方法

---

## 🧪 測試建議

### 1. 功能測試
```bash
# 串流模式
curl -X POST http://localhost:7943/story/genstory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "roleform": {
      "style": "童話風格",
      "mainCharacter": "小兔子",
      "description": "一隻勇敢的小兔子"
    },
    "stream": true
  }'

# 非串流模式
curl -X POST http://localhost:7943/story/genstory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "roleform": {
      "style": "科幻風格",
      "mainCharacter": "機器人",
      "description": "一個有感情的機器人"
    },
    "stream": false
  }'
```

### 2. 前端監聽範例
```typescript
const eventSource = new EventSource('/story/genstory');

eventSource.addEventListener('message', (e) => {
  const data = JSON.parse(e.data);
  
  switch (data.type) {
    case 'connected':
      console.log('連接成功');
      break;
    case 'story':
      appendText(data.content); // 逐步顯示文字
      break;
    case 'image':
      displayImage(data.image); // 立即顯示圖片
      console.log(`已收到第 ${data.currentCount} 張圖片`);
      break;
    case 'status':
      showStatus(data.message);
      break;
    case 'warning':
      showWarning(data.message);
      break;
    case 'complete':
      console.log('生成完成', data.storyId);
      eventSource.close();
      break;
    case 'error':
      console.error('錯誤', data.message);
      eventSource.close();
      break;
  }
});
```

---

## 📊 效能優勢

### 串流模式優勢
1. **降低首屏等待時間**: 文字開始生成後立即顯示
2. **漸進式渲染**: 圖片完成即顯示，不需等待全部完成
3. **用戶體驗提升**: 實時進度反饋，降低焦慮感

### 存儲優化
- **Base64 → 二進制**: 節省 33% 存儲空間
- **GridFS 分塊存儲**: 突破 16MB 文檔限制
- **按需加載**: 可選擇只加載特定圖片

---

## ⚠️ 注意事項

### 1. 前端實作要求
- 必須支援 SSE (Server-Sent Events)
- 需處理多種事件類型 (story, image, status, error, etc.)
- 建議使用 EventSource API 或 fetch with stream

### 2. 網路要求
- 串流模式需要穩定的長連接
- 建議配置 Nginx `proxy_buffering off`
- 前端需設定合理的超時時間

### 3. 錯誤恢復
- 圖片保存失敗不影響故事本身
- 前端應提示用戶重新生成圖片（未來功能）

---

## 📝 結論

✅ **圖片和文字串流生成功能已完善**

- 串流模式實現真正的漸進式渲染
- 圖片即時傳輸，無需等待全部完成
- 完整的錯誤處理和狀態回饋
- 存儲系統穩定高效（GridFS + 二進制優化）

**建議後續優化**:
1. 添加圖片重新生成功能（針對保存失敗的情況）
2. 實作前端串流接收和渲染邏輯
3. 增加生成進度百分比（基於 token 估算）
4. 添加生成中斷/取消功能
