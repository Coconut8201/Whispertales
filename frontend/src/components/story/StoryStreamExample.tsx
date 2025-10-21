/**
 * 故事串流生成範例組件
 * 展示如何使用 StoryService.generateStoryStream 即時顯示生成的故事
 */

import { useState } from "react";
import { StoryService } from "../../services/storyService";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress.tsx";

interface StoryStreamExampleProps {
  roleForm: any; // 角色表單數據
  voiceModelName: string; // 語音模型名稱
}

export const StoryStreamExample: React.FC<StoryStreamExampleProps> = ({
  roleForm,
  voiceModelName,
}) => {
  const [storyContent, setStoryContent] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [abortFunction, setAbortFunction] = useState<(() => void) | null>(null);

  /**
   * 開始生成故事（串流模式）
   */
  const handleGenerateStory = async () => {
    // 重置狀態
    setStoryContent("");
    setImages([]);
    setProgress(0);
    setStatus("準備開始...");
    setIsGenerating(true);

    try {
      const abort = await StoryService.generateStoryStream(
        roleForm,
        voiceModelName,
        {
          // 收到故事片段
          onStory: (content, progressValue) => {
            setStoryContent((prev) => prev + content);
            setProgress(progressValue);
          },

          // 收到圖片
          onImages: (imageUrls) => {
            setImages(imageUrls);
            setStatus("圖片已生成");
          },

          // 狀態更新
          onStatus: (message) => {
            setStatus(message);
          },

          // 生成完成
          onComplete: (metadata) => {
            setStatus("生成完成！");
            setIsGenerating(false);
            console.log("故事元數據:", metadata);
          },

          // 發生錯誤
          onError: (error) => {
            setStatus(`錯誤: ${error}`);
            setIsGenerating(false);
          },
        },
      );

      // 保存 abort 函數供取消使用
      setAbortFunction(() => abort);
    } catch (error) {
      console.error("啟動故事生成失敗:", error);
      setStatus("無法啟動故事生成");
      setIsGenerating(false);
    }
  };

  /**
   * 取消生成
   */
  const handleCancel = () => {
    if (abortFunction) {
      abortFunction();
      setStatus("已取消");
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">故事生成（串流模式）</h2>

        {/* 控制按鈕 */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleGenerateStory}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? "生成中..." : "開始生成故事"}
          </Button>

          {isGenerating && (
            <Button onClick={handleCancel} variant="destructive">
              取消
            </Button>
          )}
        </div>

        {/* 狀態顯示 */}
        {status && (
          <div className="text-sm text-gray-600 mb-2">狀態: {status}</div>
        )}

        {/* 進度條 */}
        {isGenerating && (
          <div className="mb-4">
            <Progress value={progress} className="w-full" />
            <div className="text-sm text-gray-600 text-center mt-1">
              {progress}%
            </div>
          </div>
        )}

        {/* 故事內容 */}
        {storyContent && (
          <Card className="p-4 bg-gray-50 mb-4">
            <h3 className="text-lg font-semibold mb-2">故事內容：</h3>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {storyContent}
            </div>
          </Card>
        )}

        {/* 圖片顯示 */}
        {images.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">生成的圖片：</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`故事插圖 ${index + 1}`}
                  className="w-full rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
