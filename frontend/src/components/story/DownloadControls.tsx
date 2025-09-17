import React, { useState } from 'react';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { StoryData } from '../../utils/storyPlayer';
import '../../styles/ChildrenTheme.css';

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
    <div className={`children-card ${className}`}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ 
          color: '#ff6b6b', 
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          📥 下載我的故事書
        </h3>

        {/* 下載選項 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {/* 下載類型選擇 */}
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#2d3436'
            }}>
              <input
                type="radio"
                value="pdf"
                checked={downloadType === 'pdf'}
                onChange={(e) => setDownloadType(e.target.value as 'pdf')}
                disabled={disabled || isDownloading}
              />
              📄 PDF格式
            </label>

            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#2d3436'
            }}>
              <input
                type="radio"
                value="zip"
                checked={downloadType === 'zip'}
                onChange={(e) => setDownloadType(e.target.value as 'zip')}
                disabled={disabled || isDownloading}
              />
              📦 完整包 (PDF + 圖片 + 文字)
            </label>
          </div>

          {/* 注音選項 */}
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#2d3436',
            marginBottom: '16px'
          }}>
            <input
              type="checkbox"
              checked={showZhuyin}
              onChange={(e) => setShowZhuyin(e.target.checked)}
              disabled={disabled || isDownloading}
            />
            🔤 包含注音符號 (適合學習中文)
          </label>
        </div>

        {/* 下載按鈕 */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          {downloadType === 'pdf' ? (
            <>
              <button
                onClick={handlePreviewPDF}
                disabled={disabled || isDownloading}
                className="children-btn children-btn-secondary"
                style={{ 
                  fontSize: '14px',
                  padding: '12px 20px',
                  minWidth: '120px'
                }}
              >
                {isDownloading ? '⏳ 準備中...' : '👀 預覽PDF'}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                disabled={disabled || isDownloading}
                className="children-btn children-btn-primary"
                style={{ 
                  fontSize: '14px',
                  padding: '12px 20px',
                  minWidth: '120px'
                }}
              >
                {isDownloading ? '⏳ 下載中...' : '📄 下載PDF'}
              </button>
            </>
          ) : (
            <button
              onClick={handleDownloadZIP}
              disabled={disabled || isDownloading}
              className="children-btn children-btn-primary"
              style={{ 
                fontSize: '14px',
                padding: '12px 20px',
                minWidth: '140px'
              }}
            >
              {isDownloading ? '⏳ 打包中...' : '📦 下載完整包'}
            </button>
          )}
        </div>

        {/* 下載信息 */}
        <div style={{ 
          fontSize: '12px', 
          color: '#636e72',
          marginBottom: '12px'
        }}>
          📊 包含 {downloadCount} 張圖片和 {storyLines.length} 頁故事
        </div>

        {/* 下載說明 */}
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#636e72',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>
            💡 下載說明：
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            <li>📄 <strong>PDF格式</strong>：適合閱讀和列印的電子書</li>
            <li>📦 <strong>完整包</strong>：包含PDF、原始圖片和故事文字檔案</li>
            <li>🔤 <strong>注音符號</strong>：幫助小朋友學習中文發音</li>
            <li>💾 下載的檔案會保存到你的下載資料夾</li>
          </ul>
        </div>

        {/* 加載狀態 */}
        {isDownloading && (
          <div style={{ 
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#4ecdc4',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <div className="children-loading-spinner" style={{ 
              width: '20px', 
              height: '20px',
              borderWidth: '2px'
            }}></div>
            正在準備你的故事書...
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadControls;