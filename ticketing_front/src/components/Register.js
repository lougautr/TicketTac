import React, { useState } from 'react';
import '../css/Register.css';
import Footer from '../components/Footer'; 
import Header from '../components/Header'; 
import { FaLock, FaEnvelope, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [first_name, setFirst_name] = useState('');
    const [last_name, setLast_name] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
    
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
    
        const userData = {
            email,
            first_name,
            last_name,
            password
        };
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Registration failed. Please try again.");
            }
    
            navigate('/login'); 
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <Header />
            
            <div className="register-content">
                <h3>Create your account</h3>

                {error && <p className="error-message">{error}</p>}

                <form className="register-form" onSubmit={handleRegister}>
                    <div className="register-input-container">
                        <FaEnvelope className="register-icon" />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="register-input-container">
                        <FaUser className="register-icon" />
                        <input 
                            type="text" 
                            placeholder="First Name" 
                            value={first_name} 
                            onChange={(e) => setFirst_name(e.target.value)} 
                            required
                        />
                    </div>
                    
                    <div className="register-input-container">
                        <FaUser className="register-icon" />
                        <input 
                            type="text" 
                            placeholder="Last Name" 
                            value={last_name} 
                            onChange={(e) => setLast_name(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="register-input-container">
                        <FaLock className="register-icon" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="register-input-container">
                        <FaLock className="register-icon" />
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required
                        />
                    </div>

                    <button data-testid="register-button" type="submit">Register</button>
                    <div className="register-login-div">Already have an account? <span onClick={() => navigate('/login')}>Login</span></div>
                </form>
            </div>

            <Footer />
        </>
    );
};

export default Register;