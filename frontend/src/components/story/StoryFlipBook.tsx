import { forwardRef, useRef, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";

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
        className="bg-white relative overflow-hidden shadow-md rounded-lg h-full w-full"
        ref={ref}
      >
        {/* 圖片區域 */}
        <div className="w-full h-[70%] overflow-hidden relative rounded-t-lg">
          <img
            src={`data:image/png;base64,${image}`}
            alt="Story illustration"
            className={`h-full object-cover block ${isSpreadImage ? 'w-[200%]' : 'w-full'}`}
            style={{
              transform: isSpreadImage && !isLeft ? "translateX(-50%)" : "none",
            }}
            onError={(e) => {
              console.error("圖片載入失敗:", e);
            }}
          />
        </div>

        {/* 文字區域 */}
        <div className="h-[30%] p-4 bg-white flex items-center justify-center text-center rounded-b-lg">
          <div className="text-base leading-relaxed text-gray-800 font-sans max-h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {typeof text === "string" ? (
              <p className="whitespace-pre-wrap break-words m-0">
                {text}
              </p>
            ) : (
              text
            )}
          </div>
        </div>
      </div>
    );
  },
);

// 封面頁組件
const CoverPage = forwardRef<HTMLDivElement, { title: string; image?: string }>(
  ({ title, image }, ref) => {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#ff6b6b] to-[#ffd93d] flex flex-col items-center justify-center text-white text-center p-10 shadow-md rounded-lg relative overflow-hidden"
        ref={ref}
      >
        <div className="absolute inset-0 bg-white/10 pattern-dots" />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-shadow-md font-sans tracking-tight">
            🌟 {title} 🌟
          </h1>

          {image && (
            <div className="w-[200px] h-[150px] rounded-2xl overflow-hidden shadow-2xl mb-6 border-4 border-white/30 transform hover:scale-105 transition-transform duration-500">
              <img
                src={`data:image/png;base64,${image}`}
                alt="Story cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <p className="text-lg md:text-xl font-medium opacity-90 animate-pulse">
            📖 點擊右下角開始閱讀
          </p>
        </div>
      </div>
    );
  },
);

// 結束頁組件
const EndPage = forwardRef<HTMLDivElement, { onRestart?: () => void }>(
  ({ onRestart }, ref) => {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#4ecdc4] to-[#74b9ff] flex flex-col items-center justify-center text-white text-center p-10 shadow-md rounded-lg relative overflow-hidden"
        ref={ref}
      >
        <div className="absolute inset-0 bg-white/10 pattern-grid" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl mb-6 animate-bounce">
            🎉
          </div>

          <h2 className="text-3xl font-bold mb-4 text-shadow-md font-sans">
            故事結束了！
          </h2>

          <p className="text-lg opacity-90 mb-8 max-w-xs mx-auto">
            希望你喜歡這個美麗的故事 ✨
          </p>

          {onRestart && (
            <Button
              onClick={onRestart}
              variant="outline"
              className="bg-white/20 border-2 border-white text-white hover:bg-white/30 hover:text-white transition-all text-lg py-6 px-8 rounded-full"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              重新閱讀
            </Button>
          )}
        </div>
      </div>
    );
  },
);

const StoryFlipBook = forwardRef<StoryFlipBookRef, StoryFlipBookProps>(
  ({ pages, onPageChange, showPageNumbers = true, className = "" }, ref) => {
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
      },
    }));

    const handlePageChange = (e: any) => {
      if (onPageChange) {
        onPageChange(e.data);
      }
    };

    const allPages = [
      // 封面頁
      <CoverPage key="cover" title="我的故事書" image={pages[0]?.image} />,
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
      />,
    ];

    return (
      <div className={`relative ${className} perspective-1000`}>
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
          className="mx-auto shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {allPages}
        </HTMLFlipBook>

        {/* 頁數顯示 */}
        {showPageNumbers && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm z-50">
            📄 {Math.max(0, pages.length)} 頁
          </div>
        )}
      </div>
    );
  },
);

export default StoryFlipBook;
