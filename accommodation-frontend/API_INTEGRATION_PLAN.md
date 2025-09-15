# Accommodation Portal - API Integration Strategy

## Overview
This document outlines the comprehensive API integration strategy for connecting the React frontend with the Django backend. All frontend pages have been created and tested, and now need to be connected to the corresponding Django API endpoints.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [API Client Configuration](#api-client-configuration)
3. [Endpoint Mapping](#endpoint-mapping)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Error Handling Strategy](#error-handling-strategy)
6. [State Management](#state-management)
7. [Implementation Phases](#implementation-phases)

---

## Authentication & Authorization

### Current Frontend Auth Structure
- **Hook**: `useAuth` (in `contexts/authContext.js`)
- **Storage**: localStorage for token and user data
- **Roles**: SuperAdmin, ServiceUnitAdmin, Pastor, Member
- **Protected Routes**: Role-based access control

### Backend Integration Requirements
```javascript
// API Authentication Headers
const authHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}

// Login API Call
POST /api/auth/login/
Body: { email, password }
Response: { token, user, role, permissions }

// Token Refresh
POST /api/auth/refresh/
Body: { refresh_token }
Response: { access_token, refresh_token }

// Logout
POST /api/auth/logout/
Headers: Authorization
```

---

## API Client Configuration

### Base API Client Setup
```javascript
// src/services/apiClient.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8100/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Endpoint Mapping

### 1. Authentication Endpoints
| Frontend Page | API Endpoint | Method | Purpose |
|---------------|-------------|--------|---------|
| LoginPage | `/api/auth/login/` | POST | User authentication |
| CreateAccountPage | `/api/auth/register/` | POST | User registration |
| - | `/api/auth/logout/` | POST | User logout |
| - | `/api/auth/refresh/` | POST | Token refresh |

### 2. User Management Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| UserManagementPage | `/api/users/` | GET | List all users |
| UserManagementPage | `/api/users/` | POST | Create new user |
| UserManagementPage | `/api/users/{id}/` | GET | Get user details |
| UserManagementPage | `/api/users/{id}/` | PUT/PATCH | Update user |
| UserManagementPage | `/api/users/{id}/` | DELETE | Delete user |
| ProfilePage | `/api/users/profile/` | GET | Get current user profile |
| ProfilePage | `/api/users/profile/` | PUT | Update profile |
| SettingsPage | `/api/users/change-password/` | POST | Change password |

### 3. Service Unit Management Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| ServiceUnitManagementPage | `/api/service-units/` | GET | List service units |
| ServiceUnitManagementPage | `/api/service-units/` | POST | Create service unit |
| ServiceUnitManagementPage | `/api/service-units/{id}/` | PUT/PATCH | Update service unit |
| ServiceUnitManagementPage | `/api/service-units/{id}/` | DELETE | Delete service unit |
| ServiceUnitManagementPage | `/api/service-units/{id}/members/` | GET | Get unit members |
| MembersListPage | `/api/service-units/{id}/members/` | GET | List unit members |

### 4. Building & Room Management Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| BuildingManagementPage | `/api/buildings/` | GET | List buildings |
| BuildingManagementPage | `/api/buildings/` | POST | Create building |
| BuildingManagementPage | `/api/buildings/{id}/` | PUT/PATCH | Update building |
| BuildingManagementPage | `/api/buildings/{id}/` | DELETE | Delete building |
| BuildingManagementPage | `/api/buildings/{id}/rooms/` | GET | Get building rooms |
| RoomDetailsPage | `/api/rooms/{id}/` | GET | Get room details |
| RoomDetailsPage | `/api/rooms/{id}/availability/` | GET | Check room availability |
| ChooseRoomPage | `/api/rooms/available/` | GET | List available rooms |

### 5. Allocation Management Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| AllocationManagementPage | `/api/allocations/` | GET | List allocations |
| AllocationManagementPage | `/api/allocations/` | POST | Create allocation |
| AllocationManagementPage | `/api/allocations/{id}/` | PUT/PATCH | Update allocation |
| AllocationManagementPage | `/api/allocations/{id}/` | DELETE | Delete allocation |
| AllocationRequestPage | `/api/allocation-requests/` | GET | List requests |
| AllocationRequestPage | `/api/allocation-requests/` | POST | Create request |
| AllocationRequestPage | `/api/allocation-requests/{id}/approve/` | POST | Approve request |
| AllocationRequestPage | `/api/allocation-requests/{id}/reject/` | POST | Reject request |

### 6. Booking & Reservation Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| MakeReservationPage | `/api/reservations/` | POST | Create reservation |
| ConfirmationPage | `/api/reservations/{id}/` | GET | Get reservation details |
| PaymentPage | `/api/payments/` | POST | Process payment |
| PaymentPage | `/api/payments/{id}/verify/` | POST | Verify payment |

### 7. Dashboard & Analytics Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| DashboardPage | `/api/dashboard/stats/` | GET | Get dashboard statistics |
| DashboardPage | `/api/dashboard/recent-activities/` | GET | Recent activities |
| ReportsPage | `/api/reports/financial/` | GET | Financial reports |
| ReportsPage | `/api/reports/allocations/` | GET | Allocation reports |
| ReportsPage | `/api/reports/occupancy/` | GET | Occupancy reports |

### 8. Notification Endpoints
| Frontend Component | API Endpoint | Method | Purpose |
|-------------------|-------------|--------|---------|
| NotificationPage | `/api/notifications/` | GET | List notifications |
| NotificationDropdown | `/api/notifications/unread/` | GET | Unread notifications |
| NotificationPage | `/api/notifications/{id}/read/` | POST | Mark as read |
| NotificationPage | `/api/notifications/mark-all-read/` | POST | Mark all as read |
| NotificationPage | `/api/notifications/{id}/` | DELETE | Delete notification |

---

## Data Flow Architecture

### 1. Service Layer Structure
```
src/services/
├── apiClient.js          # Base API configuration
├── authService.js        # Authentication operations
├── userService.js        # User management operations
├── serviceUnitService.js # Service unit operations
├── buildingService.js    # Building & room operations
├── allocationService.js  # Allocation operations
├── bookingService.js     # Booking & reservation operations
├── dashboardService.js   # Dashboard & analytics operations
└── notificationService.js # Notification operations
```

### 2. Data Flow Pattern
```
Component → Service → API Client → Django Backend
                ↓
Component ← State Update ← Response Processing
```

### 3. Error Handling Flow
```
API Error → Service Catches → Component Handles → User Notification
```

---

## Error Handling Strategy

### 1. API Error Types
- **401 Unauthorized**: Token expired/invalid → Redirect to login
- **403 Forbidden**: Insufficient permissions → Show error message
- **404 Not Found**: Resource not found → Show not found message
- **422 Validation Error**: Form validation → Show field errors
- **500 Server Error**: Backend error → Show generic error message

### 2. Error Handling Implementation
```javascript
// Service layer error handling
const handleApiError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Handle unauthorized
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Handle forbidden
        return { error: 'Access denied' };
      case 422:
        // Handle validation errors
        return { errors: error.response.data.errors };
      default:
        return { error: 'An error occurred. Please try again.' };
    }
  }
  return { error: 'Network error. Please check your connection.' };
};
```

---

## State Management

### 1. Current State Structure
- **Authentication**: useAuth hook with localStorage
- **Component State**: useState for local component data
- **Loading States**: Per-component loading indicators
- **Error States**: Per-component error handling

### 2. Enhanced State Management (Recommended)
```javascript
// Context providers for global state
- AuthContext: User authentication and permissions
- NotificationContext: Global notifications and alerts
- ThemeContext: Application theme and preferences

// Local state for component-specific data
- Form state: Form inputs and validation
- Modal state: Modal open/close states
- Loading state: API call loading indicators
```

---

## Implementation Phases

### Phase 1: Core Authentication & API Setup
**Duration**: 1-2 days
- [ ] Set up API client with authentication
- [ ] Implement authentication service
- [ ] Update useAuth hook with API integration
- [ ] Test login/logout functionality

### Phase 2: User & Profile Management
**Duration**: 2-3 days
- [ ] Integrate UserManagementPage with user APIs
- [ ] Connect ProfilePage to profile APIs
- [ ] Implement SettingsPage API connections
- [ ] Add form validation and error handling

### Phase 3: Service Unit & Building Management
**Duration**: 3-4 days
- [ ] Connect ServiceUnitManagementPage to APIs
- [ ] Integrate BuildingManagementPage with building/room APIs
- [ ] Implement MembersListPage API connections
- [ ] Add CRUD operations with proper error handling

### Phase 4: Allocation & Booking System
**Duration**: 3-4 days
- [ ] Connect AllocationManagementPage to allocation APIs
- [ ] Integrate AllocationRequestPage with request workflow
- [ ] Connect booking pages to reservation APIs
- [ ] Implement payment integration

### Phase 5: Dashboard & Analytics
**Duration**: 2-3 days
- [ ] Connect DashboardPage to analytics APIs
- [ ] Integrate ReportsPage with reporting endpoints
- [ ] Add real-time data updates
- [ ] Implement role-based data filtering

### Phase 6: Notifications & Real-time Features
**Duration**: 2-3 days
- [ ] Connect NotificationPage to notification APIs
- [ ] Integrate NotificationDropdown with real-time updates
- [ ] Add WebSocket connections for live notifications
- [ ] Implement push notification support

### Phase 7: Testing & Optimization
**Duration**: 2-3 days
- [ ] End-to-end testing of all features
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Documentation updates

---

## Environment Configuration

### Development Environment
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENVIRONMENT=development
```

### Production Environment
```env
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_WS_URL=wss://your-domain.com/ws
REACT_APP_ENVIRONMENT=production
```

---

## Security Considerations

### 1. Token Management
- Store tokens securely
- Implement token refresh mechanism
- Handle token expiration gracefully

### 2. Data Validation
- Client-side validation for UX
- Server-side validation for security
- Sanitize user inputs

### 3. Permission Checking
- Role-based access control
- API endpoint permissions
- UI element visibility based on permissions

---

## Testing Strategy

### 1. Unit Tests
- Service layer functions
- API client configuration
- Error handling functions

### 2. Integration Tests
- API endpoint connections
- Authentication flows
- CRUD operations

### 3. End-to-End Tests
- Complete user workflows
- Role-based access scenarios
- Error recovery processes

---

## Monitoring & Logging

### 1. API Monitoring
- Request/response logging
- Error tracking
- Performance metrics

### 2. User Activity Tracking
- Page visits
- Feature usage
- Error occurrences

---

This comprehensive integration plan ensures that all frontend components will be properly connected to the Django backend with robust error handling, security measures, and a structured implementation approach.
