import React, { useEffect, useState } from "react";
import "../css/Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch user data");
                    }

                    const userData = await response.json();
                    setIsAdmin(userData.is_admin || false);

                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-content">
                <h2 className="header-name">TicketTac</h2>
                <div className='header-links'>
                    <nav>
                        <ul>
                            <li onClick={() => { navigate("/"); }}>Tickets</li>
                            {isAdmin && (
                                <li onClick={() => { navigate("/admin"); }}>Admin</li>
                            )}
                        </ul>
                    </nav>
                    <div>
                        {isLoggedIn ? (
                            <button className="header-profile" onClick={() => { navigate("/profile"); }}>
                                My Profile
                            </button>
                        ) : (
                            <button className="header-login" onClick={() => { navigate("/login"); }}>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;