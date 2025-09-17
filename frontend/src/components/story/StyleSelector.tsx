import React from 'react';
import '../../styles/ChildrenTheme.css';

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
    <div className="children-row">
      {/* 風格選擇器 */}
      <div className="children-col">
        <div className="children-card">
          <label className="children-label">
            🎨 選擇繪畫風格
          </label>
          <select
            className="children-select"
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
          <div style={{ color: '#4ecdc4', fontSize: '14px', marginTop: '8px' }}>
            💡 不同風格會創造不同感覺的圖片喔！
          </div>
        </div>
      </div>
      
      {/* 預覽圖片 */}
      <div className="children-col">
        <div className="children-card">
          <label className="children-label">
            👀 風格預覽
          </label>
          <div style={{ textAlign: 'center' }}>
            <img 
              src={previewImage} 
              alt="風格預覽" 
              className="children-image-preview"
              style={{ 
                maxWidth: '200px', 
                maxHeight: '150px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // 如果圖片載入失敗，顯示預設圖片
                (e.target as HTMLImageElement).src = '/Assets/default-style-preview.png';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;