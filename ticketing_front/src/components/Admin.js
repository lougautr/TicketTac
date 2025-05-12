import React, { useEffect } from "react";
import "../css/Admin.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";


const Admin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }
    }, [navigate]);

    return (
        <>
            <Header />

            <div className="admin-content">
                <h2>Admin Dashboard</h2>

                <div className="admin-cards">
                    {/* Users Card */}
                    <div className="admin-card">
                        <h1><FaUsers /></h1>
                        <Link to="/admin/users" className="admin-view-link">View Users</Link>
                    </div>

                    {/* Hotels Card */}
                    <div className="admin-card">
                        <h1><FaCalendarAlt /></h1>
                        <Link to="/admin/events" className="admin-view-link">View Events</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Admin;