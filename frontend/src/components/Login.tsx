import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { userLogin } from "../utils/tools/fetch";
import '../styles/ChildrenTheme.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await userLogin(username, password);
        if (result.success) {
            console.log(`使用者 ${username} 登入成功`);
            navigate(`/style`);
        } else {
            setUsername('');
            setPassword('');
            alert('🚫 登入失敗，請重新檢查帳號密碼！');
            console.log('登入失敗');
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
                    🔑 歡迎回來！
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="👤 輸入你的使用者名稱"
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
                            placeholder="🔒 輸入你的密碼"
                            className="children-input"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="children-btn children-btn-primary children-btn-large"
                        disabled={isLoading}
                        style={{ marginTop: '16px' }}
                    >
                        {isLoading ? '🔄 登入中...' : '🚀 開始冒險！'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{
                        fontSize: 'var(--font-size-md)',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        還沒有帳號嗎？
                        <a
                            href="/login/register"
                            style={{
                                color: 'var(--primary-color)',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}
                        >
                            🌟 立即註冊
                        </a>
                    </p>

                    <p style={{ margin: 0 }}>
                        <a
                            href="/style"
                            className="children-btn children-btn-secondary"
                            style={{
                                textDecoration: 'none',
                                display: 'inline-block',
                                padding: '12px 24px'
                            }}
                        >
                            🏠 返回首頁
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;