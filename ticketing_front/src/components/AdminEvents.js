import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../css/AdminEvents.css"; 
import { useNavigate, Link } from "react-router-dom";
import { FaChevronRight, FaEdit, FaTrash, FaPlus, FaBed } from "react-icons/fa";

const AdminEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editedEvent, setEditedEvent] = useState({ 
        name: "", 
        location: "", 
        description: "", 
        rating: "", 
        breakfast: false 
    });
    const [newEvent, setNewEvent] = useState({
        name: "",
        location: "",
        description: "",
        rating: "",
        breakfast: false,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const fetchEvents = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch events");
                }

                const data = await response.json();
                setEvents(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [navigate]);

    // Open Edit Modal
    const openEditModal = (event) => {
        setSelectedEvent(event);
        setEditedEvent({ 
            name: event.name, 
            location: event.location, 
            description: event.description, 
            date: event.date, 
            total_tickets: event.total_tickets, 
            available_tickets: event.available_tickets, 
        });
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (event) => {
        setSelectedEvent(event);
        setIsDeleteModalOpen(true);
    };

    // Handle Edit Submission
    const handleEditSubmit = async () => {
        const token = localStorage.getItem("token");
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${selectedEvent.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedEvent),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update event.");
            }
    
            const updatedEvent = await response.json();
    
            setEvents((prevEvents) => {
                const newEvents = prevEvents.map(event =>
                    event.id === selectedEvent.id ? updatedEvent : event
                );
                return newEvents;
            });
    
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating event:", error);
            setError(error.message);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${selectedEvent.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete event.");
            }

            setEvents(events.filter(event => event.id !== selectedEvent.id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCreateEvent = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                throw new Error("Failed to create event");
            }

            const createdEvent = await response.json();
            setEvents([...events, createdEvent]);
            setIsCreateModalOpen(false);
            setNewEvent({ name: "", location: "", description: "", date: "", total_tickets: "", available_tickets: "" });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="admin-events">
            <Header />

            <div className="admin-events-content">
                <nav className="breadcrumb">
                    <Link to="/admin" className="breadcrumb-link">Admin Dashboard</Link>
                    <FaChevronRight className="breadcrumb-icon" />
                    <span className="breadcrumb-current">Events Management</span>
                </nav>

                <h2>Events Management</h2>

                <div className="admin-events-create-button">
                    <button data-testid="create-event-button" onClick={() => setIsCreateModalOpen(true)}>
                        <FaPlus /> Create Event
                    </button>
                </div>

                <div className="admin-events-table-container">
                    {loading ? (
                        <p>Loading events...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <table className="admin-events-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                    <th>Available tickets</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <td>{event.id}</td>
                                        <td>{event.name}</td>
                                        <td>{event.location}</td>
                                        <td>{event.date}</td>
                                        <td>{event.available_tickets}</td>
                                        <td>
                                            <FaEdit data-testid={`edit-event-button-${event.id}`} className="admin-events-action-icon admin-events-edit-icon" onClick={() => openEditModal(event)} />
                                            <FaTrash data-testid={`delete-event-button-${event.id}`} className="admin-events-action-icon admin-events-delete-icon" onClick={() => openDeleteModal(event)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="admin-events-modal-overlay">
                        <div className="admin-events-modal-content">
                            <h3>Edit Event</h3>
                            <form className="admin-events-modal-form">
                                <label htmlFor="edit-event-name">Name:</label>
                                <input
                                    type="text"
                                    id="edit-event-name"
                                    value={editedEvent.name}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
                                />

                                <label htmlFor="edit-event-location">Location:</label>
                                <input
                                    type="text"
                                    id="edit-event-location"
                                    value={editedEvent.location}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                                />

                                <label htmlFor="edit-event-description">Description:</label>
                                <textarea
                                    id="edit-event-description"
                                    value={editedEvent.description}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
                                />

                                <label htmlFor="edit-event-location">Date:</label>
                                <input
                                    type="datetime-local"
                                    id="edit-event-date"
                                    value={editedEvent.date}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
                                />

                                <label htmlFor="edit-event-location">Total tickets:</label>
                                <input
                                    type="number"
                                    id="edit-event-total-tickets"
                                    value={editedEvent.total_tickets}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, total_tickets: e.target.value })}
                                />
                                
                                <label htmlFor="edit-event-location">Available tickets:</label>
                                <input
                                    type="number"
                                    id="edit-event-available-tickets"
                                    value={editedEvent.available_tickets}
                                    onChange={(e) => setEditedEvent({ ...editedEvent, available_tickets: e.target.value })}
                                />

                                <div className="admin-events-modal-buttons">
                                    <button data-testid="submit-edit-event" type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button data-testid="cancel-edit-event" type="button" className="save-button" onClick={handleEditSubmit}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="admin-events-modal-overlay">
                        <div className="admin-events-modal-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete this event?</p>
                            <div className="admin-events-modal-buttons">
                                <button data-testid="cancel-delete-event" className="cancel-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button data-testid="submit-delete-event" className="save-button" onClick={handleDelete}>Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="admin-events-modal-overlay">
                        <div className="admin-events-modal-content">
                            <h3>Create Event</h3>
                            <form className="admin-events-modal-form">
                                <label htmlFor="new-event-name">Name:</label>
                                <input
                                    type="text"
                                    id="new-event-name"
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                />

                                <label htmlFor="new-event-location">Location:</label>
                                <input
                                    type="text"
                                    id="new-event-location"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                />

                                <label htmlFor="new-event-description">Description:</label>
                                <textarea
                                    id="new-event-description"
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                />

                                <label htmlFor="new-event-date">Date:</label>
                                <input
                                    type="datetime-local"
                                    id="new-event-date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                />

                                <label htmlFor="new-event-total-tickets">Total tickets:</label>
                                <input
                                    type="number"
                                    id="new-event-total-tickets"
                                    value={newEvent.total_tickets}
                                    onChange={(e) => setNewEvent({ ...newEvent, total_tickets: e.target.value })}
                                />

                                <label htmlFor="new-event-available-tickets">Available tickets:</label>
                                <input
                                    type="number"
                                    id="new-event-available-tickets"
                                    value={newEvent.available_tickets}
                                    onChange={(e) => setNewEvent({ ...newEvent, available_tickets: e.target.value })}
                                />

                                <div className="admin-events-modal-buttons">
                                    <button data-testid="cancel-new-event" type="button" className="cancel-button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                    <button data-testid="submit-new-event" type="button" className="save-button" onClick={handleCreateEvent}>Create</button>
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

export default AdminEvents;