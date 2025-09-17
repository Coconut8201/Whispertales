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
  private lastResult: string = '';
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor(
    config: SpeechRecognitionConfig = {},
    callbacks: SpeechRecognitionCallbacks = {}
  ) {
    this.callbacks = callbacks;
    this.initializeRecognition(config);
  }

  private initializeRecognition(config: SpeechRecognitionConfig) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('您的瀏覽器不支援語音識別功能');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = config.lang || 'zh-TW';
    this.recognition.continuous = config.continuous !== undefined ? config.continuous : true;
    this.recognition.interimResults = config.interimResults !== undefined ? config.interimResults : true;

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          
          // 避免重複添加相同的結果
          if (transcript !== this.lastResult) {
            finalTranscript += transcript;
            this.lastResult = transcript;
          }
        }
      }
      
      if (finalTranscript && this.callbacks.onResult) {
        this.callbacks.onResult(finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('語音識別錯誤:', event.error);
      this.isRecording = false;
      
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }
    };

    this.recognition.onstart = () => {
      this.isRecording = true;
      
      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }
    };

    this.recognition.onend = () => {
      // 如果還在錄音狀態，自動重新開始
      if (this.isRecording) {
        this.recognition.start();
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
      console.error('語音識別功能不可用');
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('開始語音識別失敗:', error);
      return false;
    }
  }

  /**
   * 停止語音識別
   */
  public stopRecording(): void {
    if (this.recognition) {
      this.isRecording = false;
      this.recognition.stop();
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
    this.lastResult = '';
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
  callbacks: SpeechRecognitionCallbacks = {}
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
    onError?: (error: string) => void
  ) => {
    if (!SpeechRecognitionService.isSupported()) {
      console.error('您的瀏覽器不支援語音識別');
      return false;
    }

    recognition = createSpeechRecognition(
      {
        lang: 'zh-TW',
        continuous: true,
        interimResults: true
      },
      {
        onResult,
        onError,
        onStart: () => { isRecording = true; },
        onEnd: () => { isRecording = false; }
      }
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
    isSupported: SpeechRecognitionService.isSupported()
  };
};