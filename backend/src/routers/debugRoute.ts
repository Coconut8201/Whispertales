import { Router } from "express";
import { DebugController } from "../controller/debugController";
import {
  validateRequest,
  validateQuery,
} from "../middleware/responseMiddleware";

/**
 * 調試路由
 * 僅在開發環境中使用
 * 提供各種調試和檢查功能
 */
export class DebugRoute {
  private router: Router;
  private url: string = "/debug";
  private controller = new DebugController();

  constructor() {
    this.router = Router();
    this.setRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  // 調試路由列表：
  // GET    /debug/check-user?userName=xxx      - 檢查用戶是否存在
  // GET    /debug/list-users                   - 列出所有用戶
  // POST   /debug/verify-credentials           - 驗證登入憑證
  // GET    /debug/db-status                    - 資料庫狀態
  // GET    /debug/gridfs-stats                 - GridFS 統計信息
  // POST   /debug/save-txt                     - 測試 GridFS 文本儲存
  // GET    /debug/gridfs-list                  - 列出所有 GridFS 文件
  private setRoutes(): void {
    // 檢查用戶是否存在
    this.router.get(
      `${this.url}/check-user`,
      validateQuery(["userName"]),
      this.controller.checkUser,
    );

    // 列出所有用戶
    this.router.get(`${this.url}/list-users`, this.controller.listUsers);

    // 驗證登入憑證
    this.router.post(
      `${this.url}/verify-credentials`,
      validateRequest(["userName", "userPassword"]),
      this.controller.verifyCredentials,
    );

    // 資料庫狀態
    this.router.get(`${this.url}/db-status`, this.controller.dbStatus);

    // GridFS 統計信息
    this.router.get(`${this.url}/gridfs-stats`, this.controller.gridfsStats);

    // 測試 GridFS 文本儲存
    this.router.post(`${this.url}/save-txt`, this.controller.saveTxt);

    // 列出所有 GridFS 文件
    this.router.get(`${this.url}/gridfs-list`, this.controller.gridFSList);
    
    this.router.post(`${this.url}/get-image`, 
      validateRequest(["id"]),
      this.controller.getImage);
  }
}
