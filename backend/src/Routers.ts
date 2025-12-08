import { Route } from "./interfaces/Route";
import { StoryRoute } from "./routers/StoryRoute";
import { UserRoute } from "./routers/userRoute";
import { VoiceRoute } from "./routers/VoiceRoute";
import { DebugRoute } from "./routers/debugRoute";
import { Router } from "express";

// 定義路由介面，支援 Route 類別或任何有 getRouter() 方法的物件
interface RouteHandler {
  getRouter(): Router;
}

// 根據環境決定是否加入調試路由
const routes: Array<RouteHandler> = [
  new StoryRoute(),
  new UserRoute(),
  new VoiceRoute(),
];

// 只在開發環境加入調試路由
if (process.env.NODE_ENV !== "production") {
  routes.push(new DebugRoute());
  console.log("[調試模式] 調試路由已啟用: /debug/*");
}

export const router: Array<RouteHandler> = routes;
