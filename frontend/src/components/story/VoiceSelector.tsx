import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Music } from "lucide-react";

interface VoiceSelectorProps {
  selectedVoice: string;
  voiceOptions: string[];
  onVoiceChange: (voice: string) => void;
  disabled?: boolean;
  optional?: boolean;
}

const VoiceSelector = ({
  selectedVoice,
  voiceOptions,
  onVoiceChange,
  disabled = false,
  optional = false,
}: VoiceSelectorProps) => {
  return (
    <Card className="h-full border-2 border-children-secondary/20 shadow-children-sm hover:shadow-children-md transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-children-secondary flex items-center gap-2">
          <Music className="w-5 h-5" />
          故事朗讀聲音
          {optional && <span className="text-xs text-gray-400 font-normal ml-auto">(可選)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-children-secondary/30 focus-visible:ring-children-secondary"
          value={selectedVoice}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onVoiceChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">
            {optional ? "暫不選擇（稍後可添加語音）" : "請選擇聲音"}
          </option>
          {voiceOptions.map((voice: string, index: number) => (
            <option key={index} value={voice}>
              {voice}
            </option>
          ))}
        </select>

        {!selectedVoice && !optional && (
          <p className="mt-2 text-xs text-red-500 font-bold">
            💡 請選擇一個聲音！
          </p>
        )}
        {!selectedVoice && optional && (
          <p className="mt-2 text-xs text-orange-400">
            ℹ️ 稍後可以隨時添加語音
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceSelector;
