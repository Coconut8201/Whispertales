import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { userRegister } from "../utils/tools/fetch";
import '../styles/ChildrenTheme.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await userRegister(username, password);
        if (result.success) {
            alert('🎉 註冊成功！歡迎加入 Whisper Tales 大家庭，即將回到登入頁面！');
            console.log(`使用者 ${username} 註冊成功`);
            navigate(`/login`);
        } else if(result.code == 401) {
            alert("⚠️ 這個使用者名稱已經被使用了！請試試別的名稱或確認是否已有帳號。");
        } else {
            alert('😔 註冊失敗，請稍後再試。');
            console.log('註冊失敗');
        }
        setIsLoading(false);
    };

    return (
        <div className="children-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="children-card" style={{ width: '400px', textAlign: 'center' }}>
                <div className="children-header" style={{ marginBottom: '32px', borderRadius: 'var(--border-radius-lg)' }}>
                    <h1>✨ WHISPER TALES ✨</h1>
                </div>

                <h2 style={{
                    fontSize: 'var(--font-size-xl)',
                    color: 'var(--text-primary)',
                    marginBottom: '24px',
                    fontWeight: 'bold'
                }}>
                    🌟 創建新帳號
                </h2>

                <p style={{
                    fontSize: 'var(--font-size-md)',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px'
                }}>
                    加入我們，開始你的奇幻故事之旅！
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="👤 選擇一個獨特的使用者名稱"
                            className="children-input"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="🔒 設定你的安全密碼"
                            className="children-input"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="children-btn children-btn-success children-btn-large"
                        disabled={isLoading}
                        style={{ marginTop: '16px' }}
                    >
                        {isLoading ? '🔄 註冊中...' : '🎊 立即註冊！'}
                    </button>
                </form>

                <div style={{ marginTop: '32px' }}>
                    <p style={{
                        fontSize: 'var(--font-size-md)',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        marginBottom: '16px'
                    }}>
                        已經有帳號了嗎？
                        <a
                            href="/login"
                            style={{
                                color: 'var(--info-color)',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}
                        >
                            🔑 直接登入
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;