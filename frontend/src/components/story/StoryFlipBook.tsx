import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import HTMLFlipBook from "react-pageflip";
import '../../styles/ChildrenTheme.css';

interface PageProps {
  image: string;
  text: string | JSX.Element;
  isLeft?: boolean;
  isSpreadImage?: boolean;
}

interface StoryFlipBookProps {
  pages: PageProps[];
  onPageChange?: (pageIndex: number) => void;
  showPageNumbers?: boolean;
  className?: string;
}

export interface StoryFlipBookRef {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (pageIndex: number) => void;
  getCurrentPage: () => number;
}

// 單頁組件
const StoryPage = forwardRef<HTMLDivElement, PageProps>(
  ({ image, text, isLeft = true, isSpreadImage = false }, ref) => {
    return (
      <div 
        className="story-page" 
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        {/* 圖片區域 */}
        <div style={{
          width: '100%',
          height: '70%',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '8px 8px 0 0'
        }}>
          <img
            src={`data:image/png;base64,${image}`}
            alt="Story illustration"
            style={{
              width: isSpreadImage ? '200%' : '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: isSpreadImage && !isLeft ? 'translateX(-50%)' : 'none'
            }}
            onError={(e) => {
              console.error('圖片載入失敗:', e);
              // 可以設置一個預設圖片
            }}
          />
        </div>
        
        {/* 文字區域 */}
        <div style={{
          height: '30%',
          padding: '16px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          borderRadius: '0 0 8px 8px'
        }}>
          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#2d3436',
            fontFamily: "'Noto Sans TC', sans-serif",
            maxHeight: '100%',
            overflow: 'auto'
          }}>
            {typeof text === 'string' ? (
              <pre style={{ 
                margin: 0, 
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}>
                {text}
              </pre>
            ) : (
              text
            )}
          </div>
        </div>
      </div>
    );
  }
);

// 封面頁組件
const CoverPage = forwardRef<HTMLDivElement, { title: string; image?: string }>(
  ({ title, image }, ref) => {
    return (
      <div 
        className="story-cover-page"
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          fontFamily: "'Noto Sans TC', sans-serif"
        }}>
          🌟 {title} 🌟
        </h1>
        
        {image && (
          <div style={{
            width: '200px',
            height: '150px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            marginBottom: '20px'
          }}>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Story cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
        
        <p style={{
          fontSize: '18px',
          opacity: 0.9,
          fontWeight: '500'
        }}>
          📖 點擊右下角開始閱讀
        </p>
      </div>
    );
  }
);

// 結束頁組件
const EndPage = forwardRef<HTMLDivElement, { onRestart?: () => void }>(
  ({ onRestart }, ref) => {
    return (
      <div 
        className="story-end-page"
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #74b9ff 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          🎉
        </div>
        
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          fontFamily: "'Noto Sans TC', sans-serif"
        }}>
          故事結束了！
        </h2>
        
        <p style={{
          fontSize: '18px',
          opacity: 0.9,
          marginBottom: '30px'
        }}>
          希望你喜歡這個美麗的故事 ✨
        </p>
        
        {onRestart && (
          <button
            onClick={onRestart}
            className="children-btn children-btn-primary"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white'
            }}
          >
            🔄 重新閱讀
          </button>
        )}
      </div>
    );
  }
);

const StoryFlipBook = forwardRef<StoryFlipBookRef, StoryFlipBookProps>(
  ({ pages, onPageChange, showPageNumbers = true, className = '' }, ref) => {
    const flipBookRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      nextPage: () => {
        if (flipBookRef.current) {
          flipBookRef.current.getPageFlip().flipNext();
        }
      },
      prevPage: () => {
        if (flipBookRef.current) {
          flipBookRef.current.getPageFlip().flipPrev();
        }
      },
      goToPage: (pageIndex: number) => {
        if (flipBookRef.current) {
          flipBookRef.current.getPageFlip().flip(pageIndex);
        }
      },
      getCurrentPage: () => {
        if (flipBookRef.current) {
          return flipBookRef.current.getPageFlip().getCurrentPageIndex();
        }
        return 0;
      }
    }));

    const handlePageChange = (e: any) => {
      if (onPageChange) {
        onPageChange(e.data);
      }
    };

    const allPages = [
      // 封面頁
      <CoverPage
        key="cover"
        title="我的故事書"
        image={pages[0]?.image}
      />,
      // 故事頁面
      ...pages.map((page, index) => (
        <StoryPage
          key={`page-${index}`}
          image={page.image}
          text={page.text}
          isLeft={index % 2 === 0}
          isSpreadImage={page.isSpreadImage}
        />
      )),
      // 結束頁
      <EndPage
        key="end"
        onRestart={() => {
          if (flipBookRef.current) {
            flipBookRef.current.getPageFlip().flip(0);
          }
        }}
      />
    ];

    return (
      <div className={`story-flipbook-container ${className}`} style={{ position: 'relative' }}>
        <HTMLFlipBook
          ref={flipBookRef}
          width={400}
          height={600}
          size="stretch"
          minWidth={300}
          maxWidth={800}
          minHeight={400}
          maxHeight={1000}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={handlePageChange}
          className="demo-book"
          style={{
            margin: '0 auto'
          }}
        >
          {allPages}
        </HTMLFlipBook>
        
        {/* 頁數顯示 */}
        {showPageNumbers && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            📄 {Math.max(0, pages.length)} 頁
          </div>
        )}
      </div>
    );
  }
);

export default StoryFlipBook;