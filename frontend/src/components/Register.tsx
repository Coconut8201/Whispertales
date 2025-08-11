import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { userRegister } from "../utils/tools/fetch";

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await userRegister(username, password);
        if (result.success) {
            alert('註冊成功，將回到登入頁面');
            console.log(`使用者 ${username} 註冊成功`);
            navigate(`/login`);
        } else if(result.code == 401) {
            alert("此使用者名稱／帳號已被使用，請確認登入或是更改名稱／帳號");
        } else {
            console.log('註冊失敗');
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <h2>WHISPER TALES</h2>
                <h2>使用者註冊</h2>
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
                    <button type="submit" className="login-button">註冊</button>
                </form>
                <p className="register-link">
                    <a href="/login">返回登入頁面</a>
                </p>
            </div>
        </div>
    );
}

export default Register;