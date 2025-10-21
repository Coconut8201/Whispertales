# 語音識別功能調試指南

## 🎤 功能概述

語音識別功能使用瀏覽器原生的 Web Speech API，允許用戶通過語音輸入故事內容。

## ✅ 已修復的問題

### 1. **重複啟動問題**
- ❌ **舊問題**: 多次點擊錄音按鈕導致崩潰
- ✅ **修復**: 檢查是否已在錄音，自動停止舊實例再啟動新實例

### 2. **錯誤處理不友好**
- ❌ **舊問題**: 所有錯誤都彈出 alert
- ✅ **修復**: 只在關鍵錯誤時彈出，其他錯誤顯示在界面上

### 3. **調試信息不足**
- ❌ **舊問題**: 無法追蹤錄音狀態
- ✅ **修復**: 添加詳細的 console.log，便於調試

### 4. **連續錄音失敗**
- ❌ **舊問題**: `onend` 事件後無法自動重啟
- ✅ **修復**: 改進 `onend` 處理邏輯，加入錯誤處理

## 🌐 瀏覽器兼容性

| 瀏覽器 | 支持情況 | 備註 |
|--------|---------|------|
| Chrome (Desktop) | ✅ 完全支持 | 推薦使用 |
| Edge | ✅ 完全支持 | 基於 Chromium |
| Safari (macOS) | ✅ 支持 | 需要允許麥克風權限 |
| Firefox | ❌ 不支持 | 未實現 Web Speech API |
| Chrome (Android) | ✅ 支持 | 需要 HTTPS |
| Safari (iOS) | ⚠️ 部分支持 | 可能有限制 |

## 🔧 使用方式

### 1. 檢查瀏覽器支持

```typescript
import { SpeechRecognitionService } from './utils/speechRecognition';

if (SpeechRecognitionService.isSupported()) {
  console.log('✅ 瀏覽器支持語音識別');
} else {
  console.log('❌ 瀏覽器不支持語音識別');
}
```

### 2. 創建語音識別服務

```typescript
import { createSpeechRecognition } from './utils/speechRecognition';

const speechRecognition = createSpeechRecognition(
  {
    lang: 'zh-TW',          // 語言設置（繁體中文）
    continuous: true,        // 連續識別
    interimResults: true     // 顯示臨時結果
  },
  {
    onResult: (transcript) => {
      console.log('識別結果:', transcript);
      // 處理識別結果
    },
    onError: (error) => {
      console.error('錯誤:', error);
      // 處理錯誤
    },
    onStart: () => {
      console.log('開始錄音');
    },
    onEnd: () => {
      console.log('錄音結束');
    }
  }
);

// 開始錄音
speechRecognition.startRecording();

// 停止錄音
speechRecognition.stopRecording();
```

## 🐛 常見問題排查

### 問題 1: 點擊麥克風按鈕沒有反應

**可能原因**:
1. 瀏覽器不支持 Web Speech API
2. 沒有麥克風權限
3. 已經有錄音實例在運行

**排查步驟**:

```javascript
// 1. 打開瀏覽器控制台 (F12)
// 2. 檢查是否有錯誤信息

// 3. 手動測試瀏覽器支持
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  console.log('✅ 瀏覽器支持語音識別');
} else {
  console.log('❌ 瀏覽器不支持語音識別');
}

// 4. 檢查麥克風權限
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ 有麥克風權限'))
  .catch(() => console.log('❌ 沒有麥克風權限'));
```

**解決方案**:
- 使用 Chrome 或 Edge 瀏覽器
- 允許瀏覽器訪問麥克風
- 檢查控制台是否有 `[SpeechRecognition]` 開頭的日誌

### 問題 2: 識別不到語音（no-speech 錯誤）

**可能原因**:
1. 麥克風音量太小
2. 環境噪音太大
3. 說話距離太遠

**解決方案**:
- 調整麥克風音量
- 靠近麥克風說話
- 減少環境噪音
- 說話清晰一些

### 問題 3: 錄音自動停止

**可能原因**:
1. 瀏覽器檢測到長時間沒有語音
2. 網絡問題（語音識別需要網絡）
3. 瀏覽器限制（某些瀏覽器有時間限制）

**解決方案**:
- 修復方案已實現：`onend` 事件中自動重啟
- 如果仍然有問題，檢查網絡連接

### 問題 4: 識別結果重複

**可能原因**:
- `onResult` 回調被多次觸發

**解決方案**:
- 已修復：使用 `lastResult` 避免重複

### 問題 5: 權限被拒絕（not-allowed）

**錯誤信息**: `麥克風權限被拒絕，請在瀏覽器設置中允許麥克風訪問`

**解決方案**:

#### Chrome:
1. 點擊地址欄左側的鎖形圖標
2. 找到「麥克風」設置
3. 選擇「允許」
4. 刷新頁面

#### Safari:
1. Safari → 偏好設定 → 網站 → 麥克風
2. 找到你的網站
3. 選擇「允許」

## 📊 調試日誌

啟用詳細日誌後，你會看到以下輸出：

```
[DescriptionForm] 開始創建語音識別服務
[SpeechRecognition] 嘗試開始錄音
[SpeechRecognition] 開始錄音
[DescriptionForm] 語音識別已啟動
[DescriptionForm] 啟動結果: true

// 識別到語音時
[SpeechRecognition] 識別結果: 小兔子和小熊是好朋友
[DescriptionForm] 收到語音結果: 小兔子和小熊是好朋友

// 停止錄音時
[DescriptionForm] 停止錄音
[SpeechRecognition] 停止錄音
[SpeechRecognition] 錄音結束，isRecording: false
[DescriptionForm] 語音識別已結束
```

## 🎯 測試流程

### 測試 1: 基本功能測試

1. **啟動開發服務器**:
   ```bash
   cd frontend
   pnpm run dev
   ```

2. **打開頁面**: `http://localhost:3151/style/role`

3. **點擊麥克風按鈕** 🎤

4. **檢查控制台**:
   - 應該看到 `[SpeechRecognition] 開始錄音`
   - 應該看到 `[DescriptionForm] 語音識別已啟動`

5. **說出內容**: "小兔子和小熊是好朋友"

6. **檢查結果**:
   - textarea 中應該出現識別的文字
   - 控制台應該顯示 `[SpeechRecognition] 識別結果: ...`

7. **點擊停止按鈕** 🛑

8. **確認停止**:
   - 按鈕從 🛑 變回 🎤
   - 紅色錄音提示消失

### 測試 2: 錯誤處理測試

1. **測試麥克風權限被拒**:
   - Chrome: 設置 → 隱私和安全 → 網站設置 → 麥克風 → 封鎖該網站
   - 點擊錄音按鈕
   - 應該看到錯誤提示：`麥克風權限被拒絕...`

2. **測試不支持的瀏覽器**:
   - 使用 Firefox
   - 點擊錄音按鈕
   - 應該看到：`您的瀏覽器不支援語音輸入功能`

3. **測試網絡問題**:
   - 斷開網絡
   - 點擊錄音按鈕
   - 說話後應該看到網絡錯誤提示

### 測試 3: 連續錄音測試

1. 點擊錄音按鈕開始
2. 說一句話，等待識別
3. 停頓 3-5 秒（不要停止錄音）
4. 再說一句話
5. 確認兩句話都被識別並添加到 textarea

### 測試 4: 多次啟動測試

1. 快速點擊錄音按鈕 5 次
2. 確認沒有崩潰
3. 確認最終狀態正確（正在錄音或已停止）

## 📝 代碼示例

### 完整的 React Hook 示例

```typescript
import { useState, useRef, useEffect } from 'react';
import { createSpeechRecognition, SpeechRecognitionService } from './utils/speechRecognition';

export function useSpeechInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionService | null>(null);

  const startRecording = () => {
    if (!SpeechRecognitionService.isSupported()) {
      setError('您的瀏覽器不支持語音識別');
      return false;
    }

    // 清除舊實例
    if (recognitionRef.current) {
      recognitionRef.current.stopRecording();
    }

    const recognition = createSpeechRecognition(
      { lang: 'zh-TW', continuous: true, interimResults: true },
      {
        onResult: (text) => {
          setTranscript(prev => prev ? `${prev} ${text}` : text);
        },
        onError: (err) => {
          setError(err);
          setIsRecording(false);
        },
        onStart: () => {
          setIsRecording(true);
          setError('');
        },
        onEnd: () => {
          setIsRecording(false);
        }
      }
    );

    recognitionRef.current = recognition;
    return recognition.startRecording();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stopRecording();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stopRecording();
      }
    };
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    isSupported: SpeechRecognitionService.isSupported()
  };
}
```

## 🚀 性能優化建議

1. **避免頻繁創建實例**:
   - 使用 `useRef` 保存實例
   - 重用同一個實例

2. **及時清理資源**:
   - 組件卸載時停止錄音
   - 不需要時釋放麥克風

3. **限制識別長度**:
   - 設置最大字數限制
   - 超過限制自動停止

4. **節流更新**:
   - `interimResults: false` 只接收最終結果
   - 減少 UI 更新頻率

## 📚 參考資料

- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Chrome Speech Recognition](https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api/)
- [Can I Use - Speech Recognition](https://caniuse.com/speech-recognition)

## 🎉 總結

語音識別功能現在應該可以正常工作了！主要改進包括：

✅ 更好的錯誤處理  
✅ 詳細的調試日誌  
✅ 避免重複啟動  
✅ 友好的錯誤提示  
✅ 自動重啟連續錄音  

如果還有問題，請：
1. 查看瀏覽器控制台的日誌
2. 確認使用的是 Chrome/Edge 瀏覽器
3. 檢查麥克風權限設置
4. 參考本文檔的故障排查部分
