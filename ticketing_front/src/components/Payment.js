import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt, FaChevronLeft } from 'react-icons/fa';
import '../css/Payment.css';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };
    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit"
    };
    return `${date.toLocaleDateString("en-US", options)} at ${date.toLocaleTimeString("en-US", timeOptions)}`;
};

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${id}`);
                if (!response.ok) throw new Error('Failed to load event details');
                const data = await response.json();
                setEvent(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchEvent();
    }, [id]);

    const handleBuyTicket = async () => {
        const ticketData = {
            ticket_number: `TKT-${Math.floor(Math.random() * 1000000)}`, // Génère un numéro aléatoire
            event_id: parseInt(id),
            purchase_date: new Date().toISOString()
        };

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(ticketData)
            });

            if (!response.ok) {
                throw new Error("Failed to create ticket");
            }

            navigate("/profile/tickets");
        } catch (err) {
            console.error("Error buying ticket:", err);
            alert("Error: " + err.message);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!event) return <div className="loading">Loading event...</div>;

    const { name, location, description, date, available_tickets } = event;

    return (
        <>
            <Header />

            <div className="payment-page">
                <button className="payment-back-btn" onClick={() => navigate(-1)}>
                    <FaChevronLeft /> <span>Back</span>
                </button>

                <div className="payment-two-columns">
                    {/* Left: fake payment form */}
                    <div className="payment-form">
                        <h3>Credit Card Payment</h3>
                        <form>
                            <label>Name on Card</label>
                            <input type="text" placeholder="John Doe" />

                            <label>Card Number</label>
                            <input type="text" placeholder="1234 5678 9012 3456" />

                            <label>Expiration Date</label>
                            <input type="text" placeholder="MM/YY" />

                            <label>CVV</label>
                            <input type="text" placeholder="123" />

                            <button
                                type="button"
                                className="confirm-payment-btn"
                                onClick={handleBuyTicket}
                            >
                                Confirm & Buy Ticket
                            </button>
                        </form>
                    </div>

                    {/* Right: recap event */}
                    <div className="payment-recap">
                        <h2>Event Summary</h2>
                        <div className="payment-event-details">
                            <h3>{name}</h3>
                            <p><FaCalendarAlt /> {formatDate(date)}</p>
                            <p><FaMapMarkerAlt /> {location}</p>
                            <p className="payment-description">{description}</p>
                            <p className="payment-remaining"><FaTicketAlt /> {available_tickets} tickets remaining</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Payment;