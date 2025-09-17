// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import CreateAccountPage from './pages/Auth/CreateAccountPage';
import LoginPage from './pages/Auth/LoginPage';
import './App.css';
import MakeReservationPage from './pages/Booking/MakeReservationPage';
import ChooseRoomPage from './pages/Booking/ChooseRoomPage';
import ConfirmationPage from './pages/Booking/ConfirmationPage';
import PaymentPage from './pages/Booking/PaymentPage';
import ProtectedRoute from './components/layout/ProtectedRouteClean';
import { AuthProvider } from './contexts/authContext';
import { ToastProvider } from './contexts/ToastContext';
import ApiTester from './components/ApiTester';
import ApiConnectionTest from './components/ApiConnectionTest';
import LoginDebugger from './components/LoginDebugger';
import AuthDebugger from './components/debug/AuthDebugger';

// Admin Pages
import DashboardPage from './pages/Admin/DashboardPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import ServiceUnitManagementPage from './pages/Admin/ServiceUnitManagementPage';
import BuildingManagementPage from './pages/Admin/BuildingManagementPage';
import AllocationManagementPage from './pages/Admin/AllocationManagementPage';
import ReportsPage from './pages/Reports/ReportsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotificationPage from './pages/Notifications/NotificationPage';

// Member Pages
import MembersListPage from './pages/Members/MembersListPage';
import AllocationRequestPage from './pages/Members/AllocationRequestPage';
import RoomDetailsPage from './pages/Members/RoomDetailsPage';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
          {/* Home Route */}
          <Route path="/" element={<HomePage />} />
          
          {/* API Tester - for development/testing */}
          <Route path="/api-test" element={<ApiTester />} />
          <Route path="/api-connection-test" element={<ApiConnectionTest />} />
          <Route path="/login-debug" element={<LoginDebugger />} />
          <Route path="/auth-debug" element={<AuthDebugger />} />
          
          {/* Authentication Routes */}
          <Route path="/signup" element={<CreateAccountPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/create-account" element={<CreateAccountPage />} />
          
          {/* Redirect /register to /signup for consistency */}
          <Route path="/register" element={<Navigate to="/signup" replace />} />

          {/* Protected Reservation Flow */}
          <Route
            path="/reservations/booking-info"
            element={
              <ProtectedRoute stage="booking">
                <MakeReservationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/choose-room"
            element={
              <ProtectedRoute stage="room">
                <ChooseRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/confirmation"
            element={
              <ProtectedRoute stage="confirmation">
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/payment"
            element={
              <ProtectedRoute stage="payment">
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin', 'ServiceUnitAdmin', 'Pastor', 'Member']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Profile and Settings Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin', 'ServiceUnitAdmin', 'Pastor', 'Member']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin', 'ServiceUnitAdmin', 'Pastor', 'Member']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Notification Routes */}
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin', 'ServiceUnitAdmin', 'Pastor', 'Member']}>
                <NotificationPage />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/service-units"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin']}>
                <ServiceUnitManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/buildings"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin']}>
                <BuildingManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/allocations"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin']}>
                <AllocationManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Service Unit Admin Routes */}
          <Route
            path="/service-unit/dashboard"
            element={
              <ProtectedRoute requiredRoles={['ServiceUnitAdmin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-unit/members"
            element={
              <ProtectedRoute requiredRoles={['ServiceUnitAdmin']}>
                <MembersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-unit/allocations"
            element={
              <ProtectedRoute requiredRoles={['ServiceUnitAdmin']}>
                <AllocationRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Pastor Routes */}
          <Route
            path="/pastor/room/:roomId"
            element={
              <ProtectedRoute requiredRoles={['Pastor']}>
                <RoomDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pastor/requests"
            element={
              <ProtectedRoute requiredRoles={['Pastor']}>
                <AllocationRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Member Routes */}
          <Route
            path="/member/room/:roomId"
            element={
              <ProtectedRoute requiredRoles={['Member']}>
                <RoomDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/requests"
            element={
              <ProtectedRoute requiredRoles={['Member']}>
                <AllocationRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Shared Room Details Route */}
          <Route
            path="/rooms/:roomId"
            element={
              <ProtectedRoute requiredRoles={['SuperAdmin', 'ServiceUnitAdmin', 'Pastor', 'Member']}>
                <RoomDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect common admin paths */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/service-unit" element={<Navigate to="/service-unit/dashboard" replace />} />
          <Route path="/pastor" element={<Navigate to="/dashboard" replace />} />
          <Route path="/member" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all route - redirect to home (placed last) */}
          <Route path="*" element={<Navigate to="/" replace />} />


        </Routes>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
