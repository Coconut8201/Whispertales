# 多階段構建 - 構建階段
FROM node:18-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製源代碼
COPY . .

# 構建應用
RUN npm run build

# 生產階段 - 使用 Nginx 提供靜態文件
FROM nginx:alpine

# 複製自定義 nginx 配置（如果需要）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從構建階段複製構建好的文件到 nginx 默認目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 創建非 root 用戶
RUN addgroup -g 1001 -S frontend && \
    adduser -S frontend -u 1001

# 設置適當的權限
RUN chown -R frontend:frontend /usr/share/nginx/html && \
    chown -R frontend:frontend /var/cache/nginx && \
    chown -R frontend:frontend /var/log/nginx && \
    chown -R frontend:frontend /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R frontend:frontend /var/run/nginx.pid

# 切換到非 root 用戶
USER frontend

# 暴露端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]