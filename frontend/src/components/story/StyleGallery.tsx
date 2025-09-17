import React, { useState } from 'react';
import { sdmodel } from '../../utils/sdmodel_list';
import '../../styles/ChildrenTheme.css';

interface StyleGalleryProps {
  options: sdmodel[];
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
  disabled = false
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
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      padding: '20px 0'
    }}>
      {options.map((option, index) => (
        <div
          key={`${option.show_name}-${index}`}
          className="children-card"
          onClick={() => handleCardClick(option.show_name)}
          onDoubleClick={handleCardDoubleClick}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(-1)}
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            transform: hoveredIndex === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            transition: 'all 0.3s ease',
            border: selectedStyle === option.show_name ? '4px solid #ff6b6b' : '3px solid transparent',
            position: 'relative',
            overflow: 'hidden',
            opacity: disabled ? 0.6 : 1
          }}
        >
          {/* 選中指示器 */}
          {selectedStyle === option.show_name && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              ✓
            </div>
          )}

          {/* 圖片容器 */}
          <div style={{
            width: '100%',
            height: '250px',
            overflow: 'hidden',
            borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0',
            position: 'relative'
          }}>
            <img 
              src={option.image_path} 
              alt={option.show_name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)'
              }}
              onError={(e) => {
                // 圖片載入失敗時的處理
                (e.target as HTMLImageElement).src = '/Assets/default-style.png';
              }}
            />
            
            {/* 懸停覆蓋層 */}
            {hoveredIndex === index && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 217, 61, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.3s ease'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ff6b6b'
                }}>
                  {selectedStyle === option.show_name ? '✨ 已選擇' : '🎨 點擊選擇'}
                </div>
              </div>
            )}
          </div>

          {/* 標題區域 */}
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: selectedStyle === option.show_name 
              ? 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)'
              : 'white'
          }}>
            <h4 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: selectedStyle === option.show_name ? '#ff6b6b' : '#2d3436',
              marginBottom: '8px'
            }}>
              🎨 {option.show_name}
            </h4>
            
            {selectedStyle === option.show_name && (
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#ff6b6b',
                fontWeight: '500'
              }}>
                ✨ 這是你選擇的風格！
              </p>
            )}
            
            {selectedStyle !== option.show_name && (
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#636e72',
                fontStyle: 'italic'
              }}>
                點擊選擇這個風格
              </p>
            )}
          </div>

          {/* 雙擊提示 */}
          {selectedStyle === option.show_name && (
            <div style={{
              padding: '0 20px 16px',
              textAlign: 'center'
            }}>
              <div style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                💫 雙擊開始創作故事！
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StyleGallery;