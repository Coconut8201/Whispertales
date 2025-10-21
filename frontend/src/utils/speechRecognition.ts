// 語音識別工具函數
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export interface SpeechRecognitionConfig {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionCallbacks {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isRecording: boolean = false;
  private lastResult: string = "";
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor(
    config: SpeechRecognitionConfig = {},
    callbacks: SpeechRecognitionCallbacks = {},
  ) {
    this.callbacks = callbacks;
    this.initializeRecognition(config);
  }

  private initializeRecognition(config: SpeechRecognitionConfig) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("您的瀏覽器不支援語音識別功能");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = config.lang || "zh-TW";
    this.recognition.continuous =
      config.continuous !== undefined ? config.continuous : true;
    this.recognition.interimResults =
      config.interimResults !== undefined ? config.interimResults : true;

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();

          // 避免重複添加相同的結果
          if (transcript && transcript !== this.lastResult) {
            finalTranscript += transcript;
            this.lastResult = transcript;
          }
        }
      }

      if (finalTranscript && this.callbacks.onResult) {
        console.log("[SpeechRecognition] 識別結果:", finalTranscript);
        this.callbacks.onResult(finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("[SpeechRecognition] 錯誤:", event.error);

      // 某些錯誤不應該停止錄音（如 no-speech）
      if (event.error === "aborted" || event.error === "not-allowed") {
        this.isRecording = false;
      }

      if (this.callbacks.onError) {
        let errorMessage = event.error;

        // 提供更友好的錯誤信息
        switch (event.error) {
          case "not-allowed":
            errorMessage = "麥克風權限被拒絕，請在瀏覽器設置中允許麥克風訪問";
            break;
          case "no-speech":
            errorMessage = "未檢測到語音，請重試";
            break;
          case "network":
            errorMessage = "網絡錯誤，請檢查網絡連接";
            break;
          case "aborted":
            errorMessage = "語音識別被中止";
            break;
        }

        this.callbacks.onError(errorMessage);
      }
    };

    this.recognition.onstart = () => {
      console.log("[SpeechRecognition] 開始錄音");
      this.isRecording = true;

      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }
    };

    this.recognition.onend = () => {
      console.log(
        "[SpeechRecognition] 錄音結束，isRecording:",
        this.isRecording,
      );

      // 如果還在錄音狀態，自動重新開始（實現連續錄音）
      if (this.isRecording) {
        try {
          console.log("[SpeechRecognition] 自動重新啟動");
          this.recognition.start();
        } catch (error) {
          console.error("[SpeechRecognition] 重新啟動失敗:", error);
          this.isRecording = false;
          if (this.callbacks.onEnd) {
            this.callbacks.onEnd();
          }
        }
      } else if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    };
  }

  /**
   * 開始語音識別
   */
  public startRecording(): boolean {
    if (!this.recognition) {
      console.error("[SpeechRecognition] 語音識別功能不可用");
      return false;
    }

    // 如果已經在錄音，先停止再重新開始
    if (this.isRecording) {
      console.warn("[SpeechRecognition] 已在錄音中，先停止再重新開始");
      this.stopRecording();
      // 延遲一下再開始
      setTimeout(() => this.startRecording(), 100);
      return true;
    }

    try {
      console.log("[SpeechRecognition] 嘗試開始錄音");
      this.lastResult = ""; // 重置上次結果
      this.recognition.start();
      return true;
    } catch (error: any) {
      // 如果錯誤是因為已經在運行，忽略這個錯誤
      if (error.message && error.message.includes("already started")) {
        console.warn("[SpeechRecognition] 語音識別已經在運行");
        return true;
      }

      console.error("[SpeechRecognition] 開始語音識別失敗:", error);
      return false;
    }
  }

  /**
   * 停止語音識別
   */
  public stopRecording(): void {
    if (this.recognition && this.isRecording) {
      console.log("[SpeechRecognition] 停止錄音");
      this.isRecording = false; // 先設置為 false，避免 onend 中自動重啟

      try {
        this.recognition.stop();
      } catch (error) {
        console.error("[SpeechRecognition] 停止錄音失敗:", error);
      }
    }
  }

  /**
   * 獲取當前錄音狀態
   */
  public getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * 重置識別服務
   */
  public reset(): void {
    this.stopRecording();
    this.lastResult = "";
  }

  /**
   * 檢查瀏覽器是否支援語音識別
   */
  public static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

/**
 * 創建語音識別服務的工廠函數
 */
export const createSpeechRecognition = (
  config: SpeechRecognitionConfig = {},
  callbacks: SpeechRecognitionCallbacks = {},
): SpeechRecognitionService => {
  return new SpeechRecognitionService(config, callbacks);
};

/**
 * 簡化的語音識別 Hook 類似功能
 */
export const useSpeechRecognition = () => {
  let recognition: SpeechRecognitionService | null = null;
  let isRecording = false;

  const startRecording = (
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
  ) => {
    if (!SpeechRecognitionService.isSupported()) {
      console.error("您的瀏覽器不支援語音識別");
      return false;
    }

    recognition = createSpeechRecognition(
      {
        lang: "zh-TW",
        continuous: true,
        interimResults: true,
      },
      {
        onResult,
        onError,
        onStart: () => {
          isRecording = true;
        },
        onEnd: () => {
          isRecording = false;
        },
      },
    );

    return recognition.startRecording();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stopRecording();
      isRecording = false;
    }
  };

  const getRecordingStatus = () => isRecording;

  return {
    startRecording,
    stopRecording,
    getRecordingStatus,
    isSupported: SpeechRecognitionService.isSupported(),
  };
};
