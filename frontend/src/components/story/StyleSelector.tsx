import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Palette, Image as ImageIcon } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: string;
  styleOptions: string[];
  onStyleChange: (style: string) => void;
  previewImage: string;
  disabled?: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  styleOptions,
  onStyleChange,
  previewImage,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 風格選擇器 */}
      <Card className="border-2 border-children-accent/20 shadow-children-sm hover:shadow-children-md transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-children-accent flex items-center gap-2">
            <Palette className="w-5 h-5" />
            選擇繪畫風格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-children-accent/30 focus-visible:ring-children-accent"
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            disabled={disabled}
          >
            {styleOptions.map((option, index) => (
              <option key={index} value={option}>
                ✨ {option}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-teal-500">
            💡 不同風格會創造不同感覺的圖片喔！
          </p>
        </CardContent>
      </Card>

      {/* 預覽圖片 */}
      <Card className="border-2 border-children-accent/20 shadow-children-sm hover:shadow-children-md transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-children-accent flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            風格預覽
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="relative rounded-lg overflow-hidden border-2 border-children-accent/10 shadow-sm">
            <img
              src={previewImage}
              alt="風格預覽"
              className="w-full max-w-[200px] h-auto object-cover hover:scale-105 transition-transform duration-500"
              style={{ maxHeight: '150px' }}
              onError={(e) => {
                // 如果圖片載入失敗，顯示預設圖片
                (e.target as HTMLImageElement).src = '/Assets/default-style-preview.png';
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleSelector;