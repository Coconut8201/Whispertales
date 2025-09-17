import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ChildrenTheme.css';

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
  showNavButtons = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="children-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* 標題 */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(18px, 4vw, 28px)',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          fontFamily: "'Noto Sans TC', sans-serif"
        }}>
          {title}
        </h1>
      </div>

      {/* 導航按鈕區域 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* 功能按鈕 */}
        {isLogin && showNavButtons && (
          <>
            <button 
              onClick={() => navigate('/bookmanage')} 
              className="children-btn children-btn-secondary"
              style={{
                fontSize: '14px',
                padding: '8px 16px',
                minWidth: '100px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white'
              }}
            >
              📚 我的書本
            </button>
            <button 
              onClick={() => navigate('/voice')} 
              className="children-btn children-btn-secondary"
              style={{
                fontSize: '14px',
                padding: '8px 16px',
                minWidth: '100px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white'
              }}
            >
              🎵 語音設定
            </button>
          </>
        )}

        {/* 登入狀態按鈕 */}
        <button 
          onClick={() => navigate('/login')} 
          className="children-btn children-btn-warning"
          style={{
            fontSize: '14px',
            padding: '8px 16px',
            minWidth: '80px',
            backgroundColor: isLogin ? 'rgba(78, 205, 196, 0.9)' : 'rgba(255, 179, 71, 0.9)',
            border: '2px solid white',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {isLogin ? '😊 已登入' : '👋 未登入'}
        </button>

        {/* 登出按鈕 */}
        {isLogin && (
          <button 
            onClick={onLogout}
            className="children-btn children-btn-warning"
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              minWidth: '80px',
              backgroundColor: 'rgba(255, 107, 107, 0.9)',
              border: '2px solid white',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            🚪 登出
          </button>
        )}
      </div>
    </div>
  );
};

export default ChildrenHeader;