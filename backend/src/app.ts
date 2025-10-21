import express from "express";
import { ConnectionManager } from "./database";
import { GridFSStorageService } from "./services/GridFSStorageService";
import cors from "cors";
import { router } from "./Routers";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {
  responseMiddleware,
  requestLogger,
} from "./middleware/responseMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";
dotenv.config();

const app = express();
const port = process.env.PORT || 7943;

/**
 * 初始化應用程式
 * 確保資料庫和 GridFS 完全初始化後才啟動伺服器
 */
async function initializeApp() {
  try {
    // 1. 初始化資料庫連線（單例模式，全局只連線一次）
    const connectionManager = ConnectionManager.getInstance();
    await connectionManager.connect(process.env.MONGO_DB_Connect!);
    console.log("[App] 資料庫連線成功");

    // 2. 初始化 GridFS（必須在資料庫連線成功後）
    GridFSStorageService.initializeBucket();
    console.log("[App] GridFS 初始化成功");

    // 3. 啟動 Express 伺服器
    app.listen(port, () => {
      console.log("[App] 伺服器啟動成功");
      console.log(`Server: http://localhost:${port}/user`);
    });
  } catch (error) {
    console.error("[App] 初始化失敗:", error);
    process.exit(1); // 初始化失敗則終止應用
  }
}

//系統伺服器
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    const allowedOrigins = [process.env.CORS_Options];

    // 允許來自允許列表的請求
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

// 基礎中介軟體 (順序很重要!)
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// 自定義中介軟體
app.use(requestLogger); // 請求日誌
app.use(responseMiddleware); // 響應處理

// 註冊路由
for (const route of router) {
  app.use(route.getRouter());
}

// 錯誤處理中介軟體 (必須放在最後!)
app.use(notFoundHandler); // 404 處理
app.use(errorHandler); // 全域錯誤處理

//=============================================
// 啟動應用程式（異步初始化）
initializeApp();
