# 故事串流生成功能使用指南

## 概述

這個功能使用 **Server-Sent Events (SSE)** 技術實現即時故事生成，讓用戶可以逐句看到故事內容，而不需要等待整個故事生成完成。

## 後端實現

### 修改內容

在 `backend/src/controller/storyController.ts` 中的 `GenStory` 方法新增了串流模式支援：

- 新增 `stream` 參數控制是否使用串流模式
- 使用 SSE (Server-Sent Events) 協議傳送即時數據
- 將故事按句子分段傳送，提供進度百分比
- 保持向後兼容，非串流模式依然可用

### SSE 訊息格式

後端會發送以下類型的訊息：

```typescript
// 連接成功
{ type: 'connected', message: '開始生成故事...' }

// 故事片段
{ type: 'story', content: '故事內容...', progress: 50 }

// 圖片數據
{ type: 'images', images: ['data:image/png;base64,...'] }

// 狀態更新
{ type: 'status', message: '正在處理圖片...' }

// 完成
{ type: 'complete', message: '繪本生成完成', metadata: {...} }

// 錯誤
{ type: 'error', message: '錯誤訊息', error: '詳細錯誤' }
```

## 前端實現

### StoryService 新增方法

在 `frontend/src/services/storyService.ts` 中新增了 `generateStoryStream` 方法：

```typescript
const abort = await StoryService.generateStoryStream(
  roleForm,
  voiceModelName,
  {
    onStory: (content, progress) => {
      // 收到故事片段時觸發
      setStoryContent(prev => prev + content);
      setProgress(progress);
    },
    onImages: (images) => {
      // 收到圖片時觸發
      setImages(images);
    },
    onStatus: (message) => {
      // 狀態更新
      setStatus(message);
    },
    onComplete: (metadata) => {
      // 生成完成
      console.log('完成', metadata);
    },
    onError: (error) => {
      // 發生錯誤
      console.error('錯誤', error);
    }
  }
);

// 如需取消生成，調用返回的 abort 函數
// abort();
```

### 範例組件

已創建 `frontend/src/components/story/StoryStreamExample.tsx` 作為完整的使用範例。

## 整合到現有組件

### 方法 1: 在現有組件中使用（推薦）

假設你有一個現有的故事生成組件，可以這樣整合：

```typescript
import { StoryService } from "../../services/storyService";

const YourStoryComponent = () => {
  const [storyContent, setStoryContent] = useState("");
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStoryContent("");
    
    const abort = await StoryService.generateStoryStream(
      roleForm,
      voiceModelName,
      {
        onStory: (content, prog) => {
          setStoryContent(prev => prev + content);
          setProgress(prog);
        },
        onComplete: () => {
          setIsGenerating(false);
          alert("故事生成完成！");
        },
        onError: (error) => {
          setIsGenerating(false);
          alert(`錯誤: ${error}`);
        }
      }
    );
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        生成故事
      </button>
      {isGenerating && <Progress value={progress} />}
      <div>{storyContent}</div>
    </div>
  );
};
```

### 方法 2: 使用範例組件

直接在你的頁面中使用已創建的範例組件：

```typescript
import { StoryStreamExample } from "../components/story/StoryStreamExample";

<StoryStreamExample 
  roleForm={roleForm} 
  voiceModelName={voiceModelName} 
/>
```

## 測試步驟

1. **啟動後端**
   ```bash
   cd backend
   pnpm run dev
   ```

2. **啟動前端**
   ```bash
   cd frontend
   pnpm run dev
   ```

3. **測試串流功能**
   - 訪問包含故事生成功能的頁面
   - 填寫角色表單
   - 點擊「開始生成故事」
   - 觀察故事內容逐句出現

## 優勢

✅ **即時回饋**: 用戶可以立即看到生成進度，不需要等待
✅ **更好的用戶體驗**: 避免長時間白屏等待
✅ **進度可視化**: 顯示百分比進度條
✅ **可取消**: 支援中途取消生成
✅ **向後兼容**: 保留非串流模式供需要時使用

## 注意事項

1. **瀏覽器支援**: SSE 在所有現代瀏覽器中都有良好支援
2. **連接管理**: 記得在組件卸載時調用 abort 函數清理連接
3. **錯誤處理**: 務必處理 `onError` 回調，避免靜默失敗
4. **進度顯示**: 進度基於句子數量，實際 AI 生成時間可能不均勻

## 疑難排解

### 問題：無法建立串流連接

**解決方案**：
- 檢查後端是否正確啟動
- 確認 CORS 設定允許串流請求
- 檢查瀏覽器控制台的網路錯誤

### 問題：故事內容不連貫

**解決方案**：
- 檢查 `onStory` 回調是否正確累加內容
- 使用 `prev => prev + content` 而非直接賦值

### 問題：進度條不更新

**解決方案**：
- 確認 `setProgress` 在 `onStory` 回調中被正確調用
- 檢查 Progress 組件是否正確接收 value prop

## 相關文件

- [Server-Sent Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Fetch API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [ReadableStream - MDN](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
