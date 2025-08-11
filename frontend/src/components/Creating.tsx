import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { sdmodel, sdmodel_list } from "../utils/sdmodel_list";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Creating.css';
import { userLogout, verifyAuth } from "../utils/tools/fetch";

const options: sdmodel[] = sdmodel_list;

export default function Creating() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { success } = await userLogout();
            if (success) {
                setIsLogin(false);
                navigate('/login');
                alert('您已成功登出!');
            }
        } catch (error) {
            console.error('登出失敗:', error);
        }
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            let verifyAuthStaus = await verifyAuth()
            setIsLogin(verifyAuthStaus.isAuthenticated)
        };
        
        checkLoginStatus();
    }, []);

    const handleSearch = () => {
        if( isLogin == false ) {
            alert('請先登入');
            navigate('/Login');
            return;
        }
        if (searchQuery.trim()) {
            navigate(`/style/role?query=${encodeURIComponent(searchQuery)}`);
        } else {
            alert('請選擇圖片風格');
        }
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleOptionClick = (value: string) => {
        setSearchQuery(value);
    };

    return (
        <>
            <div>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </div>
            <div className="container-fluid">
                <div className="header">
                    <div className="header-content">
                        WisperTales
                    </div>
                    {isLogin && (
                        <>
                            <button onClick={() => navigate('/bookmanage')} className="login">
                                書本管理
                            </button>
                            <button onClick={() => navigate('/voice')} className="login">
                                語音管理
                            </button>
                        </>
                    )}
                    <button onClick={() => navigate('/login')} className="login">
                        { isLogin ? "已登入" : "未登入" }
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="login"
                    >
                        登出
                    </button>
                </div>
                <div className="body-content">
                    <div className="row mt-4 mb-3">
                        <div className="mx-auto">
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="選擇故事圖片風格"
                                    readOnly
                                    className="form-control border-left-0 rounded-pill custom-search-input non-editable AAA"
                                />
                                <div className="input-group-append">
                                    <button onClick={handleSearch} className="button-submit AAA">選擇</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {options.map((option, index) => (
                            <div
                                key={`${option.show_name}-${index}`}
                                className="col-md-3 mb-4"
                                onClick={() => handleOptionClick(option.show_name)}
                                onDoubleClick={handleSearch}
                            >
                                <div className="card h-100">
                                    <img src={option.image_path} alt={option.show_name} className="card-img-top" />
                                    <div className="card-body text-center">
                                        <p className="card-text">{option.show_name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
