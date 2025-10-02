# Docker 部署指南

## 🚀 快速開始

### 1. 環境準備

確保已安裝以下軟體：
- Docker (>= 20.10)
- Docker Compose (>= 2.0)

### 2. 環境變數設定

複製環境變數範例文件：
```bash
cp .env.example .env
```

編輯 `.env` 文件，設定必要的環境變數：
- MongoDB 用戶名和密碼
- JWT 密鑰
- OpenAI API Key
- Google Translate API Key
- 其他必要的 API 密鑰

### 3. 啟動服務

#### 開發環境
```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

#### 生產環境
```bash
# 使用生產配置啟動
docker-compose -f docker-compose.yaml up -d

# 檢查服務健康狀態
docker-compose ps
```

### 4. 服務訪問

- **應用主頁**: http://localhost:80
- **API 文檔**: http://localhost:80/api/
- **後端直接訪問**: http://localhost:7943
- **前端直接訪問**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 📁 服務架構

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │◄───┤   Frontend  │    │   Backend   │
│  (Port 80)  │    │  (Port 3000)│◄───┤ (Port 7943) │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                        ┌─────────────┐      │
                        │   MongoDB   │◄─────┘
                        │ (Port 27017)│
                        └─────────────┘
                                │
                        ┌─────────────┐
                        │    Redis    │
                        │ (Port 6379) │
                        └─────────────┘
```

## 🔧 常用命令

### 服務管理
```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 重啟服務
docker-compose restart

# 停止並刪除所有容器和網路
docker-compose down --volumes --remove-orphans
```

### 構建和更新
```bash
# 重新構建所有映像
docker-compose build

# 重新構建特定服務
docker-compose build backend
docker-compose build frontend

# 強制重新構建（無快取）
docker-compose build --no-cache
```

### 日誌和除錯
```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs backend
docker-compose logs frontend

# 即時日誌
docker-compose logs -f

# 進入容器
docker-compose exec backend sh
docker-compose exec frontend sh
```

### 資料庫操作
```bash
# 連接 MongoDB
docker-compose exec mongodb mongo -u admin -p password123

# 備份資料庫
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/whispertales?authSource=admin" --out=/data/backup

# 恢復資料庫
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/whispertales?authSource=admin" /data/backup/whispertales
```

## 🔒 安全注意事項

### 生產環境配置

1. **更改默認密碼**：
   - MongoDB root 密碼
   - JWT 密鑰

2. **環境變數**：
   - 不要將 `.env` 文件提交到版本控制
   - 使用強密碼和隨機密鑰

3. **網路安全**：
   - 配置防火牆限制對資料庫的直接訪問
   - 使用 HTTPS（配置 SSL 證書）

4. **SSL/TLS 配置**：
```yaml
# 在 nginx 服務中添加 SSL 配置
volumes:
  - ./ssl:/etc/nginx/ssl:ro
ports:
  - "443:443"
```

## 🐛 故障排除

### 常見問題

1. **端口衝突**：
   - 檢查是否有其他服務佔用相同端口
   - 修改 docker-compose.yaml 中的端口映射

2. **權限問題**：
   - 確保 Docker 有適當的權限
   - 檢查文件夾權限

3. **內存不足**：
   - 增加 Docker 可用內存
   - 檢查系統資源使用情況

4. **網路連接問題**：
   - 檢查防火牆設定
   - 確認容器間網路連通性

### 健康檢查
所有服務都配置了健康檢查，使用以下命令查看：
```bash
docker-compose ps
```

### 性能監控
```bash
# 查看資源使用情況
docker stats

# 查看特定容器資源使用
docker stats whispertales-backend
```

## 📦 更新和維護

### 更新應用
```bash
# 拉取最新代碼
git pull

# 重新構建和啟動
docker-compose down
docker-compose build
docker-compose up -d
```

### 備份策略
```bash
# 創建備份腳本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/whispertales?authSource=admin" --out=/data/backup_$DATE
```

### 清理資源
```bash
# 清理未使用的映像
docker image prune

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 系統清理（謹慎使用）
docker system prune -a
```