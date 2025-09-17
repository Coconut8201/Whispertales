import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoryDataManager, AudioPlayerManager, createAudioPlayer, StoryData } from '../../utils/storyPlayer';
import StoryFlipBook, { StoryFlipBookRef } from './StoryFlipBook';
import AudioControls from './AudioControls';
import DownloadControls from './DownloadControls';
import '../../styles/ChildrenTheme.css';

const StoryReader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 從URL獲取故事ID
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get("query") || "";

  // 狀態管理
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [storyLines, setStoryLines] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Refs
  const flipBookRef = useRef<StoryFlipBookRef>(null);
  const audioPlayerRef = useRef<AudioPlayerManager | null>(null);

  // 初始化故事數據
  useEffect(() => {
    const loadStoryData = async () => {
      if (!storyId) {
        setError("未提供故事ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const result = await StoryDataManager.loadStory(storyId);
        
        if (result.success && result.data) {
          setStoryData(result.data);
          
          // 處理故事文本
          const lines = StoryDataManager.processStoryText(result.data.storyTale);
          setStoryLines(lines);
          
          // 初始化音頻播放器
          await initializeAudioPlayer(lines, storyId);
        } else {
          setError(result.message || "載入故事失敗");
        }
      } catch (error) {
        console.error("載入故事錯誤:", error);
        setError("載入故事時發生錯誤");
      } finally {
        setIsLoading(false);
      }
    };

    loadStoryData();
  }, [storyId]);

  // 初始化音頻播放器
  const initializeAudioPlayer = async (lines: string[], storyId: string) => {
    try {
      setIsLoadingAudio(true);
      
      const audioPlayer = createAudioPlayer((state) => {
        // 音頻狀態變化回調
        console.log('音頻狀態更新:', state);
      });
      
      audioPlayerRef.current = audioPlayer;
      
      // 初始化音頻
      await audioPlayer.initializeAudio(lines, storyId);
    } catch (error) {
      console.error("初始化音頻播放器失敗:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // 處理頁面變化
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  // 導航控制
  const handleGoBack = () => {
    navigate('/style');
  };

  const handleGoToAdvanced = () => {
    navigate('/style/role');
  };

  // 清理資源
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.cleanup();
      }
    };
  }, []);

  // 加載狀態
  if (isLoading) {
    return (
      <div className="children-theme">
        <div className="children-container">
          <div className="children-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div className="children-loading-spinner" style={{ margin: '0 auto 24px' }}></div>
            <h2 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
              📚 正在載入你的故事...
            </h2>
            <p style={{ color: '#636e72', fontSize: '16px' }}>
              請稍等片刻，我們正在準備精彩的故事書！
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error || !storyData) {
    return (
      <div className="children-theme">
        <div className="children-container">
          <div className="children-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>😢</div>
            <h2 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
              載入故事失敗
            </h2>
            <p style={{ color: '#636e72', fontSize: '16px', marginBottom: '24px' }}>
              {error || "找不到指定的故事"}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleGoBack}
                className="children-btn children-btn-primary"
              >
                🏠 回到首頁
              </button>
              <button
                onClick={handleGoToAdvanced}
                className="children-btn children-btn-secondary"
              >
                ✨ 創作新故事
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 準備翻頁書數據
  const flipBookPages = storyLines.map((line, index) => ({
    image: storyData.image_base64?.[index] || '',
    text: line,
    isSpreadImage: false
  }));

  return (
    <div className="children-theme">
      {/* 頁面標題 */}
      <div className="children-header">
        <h1>📖 我的故事書 📖</h1>
      </div>

      {/* 導航按鈕 */}
      <div className="children-container">
        <div className="children-row" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <button 
            onClick={handleGoBack} 
            className="children-btn children-btn-secondary"
          >
            🏠 回到首頁
          </button>
          <button 
            onClick={handleGoToAdvanced} 
            className="children-btn children-btn-primary"
          >
            ✨ 創作新故事
          </button>
        </div>

        {/* 主要內容區域 */}
        <div className="children-row" style={{ alignItems: 'flex-start' }}>
          {/* 左側：翻頁書 */}
          <div style={{ flex: 2, marginRight: '20px' }}>
            <div className="children-card" style={{ padding: '20px' }}>
              <StoryFlipBook
                ref={flipBookRef}
                pages={flipBookPages}
                onPageChange={handlePageChange}
                showPageNumbers={true}
                className="story-reader-flipbook"
              />
            </div>
          </div>

          {/* 右側：控制面板 */}
          <div style={{ flex: 1 }}>
            {/* 音頻控制 */}
            <AudioControls
              audioPlayer={audioPlayerRef.current}
              totalPages={storyLines.length}
              currentPage={currentPage}
              disabled={isLoadingAudio}
              className="story-audio-controls"
            />

            {/* 下載控制 */}
            <DownloadControls
              storyData={storyData}
              storyLines={storyLines}
              className="story-download-controls"
            />

            {/* 故事信息 */}
            <div className="children-card" style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#ff6b6b', marginBottom: '12px', fontSize: '16px' }}>
                📋 故事信息
              </h4>
              <div style={{ fontSize: '14px', color: '#636e72' }}>
                <div style={{ marginBottom: '8px' }}>
                  📅 創作時間：{new Date(storyData.addDate).toLocaleDateString('zh-TW')}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  📄 故事頁數：{storyLines.length} 頁
                </div>
                <div style={{ marginBottom: '8px' }}>
                  🖼️ 圖片數量：{storyData.image_base64?.length || 0} 張
                </div>
                <div>
                  ⭐ 收藏狀態：{storyData.is_favorite ? '已收藏' : '未收藏'}
                </div>
              </div>
            </div>

            {/* 操作提示 */}
            <div className="children-card" style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#4ecdc4', marginBottom: '12px', fontSize: '16px' }}>
                💡 使用提示
              </h4>
              <div style={{ fontSize: '12px', color: '#636e72', lineHeight: '1.5' }}>
                <div>• 點擊書頁右下角翻到下一頁</div>
                <div>• 點擊書頁左下角翻到上一頁</div>
                <div>• 使用右側音頻控制播放故事朗讀</div>
                <div>• 可以下載PDF或完整故事包保存</div>
              </div>
            </div>
          </div>
        </div>

        {/* 故事內容預覽（摺疊式） */}
        <details className="children-card" style={{ marginTop: '24px' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#ff6b6b',
            padding: '8px 0'
          }}>
            📝 查看完整故事內容
          </summary>
          <div style={{ 
            marginTop: '16px', 
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#2d3436'
          }}>
            <pre style={{ 
              margin: 0, 
              fontFamily: "'Noto Sans TC', sans-serif",
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {storyData.storyTale}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default StoryReader;