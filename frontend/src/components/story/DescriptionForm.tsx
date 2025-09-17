import React, { useState, useRef } from 'react';
import { createSpeechRecognition, SpeechRecognitionService } from '../../utils/speechRecognition';
import '../../styles/ChildrenTheme.css';

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
  error
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);

  const startRecording = () => {
    if (!SpeechRecognitionService.isSupported()) {
      alert('您的瀏覽器不支援語音輸入功能');
      return;
    }

    const speechRecognition = createSpeechRecognition(
      {
        lang: 'zh-TW',
        continuous: true,
        interimResults: true
      },
      {
        onResult: (transcript) => {
          // 將新的語音內容添加到現有描述後面
          onDescriptionChange(description + ' ' + transcript);
        },
        onError: (error) => {
          console.error('語音識別錯誤:', error);
          setIsRecording(false);
          alert('語音識別發生錯誤，請重試');
        },
        onStart: () => {
          setIsRecording(true);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      }
    );

    speechRecognitionRef.current = speechRecognition;
    
    if (speechRecognition.startRecording()) {
      setIsRecording(true);
    } else {
      alert('無法開始語音識別，請檢查麥克風權限');
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stopRecording();
    }
    setIsRecording(false);
  };

  const clearDescription = () => {
    onDescriptionChange('');
  };

  const wordCount = description.trim().length;
  const isValid = wordCount >= 10 && wordCount <= 1000;

  return (
    <div className="children-card">
      <label className="children-label">
        📝 故事內容描述
      </label>
      
      <div style={{ position: 'relative' }}>
        <textarea
          className="children-textarea"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="告訴我你想要什麼樣的故事...
例如：小兔子和小熊是好朋友，他們一起去森林裡探險，遇到了魔法師..."
          disabled={disabled}
          style={{
            minHeight: '150px',
            borderColor: error ? '#ff6b6b' : isValid ? '#6bcf7f' : undefined,
            paddingRight: '80px' // 為錄音按鈕留出空間
          }}
        />
        
        {/* 語音輸入按鈕 */}
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`children-record-btn ${isRecording ? 'recording' : ''}`}
            disabled={disabled}
            title={isRecording ? '停止錄音' : '開始語音輸入'}
          >
            {isRecording ? '🛑' : '🎤'}
          </button>
          
          {description && (
            <button
              onClick={clearDescription}
              className="children-btn children-btn-warning"
              disabled={disabled}
              style={{ 
                padding: '8px',
                fontSize: '12px',
                minWidth: 'auto',
                borderRadius: '8px'
              }}
              title="清除內容"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {/* 錄音狀態提示 */}
      {isRecording && (
        <div style={{ 
          color: '#e17055', 
          fontSize: '14px', 
          marginTop: '8px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ animation: 'pulse 1.5s infinite' }}>🔴</span>
          正在錄音...請說出你的故事內容
        </div>
      )}
      
      {/* 字數統計和錯誤提示 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '14px'
      }}>
        <div style={{ 
          color: wordCount < 10 ? '#ff6b6b' : 
                wordCount > 1000 ? '#ff6b6b' : 
                '#6bcf7f'
        }}>
          📊 字數：{wordCount} / 1000
        </div>
        
        {wordCount < 10 && (
          <div style={{ color: '#ff6b6b' }}>
            還需要 {10 - wordCount} 個字
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>
          ⚠️ {error}
        </div>
      )}
      
      {!error && wordCount >= 10 && (
        <div style={{ color: '#6bcf7f', fontSize: '14px', marginTop: '8px' }}>
          ✅ 很棒！內容長度剛好
        </div>
      )}
      
      {!error && wordCount === 0 && (
        <div style={{ color: '#4ecdc4', fontSize: '14px', marginTop: '8px' }}>
          💡 點擊麥克風按鈕可以用語音輸入，或者直接打字描述你的故事想法
        </div>
      )}
    </div>
  );
};

export default DescriptionForm;