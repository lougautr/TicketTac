import React, { useState } from 'react';
import '../css/Login.css';
import Footer from '../components/Footer'; 
import Header from '../components/Header'; 
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
                method: "POST",
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error("Invalid email or password. Please try again.");
            }
    
            const data = await response.json();
    
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
    
                window.dispatchEvent(new Event("storage"));
            }
    
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <Header />
            
            <div className="login-content">
                <h3>Log in to access your account</h3>

                {error && <p className="error-message">{error}</p>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-input-container">
                        <FaUser className="login-icon" />
                        <input 
                            type="text" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="login-input-container">
                        <FaLock className="login-icon" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <button data-testid="login-button" type="submit">Login</button>
                    <div className="login-register-div">
                        Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
                    </div>
                </form>
            </div>

            <Footer />
        </>
    );
};

export default Login;