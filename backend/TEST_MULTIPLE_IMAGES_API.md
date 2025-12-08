# 測試多張圖片生成 API

## API 端點

**URL**: `POST http://localhost:7943/story/test_multiple_images`

**認證**: 需要 JWT token（透過 `authenticateToken` 中介軟體）

## 請求參數

| 參數 | 類型 | 必填 | 預設值 | 說明 |
|------|------|------|--------|------|
| `prompt` | string | 否 | "A beautiful sunset over mountains" | 圖片生成提示詞 |
| `count` | number | 否 | 2 | 要生成的圖片數量（1-10） |
| `aspectRatio` | string | 否 | "1:1" | 圖片長寬比（可選值：1:1, 3:4, 4:3, 9:16, 16:9） |
| `stream` | boolean | 否 | false | 是否使用串流模式 |

## 使用範例

### 1. 批次模式（非串流）- 一次返回所有圖片

```bash
curl -X POST http://localhost:7943/story/test_multiple_images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "A cute cartoon rabbit in a magical forest",
    "count": 3,
    "aspectRatio": "16:9",
    "stream": false
  }'
```

**回應範例**:
```json
{
  "success": true,
  "message": "成功生成 3 張圖片",
  "data": {
    "images": [
      {
        "dataUri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
        "mimeType": "image/png",
        "size": 123456
      },
      {
        "dataUri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
        "mimeType": "image/png",
        "size": 234567
      },
      {
        "dataUri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
        "mimeType": "image/png",
        "size": 345678
      }
    ],
    "metadata": {
      "prompt": "A cute cartoon rabbit in a magical forest",
      "count": 3,
      "aspectRatio": "16:9",
      "elapsedTime": "45.23秒",
      "averageTimePerImage": "15.08秒"
    }
  }
}
```

### 2. 串流模式（SSE）- 圖片生成後立即返回

```bash
curl -X POST http://localhost:7943/story/test_multiple_images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "A cute cartoon rabbit in a magical forest",
    "count": 3,
    "aspectRatio": "16:9",
    "stream": true
  }'
```

**SSE 事件串流範例**:

```
data: {"type":"connected","message":"開始生成 3 張圖片...","config":{"prompt":"A cute cartoon rabbit in a magical forest","count":3,"aspectRatio":"16:9"}}

data: {"type":"image","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEU...","imageNumber":1,"totalCount":3,"mimeType":"image/png","dataLength":123456}

data: {"type":"image","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEU...","imageNumber":2,"totalCount":3,"mimeType":"image/png","dataLength":234567}

data: {"type":"image","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEU...","imageNumber":3,"totalCount":3,"mimeType":"image/png","dataLength":345678}

data: {"type":"complete","message":"所有圖片生成完成","totalImages":3,"elapsedTime":"45.23秒"}
```

### 3. JavaScript 前端範例（串流模式）

```javascript
async function testMultipleImagesStream() {
  const response = await fetch('http://localhost:7943/story/test_multiple_images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_JWT_TOKEN}`,
    },
    body: JSON.stringify({
      prompt: 'A cute cartoon rabbit in a magical forest',
      count: 3,
      aspectRatio: '16:9',
      stream: true,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.type === 'connected') {
          console.log('✅', data.message);
        } else if (data.type === 'image') {
          console.log(`📷 收到第 ${data.imageNumber}/${data.totalCount} 張圖片`);
          // 顯示圖片
          const img = document.createElement('img');
          img.src = data.image;
          document.body.appendChild(img);
        } else if (data.type === 'complete') {
          console.log('🎉', data.message, `總耗時: ${data.elapsedTime}`);
        } else if (data.type === 'error') {
          console.error('❌ 錯誤:', data.message);
        }
      }
    }
  }
}

testMultipleImagesStream();
```

### 4. JavaScript 前端範例（批次模式）

```javascript
async function testMultipleImagesBatch() {
  try {
    const response = await fetch('http://localhost:7943/story/test_multiple_images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_JWT_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: 'A cute cartoon rabbit in a magical forest',
        count: 3,
        aspectRatio: '16:9',
        stream: false,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ 成功生成 ${result.data.images.length} 張圖片`);
      console.log(`⏱️ 總耗時: ${result.data.metadata.elapsedTime}`);
      console.log(`📊 平均每張: ${result.data.metadata.averageTimePerImage}`);

      // 顯示所有圖片
      result.data.images.forEach((img, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = img.dataUri;
        imgElement.alt = `Image ${index + 1}`;
        document.body.appendChild(imgElement);
      });
    } else {
      console.error('❌ 生成失敗:', result.message);
    }
  } catch (error) {
    console.error('❌ 請求失敗:', error);
  }
}

testMultipleImagesBatch();
```

## 錯誤處理

### 參數驗證錯誤

**錯誤 1: 無效的長寬比**
```json
{
  "success": false,
  "message": "無效的 aspectRatio，請使用: 1:1, 3:4, 4:3, 9:16, 16:9",
  "statusCode": 400
}
```

**錯誤 2: 圖片數量超出範圍**
```json
{
  "success": false,
  "message": "count 必須在 1-10 之間",
  "statusCode": 400
}
```

### API 錯誤

**錯誤 3: 圖片生成失敗**
```json
{
  "success": false,
  "message": "圖片生成失敗",
  "statusCode": 500,
  "data": {
    "error": "Gemini AI 多圖片生成失敗: API quota exceeded"
  }
}
```

## 效能參考

根據實際測試（使用 gemini-2.5-flash-image 模型）：

- **單張圖片**: 約 10-15 秒
- **3 張圖片**: 約 30-45 秒
- **5 張圖片**: 約 50-75 秒

**建議**:
- 對於需要即時反饋的場景，使用**串流模式**（`stream: true`）
- 對於批次處理或後台任務，使用**批次模式**（`stream: false`）
- 建議最多一次生成 5 張圖片，避免請求超時

## 注意事項

1. **API 配額限制**: Gemini API 有每日請求配額限制，請注意使用量
2. **生成時間**: 每張圖片生成需要 10-15 秒，請設置適當的前端 loading 提示
3. **圖片大小**: 生成的圖片 base64 編碼後可能很大（每張 100KB-500KB），請注意網路傳輸
4. **認證要求**: 所有請求都需要有效的 JWT token

## 技術實現細節

### 為什麼需要多次呼叫 API？

Gemini API 目前**不支援單次呼叫生成多張圖片**。即使設定 `candidate_count` 參數，也只會生成一張圖片。

因此，我們的實現是：
- 在 `generateMultipleImages()` 中循環呼叫 API `count` 次
- 在 `generateMultipleImagesStream()` 中每生成一張就立即返回，實現漸進式載入

### 程式碼位置

- **GeminiAI 工具類**: `backend/src/utils/tools/geminiAI.ts`
  - `generateMultipleImages()` - 批次生成方法
  - `generateMultipleImagesStream()` - 串流生成方法
  
- **Controller**: `backend/src/controller/storyController.ts`
  - `testMultipleImages` - API 端點實現

- **路由註冊**: `backend/src/routers/StoryRoute.ts`
  - `POST /story/test_multiple_images`

## 下一步整合建議

如果你想在實際的故事生成流程中使用多張圖片：

1. 修改 `GenStory` 方法，增加 `imageCount` 參數
2. 使用 `generateMultipleImagesStream()` 來生成多張圖片
3. 將所有圖片保存到 GridFS
4. 更新前端的故事閱讀器，支援多頁繪本

範例整合：
```typescript
// 在 GenStory 中整合多張圖片
const imageCount = 5; // 生成 5 頁繪本
for await (const chunk of this.gemini.generateMultipleImagesStream(
  prompt,
  imageCount,
  "16:9"
)) {
  if (chunk.image) {
    // 即時發送給前端
    res.write(`data: ${JSON.stringify({ type: "image", ... })}\n\n`);
  }
}
```
