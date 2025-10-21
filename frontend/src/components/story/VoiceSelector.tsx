import React from "react";
import "../../styles/ChildrenTheme.css";

interface VoiceSelectorProps {
  selectedVoice: string;
  voiceOptions: string[];
  onVoiceChange: (voice: string) => void;
  disabled?: boolean;
  optional?: boolean; // 是否為可選項（不強制選擇）
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  voiceOptions,
  onVoiceChange,
  disabled = false,
  optional = false,
}) => {
  return (
    <div className="children-card">
      <label className="children-label">
        🎵 選擇故事朗讀聲音{" "}
        {optional && (
          <span style={{ fontSize: "14px", color: "#999" }}>(可選)</span>
        )}
      </label>
      <select
        className="children-select"
        value={selectedVoice}
        onChange={(e) => onVoiceChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">
          {optional ? "暫不選擇（稍後可添加語音）" : "請選擇聲音"}
        </option>
        {voiceOptions.map((voice, index) => (
          <option key={index} value={voice}>
            {voice}
          </option>
        ))}
      </select>
      {!selectedVoice && !optional && (
        <div style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "8px" }}>
          💡 選擇一個喜歡的聲音來朗讀故事吧！
        </div>
      )}
      {!selectedVoice && optional && (
        <div style={{ color: "#ffa500", fontSize: "14px", marginTop: "8px" }}>
          ℹ️ 語音功能開發中，可以先不選擇，稍後再添加語音朗讀
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
