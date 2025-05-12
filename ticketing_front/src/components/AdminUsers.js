import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import "../css/AdminUsers.css"; 
import { useNavigate, Link } from "react-router-dom";
import { FaChevronRight, FaEdit, FaPlus } from "react-icons/fa";

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editedUser, setEditedUser] = useState({ 
        email: "", 
        first_name: "", 
        last_name: "",
        is_admin: "", 
    });
    const [newUser, setNewUser] = useState({
        email: "", 
        first_name: "", 
        last_name: "",
        password: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:8000/users", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    // Open Edit Modal
    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditedUser({ 
            email: user.email, 
            first_name: user.first_name, 
            last_name: user.last_name,
            is_admin: user.is_admin
        });
        setIsEditModalOpen(true);
    };

    // Handle Edit Submission
    const handleEditSubmit = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedUser),
            });

            if (!response.ok) {
                throw new Error("Failed to update user.");
            }

            setUsers(users.map(user => user.id === selectedUser.id ? { ...user, ...editedUser } : user));
            setIsEditModalOpen(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCreateUser = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error("Failed to create user");
            }

            const createdUser = await response.json();
            setUsers([...users, createdUser]);
            setIsCreateModalOpen(false);
            setNewUser({ email: "", first_name: "", last_name: "", password: "" });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="admin-users">
            <Header />

            <div className="admin-users-content">
                <nav className="breadcrumb">
                    <Link to="/admin" className="breadcrumb-link">Admin Dashboard</Link>
                    <FaChevronRight className="breadcrumb-icon" />
                    <span className="breadcrumb-current">Users Management</span>
                </nav>

                <h2>Users Management</h2>

                <div className="admin-users-create-button">
                    <button data-testid="create-user-button" onClick={() => setIsCreateModalOpen(true)}>
                        <FaPlus /> Create User
                    </button>
                </div>

                <div className="admin-users-table-container">
                    {loading ? (
                        <p>Loading users...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <table className="admin-users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.email}</td>
                                        <td>{user.first_name}</td>
                                        <td>{user.last_name}</td>
                                        <td>
                                            <FaEdit data-testid={`edit-user-button-${user.id}`}  className="admin-users-action-icon admin-users-edit-icon" onClick={() => openEditModal(user)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="admin-users-modal-overlay">
                        <div className="admin-users-modal-content">
                            <h3>Edit User</h3>
                            <form className="admin-users-modal-form">
                                <label htmlFor="edit-user-name">Email*:</label>
                                <input
                                    type="text"
                                    data-testid="edit-user-name" 
                                    id="edit-user-name"
                                    value={editedUser.email}
                                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                    required
                                />

                                <label htmlFor="edit-user-first-name">First Name*:</label>
                                <input
                                    type="text"
                                    id="edit-user-first-name"
                                    value={editedUser.first_name}
                                    onChange={(e) => setEditedUser({ ...editedUser, first_name: e.target.value })}
                                    required
                                />

                                <label htmlFor="edit-user-last-name">Last Name*:</label>
                                <input
                                    type="text"
                                    id="edit-user-last-name"
                                    value={editedUser.last_name}
                                    onChange={(e) => setEditedUser({ ...editedUser, last_name: e.target.value })}
                                    required
                                />
                                
                                <div className="admin-users-modal-checkbox">
                                    <label htmlFor="edit-user-is-admin">Is admin:</label>
                                    <input
                                        type="checkbox"
                                        data-testid="edit-user-is-admin" 
                                        id="edit-user-is-admin"
                                        checked={editedUser.is_admin}
                                        onChange={(e) => setEditedUser({ ...editedUser, is_admin: e.target.checked })}
                                    />
                                </div>

                                <div className="admin-users-modal-buttons">
                                    <button data-testid="submit-edit-user" type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button data-testid="cancel-edit-user" type="button" className="save-button" onClick={handleEditSubmit}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="admin-users-modal-overlay">
                        <div className="admin-users-modal-content">
                            <h3>Create User</h3>
                            <form className="admin-users-modal-form">
                                <label htmlFor="new-user-email">Email*:</label>
                                <input
                                    type="text"
                                    data-testid="new-user-email" 
                                    id="new-user-email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                                <label htmlFor="new-user-first-name">First Name*:</label>
                                <input
                                    type="text"
                                    id="new-user-first-name"
                                    value={newUser.first_name}
                                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                    required
                                />
                                <label htmlFor="new-user-last-name">Last Name*:</label>
                                <input
                                    type="text"
                                    id="new-user-last-name"
                                    value={newUser.last_name}
                                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                    required
                                />
                                <label htmlFor="new-user-password">Password*:</label>
                                <input
                                    type="text"
                                    data-testid="new-user-password" 
                                    id="new-user-password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                                <div className="admin-users-modal-buttons">
                                    <button data-testid="cancel-new-user" type="button" className="cancel-button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                    <button data-testid="submit-new-user" type="button" className="save-button" onClick={handleCreateUser}>Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default AdminUsers;