import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Loading } from './ui/loading';
import { Sparkles, Heart, Star, Wand2, BookOpen, Palette, ArrowRight, PlayCircle, Music, Mic } from 'lucide-react';

const ChildrenUIDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCreateStory = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('🎉 你的魔法故事書已經準備好了！');
    }, 2000);
  };

  const storyStyles = [
    { id: 1, name: '夢幻童話', emoji: '🏰', description: '公主與龍的魔法世界', color: 'from-pink-400 to-rose-400' },
    { id: 2, name: '星際探險', emoji: '🚀', description: '飛向浩瀚無垠的宇宙', color: 'from-indigo-400 to-cyan-400' },
    { id: 3, name: '深海奇遇', emoji: '🐳', description: '尋找傳說中的亞特蘭提斯', color: 'from-blue-400 to-teal-400' },
    { id: 4, name: '森林秘境', emoji: '🌲', description: '與精靈共舞的綠色冒險', color: 'from-green-400 to-emerald-400' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F0F4F8]">


      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-300 blur-[120px] animate-pulse-slow mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-300 blur-[120px] animate-pulse-slow mix-blend-multiply animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-pink-300 blur-[120px] animate-pulse-slow mix-blend-multiply animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-16">

        {/* Validated Premium Hero Section */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm text-indigo-600 font-bold text-sm tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            AI Story Magic Engine v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 drop-shadow-sm">
            WhisperTales
            <span className="block text-2xl md:text-3xl mt-2 font-bold text-gray-600 tracking-normal">
              讓想像力飛翔的魔法繪本工廠 ✨
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed font-medium">
            專為孩子打造的 AI 故事生成器。選擇風格、錄製聲音，一鍵生成獨一無二的互動式有聲繪本。
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Button className="h-14 px-8 rounded-full text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-white/20">
              🚀 開始創作故事
            </Button>
            <Button variant="outline" className="h-14 px-8 rounded-full text-xl font-bold bg-white/50 backdrop-blur-sm border-2 border-white hover:bg-white/80 text-gray-700 shadow-lg hover:shadow-xl transition-all">
              📺 觀看展示影片
            </Button>
          </div>
        </div>

        {/* Floating Stats Cards - Glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: '繪畫風格', value: '50+', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
            { label: '故事創作', value: '10k+', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'AI 語音', value: 'Pro', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: '快樂讀者', value: '100%', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <div key={i} className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute top-4 right-4 p-3 rounded-2xl ${stat.bg} ${stat.color} opacity-80 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black text-gray-800 mb-1">{stat.value}</div>
              <div className="text-gray-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Showcase - Split Layout */}
        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* Left: Quick Create Form */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-[2.5rem] rotate-3 opacity-20 blur-xl"></div>
            <Card className="relative bg-white/70 backdrop-blur-2xl border-white/80 shadow-2xl rounded-[2rem] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-purple-500" />
                    快速施法
                  </h3>
                  <p className="text-gray-500">30秒內創造你的第一個故事！</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">我是誰？ (主角名稱)</label>
                    <Input className="h-14 rounded-2xl bg-white/50 border-2 border-purple-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 text-lg transition-all" placeholder="例如：勇敢的小雷" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">關於什麼的故事？</label>
                    <Input className="h-14 rounded-2xl bg-white/50 border-2 border-purple-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 text-lg transition-all" placeholder="例如：尋找魔法寶石" />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleCreateStory}
                      disabled={isLoading}
                      className="w-full h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2"><Loading size="sm" /> 正在施法中...</span>
                      ) : (
                        <span className="flex items-center gap-2">✨ 立即生成故事 <ArrowRight className="w-5 h-5" /></span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Style Grid */}
          <div className="md:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-3xl font-black text-gray-800">熱門畫風選擇</h2>
              <Button variant="ghost" className="text-purple-600 font-bold hover:bg-purple-50">查看全部 (50+)</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {storyStyles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedCard(style.id)}
                  className={`
                      group cursor-pointer relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300
                      ${selectedCard === style.id ? 'ring-4 ring-offset-4 ring-purple-500 scale-[1.02] shadow-2xl z-10' : 'hover:scale-[1.03] hover:shadow-xl bg-white/60'}
                    `}
                >
                  {/* Card Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className="text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-500 filter hover:brightness-110">{style.emoji}</div>
                    <div>
                      <h4 className="text-xl font-black text-gray-800 mb-1">{style.name}</h4>
                      <p className="text-xs font-bold text-gray-500 line-clamp-1">{style.description}</p>
                    </div>

                    {selectedCard === style.id && (
                      <div className="absolute top-4 right-4 bg-white text-purple-600 p-1 rounded-full shadow-md animate-scale-in">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              {[
                { icon: Music, text: '背景音樂生成' },
                { icon: Mic, text: '聲音複製技術' },
                { icon: PlayCircle, text: '自動動畫化' }
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/40 border border-white/60 rounded-full font-bold text-gray-600 shadow-sm backdrop-blur-sm">
                  <feat.icon className="w-4 h-4 text-purple-500" />
                  {feat.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>

          <div className="relative z-10 px-8 py-12 md:py-16 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
              準備好開始你的冒險了嗎？
            </h2>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              加入超過 1,000 個家庭，一起用故事連結親子時光。
              <br className="hidden md:block" />
              現在註冊，即可免費獲得 3 個魔法故事額度！
            </p>
            <Button size="lg" className="h-16 px-10 rounded-full bg-white text-purple-600 text-xl font-black shadow-xl hover:bg-gray-50 hover:scale-105 transition-all">
              🎁 免費領取額度
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChildrenUIDemo;
