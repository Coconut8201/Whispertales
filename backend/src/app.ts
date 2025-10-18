import express from "express";
import { DataBase } from "./utils/DataBase";
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
const DB = new DataBase(process.env.MONGO_DB_Connect!);

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
//dev 開發
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/user`);
});
