import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/authContext';

// Developer mode - set to true to bypass all protections during development
const DEVELOPER_MODE = true; // Changed to false for proper authentication

// Keys / helpers
const K_BOOKING = 'reservation.bookingInfo';
const K_ROOM = 'reservation.selectedRoomId';
const K_CONFIRMED = 'reservation.confirmed';
const REQUIRED = ['firstName','lastName','gender','phoneNumber','townCity','country','adults','checkIn','checkOut','nextOfKinName','nextOfKinPhone','nextOfKinTownCity','nextOfKinCountry'];

const j = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const hasBooking = () => { const d = j(K_BOOKING) || {}; return REQUIRED.every(f => d[f] && String(d[f]).trim() !== '') && (!d.checkIn || !d.checkOut || d.checkOut >= d.checkIn); };
const hasRoom = () => { try { return !!localStorage.getItem(K_ROOM); } catch { return false; } };
const hasConfirm = () => { try { return localStorage.getItem(K_CONFIRMED) === '1'; } catch { return false; } };
const firstIncomplete = () => { if (!hasBooking()) return '/reservations/booking-info'; if (!hasRoom()) return '/reservations/choose-room'; if (!hasConfirm()) return '/reservations/confirmation'; return null; };

// Check if user has required role
const hasRequiredRole = (user, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!user || !user.role) return false;
  return requiredRoles.includes(user.role);
};

// stage: booking | room | confirmation | payment
// requiredRoles: array of roles that can access this route
const ProtectedRoute = ({ children, stage, requiredRoles }) => {
  // Always call hooks first (React requirement)
  const { user, loading } = useAuthContext();
  const location = useLocation();
  
  // Developer mode bypass - remove this when ready for production
  if (DEVELOPER_MODE) {
    return children;
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  
  // Check authentication
  const isAuthenticated = !!user;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  
  // Check role-based access
  if (requiredRoles && !hasRequiredRole(user, requiredRoles)) {
    return <Navigate to="/" replace state={{ error: 'Insufficient permissions' }} />;
  }
  
  // Handle reservation flow stages
  if (stage === 'booking') return children;
  const redirect = firstIncomplete();
  if (stage === 'room' && !hasBooking()) return <Navigate to={redirect} replace />;
  if (stage === 'confirmation' && (!hasBooking() || !hasRoom())) return <Navigate to={redirect} replace />;
  if (stage === 'payment' && (!hasBooking() || !hasRoom() || !hasConfirm())) return <Navigate to={redirect} replace />;
  
  return children;
};

export default ProtectedRoute;
