import React, { useState } from 'react';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { StoryData } from '../../utils/storyPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, FileText, Package, Eye, Loader2, Info } from 'lucide-react';

interface DownloadControlsProps {
  storyData: StoryData;
  storyLines: string[];
  disabled?: boolean;
  className?: string;
}

const DownloadControls: React.FC<DownloadControlsProps> = ({
  storyData,
  storyLines,
  disabled = false,
  className = ''
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showZhuyin, setShowZhuyin] = useState(false);
  const [downloadType, setDownloadType] = useState<'pdf' | 'zip'>('pdf');

  const handleDownloadPDF = async () => {
    if (disabled || isDownloading) return;

    setIsDownloading(true);
    try {
      const filename = `我的故事書_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '')}.pdf`;
      await PDFGenerator.downloadPDF(storyData, storyLines, filename, showZhuyin);
    } catch (error) {
      console.error('PDF下載失敗:', error);
      alert('PDF下載失敗，請重試');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadZIP = async () => {
    if (disabled || isDownloading) return;

    setIsDownloading(true);
    try {
      const filename = `我的故事書包_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '')}.zip`;
      await PDFGenerator.downloadZIP(storyData, storyLines, filename, showZhuyin);
    } catch (error) {
      console.error('ZIP下載失敗:', error);
      alert('ZIP下載失敗，請重試');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (disabled || isDownloading) return;

    setIsDownloading(true);
    try {
      await PDFGenerator.previewPDF(storyData, storyLines, showZhuyin);
    } catch (error) {
      console.error('PDF預覽失敗:', error);
      alert('PDF預覽失敗，請重試');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCount = storyData.image_base64?.length || 0;

  return (
    <Card className={`border-2 border-children-primary/20 shadow-children-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-children-primary flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          下載我的故事書
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 下載選項 */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-4">
            {/* 下載類型選擇 */}
            <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all ${downloadType === 'pdf' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
              <input
                type="radio"
                value="pdf"
                checked={downloadType === 'pdf'}
                onChange={(e) => setDownloadType(e.target.value as 'pdf')}
                disabled={disabled || isDownloading}
                className="accent-children-primary"
              />
              <FileText className="w-4 h-4 text-children-primary" />
              <span className="text-sm font-medium">PDF格式</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all ${downloadType === 'zip' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
              <input
                type="radio"
                value="zip"
                checked={downloadType === 'zip'}
                onChange={(e) => setDownloadType(e.target.value as 'zip')}
                disabled={disabled || isDownloading}
                className="accent-children-primary"
              />
              <Package className="w-4 h-4 text-children-primary" />
              <span className="text-sm font-medium">完整包 (圖片+文字)</span>
            </label>
          </div>

          {/* 注音選項 */}
          <div className="flex justify-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showZhuyin}
                onChange={(e) => setShowZhuyin(e.target.checked)}
                disabled={disabled || isDownloading}
                className="w-4 h-4 rounded border-gray-300 accent-children-secondary"
              />
              <span className="text-sm text-gray-700">🔤 包含注音符號 (適合學習中文)</span>
            </label>
          </div>
        </div>

        {/* 下載按鈕 */}
        <div className="flex flex-wrap justify-center gap-3">
          {downloadType === 'pdf' ? (
            <>
              <Button
                onClick={handlePreviewPDF}
                disabled={disabled || isDownloading}
                variant="outline"
                className="flex-1 min-w-[120px]"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                {isDownloading ? '準備中...' : '預覽PDF'}
              </Button>

              <Button
                onClick={handleDownloadPDF}
                disabled={disabled || isDownloading}
                className="flex-1 min-w-[120px] bg-children-primary hover:bg-children-primary/90"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isDownloading ? '下載中...' : '下載PDF'}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleDownloadZIP}
              disabled={disabled || isDownloading}
              className="flex-1 min-w-[120px] bg-children-primary hover:bg-children-primary/90"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
              {isDownloading ? '打包中...' : '下載完整包'}
            </Button>
          )}
        </div>

        {/* 下載信息 */}
        <div className="text-center text-xs text-gray-500">
          📊 包含 {downloadCount} 張圖片和 {storyLines.length} 頁故事
        </div>

        {/* 下載說明 */}
        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2 text-left border border-gray-100">
          <p className="font-bold flex items-center gap-1 text-gray-800">
            <Info className="w-3 h-3" />
            下載說明：
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>PDF格式</strong>：適合閱讀和列印的電子書</li>
            <li><strong>完整包</strong>：包含PDF、原始圖片和故事文字檔案</li>
            <li><strong>注音符號</strong>：幫助小朋友學習中文發音</li>
            <li>下載的檔案會保存到你的下載資料夾</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadControls;