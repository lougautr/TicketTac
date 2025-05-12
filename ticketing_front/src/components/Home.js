import React, { useState, useEffect } from 'react';
import '../css/Home.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import EventCard from "../components/EventCard";
import SearchBar from '../components/SearchBar';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/events`);
                console.log(response);

                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const eventData = await response.json();
                setEvents(eventData);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleSearch = (searchResults) => {
        setEvents(searchResults);
    };

    return (
        <>
            <Header />

            <div className="home-component">

                <SearchBar onSearch={handleSearch} />

                <div className="home-container">

                    {/* Display Events */}
                    <div className="events-list">
                        {loading ? (
                            <p>Loading events...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : events.length > 0 ? (
                            events.map((event) => <EventCard key={event.id} event={event} />)
                        ) : (
                            <p>No events found. Try a different search.</p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Home;