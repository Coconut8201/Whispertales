import React, { useState, useEffect } from 'react';
import { AudioPlayerManager, AudioState } from '../../utils/storyPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Play, Square, SkipBack, SkipForward, Volume2, AudioWaveform } from 'lucide-react';
import { Loading } from '../ui/loading';

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
      <Card className={`border-2 border-children-info/20 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loading size="md" emoji="🎵" />
          <p className="text-gray-500 text-sm mt-4">
            正在準備故事朗讀...
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasAudioForCurrentPage = audioState.audioUrls[currentPage];
  const canPlayPrevious = currentPage > 0 && audioState.audioUrls[currentPage - 1];
  const canPlayNext = currentPage < totalPages - 1 && audioState.audioUrls[currentPage + 1];

  return (
    <Card className={`border-2 border-children-info/20 shadow-children-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-children-info flex items-center justify-center gap-2">
          <AudioWaveform className="w-5 h-5" />
          故事朗讀控制
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {/* 播放狀態顯示 */}
        {audioState.isPlaying && (
          <div className="flex items-center justify-center gap-2 text-green-500 font-bold bg-green-50 py-2 rounded-lg animate-fade-in">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>正在播放第 {audioState.currentPage + 1} 頁</span>
          </div>
        )}

        {/* 主要控制按鈕 */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={handlePlayPage}
            disabled={disabled || !hasAudioForCurrentPage || audioState.isPlaying}
            className="flex-1 min-w-[120px]"
            variant="default"
          >
            {audioState.isPlaying && audioState.currentPage === currentPage ? (
              <>
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                播放中
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                播放本頁
              </>
            )}
          </Button>

          {audioState.isPlaying && (
            <Button
              onClick={handleStop}
              disabled={disabled}
              variant="destructive"
              className="flex-none px-4"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}

          <Button
            onClick={handlePlayAll}
            disabled={disabled || audioState.isPlaying || audioState.audioUrls.every(url => !url)}
            className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600 text-white"
          >
            <AudioWaveform className="w-4 h-4 mr-2" />
            播放全部
          </Button>
        </div>

        {/* 頁面導航控制 */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={handlePlayPrevious}
            disabled={disabled || !canPlayPrevious || audioState.isPlaying}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <SkipBack className="w-4 h-4 mr-1" />
            上一頁
          </Button>

          <Button
            onClick={handlePlayNext}
            disabled={disabled || !canPlayNext || audioState.isPlaying}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            下一頁
            <SkipForward className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 頁面信息 */}
        <div className="text-sm text-gray-500 font-medium">
          📄 第 {currentPage + 1} 頁 / 共 {totalPages} 頁
        </div>

        {/* 提示信息 */}
        {!hasAudioForCurrentPage && (
          <p className="text-xs text-orange-400 italic">
            ⚠️ 此頁面暫無語音朗讀
          </p>
        )}

        {!audioState.isPlaying && hasAudioForCurrentPage && (
          <p className="text-xs text-teal-500 italic">
            💡 點擊「播放本頁」聽故事朗讀
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioControls;