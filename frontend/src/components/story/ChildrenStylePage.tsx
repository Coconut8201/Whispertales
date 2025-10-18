import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sdmodel, sdmodel_list } from "../../utils/sdmodel_list";
import { userLogout, verifyAuth } from "../../utils/tools/fetch";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Loading } from "../ui/loading";
import { StatCard } from "../ui/stat-card";
import ChildrenHeader from "./ChildrenHeader";
import StyleSearch from "./StyleSearch";
import StyleGallery from "./StyleGallery";
import { LogIn, Rocket } from "lucide-react";

const ChildrenStylePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const options: sdmodel[] = sdmodel_list;

  // 檢查登入狀態
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const verifyAuthStatus = await verifyAuth();
        setIsLogin(verifyAuthStatus.isAuthenticated);
      } catch (error) {
        console.error("檢查登入狀態失敗:", error);
        setIsLogin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 登出處理
  const handleLogout = async () => {
    try {
      setIsNavigating(true);
      const { success } = await userLogout();
      if (success) {
        setIsLogin(false);
        navigate("/login");
        console.log("您已成功登出!");
      }
    } catch (error) {
      console.error("登出失敗:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  // 開始創作
  const handleSearch = () => {
    if (isNavigating) return;

    if (!isLogin) {
      setIsNavigating(true);
      navigate("/login");
      return;
    }

    if (searchQuery.trim()) {
      setIsNavigating(true);
      navigate(`/style/role?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 風格選擇
  const handleStyleSelect = (styleName: string) => {
    setSearchQuery(styleName);
  };

  // 雙擊快速創作
  const handleStyleDoubleClick = () => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  // 載入狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Loading size="lg" emoji="🎨" message="正在載入繪畫風格..." />
            <p className="text-center text-children-text-secondary mt-4 text-sm sm:text-base">
              請稍等片刻，我們正在準備美麗的風格選項！
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary">
      {/* 導航遮罩 */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-auto mx-4">
            <CardContent className="pt-6 px-6 sm:px-8 pb-6">
              <Loading size="md" emoji="✨" message="正在前往創作頁面..." />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 頁面標題 */}
      <ChildrenHeader
        isLogin={isLogin}
        onLogout={handleLogout}
        title="🌟 WisperTales - 故事創作樂園 🌟"
        showNavButtons={true}
      />

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 歡迎訊息 - 未登入時顯示 */}
        {!isLogin && (
          <Card className="border-3 border-children-primary bg-gradient-to-br from-white to-children-bg-primary">
            <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-bounce-slow">
                👋
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-children-primary mb-2 sm:mb-3">
                歡迎來到故事創作樂園！
              </h3>
              <p className="text-sm sm:text-base text-children-text-secondary mb-4 sm:mb-6 max-w-lg mx-auto">
                你可以先瀏覽不同的繪畫風格，但需要登入後才能開始創作故事喔！
              </p>
              <Button
                onClick={() => navigate("/login")}
                variant="default"
                size="lg"
                className="animate-pulse-slow"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                🔑 點擊這裡登入
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 搜尋區域 */}
        <StyleSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          disabled={isNavigating}
          placeholder={
            isLogin ? "選擇一個喜歡的繪畫風格..." : "先登入才能開始創作喔！"
          }
        />

        {/* 風格畫廊 */}
        <Card>
          <CardHeader className="text-center pb-3 sm:pb-4">
            <div className="flex justify-center mb-2">
              <Badge variant="secondary" className="text-sm sm:text-base">
                🎨 繪畫風格選擇
              </Badge>
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">
              選擇你喜歡的繪畫風格
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isLogin
                ? "點擊任一張圖片選擇風格，雙擊可快速開始創作！"
                : "瀏覽各種美麗的繪畫風格，登入後即可開始創作！"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-3 sm:px-4 md:px-6">
            <StyleGallery
              options={options}
              selectedStyle={searchQuery}
              onStyleSelect={handleStyleSelect}
              onStyleDoubleClick={isLogin ? handleStyleDoubleClick : undefined}
              disabled={isNavigating || !isLogin}
            />
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <Card className="bg-gradient-to-r from-children-bg-secondary to-blue-50 border-2 border-children-secondary">
          <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
            <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 animate-wiggle">
              🌟
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-children-secondary mb-2 sm:mb-3">
              準備好創作屬於你的故事了嗎？
            </h4>
            <p className="text-xs sm:text-sm text-children-text-secondary mb-4 sm:mb-6 max-w-lg mx-auto">
              選擇一個繪畫風格，我們將為你創造一個獨一無二的故事世界！
            </p>

            {searchQuery && isLogin && (
              <Button
                onClick={handleSearch}
                disabled={isNavigating}
                variant="success"
                size="lg"
                className="animate-pulse"
              >
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                🚀 立即開始創作故事！
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 數據統計 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto">
          <StatCard
            emoji="🎨"
            value={`${options.length}+`}
            label="繪畫風格"
            color="primary"
          />

          <StatCard emoji="🌟" value="∞" label="創作可能" color="secondary" />

          <StatCard emoji="💝" value="100%" label="專屬故事" color="accent" />
        </div>

        {/* 功能特色 - 額外的視覺元素 */}
        {isLogin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Card className="text-center hover:scale-105 transition-transform bg-gradient-to-br from-red-50 to-pink-50">
              <CardContent className="py-4 sm:py-6 px-2 sm:px-3">
                <div className="text-2xl sm:text-3xl mb-2">🎨</div>
                <p className="text-xs sm:text-sm font-bold text-children-text-primary">
                  AI 繪圖
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="py-4 sm:py-6 px-2 sm:px-3">
                <div className="text-2xl sm:text-3xl mb-2">🎙️</div>
                <p className="text-xs sm:text-sm font-bold text-children-text-primary">
                  語音朗讀
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="py-4 sm:py-6 px-2 sm:px-3">
                <div className="text-2xl sm:text-3xl mb-2">📚</div>
                <p className="text-xs sm:text-sm font-bold text-children-text-primary">
                  故事收藏
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="py-4 sm:py-6 px-2 sm:px-3">
                <div className="text-2xl sm:text-3xl mb-2">🌈</div>
                <p className="text-xs sm:text-sm font-bold text-children-text-primary">
                  多種風格
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenStylePage;
