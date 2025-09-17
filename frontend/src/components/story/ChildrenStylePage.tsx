import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { sdmodel, sdmodel_list } from "../../utils/sdmodel_list";
import { userLogout, verifyAuth } from "../../utils/tools/fetch";
import ChildrenHeader from './ChildrenHeader';
import StyleSearch from './StyleSearch';
import StyleGallery from './StyleGallery';
import '../../styles/ChildrenTheme.css';

const ChildrenStylePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
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
                console.error('檢查登入狀態失敗:', error);
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
                navigate('/login');
                // 使用友好的提示替代 alert
                console.log('您已成功登出!');
            }
        } catch (error) {
            console.error('登出失敗:', error);
        } finally {
            setIsNavigating(false);
        }
    };

    // 開始創作
    const handleSearch = () => {
        if (isNavigating) return;

        if (!isLogin) {
            // 友好的登入提示
            setIsNavigating(true);
            navigate('/login');
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
            <div className="children-theme">
                <div className="children-container">
                    <div className="children-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="children-loading-spinner" style={{ margin: '0 auto 24px' }}></div>
                        <h2 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
                            🎨 正在載入繪畫風格...
                        </h2>
                        <p style={{ color: '#636e72', fontSize: '16px' }}>
                            請稍等片刻，我們正在準備美麗的風格選項！
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="children-theme" style={{ minHeight: '100vh' }}>
            {/* 導航遮罩 */}
            {isNavigating && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="children-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="children-loading-spinner" style={{ margin: '0 auto 20px' }}></div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>
                            ✨ 正在前往創作頁面...
                        </div>
                    </div>
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
            <div className="children-container">
                {/* 歡迎訊息 */}
                {!isLogin && (
                    <div className="children-card" style={{ 
                        marginBottom: '24px',
                        textAlign: 'center',
                        backgroundColor: '#fff9f9',
                        border: '2px solid #ff6b6b'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
                        <h3 style={{ color: '#ff6b6b', marginBottom: '12px' }}>
                            歡迎來到故事創作樂園！
                        </h3>
                        <p style={{ color: '#636e72', fontSize: '16px', marginBottom: '20px' }}>
                            你可以先瀏覽不同的繪畫風格，但需要登入後才能開始創作故事喔！
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="children-btn children-btn-primary children-btn-large"
                        >
                            🔑 點擊這裡登入
                        </button>
                    </div>
                )}

                {/* 搜尋區域 */}
                <StyleSearch
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearch={handleSearch}
                    disabled={isNavigating}
                    placeholder={isLogin ? "選擇一個喜歡的繪畫風格..." : "先登入才能開始創作喔！"}
                />

                {/* 風格畫廊 */}
                <div className="children-card" style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h3 style={{ color: '#4ecdc4', fontSize: '20px', marginBottom: '8px' }}>
                            🎨 選擇你喜歡的繪畫風格
                        </h3>
                        <p style={{ color: '#636e72', fontSize: '14px', margin: 0 }}>
                            {isLogin 
                                ? '點擊任一張圖片選擇風格，雙擊可快速開始創作！'
                                : '瀏覽各種美麗的繪畫風格，登入後即可開始創作！'
                            }
                        </p>
                    </div>

                    <StyleGallery
                        options={options}
                        selectedStyle={searchQuery}
                        onStyleSelect={handleStyleSelect}
                        onStyleDoubleClick={isLogin ? handleStyleDoubleClick : undefined}
                        disabled={isNavigating || !isLogin}
                    />
                </div>

                {/* 底部提示 */}
                <div className="children-card" style={{ 
                    marginTop: '24px',
                    textAlign: 'center',
                    backgroundColor: '#f0fcfc'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>🌟</div>
                    <h4 style={{ color: '#4ecdc4', marginBottom: '12px' }}>
                        準備好創作屬於你的故事了嗎？
                    </h4>
                    <p style={{ color: '#636e72', fontSize: '14px', marginBottom: '20px' }}>
                        選擇一個繪畫風格，我們將為你創造一個獨一無二的故事世界！
                    </p>
                    
                    {searchQuery && isLogin && (
                        <button
                            onClick={handleSearch}
                            disabled={isNavigating}
                            className="children-btn children-btn-success children-btn-large"
                            style={{
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            🚀 立即開始創作故事！
                        </button>
                    )}
                </div>

                {/* 數據統計 */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '20px', 
                    marginTop: '32px',
                    flexWrap: 'wrap'
                }}>
                    <div className="children-card" style={{ 
                        textAlign: 'center', 
                        minWidth: '120px',
                        backgroundColor: '#fff9f9'
                    }}>
                        <div style={{ fontSize: '24px', color: '#ff6b6b', fontWeight: 'bold' }}>
                            {options.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#636e72' }}>
                            🎨 繪畫風格
                        </div>
                    </div>
                    
                    <div className="children-card" style={{ 
                        textAlign: 'center', 
                        minWidth: '120px',
                        backgroundColor: '#f0fcfc'
                    }}>
                        <div style={{ fontSize: '24px', color: '#4ecdc4', fontWeight: 'bold' }}>
                            ∞
                        </div>
                        <div style={{ fontSize: '12px', color: '#636e72' }}>
                            🌟 創作可能
                        </div>
                    </div>
                    
                    <div className="children-card" style={{ 
                        textAlign: 'center', 
                        minWidth: '120px',
                        backgroundColor: '#fffbf0'
                    }}>
                        <div style={{ fontSize: '24px', color: '#ffd93d', fontWeight: 'bold' }}>
                            💝
                        </div>
                        <div style={{ fontSize: '12px', color: '#636e72' }}>
                            🎁 專屬故事
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ChildrenStylePage;