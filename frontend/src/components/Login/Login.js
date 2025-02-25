import React, { useState} from "react"
import './style.css'
import {useNavigate} from "react-router-dom"

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === "admin" || password === "finpages") {
            setError("");
            navigate("/otp");
        }else{
        setError("Invalid username or password..!");
        return;
        }
    }

    return (
        <div className="login-main-container">
        <div className="login-container">
            <div className="logo">
            <img src="https://nifty10.com/wp-content/uploads/2024/02/Logo-150x150.png" width="40px" alt="Logo" />
            </div>
            <h2>LOGIN</h2>
            {error && <p className="error">{error}</p> }
            <form onSubmit={handleSubmit}>
                <div className="input-box">
                    <label htmlFor="username">Username</label>
                    <div className="input-field">
                        <i className="fas fa-user"></i>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Enter Username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="input-box">
                    <label htmlFor="password">Password</label>
                    <div className="input-field">
                        <i className="fas fa-user"></i>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Enter Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn">LOGIN</button>
            </form>
        </div>
        </div>
    )
}

export default Login