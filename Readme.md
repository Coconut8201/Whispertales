# Whispertales 🎭✨

一個結合 AI 故事生成、語音合成和圖像創作的智能說書平台。讓每個人都能輕鬆創造屬於自己的有聲故事書。

## 🌟 主要功能

- **智能故事生成**：使用 AI 大語言模型創造獨特的故事內容
- **圖像生成**：透過 Stable Diffusion 為故事自動生成配圖
- **語音合成**：將文字轉換成自然流暢的語音朗讀
- **個人化聲音**：支援自定義聲音模型，創造專屬的說書聲音
- **故事管理**：個人故事庫，收藏和管理喜愛的故事
- **用戶系統**：安全的身份認證和個人檔案管理

## 🚀 快速開始

### 系統要求

- Node.js 16.x 或更高版本
- MongoDB 數據庫
- FFmpeg（用於音頻處理）

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/Coconut8201/Whispertales.git
   cd Whispertales
   ```

2. **安裝後端依賴**
   ```bash
   cd backend
   npm install
   ```

3. **安裝前端依賴**
   ```bash
   cd ../frontend
   npm install
   ```

4. **環境配置**
   在後端目錄創建 `.env` 文件並配置以下變量：
   ```env
   mongoDB_api=mongodb://localhost:27017/whispertales
   CORS_Options=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key
   # 其他必要的 API 金鑰...
   ```

### 🏃‍♂️ 運行應用

#### 開發模式

**後端服務**（端口 7943）：
```bash
cd backend
npm run dev          # 標準開發模式
npm run noportdev    # 開發模式（自動關閉占用端口）
```

**前端服務**：
```bash
cd frontend
npm run dev
```

#### 生產模式

**構建後端**：
```bash
cd backend
npm run build
npm start
```

**構建前端**：
```bash
cd frontend
npm run build
```

## 🏗️ 專案架構

```
Whispertales/
├── backend/                 # Node.js + TypeScript 後端
│   ├── src/
│   │   ├── controller/      # 業務邏輯控制器
│   │   ├── routers/         # API 路由定義
│   │   ├── models/          # MongoDB 數據模型
│   │   ├── middleware/      # 中間件
│   │   └── utils/           # 工具函數和 AI 整合
│   └── build/               # 編譯輸出
└── frontend/                # React + TypeScript 前端
    ├── src/
    │   ├── components/      # React 元件
    │   ├── styles/          # 樣式文件
    │   └── utils/           # 前端工具函數
    └── public/              # 靜態資源
```

## 📋 API 端點

### 用戶相關 `/user`
- `POST /user/register` - 用戶註冊
- `POST /user/login` - 用戶登入
- `GET /user/profile` - 獲取用戶資料

### 故事相關 `/story`
- `POST /story/generate` - 生成新故事
- `GET /story/list` - 獲取故事列表
- `POST /story/image` - 生成故事配圖
- `POST /story/favorite` - 添加/移除收藏

### 語音相關 `/voice`
- `POST /voice/synthesize` - 文字轉語音
- `POST /voice/upload` - 上傳音頻檔案
- `POST /voice/train` - 訓練個人聲音模型

## 🛠️ 技術棧

### 後端技術
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + HTTP-only Cookies
- **AI Integration**: OpenAI API, Ollama, Stable Diffusion
- **Audio Processing**: FFmpeg, Microsoft Speech SDK, Whisper, F5-TTS

### 前端技術
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Bootstrap + Sass
- **UI Components**: React Bootstrap, FontAwesome
- **PDF Generation**: React-PDF

## 🔧 開發工具

### 程式碼品質
```bash
cd frontend
npm run lint    # ESLint 程式碼檢查
```

### 構建命令
```bash
cd backend
npm run build   # TypeScript 編譯

cd frontend
npm run build   # 前端打包構建
npm run preview # 預覽構建結果
```

## 🚀 部署

專案支援 PM2 進程管理：

```bash
cd backend
pm2 start ecosystem.config.js
```

## 🤝 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權

本專案採用 ISC 授權協議。

## 💡 關於專案

這是一個融合了現代 AI 技術的創新說書平台，旨在讓每個人都能輕鬆創造和分享屬於自己的故事。透過整合語言模型、圖像生成和語音合成技術，為用戶提供完整的數位說書體驗。

---

**開始您的創意說書之旅吧！** 🎨📚🎵