import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { getVoiceList, UploadVoice } from "../utils/tools/fetch.ts";
import { useNavigate } from "react-router-dom";
import "../styles/ChildrenTheme.css";

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
      console.log(`語音列表結果:`, result);
      if (result.success && Array.isArray(result.data)) {
        setVoiceOptions(result.data);
      } else {
        console.error("獲取語音列表失敗:", result.message);
      }
    };
    fetchVoiceList();
  }, [voiceOptions]);

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
        // if (audioUrl) {
        //   URL.revokeObjectURL(audioUrl);
        //   setAudioUrl(null);
        // }
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

  return (
    <div className="children-theme">
      <div className="children-header">
        <h1>🎤 Whisper Tales 語音工作室</h1>
      </div>

      <div className="children-container">
        <div
          className="children-row"
          style={{ alignItems: "flex-start", gap: "32px" }}
        >
          {/* 側邊欄 - 現有語音模型 */}
          <div className="children-card" style={{ flex: "0 0 300px" }}>
            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                color: "var(--text-primary)",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              🎵 現有語音模型
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {voiceOptions.length === 0 ? (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                  }}
                >
                  還沒有語音模型喔！
                </p>
              ) : (
                voiceOptions.map((voice) => (
                  <div
                    key={voice}
                    className="children-btn children-btn-secondary"
                    style={{
                      padding: "12px 16px",
                      fontSize: "var(--font-size-sm)",
                      cursor: "default",
                      transform: "none",
                    }}
                  >
                    🔊 {voice}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 主內容區 */}
          <div className="children-card" style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                color: "var(--text-primary)",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              ✨ 創建新的語音模型
            </h3>

            {/* 模型名稱輸入 */}
            <div className="children-row" style={{ marginBottom: "24px" }}>
              <label className="children-label" style={{ flex: "0 0 120px" }}>
                📝 模型名稱：
              </label>
              <input
                type="text"
                value={audioName}
                onChange={handleInputChange}
                className="children-input"
                placeholder="請輸入英文名稱"
                style={{ flex: 1 }}
              />
            </div>

            {/* 錄音按鈕 */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <button
                type="button"
                onClick={startRecording}
                disabled={isRecording}
                className={`children-btn children-btn-success ${isRecording ? "" : "children-btn-large"}`}
                style={{ opacity: isRecording ? 0.5 : 1 }}
              >
                {isRecording ? "🔴 錄音中..." : "🎙️ 開始錄製"}
              </button>

              <button
                type="button"
                onClick={stopRecording}
                disabled={!isRecording}
                className={`children-btn children-btn-warning ${!isRecording ? "" : "children-btn-large"}`}
                style={{ opacity: !isRecording ? 0.5 : 1 }}
              >
                ⏹️ 結束錄製
              </button>
            </div>

            {/* 錄音狀態顯示 */}
            {isRecording && (
              <div
                className="children-card"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)",
                  color: "white",
                  textAlign: "center",
                  marginBottom: "24px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    className="children-record-btn recording"
                    style={{ width: "24px", height: "24px" }}
                  >
                    🔴
                  </div>
                  <span
                    style={{
                      fontSize: "var(--font-size-lg)",
                      fontWeight: "bold",
                    }}
                  >
                    正在錄音中... {Math.floor(recordingTime / 60)}:
                    {String(recordingTime % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>
            )}

            {/* 音訊播放 */}
            {audioUrl && (
              <div
                className="children-card"
                style={{ textAlign: "center", marginBottom: "24px" }}
              >
                <h4
                  style={{ color: "var(--text-primary)", marginBottom: "12px" }}
                >
                  🎧 預覽錄音
                </h4>
                <audio src={audioUrl} controls style={{ maxWidth: "100%" }} />
              </div>
            )}

            {/* 範例文本 */}
            <div
              className="children-card"
              style={{
                background: "var(--bg-secondary)",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                  fontSize: "var(--font-size-md)",
                }}
              >
                📖 範例文本
              </h4>
              <p
                style={{
                  background: "var(--bg-card)",
                  padding: "16px",
                  borderRadius: "var(--border-radius-md)",
                  color: "var(--text-primary)",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                從前有一座美麗的森林，住著一隻聰明的小狐狸叫小紅。她最喜歡在夜晚抬頭看星星。有一天，小紅發現天上有一顆特別明亮的星星，閃爍著她從未見過的光芒。
              </p>
            </div>

            {/* 提交表單 */}
            <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
              <button
                type="submit"
                className="children-btn children-btn-primary children-btn-large"
                disabled={!audioBlob || isLoading}
                style={{
                  opacity: !audioBlob || isLoading ? 0.5 : 1,
                  marginBottom: "20px",
                }}
              >
                {isLoading ? "🔄 上傳中..." : "🚀 提交語音模型"}
              </button>
            </form>

            {/* 返回按鈕 */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => navigate("/style")}
                className="children-btn children-btn-secondary"
              >
                🏠 返回故事生成
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 載入遮罩 */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="children-card"
            style={{ textAlign: "center", maxWidth: "300px" }}
          >
            <div className="children-loading">
              <div className="children-loading-spinner"></div>
            </div>
            <p
              style={{
                color: "var(--text-primary)",
                fontSize: "var(--font-size-lg)",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              🎵 正在處理您的語音...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
