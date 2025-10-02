# 使用官方 Node.js 運行時作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴（FFmpeg 等）
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

# 複製 package.json 和 pnpm-lock.yaml（如果存在）
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# 安裝 pnpm
RUN npm install -g pnpm

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製 TypeScript 配置
COPY tsconfig.json ./

# 複製源代碼
COPY src/ ./src/

# 編譯 TypeScript
RUN pnpm run build

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 創建必要的目錄並設置權限
RUN mkdir -p /app/uploads /app/audio /app/temp && \
    chown -R nodejs:nodejs /app

# 切換到非 root 用戶
USER nodejs

# 暴露端口
EXPOSE 7943

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:7943/story || exit 1

# 啟動應用
CMD ["pnpm", "start"]