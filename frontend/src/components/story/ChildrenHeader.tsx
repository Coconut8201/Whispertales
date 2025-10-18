import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BookOpen, Mic, LogIn, LogOut, UserCheck } from "lucide-react";

interface ChildrenHeaderProps {
  isLogin: boolean;
  onLogout: () => void;
  title?: string;
  showNavButtons?: boolean;
}

const ChildrenHeader: React.FC<ChildrenHeaderProps> = ({
  isLogin,
  onLogout,
  title = "🌟 WisperTales - 故事創作樂園 🌟",
  showNavButtons = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-children-primary via-children-accent to-children-secondary px-3 sm:px-4 md:px-6 py-3 sm:py-4 shadow-children-medium">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* 標題 */}
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center sm:text-left drop-shadow-lg m-0">
            {title}
          </h1>
        </div>

        {/* 導航按鈕區域 */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-end">
          {/* 功能按鈕 - 僅登入時顯示 */}
          {isLogin && showNavButtons && (
            <>
              <Button
                onClick={() => navigate("/bookmanage")}
                variant="ghost"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">我的書本</span>
                <span className="sm:hidden">書本</span>
              </Button>
              <Button
                onClick={() => navigate("/voice")}
                variant="ghost"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              >
                <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">語音設定</span>
                <span className="sm:hidden">語音</span>
              </Button>
            </>
          )}

          {/* 登入狀態徽章 */}
          {isLogin ? (
            <Badge
              variant="secondary"
              className="bg-children-secondary text-white border-2 border-white text-xs sm:text-sm px-2 sm:px-3 py-1 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/login")}
            >
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              😊 已登入
            </Badge>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              variant="warning"
              size="sm"
              className="bg-children-warning text-white border-2 border-white text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              👋 未登入
            </Button>
          )}

          {/* 登出按鈕 - 僅登入時顯示 */}
          {isLogin && (
            <Button
              onClick={onLogout}
              variant="default"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white border-2 border-white text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">登出</span>
              <span className="sm:hidden">🚪</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildrenHeader;
