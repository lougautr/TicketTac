import React, { useState, useEffect } from "react";
import "../css/Profile.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate, Link } from "react-router-dom";
import { FaUserEdit, FaSignOutAlt, FaTicketAlt } from "react-icons/fa";


const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login"); 
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data. Please log in again.");
                }

                const userData = await response.json();
                setUser(userData);
                setFormData({ email: userData.email, first_name: userData.first_name, last_name: userData.last_name });
            } catch (error) {
                console.error(error);
                setError(error.message);
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            setError("User ID not found. Please refresh the page.");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, { 
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update user profile.");
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <>
            <Header />

            <div className="profile-content">
                <h2>My Profile</h2>

                {error && <p className="profile-error-message">{error}</p>}

                <div className="profile-cards">
                    {/* User Info Card */}
                    <div className="profile-card">
                        <h3>User Information</h3>
                        {user ? (
                            <>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>First name:</strong> {user.first_name}</p>
                                <p><strong>Last name:</strong> {user.last_name}</p>

                                <div className="profile-buttons">
                                    <button className="profile-edit-button" onClick={() => setIsEditing(true)}>
                                        <FaUserEdit /> Edit
                                    </button>

                                    <button className="profile-logout-button" onClick={() => {
                                            localStorage.removeItem("token");
                                            navigate("/login");
                                        }}>
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p>Loading profile...</p>
                        )}
                    </div>

                    {/* My Tickets Card */}
                    <div className="profile-card">
                        <h3>My Tickets</h3>
                        <p>Check out your upcoming concerts and events.</p>
                        <Link to="/profile/tickets" className="profile-view-all-tickets">
                            <FaTicketAlt /> View My Tickets
                        </Link>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal-content">
                        <h3>Edit Profile</h3>
                        <form onSubmit={handleEditSubmit}>
                            <label htmlFor="email">Email*:</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />

                            <label htmlFor="pseudo">First Name*:</label>
                            <input
                                id="first_name"
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                required
                            />
                            
                            <label htmlFor="pseudo">Last Name*:</label>
                            <input
                                id="last_name"
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                required
                            />

                            <div className="profile-modal-buttons">
                                <button type="button" className="profile-cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button type="submit" className="profile-save-button">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default Profile;