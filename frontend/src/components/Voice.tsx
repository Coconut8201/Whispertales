import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { getVoiceList, UploadVoice } from "../utils/tools/fetch.ts";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loading } from "./ui/loading";
import ChildrenHeader from "./story/ChildrenHeader";
import { Mic, Square, Play, Volume2, Upload, Check, Music } from "lucide-react";

export default function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("model_name");
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [voiceOptions, setVoiceOptions] = useState<string[]>([]);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const navigate = useNavigate();
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchVoiceList = async () => {
      const result = await getVoiceList();
      if (result.success && Array.isArray(result.data)) {
        setVoiceOptions(result.data);
      } else {
        console.error("獲取語音列表失敗:", result.message);
      }
    };
    fetchVoiceList();
  }, [isLoading]); // Refetch list after successful upload (isLoading changes from true to false)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("🚫 無法訪問麥克風！請檢查瀏覽器權限設置。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
    setAudioName(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRecording) {
      stopRecording();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (voiceOptions.includes(audioName)) {
      alert("⚠️ 這個模型名稱已經存在了！請選擇其他名稱。");
      return;
    }

    if (audioBlob) {
      try {
        setIsLoading(true);
        await UploadVoice(audioBlob, audioName);
        alert("🎉 語音模型上傳成功！現在您可以使用這個聲音來生成故事了！");
        // Clear recording after success
        setAudioBlob(null);
        setAudioUrl(null);
        setAudioName("model_name");
      } catch (error) {
        console.error("上傳音檔時發生錯誤:", error);
        alert("😔 語音模型上傳失敗，請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("📢 請先錄製語音才能上傳喔！");
    }
  };

  // Check login logic could be added here similar to other pages

  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary flex flex-col">
      <ChildrenHeader
        isLogin={true} // Assuming user is logged in if they can access this page, or better to verify
        onLogout={() => { /* User logout logic if needed, or rely on parent headers */ }}
        title="🎤 Whisper Tales 語音工作室"
        showNavButtons={true}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <Card className="w-auto p-8 shadow-2xl">
            <Loading size="lg" emoji="🎵" message="正在處理您的語音..." />
          </Card>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 側邊欄 - 現有語音模型 */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <Card className="h-full border-none shadow-children-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Music className="w-5 h-5 text-children-primary" />
                現有語音模型
              </h3>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {voiceOptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p>還沒有語音模型喔！</p>
                  </div>
                ) : (
                  voiceOptions.map((voice) => (
                    <div
                      key={voice}
                      className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="bg-children-secondary/10 p-2 rounded-full text-children-secondary">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700">{voice}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主內容區 */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Card className="border-none shadow-children-card overflow-hidden">
            <div className="bg-gradient-to-r from-children-primary/10 to-children-secondary/10 p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-800">
                ✨ 創建新的語音模型
              </h3>
              <p className="text-gray-500 mt-2">錄製一段聲音，讓我們學習你的說話方式！</p>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-8">
              {/* 模型名稱輸入 */}
              <div className="max-w-xl mx-auto space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">
                  📝 給你的聲音取個名字 (英文)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={audioName}
                    onChange={handleInputChange}
                    className="pl-4 pr-4 h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-children-primary focus:ring-children-primary/20"
                    placeholder="例如: my_voice"
                  />
                  {/* Validity indicator could go here */}
                </div>
              </div>

              {/* 錄音控制區 */}
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`
                       h-16 px-8 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105
                       ${isRecording
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-4 border-red-100"}
                     `}
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    開始錄音
                  </Button>

                  <Button
                    type="button"
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className={`
                       h-16 px-8 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105
                       ${!isRecording
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-white text-red-500 border-4 border-red-100 hover:bg-red-50"}
                     `}
                  >
                    <Square className="w-6 h-6 mr-2 fill-current" />
                    結束錄製
                  </Button>
                </div>

                {/* 錄音狀態 */}
                {isRecording && (
                  <div className="animate-pulse flex items-center gap-2 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    正在錄音中... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
                  </div>
                )}
              </div>

              {/* 預覽和提交區 */}
              {(audioUrl || audioBlob) && (
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 animate-fade-in">
                  <div className="flex flex-col items-center gap-4">
                    <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                      <Play className="w-5 h-5 text-children-secondary" />
                      預覽錄音
                    </h4>

                    {audioUrl && (
                      <audio src={audioUrl} controls className="w-full max-w-md rounded-lg shadow-sm" />
                    )}

                    <form onSubmit={handleSubmit} className="w-full max-w-xs mt-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-children-success hover:bg-children-success/90 text-white h-12 text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                      >
                        {isLoading ? "上傳中..." : (
                          <>
                            <Upload className="w-5 h-5 mr-2" />
                            提交語音模型
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* 範例文本 */}
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  唸唸看這段文字：
                </h4>
                <p className="text-gray-700 leading-relaxed text-lg bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  從前有一座美麗的森林，住著一隻聰明的小狐狸叫小紅。她最喜歡在夜晚抬頭看星星。有一天，小紅發現天上有一顆特別明亮的星星，閃爍著她從未見過的光芒。
                </p>
              </div>

              {/* 返回按鈕 */}
              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/style")}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  不錄了，返回上一頁
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
