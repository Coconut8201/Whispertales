import React, { useState } from "react";
import { PicStyle } from "../../utils/bookStyleList";
import { Card, CardContent } from "../ui/card";
import { Check, Palette, Sparkles } from "lucide-react";

interface StyleGalleryProps {
  options: PicStyle[];
  selectedStyle: string;
  onStyleSelect: (styleName: string) => void;
  onStyleDoubleClick?: () => void;
  disabled?: boolean;
}

const StyleGallery: React.FC<StyleGalleryProps> = ({
  options,
  selectedStyle,
  onStyleSelect,
  onStyleDoubleClick,
  disabled = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const handleCardClick = (styleName: string) => {
    if (!disabled) {
      onStyleSelect(styleName);
    }
  };

  const handleCardDoubleClick = () => {
    if (!disabled && onStyleDoubleClick) {
      onStyleDoubleClick();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-5">
      {options.map((option, index) => {
        const isSelected = selectedStyle === option.show_name;
        const isHovered = hoveredIndex === index;

        return (
          <Card
            key={`${option.show_name}-${index}`}
            className={`
              relative overflow-hidden cursor-pointer transition-all duration-300 transform
              ${disabled ? "opacity-60 cursor-not-allowed grayscale" : ""}
              ${isSelected ? "ring-4 ring-children-primary ring-offset-2 scale-[1.02] shadow-xl" : "hover:shadow-lg hover:-translate-y-1"}
            `}
            onClick={() => handleCardClick(option.show_name)}
            onDoubleClick={handleCardDoubleClick}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(-1)}
          >
            {/* 選中指示器 */}
            {isSelected && (
              <div className="absolute top-3 right-3 z-20 bg-children-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md animate-scale-in">
                <Check className="w-5 h-5" />
              </div>
            )}

            {/* 圖片容器 */}
            <div className="relative w-full h-[250px] overflow-hidden bg-gray-100">
              <img
                src={option.image_path}
                alt={option.show_name}
                className={`w-full h-full object-cover transition-transform duration-500 will-change-transform ${isHovered ? "scale-110" : "scale-100"}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/Assets/default-style.png";
                }}
              />

              {/* 懸停覆蓋層 - 僅在非禁用狀態下顯示 */}
              {!disabled && isHovered && !isSelected && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center animate-fade-in">
                  <div className="bg-white/90 text-children-primary px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform">
                    <Palette className="w-4 h-4" />
                    點擊選擇
                  </div>
                </div>
              )}
            </div>

            {/* 標題區域 */}
            <CardContent className={`
              text-center p-4 transition-colors duration-300
              ${isSelected ? "bg-gradient-to-br from-red-50 to-pink-50" : "bg-white"}
            `}>
              <h4 className={`
                text-lg font-bold mb-2 flex items-center justify-center gap-2
                ${isSelected ? "text-children-primary" : "text-gray-700"}
              `}>
                {isSelected ? <Sparkles className="w-4 h-4 text-yellow-400" /> : null}
                {option.show_name}
              </h4>

              {isSelected ? (
                <p className="text-sm text-children-primary font-medium bg-white/50 py-1 px-2 rounded-full inline-block">
                  ✨ 這是你選擇的風格！
                </p>
              ) : (
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                  {option.description || "一個獨特的繪畫風格，讓你的故事更生動。"}
                </p>
              )}

              {/* 雙擊提示 */}
              {isSelected && !disabled && (
                <div className="mt-4 animate-bounce-slow">
                  <span className="bg-children-secondary text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-md">
                    💫 雙擊開始創作故事！
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StyleGallery;
