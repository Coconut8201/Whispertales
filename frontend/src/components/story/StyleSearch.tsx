import React from 'react';
import '../../styles/ChildrenTheme.css';

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
  placeholder = "選擇一個喜歡的繪畫風格..."
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !disabled) {
      onSearch();
    }
  };

  const hasSelection = searchQuery.trim() !== '';

  return (
    <div className="children-card" style={{ 
      marginBottom: '32px',
      textAlign: 'center'
    }}>
      {/* 搜尋標題 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          color: '#ff6b6b',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px'
        }}>
          🎨 選擇你最喜歡的繪畫風格
        </h2>
        <p style={{
          color: '#636e72',
          fontSize: '16px',
          margin: 0
        }}>
          點擊下面的圖片選擇風格，然後點擊「開始創作」按鈕！
        </p>
      </div>

      {/* 搜尋輸入區域 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '600px',
        margin: '0 auto',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* 輸入框 */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            className="children-input"
            style={{
              cursor: 'not-allowed',
              backgroundColor: hasSelection ? '#e8f5e8' : '#f8f9fa',
              border: hasSelection ? '3px solid #6bcf7f' : '3px solid #e0e0e0',
              fontSize: '16px',
              textAlign: 'center',
              fontWeight: hasSelection ? 'bold' : 'normal',
              color: hasSelection ? '#2d3436' : '#636e72'
            }}
          />
        </div>

        {/* 搜尋按鈕 */}
        <button
          onClick={onSearch}
          disabled={disabled || !hasSelection}
          className={`children-btn children-btn-large ${hasSelection ? 'children-btn-success' : 'children-btn-primary'}`}
          style={{
            minWidth: '140px',
            fontSize: '18px',
            fontWeight: 'bold',
            opacity: (!hasSelection || disabled) ? 0.6 : 1,
            transform: hasSelection ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {hasSelection ? '🚀 開始創作' : '✨ 先選擇風格'}
        </button>
      </div>

      {/* 選擇狀態顯示 */}
      {hasSelection && (
        <div style={{
          marginTop: '20px',
          padding: '12px 20px',
          backgroundColor: '#e8f5e8',
          borderRadius: 'var(--border-radius-md)',
          border: '2px solid #6bcf7f',
          display: 'inline-block'
        }}>
          <span style={{
            color: '#2d3436',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            ✨ 已選擇風格：
            <span style={{ color: '#6bcf7f', marginLeft: '8px' }}>
              {searchQuery}
            </span>
          </span>
        </div>
      )}

      {/* 使用提示 */}
      {!hasSelection && (
        <div style={{
          marginTop: '16px',
          fontSize: '14px',
          color: '#4ecdc4',
          fontStyle: 'italic'
        }}>
          💡 提示：點擊下方任一張圖片來選擇你喜歡的風格！
        </div>
      )}
    </div>
  );
};

export default StyleSearch;