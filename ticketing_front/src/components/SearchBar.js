import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [locations, setLocations] = useState([]); // List of available locations
    const [filteredLocations, setFilteredLocations] = useState([]); // Filtered suggestions
    const [showDropdown, setShowDropdown] = useState(false); // ✅ Utilisation de showDropdown

    // Fetch locations on mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/events`);
                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }
                const events = await response.json();
                const uniqueLocations = [...new Set(events.map((event) => event.location))];
                setLocations(uniqueLocations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);

    // Handle location input change
    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);

        // Filter suggestions based on input
        if (value.length > 0) {
            const filtered = locations.filter((loc) =>
                loc.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredLocations(filtered);
            setShowDropdown(filtered.length > 0); // ✅ Afficher le dropdown seulement si des résultats existent
        } else {
            setShowDropdown(false);
        }
    };

    // Handle selecting a location from suggestions
    const selectLocation = (selected) => {
        setLocation(selected);
        setShowDropdown(false);
    };

    // Handle search button click
    const handleSearch = async () => {
        try {
            let queryParams = [];
    
            if (name) {
                queryParams.push(`name=${encodeURIComponent(name)}`);
            }
    
            if (date) {
                const formattedDate = `${date}:00`; // Ajout des secondes
                queryParams.push(`date=${encodeURIComponent(formattedDate)}`);
            }
    
            if (location) {
                queryParams.push(`location=${encodeURIComponent(location)}`);
            }
    
            queryParams.push("limit=10");
    
            const finalURL = `${process.env.REACT_APP_API_URL}/events?${queryParams.join("&")}`;
    
            const response = await fetch(finalURL);
    
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
    
            const events = await response.json();
            onSearch(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            onSearch([]);
        }
    };

    return (
        <div className="search-bar">
            {/* Event Name Input */}
            <div className="input-container">
                <FaSearch className="icon" />
                <input
                    type="text"
                    placeholder="Event Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Location Autocomplete Input */}
            <div className="input-container" style={{ position: 'relative' }}>
                <FaSearch className="icon" />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => setShowDropdown(filteredLocations.length > 0)} // ✅ Gérer l'affichage
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // ✅ Fermer après un délai
                    data-testid="location-input"
                />

                {/* Affichage conditionnel du dropdown */}
                {showDropdown && (
                    <ul className="autocomplete-dropdown" data-testid="autocomplete-list">
                        {filteredLocations.map((loc, index) => (
                            <li key={index} onClick={() => selectLocation(loc)} data-testid={`location-${index}`}>
                                {loc}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Date Input */}
            <div className="input-container">
                <FaSearch className="icon" />
                <input
                    type="datetime-local"
                    placeholder="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-testid="date-input"
                />
            </div>

            {/* Search Button */}
            <button onClick={handleSearch} data-testid="search-button">Search</button>
        </div>
    );
};

export default SearchBar;