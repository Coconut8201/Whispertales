import React, { useState, useRef } from "react";
import {
  createSpeechRecognition,
  SpeechRecognitionService,
} from "../../utils/speechRecognition";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Mic, MicOff, Trash2, FileText, AlertCircle } from "lucide-react";

interface DescriptionFormProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const DescriptionForm: React.FC<DescriptionFormProps> = ({
  description,
  onDescriptionChange,
  disabled = false,
  error,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string>("");
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);

  const startRecording = () => {
    setRecordingError("");

    if (!SpeechRecognitionService.isSupported()) {
      const errorMsg =
        "您的瀏覽器不支援語音輸入功能。請使用 Chrome、Edge 或 Safari 瀏覽器。";
      setRecordingError(errorMsg);
      alert(errorMsg);
      return;
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stopRecording();
      speechRecognitionRef.current = null;
    }

    console.log("[DescriptionForm] 開始創建語音識別服務");

    const speechRecognition = createSpeechRecognition(
      {
        lang: "zh-TW",
        continuous: true,
        interimResults: true,
      },
      {
        onResult: (transcript) => {
          console.log("[DescriptionForm] 收到語音結果:", transcript);
          const newDescription = description
            ? `${description} ${transcript}`
            : transcript;
          onDescriptionChange(newDescription);
        },
        onError: (error) => {
          console.error("[DescriptionForm] 語音識別錯誤:", error);
          setIsRecording(false);
          setRecordingError(error);

          if (error.includes("權限") || error.includes("not-allowed")) {
            alert(error);
          }
        },
        onStart: () => {
          console.log("[DescriptionForm] 語音識別已啟動");
          setIsRecording(true);
          setRecordingError("");
        },
        onEnd: () => {
          console.log("[DescriptionForm] 語音識別已結束");
          setIsRecording(false);
        },
      },
    );

    speechRecognitionRef.current = speechRecognition;

    const started = speechRecognition.startRecording();
    console.log("[DescriptionForm] 啟動結果:", started);

    if (!started) {
      const errorMsg = "無法開始語音識別，請檢查麥克風權限";
      setRecordingError(errorMsg);
      alert(errorMsg);
    }
  };

  const stopRecording = () => {
    console.log("[DescriptionForm] 停止錄音");
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stopRecording();
      speechRecognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const clearDescription = () => {
    onDescriptionChange("");
  };

  const wordCount = description.trim().length;
  // const isValid = wordCount >= 10 && wordCount <= 1000;

  return (
    <Card className={`border-2 shadow-children-sm hover:shadow-children-md transition-all ${error ? 'border-red-300' : 'border-children-success/20'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-children-success flex items-center gap-2">
            <FileText className="w-5 h-5" />
            故事內容描述
          </CardTitle>
          <div className={`text-xs px-2 py-1 rounded-full font-bold ${wordCount < 10 ? 'bg-red-100 text-red-600' :
              wordCount > 1000 ? 'bg-red-100 text-red-600' :
                'bg-green-100 text-green-600'
            }`}>
            {wordCount} / 1000 字
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <textarea
            className={`flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y pr-12 
              ${error ? 'border-red-300 focus-visible:ring-red-400' : 'border-children-success/30 focus-visible:ring-children-success'}`}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="告訴我你想要什麼樣的故事...
例如：小兔子和小熊是好朋友，他們一起去森林裡探險，遇到了魔法師..."
            disabled={disabled}
          />

          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="icon"
              variant={isRecording ? "destructive" : "secondary"}
              className={`rounded-full shadow-sm transition-all ${isRecording ? 'animate-pulse' : ''}`}
              disabled={disabled}
              title={isRecording ? "停止錄音" : "開始語音輸入"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {description && (
              <Button
                onClick={clearDescription}
                size="icon"
                variant="ghost"
                className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                disabled={disabled}
                title="清除內容"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 錄音狀態提示 */}
        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-red-500 font-bold animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            正在錄音...請說出你的故事內容
          </div>
        )}

        {/* 錄音錯誤提示 */}
        {recordingError && !isRecording && (
          <div className="flex items-center gap-2 text-sm bg-red-50 text-red-600 p-2 rounded-md border border-red-100">
            <AlertCircle className="w-4 h-4" />
            {recordingError}
          </div>
        )}

        {/* 狀態提示 */}
        {error ? (
          <p className="text-sm text-red-500 font-bold flex items-center gap-1">
            ⚠️ {error}
          </p>
        ) : wordCount < 10 ? (
          <p className="text-xs text-orange-400">
            👉 再多寫一點，至少需要 10 個字喔！
          </p>
        ) : (
          <p className="text-xs text-green-500 font-bold flex items-center gap-1">
            ✅ 很棒！內容長度剛好
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptionForm;
