import React, { useState, useEffect } from 'react';
import { AudioPlayerManager, AudioState } from '../../utils/storyPlayer';
import '../../styles/ChildrenTheme.css';

interface AudioControlsProps {
  audioPlayer: AudioPlayerManager | null;
  totalPages: number;
  currentPage?: number;
  disabled?: boolean;
  className?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  audioPlayer,
  totalPages,
  currentPage = 0,
  disabled = false,
  className = ''
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentPage: 0,
    audioUrls: [],
    currentAudio: null
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (audioPlayer) {
      setAudioState(audioPlayer.getState());
      setIsInitialized(audioPlayer.getState().audioUrls.length > 0);
    }
  }, [audioPlayer]);

  const handlePlayPage = () => {
    if (audioPlayer && !disabled) {
      audioPlayer.playPage(currentPage);
    }
  };

  const handlePlayAll = () => {
    if (audioPlayer && !disabled) {
      audioPlayer.playAll();
    }
  };

  const handleStop = () => {
    if (audioPlayer && !disabled) {
      audioPlayer.stopCurrent();
    }
  };

  const handlePlayPrevious = () => {
    if (audioPlayer && !disabled && currentPage > 0) {
      audioPlayer.playPage(currentPage - 1);
    }
  };

  const handlePlayNext = () => {
    if (audioPlayer && !disabled && currentPage < totalPages - 1) {
      audioPlayer.playPage(currentPage + 1);
    }
  };

  // 如果音頻播放器未初始化或沒有音頻數據，顯示加載狀態
  if (!audioPlayer || !isInitialized) {
    return (
      <div className={`children-card ${className}`}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="children-loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <div style={{ color: '#636e72', fontSize: '14px' }}>
            🎵 正在準備故事朗讀...
          </div>
        </div>
      </div>
    );
  }

  const hasAudioForCurrentPage = audioState.audioUrls[currentPage];
  const canPlayPrevious = currentPage > 0 && audioState.audioUrls[currentPage - 1];
  const canPlayNext = currentPage < totalPages - 1 && audioState.audioUrls[currentPage + 1];

  return (
    <div className={`children-card ${className}`}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ 
          color: '#ff6b6b', 
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎵 故事朗讀控制
        </h3>

        {/* 播放狀態顯示 */}
        {audioState.isPlaying && (
          <div style={{ 
            color: '#6bcf7f', 
            fontSize: '16px', 
            marginBottom: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>🔊</span>
            正在播放第 {audioState.currentPage + 1} 頁
          </div>
        )}

        {/* 主要控制按鈕 */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          {/* 播放當前頁 */}
          <button
            onClick={handlePlayPage}
            disabled={disabled || !hasAudioForCurrentPage || audioState.isPlaying}
            className="children-btn children-btn-primary"
            style={{ 
              fontSize: '14px',
              padding: '12px 20px',
              minWidth: '120px'
            }}
          >
            {audioState.isPlaying && audioState.currentPage === currentPage ? (
              '🔊 播放中'
            ) : (
              '▶️ 播放本頁'
            )}
          </button>

          {/* 停止播放 */}
          {audioState.isPlaying && (
            <button
              onClick={handleStop}
              disabled={disabled}
              className="children-btn children-btn-warning"
              style={{ 
                fontSize: '14px',
                padding: '12px 20px',
                minWidth: '100px'
              }}
            >
              ⏹️ 停止
            </button>
          )}

          {/* 播放全部 */}
          <button
            onClick={handlePlayAll}
            disabled={disabled || audioState.isPlaying || audioState.audioUrls.every(url => !url)}
            className="children-btn children-btn-success"
            style={{ 
              fontSize: '14px',
              padding: '12px 20px',
              minWidth: '120px'
            }}
          >
            🎭 播放全部
          </button>
        </div>

        {/* 頁面導航控制 */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <button
            onClick={handlePlayPrevious}
            disabled={disabled || !canPlayPrevious || audioState.isPlaying}
            className="children-btn children-btn-secondary"
            style={{ 
              fontSize: '12px',
              padding: '8px 16px',
              minWidth: 'auto'
            }}
          >
            ⏮️ 上一頁
          </button>

          <button
            onClick={handlePlayNext}
            disabled={disabled || !canPlayNext || audioState.isPlaying}
            className="children-btn children-btn-secondary"
            style={{ 
              fontSize: '12px',
              padding: '8px 16px',
              minWidth: 'auto'
            }}
          >
            下一頁 ⏭️
          </button>
        </div>

        {/* 頁面信息 */}
        <div style={{ 
          fontSize: '14px', 
          color: '#636e72',
          marginBottom: '12px'
        }}>
          📄 第 {currentPage + 1} 頁 / 共 {totalPages} 頁
        </div>

        {/* 音頻可用性提示 */}
        {!hasAudioForCurrentPage && (
          <div style={{ 
            color: '#ffb347', 
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            ⚠️ 此頁面暫無語音朗讀
          </div>
        )}

        {/* 使用提示 */}
        {!audioState.isPlaying && hasAudioForCurrentPage && (
          <div style={{ 
            color: '#4ecdc4', 
            fontSize: '12px',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            💡 點擊「播放本頁」聽故事朗讀
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AudioControls;