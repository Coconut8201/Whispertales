import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Loading } from './ui/loading';
import { Hero } from './ui/hero';
import { StatCard } from './ui/stat-card';
import { Sparkles, Heart, Star, Wand2, BookOpen, Palette } from 'lucide-react';

const ChildrenUIDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCreateStory = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('🎉 你的故事已經準備好了！');
    }, 2000);
  };

  const storyStyles = [
    { id: 1, name: '童話風格', emoji: '🏰', description: '魔法城堡與公主王子的冒險' },
    { id: 2, name: '太空冒險', emoji: '🚀', description: '探索宇宙的神秘旅程' },
    { id: 3, name: '海底世界', emoji: '🐠', description: '與海洋生物一起遊玩' },
    { id: 4, name: '森林探險', emoji: '🌳', description: '發現大自然的奧秘' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary">
      {/* Hero 區域 */}
      <Hero
        title="✨ WisperTales - 故事創作樂園 ✨"
        subtitle="用你的想像力創造獨一無二的故事世界！"
        emoji="📚"
        gradient="rainbow"
      />

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* 統計卡片區域 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard emoji="🎨" value="50+" label="繪畫風格" color="primary" />
          <StatCard emoji="📖" value="1000+" label="故事創作" color="secondary" />
          <StatCard emoji="⭐" value="∞" label="創作可能" color="accent" />
          <StatCard emoji="💝" value="100%" label="專屬故事" color="success" />
        </div>

        {/* 主要內容區 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 左側：快速創作卡片 */}
          <Card className="hover:shadow-children-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-children-primary" />
                快速開始創作
              </CardTitle>
              <CardDescription>
                選擇你喜歡的風格，立即開始創作你的故事！
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-children-md font-bold text-children-text-primary mb-2">
                  👤 你的名字
                </label>
                <Input placeholder="輸入你的名字..." />
              </div>
              <div>
                <label className="block text-children-md font-bold text-children-text-primary mb-2">
                  🎭 故事主角
                </label>
                <Input placeholder="你想要什麼角色？" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  <Star className="w-4 h-4 mr-1" />
                  熱門
                </Badge>
                <Badge variant="secondary">
                  <Heart className="w-4 h-4 mr-1" />
                  最愛
                </Badge>
                <Badge variant="success">
                  <Wand2 className="w-4 h-4 mr-1" />
                  新作品
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateStory}
                disabled={isLoading}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isLoading ? '創作中...' : '🚀 立即開始創作！'}
              </Button>
              <Button variant="outline" className="w-full">
                <BookOpen className="w-5 h-5 mr-2" />
                查看我的故事書
              </Button>
            </CardFooter>
          </Card>

          {/* 右側：功能介紹卡片 */}
          <Card className="bg-gradient-to-br from-children-accent-light/30 to-children-info/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-6 h-6 text-children-secondary" />
                超多驚喜功能
              </CardTitle>
              <CardDescription>
                探索 WisperTales 的神奇功能！
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { emoji: '🎨', title: 'AI 繪圖', desc: '用人工智慧畫出美麗的插圖' },
                { emoji: '🎙️', title: '語音朗讀', desc: '聽故事用你自己的聲音' },
                { emoji: '📚', title: '故事收藏', desc: '保存你最喜歡的故事' },
                { emoji: '🌈', title: '多種風格', desc: '50+ 種繪畫風格任你選' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-children-md bg-white/50 hover:bg-white/80 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="text-3xl flex-shrink-0">{feature.emoji}</div>
                  <div>
                    <div className="font-bold text-children-text-primary">{feature.title}</div>
                    <div className="text-children-sm text-children-text-secondary">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 故事風格選擇區 */}
        <div className="mb-8">
          <h2 className="text-children-xl font-bold text-children-text-primary mb-4 text-center">
            🎨 選擇你喜歡的故事風格
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {storyStyles.map((style) => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all ${
                  selectedCard === style.id
                    ? 'border-children-primary border-4 shadow-children-strong scale-105'
                    : 'hover:scale-105'
                }`}
                onClick={() => setSelectedCard(style.id)}
              >
                <CardContent className="text-center pt-6">
                  <div className="text-5xl mb-3 animate-bounce-slow">{style.emoji}</div>
                  <h3 className="text-children-md font-bold text-children-text-primary mb-2">
                    {style.name}
                  </h3>
                  <p className="text-children-sm text-children-text-secondary">
                    {style.description}
                  </p>
                  {selectedCard === style.id && (
                    <div className="mt-3">
                      <Badge variant="success" className="animate-pulse">
                        ✓ 已選擇
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 按鈕展示區 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎮 互動按鈕展示</CardTitle>
            <CardDescription>點擊不同的按鈕看看效果！</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">主要按鈕</Button>
              <Button variant="secondary">次要按鈕</Button>
              <Button variant="success">成功按鈕</Button>
              <Button variant="warning">警告按鈕</Button>
              <Button variant="accent">強調按鈕</Button>
              <Button variant="outline">外框按鈕</Button>
              <Button variant="ghost">透明按鈕</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">小按鈕</Button>
              <Button size="default">預設按鈕</Button>
              <Button size="lg">大按鈕</Button>
            </div>
          </CardContent>
        </Card>

        {/* 載入狀態展示 */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent>
              <Loading size="lg" emoji="✨" message="正在創造你的專屬故事..." />
            </CardContent>
          </Card>
        )}

        {/* 底部提示卡片 */}
        <Card className="bg-gradient-to-r from-children-info/20 to-children-secondary/20 border-children-info">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-children-lg font-bold text-children-text-primary mb-2">
              準備好開始你的創作之旅了嗎？
            </h3>
            <p className="text-children-md text-children-text-secondary mb-6">
              每個孩子都是天生的故事創作家，讓我們一起創造屬於你的奇幻世界！
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button variant="default" size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                開始創作
              </Button>
              <Button variant="secondary" size="lg">
                <Heart className="w-5 h-5 mr-2" />
                查看範例
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildrenUIDemo;
