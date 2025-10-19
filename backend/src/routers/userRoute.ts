import { UserController } from "../controller/userController";
import { Route } from "../interfaces/Route";
import { authenticateToken } from "../middleware/autherMiddleware";
import {
  validateRequest,
  validateQuery,
} from "../middleware/responseMiddleware";

const userController = new UserController();
export class UserRoute extends Route {
  protected url: string = "";
  protected Controller = new UserController();
  constructor() {
    super();
    this.url = "/user";
    this.setRoutes();
  }

  // http://localhost:7943/user
  // http://localhost:7943/user/logout
  // http://localhost:7943/user/verify-auth
  // http://localhost:7943/user/verify-ownership
  protected setRoutes(): void {
    // 測試路由
    this.router.get(`${this.url}`, this.Controller.test);

    // 登入/註冊（不需要認證）
    this.router.post(
      `${this.url}/login`,
      validateRequest(["userName", "userPassword"]),
      this.Controller.Login,
    );

    // 新增（不需要認證）
    this.router.post(
      `${this.url}/adduser`,
      validateRequest(["userName", "userPassword"]),
      this.Controller.AddUser,
    );

    // 登出（需要認證）
    this.router.get(
      `${this.url}/logout`,
      authenticateToken,
      this.Controller.Logout,
    );

    // 用戶管理（需要認證）
    this.router.delete(
      `${this.url}/deluser`,
      authenticateToken,
      validateRequest(["username"]),
      this.Controller.DeleteUser,
    );

    // 用戶資料（需要認證）
    this.router.get(
      "/profile",
      authenticateToken,
      userController.GetUserProfile,
    );
    this.router.put(
      "/profile",
      authenticateToken,
      userController.UpdateUserProfile,
    );

    // 驗證路由
    this.router.get(`${this.url}/verify-auth`, userController.VerifyAuth);
    this.router.get(
      `${this.url}/verify-ownership`,
      authenticateToken,
      validateQuery(["storyId"]),
      userController.VerifyOwnership,
    );
  }
}
