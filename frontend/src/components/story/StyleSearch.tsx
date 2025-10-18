import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Search, Sparkles, Rocket, Lightbulb } from "lucide-react";

interface StyleSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const StyleSearch: React.FC<StyleSearchProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  disabled = false,
  placeholder = "選擇一個喜歡的繪畫風格...",
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !disabled) {
      onSearch();
    }
  };

  const hasSelection = searchQuery.trim() !== "";

  return (
    <Card className="border-2 border-children-primary/30">
      <CardHeader className="text-center pb-3 sm:pb-4">
        <div className="flex justify-center mb-2">
          <Badge variant="default" className="text-sm sm:text-base">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            繪畫風格選擇
          </Badge>
        </div>
        <CardTitle className="text-lg sm:text-xl md:text-2xl">
          🎨 選擇你最喜歡的繪畫風格
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          點擊下面的圖片選擇風格，然後點擊「開始創作」按鈕！
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* 搜尋輸入區域 */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 max-w-2xl mx-auto">
          {/* 輸入框 */}
          <div className="w-full sm:flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              className={`text-center font-bold text-sm sm:text-base cursor-not-allowed ${
                hasSelection
                  ? "bg-green-50 border-children-success border-3 text-children-text-primary"
                  : "bg-gray-50"
              }`}
            />
          </div>

          {/* 搜尋按鈕 */}
          <Button
            onClick={onSearch}
            disabled={disabled || !hasSelection}
            variant={hasSelection ? "success" : "default"}
            size="lg"
            className={`w-full sm:w-auto min-w-[140px] text-sm sm:text-base transition-transform ${
              hasSelection ? "scale-105" : "scale-100"
            }`}
          >
            {hasSelection ? (
              <>
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                🚀 開始創作
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />✨ 先選擇風格
              </>
            )}
          </Button>
        </div>

        {/* 選擇狀態顯示 */}
        {hasSelection && (
          <div className="flex justify-center animate-pulse-slow">
            <Badge
              variant="success"
              className="text-sm sm:text-base px-4 sm:px-6 py-2"
            >
              ✨ 已選擇風格：
              <span className="ml-2 font-bold">{searchQuery}</span>
            </Badge>
          </div>
        )}

        {/* 使用提示 */}
        {!hasSelection && (
          <div className="flex items-center justify-center gap-2 text-children-secondary text-xs sm:text-sm italic">
            <Lightbulb className="w-4 h-4" />
            <span>💡 提示：點擊下方任一張圖片來選擇你喜歡的風格！</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StyleSearch;
