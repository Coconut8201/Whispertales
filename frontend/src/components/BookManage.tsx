import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBookList, verifyAuth, userLogout } from "../utils/tools/fetch";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loading } from "./ui/loading";
import ChildrenHeader from "./story/ChildrenHeader";
import { Search, BookOpen, Clock, AlertCircle, ArrowRight } from "lucide-react";

// bookManageList 類型定義
interface bookManageList {
  bookId: string;
  bookName: string;
  bookFirstImageBase64?: string;
  createTime?: string; // 假設有這個欄位，如果後端支持的話
}

export default function BookManage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<bookManageList[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const verifyAuthStatus = await verifyAuth();
        setIsLogin(verifyAuthStatus.isAuthenticated);
        if (!verifyAuthStatus.isAuthenticated) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        navigate("/login");
      }
    };
    checkLoginStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getBookList();
        if (!result) {
          setError("獲取書籍列表失敗");
        } else {
          setOptions(result);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "獲取書籍列表時發生錯誤";
        setError(errorMessage);
        console.error("獲取書籍列表錯誤：", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLogin) {
      fetchBooks();
    }
  }, [isLogin]);

  const handleLogout = async () => {
    try {
      const { success } = await userLogout();
      if (success) {
        setIsLogin(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  const handleBookSelect = (bookName: string, bookId: string) => {
    setSearchQuery(bookName);
    setSelectedBookId(bookId);
  };

  const handleStartReading = (bookId: string) => {
    navigate(`/style/role/startStory?query=${encodeURIComponent(bookId)}`);
  };

  // 過濾書籍
  const filteredOptions = options.filter((book: bookManageList) =>
    book.bookName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary flex flex-col">
      <ChildrenHeader
        isLogin={isLogin}
        onLogout={handleLogout}
        title="📚 我的故事書櫃"
        showNavButtons={true}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* 搜尋區域 */}
        <Card className="border-none shadow-children-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="搜尋你的故事書..."
                  className="pl-10 h-12 text-lg rounded-full border-2 border-children-secondary/30 focus:border-children-secondary focus:ring-children-secondary/20"
                />
              </div>
              <Button
                onClick={() => navigate('/style')}
                className="w-full md:w-auto bg-children-primary hover:bg-children-primary/90 text-white rounded-full px-8 h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all"
              >
                ✨ 創作新故事
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 書籍列表 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BookOpen className="w-6 h-6 text-children-primary" />
            <h2 className="text-2xl font-bold text-gray-800">所有故事 ({filteredOptions.length})</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loading size="lg" emoji="📚" message="正在整理書櫃..." />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-white rounded-xl shadow-sm p-8">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-bold">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                重試
              </Button>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">還沒有找到故事書喔</h3>
              <p className="text-gray-500 mb-6">快去創作你的第一本故事書吧！</p>
              <Button
                onClick={() => navigate('/style')}
                variant="default"
                size="lg"
                className="animate-bounce-slow"
              >
                ✨ 去創作
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOptions.map((book: bookManageList) => (
                <Card
                  key={book.bookId}
                  className={`
                    group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-none
                    ${selectedBookId === book.bookId ? 'ring-4 ring-children-secondary shadow-xl scale-[1.02]' : 'shadow-children-card hover:shadow-children-medium'}
                  `}
                  onClick={() => handleBookSelect(book.bookName, book.bookId)}
                  onDoubleClick={() => handleStartReading(book.bookId)}
                >
                  {/* 書籍封面 */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    {book.bookFirstImageBase64 ? (
                      <img
                        src={`data:image/png;base64,${book.bookFirstImageBase64}`}
                        alt={book.bookName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/Assets/default-cover.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-children-bg-secondary text-children-secondary">
                        <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm font-medium">暫無封面</span>
                      </div>
                    )}

                    {/* 懸停遮罩 */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <Button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleStartReading(book.bookId);
                        }}
                        className="bg-white text-children-primary hover:bg-children-primary hover:text-white rounded-full px-6 font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                      >
                        立即閱讀 <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* 書籍信息 */}
                  <CardContent className="p-4 bg-white relative z-10">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-children-primary transition-colors">
                      {book.bookName}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 gap-2">
                      <Clock className="w-3 h-3" />
                      <span>最近閱讀</span>
                    </div>
                  </CardContent>

                  {/* 選中標記 */}
                  {selectedBookId === book.bookId && (
                    <div className="absolute top-3 right-3 bg-children-secondary text-white rounded-full p-1 shadow-md z-20 animate-scale-in">
                      <div className="w-2 h-2 rounded-full bg-white m-1"></div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
