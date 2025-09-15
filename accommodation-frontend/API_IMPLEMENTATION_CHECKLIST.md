# API Integration Implementation Checklist

## Authentication Pages

### LoginPage.jsx
**Current Status**: Mock authentication with localStorage
**API Requirements**:
- [ ] POST `/api/auth/login/` - User authentication
- [ ] Handle JWT token storage
- [ ] Redirect based on user role
- [ ] Error handling for invalid credentials

**Implementation Tasks**:
```javascript
// Replace mock login with API call
const handleLogin = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    // Store token and user data
    // Redirect to dashboard
  } catch (error) {
    // Handle login errors
  }
};
```

### CreateAccountPage.jsx
**Current Status**: Mock registration
**API Requirements**:
- [ ] POST `/api/auth/register/` - User registration
- [ ] Form validation with backend errors
- [ ] Email verification flow (if implemented)

---

## Dashboard Pages

### DashboardPage.jsx
**Current Status**: Mock data for all roles
**API Requirements**:
- [ ] GET `/api/dashboard/stats/` - Role-specific statistics
- [ ] GET `/api/dashboard/recent-activities/` - Recent activities
- [ ] Real-time updates for live data

**Role-Specific Data Needs**:
- **SuperAdmin**: Total users, buildings, allocations, revenue
- **ServiceUnitAdmin**: Unit members, allocation requests, room occupancy
- **Pastor**: Assigned rooms, member requests, room status
- **Member**: Personal allocation status, payment history, room details

---

## Admin Management Pages

### UserManagementPage.jsx
**Current Status**: Mock user data with CRUD operations
**API Requirements**:
- [ ] GET `/api/users/` - List users with pagination
- [ ] POST `/api/users/` - Create new user
- [ ] PUT `/api/users/{id}/` - Update user
- [ ] DELETE `/api/users/{id}/` - Delete user
- [ ] GET `/api/users/{id}/` - Get user details

**Implementation Priority**: High - Core admin functionality

### ServiceUnitManagementPage.jsx
**Current Status**: Mock service unit data
**API Requirements**:
- [ ] GET `/api/service-units/` - List service units
- [ ] POST `/api/service-units/` - Create service unit
- [ ] PUT `/api/service-units/{id}/` - Update service unit
- [ ] DELETE `/api/service-units/{id}/` - Delete service unit
- [ ] GET `/api/service-units/{id}/members/` - Get unit members

### BuildingManagementPage.jsx
**Current Status**: Mock building and room data
**API Requirements**:
- [ ] GET `/api/buildings/` - List buildings
- [ ] POST `/api/buildings/` - Create building
- [ ] PUT `/api/buildings/{id}/` - Update building
- [ ] DELETE `/api/buildings/{id}/` - Delete building
- [ ] GET `/api/buildings/{id}/rooms/` - Get building rooms
- [ ] POST `/api/rooms/` - Create room
- [ ] PUT `/api/rooms/{id}/` - Update room
- [ ] DELETE `/api/rooms/{id}/` - Delete room

### AllocationManagementPage.jsx
**Current Status**: Mock allocation data
**API Requirements**:
- [ ] GET `/api/allocations/` - List allocations
- [ ] POST `/api/allocations/` - Create allocation
- [ ] PUT `/api/allocations/{id}/` - Update allocation
- [ ] DELETE `/api/allocations/{id}/` - Delete allocation
- [ ] POST `/api/allocations/{id}/approve/` - Approve allocation
- [ ] POST `/api/allocations/{id}/reject/` - Reject allocation

---

## User Profile & Settings

### ProfilePage.jsx
**Current Status**: Mock user profile data
**API Requirements**:
- [ ] GET `/api/users/profile/` - Get current user profile
- [ ] PUT `/api/users/profile/` - Update profile
- [ ] POST `/api/users/upload-avatar/` - Upload profile picture
- [ ] GET `/api/users/profile/activity/` - User activity history

### SettingsPage.jsx
**Current Status**: Mock settings with localStorage
**API Requirements**:
- [ ] GET `/api/users/settings/` - Get user settings
- [ ] PUT `/api/users/settings/` - Update settings
- [ ] POST `/api/users/change-password/` - Change password
- [ ] POST `/api/users/enable-2fa/` - Enable two-factor auth
- [ ] DELETE `/api/users/disable-2fa/` - Disable two-factor auth

---

## Member-Specific Pages

### MembersListPage.jsx
**Current Status**: Mock member data for service unit
**API Requirements**:
- [ ] GET `/api/service-units/{id}/members/` - List unit members
- [ ] POST `/api/service-units/{id}/add-member/` - Add member to unit
- [ ] DELETE `/api/service-units/{id}/remove-member/{member_id}/` - Remove member
- [ ] GET `/api/members/search/` - Search members

### AllocationRequestPage.jsx
**Current Status**: Mock allocation requests
**API Requirements**:
- [ ] GET `/api/allocation-requests/` - List requests (filtered by role)
- [ ] POST `/api/allocation-requests/` - Create new request
- [ ] PUT `/api/allocation-requests/{id}/` - Update request
- [ ] POST `/api/allocation-requests/{id}/approve/` - Approve request
- [ ] POST `/api/allocation-requests/{id}/reject/` - Reject request
- [ ] DELETE `/api/allocation-requests/{id}/` - Cancel request

### RoomDetailsPage.jsx
**Current Status**: Mock room data with availability
**API Requirements**:
- [ ] GET `/api/rooms/{id}/` - Get room details
- [ ] GET `/api/rooms/{id}/availability/` - Check availability
- [ ] GET `/api/rooms/{id}/occupants/` - Get current occupants
- [ ] POST `/api/rooms/{id}/request-allocation/` - Request room allocation
- [ ] GET `/api/rooms/{id}/reviews/` - Get room reviews

---

## Booking Flow Pages

### ChooseRoomPage.jsx
**Current Status**: Mock available rooms
**API Requirements**:
- [ ] GET `/api/rooms/available/` - List available rooms
- [ ] GET `/api/rooms/search/` - Search rooms with filters
- [ ] POST `/api/rooms/{id}/reserve-temp/` - Temporary reservation

### MakeReservationPage.jsx
**Current Status**: Mock reservation form
**API Requirements**:
- [ ] POST `/api/reservations/` - Create reservation
- [ ] GET `/api/reservations/calculate-cost/` - Calculate total cost
- [ ] POST `/api/reservations/validate/` - Validate reservation details

### ConfirmationPage.jsx
**Current Status**: Mock confirmation data
**API Requirements**:
- [ ] GET `/api/reservations/{id}/` - Get reservation details
- [ ] POST `/api/reservations/{id}/confirm/` - Confirm reservation
- [ ] GET `/api/reservations/{id}/receipt/` - Get payment receipt

### PaymentPage.jsx
**Current Status**: Mock payment processing
**API Requirements**:
- [ ] POST `/api/payments/` - Process payment
- [ ] POST `/api/payments/verify/` - Verify payment
- [ ] GET `/api/payments/{id}/status/` - Check payment status

---

## Reports & Analytics

### ReportsPage.jsx
**Current Status**: Mock report data with charts
**API Requirements**:
- [ ] GET `/api/reports/financial/` - Financial reports (SuperAdmin only)
- [ ] GET `/api/reports/occupancy/` - Occupancy reports
- [ ] GET `/api/reports/allocations/` - Allocation reports
- [ ] GET `/api/reports/revenue/` - Revenue analytics
- [ ] POST `/api/reports/export/` - Export report data

---

## Notification System

### NotificationPage.jsx
**Current Status**: Mock notifications with filtering
**API Requirements**:
- [ ] GET `/api/notifications/` - List user notifications
- [ ] POST `/api/notifications/{id}/read/` - Mark as read
- [ ] POST `/api/notifications/mark-all-read/` - Mark all as read
- [ ] DELETE `/api/notifications/{id}/` - Delete notification
- [ ] PUT `/api/notifications/settings/` - Update notification preferences

### NotificationDropdown.jsx
**Current Status**: Mock unread notifications
**API Requirements**:
- [ ] GET `/api/notifications/unread/` - Get unread notifications
- [ ] POST `/api/notifications/{id}/read/` - Mark notification as read
- [ ] WebSocket connection for real-time notifications

---

## Service Layer Implementation

### Create API Service Files

#### authService.js
```javascript
import apiClient from './apiClient';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  register: (userData) => apiClient.post('/auth/register/', userData),
  logout: () => apiClient.post('/auth/logout/'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => apiClient.get('/auth/user/'),
};
```

#### userService.js
```javascript
import apiClient from './apiClient';

export const userService = {
  getUsers: (params) => apiClient.get('/users/', { params }),
  getUser: (id) => apiClient.get(`/users/${id}/`),
  createUser: (userData) => apiClient.post('/users/', userData),
  updateUser: (id, userData) => apiClient.put(`/users/${id}/`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}/`),
  getProfile: () => apiClient.get('/users/profile/'),
  updateProfile: (profileData) => apiClient.put('/users/profile/', profileData),
  changePassword: (passwordData) => apiClient.post('/users/change-password/', passwordData),
};
```

#### buildingService.js
```javascript
import apiClient from './apiClient';

export const buildingService = {
  getBuildings: (params) => apiClient.get('/buildings/', { params }),
  getBuilding: (id) => apiClient.get(`/buildings/${id}/`),
  createBuilding: (buildingData) => apiClient.post('/buildings/', buildingData),
  updateBuilding: (id, buildingData) => apiClient.put(`/buildings/${id}/`, buildingData),
  deleteBuilding: (id) => apiClient.delete(`/buildings/${id}/`),
  getBuildingRooms: (id) => apiClient.get(`/buildings/${id}/rooms/`),
  
  // Room operations
  getRooms: (params) => apiClient.get('/rooms/', { params }),
  getRoom: (id) => apiClient.get(`/rooms/${id}/`),
  createRoom: (roomData) => apiClient.post('/rooms/', roomData),
  updateRoom: (id, roomData) => apiClient.put(`/rooms/${id}/`, roomData),
  deleteRoom: (id) => apiClient.delete(`/rooms/${id}/`),
  checkAvailability: (id, dates) => apiClient.post(`/rooms/${id}/availability/`, dates),
};
```

### Implementation Order Priority

#### Phase 1 (Week 1): Core Foundation
1. **apiClient.js** - Base API configuration
2. **authService.js** - Authentication
3. **LoginPage** - Real authentication
4. **DashboardPage** - Basic stats

#### Phase 2 (Week 2): User Management
1. **userService.js** - User operations
2. **UserManagementPage** - Full CRUD
3. **ProfilePage** - Profile management
4. **SettingsPage** - User settings

#### Phase 3 (Week 3): Building & Service Unit Management
1. **buildingService.js** - Building/room operations
2. **serviceUnitService.js** - Service unit operations
3. **BuildingManagementPage** - Full CRUD
4. **ServiceUnitManagementPage** - Full CRUD

#### Phase 4 (Week 4): Allocation System
1. **allocationService.js** - Allocation operations
2. **AllocationManagementPage** - Allocation CRUD
3. **AllocationRequestPage** - Request workflow
4. **MembersListPage** - Member management

#### Phase 5 (Week 5): Booking & Payments
1. **bookingService.js** - Booking operations
2. **Booking flow pages** - Complete booking process
3. **PaymentPage** - Payment integration
4. **RoomDetailsPage** - Room information

#### Phase 6 (Week 6): Analytics & Notifications
1. **dashboardService.js** - Analytics
2. **notificationService.js** - Notifications
3. **ReportsPage** - Reporting system
4. **Real-time notifications** - WebSocket integration

---

## Testing Checklist

### For Each API Integration:
- [ ] Test successful API calls
- [ ] Test error handling (401, 403, 404, 500)
- [ ] Test form validation
- [ ] Test loading states
- [ ] Test role-based access
- [ ] Test pagination (where applicable)
- [ ] Test search and filtering
- [ ] Test CRUD operations

### Authentication Testing:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token refresh
- [ ] Logout functionality
- [ ] Protected route access
- [ ] Role-based page access

### Error Scenarios:
- [ ] Network disconnection
- [ ] Server downtime
- [ ] Invalid token
- [ ] Permission denied
- [ ] Validation errors

---

This checklist provides a clear roadmap for implementing API integration for each frontend component, ensuring comprehensive coverage of all functionality.
