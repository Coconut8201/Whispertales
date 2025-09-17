import React from 'react';
import '../../styles/ChildrenTheme.css';

interface VoiceSelectorProps {
  selectedVoice: string;
  voiceOptions: string[];
  onVoiceChange: (voice: string) => void;
  disabled?: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  voiceOptions,
  onVoiceChange,
  disabled = false
}) => {
  return (
    <div className="children-card">
      <label className="children-label">
        🎵 選擇故事朗讀聲音
      </label>
      <select
        className="children-select"
        value={selectedVoice}
        onChange={(e) => onVoiceChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">請選擇聲音</option>
        {voiceOptions.map((voice, index) => (
          <option key={index} value={voice}>
            {voice}
          </option>
        ))}
      </select>
      {!selectedVoice && (
        <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>
          💡 選擇一個喜歡的聲音來朗讀故事吧！
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;