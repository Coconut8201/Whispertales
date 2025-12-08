import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryFlipBook, { StoryFlipBookRef } from './StoryFlipBook';
import AudioControls from './AudioControls';
import DownloadControls from './DownloadControls';
import { StoryDataManager, StoryData, AudioPlayerManager, createAudioPlayer } from '../../utils/storyPlayer';
import { Button } from '../ui/button';
import { ArrowLeft, BookOpen, Clock, Calendar, User, AlignLeft } from 'lucide-react';
import { Loading } from '../ui/loading';

const StoryReader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const storyId = queryParams.get('query');

  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [storyLines, setStoryLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Audio Player
  const audioPlayerRef = useRef<AudioPlayerManager | null>(null);
  const flipBookRef = useRef<StoryFlipBookRef>(null);

  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setError('未找到故事 ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await StoryDataManager.loadStory(storyId);

        if (result.success && result.data) {
          setStoryData(result.data);

          // Process story text
          const lines = StoryDataManager.processStoryText(result.data.storyTale);
          setStoryLines(lines);

          // Initialize audio player
          await initializeAudioPlayer(lines, storyId);

        } else {
          setError(result.message || '無法加載故事數據');
        }
      } catch (err) {
        console.error('加載故事出錯:', err);
        setError('加載故事時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    loadStory();

    // Cleanup audio player
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.cleanup();
      }
    };
  }, [storyId]);

  const initializeAudioPlayer = async (lines: string[], storyId: string) => {
    try {
      // Create audio player with state change callback
      const audioPlayer = createAudioPlayer((state) => {
        // Optional: you can sync detailed state here if needed
        // For now, AudioControls handles its own state updates via the manager

        // Auto-page turn logic could be implemented here if the player supported timestamped events,
        // but current implementation is page-based playback.
        if (state.isPlaying && flipBookRef.current && flipBookRef.current.getCurrentPage() !== state.currentPage) {
          flipBookRef.current.goToPage(state.currentPage);
        }
      });

      audioPlayerRef.current = audioPlayer;
      await audioPlayer.initializeAudio(lines, storyId);

    } catch (error) {
      console.error("初始化音頻播放器失敗:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full mx-4">
          <Loading size="lg" emoji="📖" message="正在打開故事書..." />
          <p className="text-gray-500 mt-4 text-sm animate-pulse">
            精彩的故事馬上開始！
          </p>
        </div>
      </div>
    );
  }

  if (error || !storyData) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border-2 border-red-200">
          <div className="text-4xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">哎呀，出錯了！</h2>
          <p className="text-gray-600 mb-6">{error || '無法找到該故事'}</p>
          <Button
            onClick={() => navigate('/style')}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  const images = storyData.image_base64 || [];

  // 準備給 FlipBook 的頁面數據
  const bookPages = storyLines.map((line: string, index: number) => ({
    image: images[index] || '',
    text: line,
    isSpreadImage: false // 這裡可以根據邏輯判斷是否為跨頁圖
  }));

  // 格式化日期
  const createdDate = storyData.addDate
    ? new Date(storyData.addDate).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
    : '未知日期';

  // Parse info if possible - removed unused vars
  const mainChar = "未命名";


  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary flex flex-col pb-10">
      {/* 頂部導航 */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 px-4 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/style')}
            className="text-children-primary hover:bg-children-bg-primary font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首頁
          </Button>

          <h1 className="text-lg font-bold text-gray-800 truncate px-4 hidden sm:block">
            📖 我的故事書
          </h1>

          <div className="w-24"></div> {/* 佔位，保持標題居中 */}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左側：故事書區域 */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-500">
            <StoryFlipBook
              ref={flipBookRef}
              pages={bookPages}
              onPageChange={(pageIndex: number) => {
                setCurrentPage(pageIndex);
                // When manual page turn happens, we might want to stop current audio or seek
                // But current AudioPlayerManager is page-based, so maybe we just let it be or stop it
                if (audioPlayerRef.current) {
                  // logic to sync audio if needed, or just let user play manually
                }
              }}
              className="shadow-2xl rounded-lg"
            />
          </div>

          <div className="mt-8 text-center text-gray-600 bg-white/60 px-6 py-2 rounded-full backdrop-blur-sm shadow-sm inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            點擊書角或者使用鍵盤左右鍵翻頁喔！
          </div>
        </div>

        {/* 右側：控制面板和信息 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* 音頻控制 */}
            <AudioControls
              audioPlayer={audioPlayerRef.current}
              totalPages={bookPages.length}
              currentPage={currentPage}
            />

            {/* 下載控制 */}
            <DownloadControls
              storyData={storyData}
              storyLines={storyLines}
            />

            {/* 故事詳情卡片 */}
            <div className="bg-white rounded-xl shadow-children-sm p-5 border border-purple-100">
              <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                故事資訊
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>主角：<span className="font-bold text-gray-800">{mainChar}</span></span>
                </div>

                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>創作時間：{createdDate}</span>
                </div>

                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <AlignLeft className="w-4 h-4 text-purple-400" />
                  <span>故事長度：{storyLines.length} 頁</span>
                </div>

                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>預計閱讀時間：{Math.ceil(storyLines.length * 1.5)} 分鐘</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;