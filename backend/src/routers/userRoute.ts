import { UserController } from "../controller/userController";
import { Route } from "../interfaces/Route";
import { authMiddleware } from "../utils/multer";
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
      validateRequest(["userName", "userPassword", "permissions"]),
      this.Controller.Login,
    );

    this.router.post(
      `${this.url}/adduser`,
      validateRequest(["userName", "userPassword"]),
      this.Controller.AddUser,
    );

    // 登出（需要認證）
    this.router.get(`${this.url}/logout`, this.Controller.Logout);

    // 用戶管理（需要認證）
    this.router.delete(
      `${this.url}/deluser`,
      authMiddleware,
      validateRequest(["username"]),
      this.Controller.DeleteUser,
    );

    // 收藏功能（需要認證 + 查詢參數驗證）
    this.router.post(
      `${this.url}/addfav`,
      authMiddleware,
      validateQuery(["bookid"]),
      this.Controller.AddFavorite,
    );

    this.router.post(
      `${this.url}/remfav`,
      authMiddleware,
      validateQuery(["bookid"]),
      this.Controller.RemoveFavorite,
    );

    // 用戶資料（需要認證）
    this.router.get("/profile", authenticateToken, userController.GetProfile);
    this.router.put(
      "/profile",
      authenticateToken,
      userController.UpdateProfile,
    );

    // 驗證路由
    this.router.get(`${this.url}/verify-auth`, userController.verifyAuth);
    this.router.get(
      `${this.url}/verify-ownership`,
      authenticateToken,
      validateQuery(["storyId"]),
      userController.verifyOwnership,
    );
  }
}
