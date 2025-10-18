import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserService } from "../services";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loading } from "./ui/loading";
import { Badge } from "./ui/badge";
import { UserPlus, Home, Sparkles, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await UserService.login(username, password);
    if (result.success) {
      console.log(`使用者 ${username} 登入成功`);
      navigate(`/style`);
    } else {
      setError("登入失敗，請檢查帳號密碼是否正確！");
      setPassword("");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary via-purple-50 to-children-bg-secondary flex items-center justify-center p-2 sm:p-3 md:p-4">
      <div className="w-full max-w-md px-2">
        {/* Logo 和標題 */}
        <div className="text-center mb-2 sm:mb-3">
          <div className="text-3xl sm:text-4xl mb-1 sm:mb-1.5">📚</div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-children-primary via-children-accent to-children-secondary bg-clip-text text-transparent">
            ✨ WhisperTales ✨
          </h1>
          <p className="text-xs sm:text-sm text-children-text-secondary mt-0.5">
            故事創作樂園
          </p>
        </div>

        {/* 登入卡片 */}
        <Card className="shadow-children-medium border-2 border-children-accent/20">
          <CardHeader className="text-center space-y-0.5 sm:space-y-1 pb-2 sm:pb-3 px-3 sm:px-4">
            <div className="flex justify-center mb-0.5"></div>
            <CardTitle className="text-base sm:text-lg md:text-xl !leading-tight">
              🔑 歡迎回來！
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm !leading-tight">
              登入後繼續你的創作之旅
            </CardDescription>
          </CardHeader>

          <CardContent className="px-3 sm:px-4 pb-2 sm:pb-3">
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
              {/* 錯誤訊息 */}
              {error && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-2 text-center">
                  <p className="text-red-600 font-bold text-xs sm:text-sm">
                    🚫 {error}
                  </p>
                </div>
              )}

              {/* 使用者名稱 */}
              <div className="space-y-0.5 sm:space-y-1">
                <label
                  htmlFor="username"
                  className="block text-xs sm:text-sm font-bold text-children-text-primary"
                >
                  👤 使用者名稱
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="輸入你的使用者名稱..."
                  required
                  disabled={isLoading}
                  className="text-sm h-9 sm:h-10"
                />
              </div>

              {/* 密碼 */}
              <div className="space-y-0.5 sm:space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-bold text-children-text-primary"
                >
                  🔒 密碼
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="輸入你的密碼..."
                    required
                    disabled={isLoading}
                    className="text-sm h-9 sm:h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-children-text-secondary hover:text-children-text-primary transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 登入按鈕 */}
              <Button
                type="submit"
                variant="default"
                className="w-full mt-2 sm:mt-2.5 h-9 sm:h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-1.5">🔄</div>
                    登入中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    🚀 開始冒險！
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-1.5 sm:gap-2 px-3 sm:px-4 pb-3 sm:pb-4">
            {/* 分隔線 */}
            <div className="relative w-full my-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-children-text-secondary font-bold">
                  或者
                </span>
              </div>
            </div>

            {/* 註冊連結 */}
            <div className="text-center w-full space-y-1">
              <p className="text-xs text-children-text-secondary">
                還沒有帳號嗎？
              </p>
              <Link to="/login/register" className="block">
                <Button
                  variant="secondary"
                  className="w-full h-9 sm:h-10 text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  🌟 立即註冊
                </Button>
              </Link>
            </div>

            {/* 返回首頁 */}
            <Link to="/style" className="w-full">
              <Button
                variant="outline"
                className="w-full h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                🏠 返回首頁
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* 底部裝飾 */}
        <div className="mt-2 sm:mt-2.5 text-center space-y-1">
          <div className="flex justify-center gap-1 flex-wrap">
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
              ✨ 安全
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              🎨 創作
            </Badge>
            <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
              📚 故事
            </Badge>
          </div>
          <p className="text-[10px] text-children-text-secondary">
            © 2024 WhisperTales
          </p>
        </div>

        {/* 載入遮罩 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <Card className="w-auto mx-4">
              <CardContent className="pt-6">
                <Loading size="md" emoji="🔐" message="正在登入中..." />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
