import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { userRegister } from "../utils/tools/fetch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Loading } from "./ui/loading";
import { Badge } from "./ui/badge";
import { UserPlus, User, Lock, ArrowLeft, Heart, Sparkles, CheckCircle, Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await userRegister(username, password);
            if (result.success) {
                // Success - maybe show a success modal or redirect
                // For now alerting but UI feedback would be better 
                // navigate(`/login`); we will do this after a small delay to show success
                setTimeout(() => navigate('/login'), 1500);
            } else if (result.code === 401) {
                setError("這個使用者名稱已經被使用了！請試試別的名稱。");
            } else {
                setError("註冊失敗，請稍後再試。");
            }
        } catch (err) {
            setError("發生錯誤，請稍後再試。");
            console.error("Registration error:", err);
        } finally {
            if (!error) setIsLoading(false); // Only stop loading if success or we handle it inside
        }
    };

    // If successful registration (detected via isLoading state potentially or a success state), we could show different UI
    // But for simplicity with existing logic:

    return (
        <div className="min-h-screen bg-gradient-to-br from-children-bg-primary via-blue-50 to-children-bg-secondary flex items-center justify-center p-2 sm:p-3 md:p-4">
            <div className="w-full max-w-md px-2">
                {/* Logo 和標題 */}
                <div className="text-center mb-2 sm:mb-3">
                    <div className="text-3xl sm:text-4xl mb-1 sm:mb-1.5">✨</div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-children-primary via-children-accent to-children-secondary bg-clip-text text-transparent">
                        WhisperTales
                    </h1>
                    <p className="text-xs sm:text-sm text-children-text-secondary mt-0.5">
                        加入我們，開始你的奇幻故事之旅！
                    </p>
                </div>

                <Card className="shadow-children-medium border-2 border-children-primary/20">
                    <CardHeader className="text-center space-y-0.5 sm:space-y-1 pb-2 sm:pb-3 px-3 sm:px-4">
                        <CardTitle className="text-base sm:text-lg md:text-xl !leading-tight text-children-primary flex items-center justify-center gap-2">
                            <UserPlus className="w-5 h-5" /> 創建新帳號
                        </CardTitle>
                        <CardDescription>
                            填寫以下資料來註冊
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-3 sm:px-4 pb-2 sm:pb-3">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 錯誤訊息 */}
                            {error && (
                                <div className="bg-red-50 border border-red-300 rounded-lg p-2 text-center animate-shake">
                                    <p className="text-red-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-1">
                                        <span className="text-lg">⚠️</span> {error}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                    <User className="w-4 h-4 text-children-primary" /> 使用者名稱
                                </label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="例如: StoryHero123"
                                    required
                                    disabled={isLoading}
                                    className="border-gray-200 focus:border-children-primary focus:ring-children-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                    <Lock className="w-4 h-4 text-children-primary" /> 設定密碼
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="設定一個安全的密碼"
                                        required
                                        disabled={isLoading}
                                        className="pr-10 border-gray-200 focus:border-children-primary focus:ring-children-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-children-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-lg font-bold bg-gradient-to-r from-children-success to-green-500 hover:from-green-500 hover:to-green-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                disabled={isLoading}
                            >
                                {isLoading ? "註冊中..." : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" /> 立即註冊
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-3 sm:px-4 pb-4 bg-gray-50/50 rounded-b-xl border-t border-gray-100 mt-2 pt-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            已經有帳號了嗎？
                            <Link to="/login" className="text-children-primary font-bold hover:underline">
                                直接登入
                            </Link>
                        </div>

                        <Link to="/login" className="w-full">
                            <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                                <ArrowLeft className="w-4 h-4 mr-2" /> 返回登入頁面
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* 底部徽章 */}
                <div className="mt-4 flex justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-white/50 border-white text-children-text-secondary">
                        <Heart className="w-3 h-3 mr-1 text-red-400" /> 永久免費
                    </Badge>
                    <Badge variant="outline" className="bg-white/50 border-white text-children-text-secondary">
                        <CheckCircle className="w-3 h-3 mr-1 text-green-400" /> 簡單易用
                    </Badge>
                </div>
            </div>

            {/* 成功彈窗/遮罩 */}
            {isLoading && !error && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <Card className="w-auto p-8 shadow-2xl animate-scale-in">
                        <Loading size="lg" emoji="🎉" message="正在創建您的帳號..." />
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Register;