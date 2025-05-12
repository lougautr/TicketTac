import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../views/Home';
import EventDetails from '../views/EventDetails';
import Login from '../views/Login';
import Register from '../views/Register';
import Profile from '../views/Profile';
import Payment from '../views/Payment';
import Admin from '../views/Admin';
import AdminEvents from '../views/AdminEvents';
import AdminUsers from '../views/AdminUsers';
import ProfileTickets from '../views/ProfileTickets';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/profile/tickets" element={<ProfileTickets />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;