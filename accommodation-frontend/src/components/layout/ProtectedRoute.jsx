import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Storage keys
const K_BOOKING = 'reservation.bookingInfo';
const K_ROOM = 'reservation.selectedRoomId';
const K_CONFIRMED = 'reservation.confirmed';

const REQUIRED = ['firstName','lastName','gender','phoneNumber','townCity','country','adults','checkIn','checkOut','nextOfKinName','nextOfKinPhone','nextOfKinTownCity','nextOfKinCountry'];

const getJSON = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const hasBooking = () => {
	const d = getJSON(K_BOOKING) || {}; return REQUIRED.every(f => d[f] && String(d[f]).trim() !== '') && (!d.checkIn || !d.checkOut || d.checkOut >= d.checkIn);
};
const hasRoom = () => { try { return !!localStorage.getItem(K_ROOM); } catch { return false; } };
const hasConfirm = () => { try { return localStorage.getItem(K_CONFIRMED) === '1'; } catch { return false; } };

const firstIncomplete = () => {
	if (!hasBooking()) return '/reservations/booking-info';
	if (!hasRoom()) return '/reservations/choose-room';
	if (!hasConfirm()) return '/reservations/confirmation';
	return null;
};

const ProtectedRoute = ({ children, stage }) => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

	if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

	if (stage === 'booking') return children;

	const redirect = firstIncomplete();
	if (stage === 'room' && !hasBooking()) return <Navigate to={redirect} replace />;
	if (stage === 'confirmation' && (!hasBooking() || !hasRoom())) return <Navigate to={redirect} replace />;
	if (stage === 'payment' && (!hasBooking() || !hasRoom() || !hasConfirm())) return <Navigate to={redirect} replace />;

	return children;
};

export default ProtectedRoute;

