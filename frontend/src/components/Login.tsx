import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { userLogin } from "../utils/tools/fetch";
import '../styles/Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await userLogin(username, password);
        if (result.success) {
            console.log(`使用者 ${username} 登入成功`);
            navigate(`/style`);
        } else {
            setUsername('');
            setPassword('');
            alert('登入失敗，請重新登入');
            console.log('登入失敗');
        }
    };

    return (
        <div className="login-body">
        <div className="login-container">
            <h2>WHISPER TALES</h2>
            <h2>登入</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="使用者名稱"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="密碼"
                        required
                    />
                </div>
                <button type="submit" className="login-button">登入</button>
            </form>
            <p className="register-link">
                還沒有帳號？<a href="/login/register">立即註冊</a>
            </p>
            <p className="register-link">
                <a href="/style">返回畫面</a>
            </p>
        </div>
        </div>
    );
}

export default Login;