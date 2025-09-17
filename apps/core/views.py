"""
Core app views for dashboard and system-wide functionality.
Provides dashboard statistics and activities based on user roles.
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

# Import models safely
try:
    from apps.authentication.models import User
except ImportError:
    User = None

try:
    from apps.buildings.models import Building, Room
except ImportError:
    Building = None
    Room = None

try:
    from apps.service_units.models import ServiceUnit
except ImportError:
    ServiceUnit = None

try:
    from apps.allocations.models import RoomAllocation
except ImportError:
    RoomAllocation = None


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get role-based dashboard statistics.
    Returns different stats based on user role (SuperAdmin, ServiceUnitAdmin, Pastor, Member).
    """
    try:
        stats_data = get_dashboard_stats_data(request.user)
        return Response({
            'success': True,
            'data': stats_data,
            'role': request.user.role,
            'timestamp': timezone.now()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch dashboard statistics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_activities(request):
    """
    Get recent activities for dashboard based on user role.
    Returns role-specific recent activities and notifications.
    """
    try:
        activities_data = get_dashboard_activities_data(request.user)
        return Response({
            'success': True,
            'data': activities_data,
            'role': request.user.role,
            'count': len(activities_data),
            'timestamp': timezone.now()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch dashboard activities'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    """
    Get combined dashboard data (stats + activities) in a single API call.
    Optimized endpoint for dashboard page to reduce API calls.
    """
    user = request.user
    
    try:
        # Get stats and activities data directly
        stats_data = get_dashboard_stats_data(user)
        activities_data = get_dashboard_activities_data(user)
            
        return Response({
            'success': True,
            'data': {
                'stats': stats_data,
                'activities': activities_data,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'service_unit': user.service_unit.name if user.service_unit else None
                }
            },
            'timestamp': timezone.now()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch dashboard summary'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Helper functions to separate business logic from views
def get_dashboard_stats_data(user):
    """Extract dashboard statistics logic into a reusable function."""
    role = user.role
    
    try:
        if role == 'SuperAdmin':
            # Calculate real allocation statistics
            total_rooms = Room.objects.count() if Room else 0
            active_allocations = RoomAllocation.objects.filter(is_active=True).count() if RoomAllocation else 0
            occupied_rooms = Room.objects.filter(is_allocated=True).count() if Room else 0
            available_rooms = Room.objects.filter(is_allocated=False).count() if Room else 0
            occupancy_rate = round((occupied_rooms / total_rooms) * 100) if total_rooms > 0 else 0
            
            stats = {
                'totalUsers': User.objects.count() if User else 0,
                'totalBuildings': Building.objects.count() if Building else 0,
                'totalRooms': total_rooms,
                'totalServiceUnits': ServiceUnit.objects.count() if ServiceUnit else 0,
                'occupancyRate': occupancy_rate,
                'activeAllocations': active_allocations,
                'availableRooms': available_rooms,
                'occupiedRooms': occupied_rooms,
                'newUsersThisMonth': _get_new_users_count(),
                'pendingRequests': 0,  # Will implement when requests model is created
                'monthlyRevenue': 0,   # Will implement when payment model is created
                'maintenanceRequests': 0  # Will implement when maintenance model is created
            }
            
        elif role == 'ServiceUnitAdmin':
            # Get user's service unit
            service_unit = getattr(user, 'service_unit', None)
            if service_unit:
                # Calculate real stats for service unit
                service_unit_allocations = RoomAllocation.objects.filter(
                    service_unit=service_unit,
                    is_active=True
                ) if RoomAllocation else []
                
                allocated_rooms_count = service_unit_allocations.count() if RoomAllocation else 0
                
                # Get real member count from users in this service unit
                total_members = User.objects.filter(service_unit=service_unit).count() if User else 0
                
                # Calculate occupancy rate for service unit rooms
                service_unit_rooms = [alloc.room for alloc in service_unit_allocations] if RoomAllocation else []
                total_capacity = sum(room.capacity for room in service_unit_rooms) if service_unit_rooms else 0
                occupancy_rate = round((total_members / total_capacity) * 100) if total_capacity > 0 else 0
                
                stats = {
                    'totalMembers': total_members,
                    'allocatedRooms': allocated_rooms_count,
                    'activeAllocations': allocated_rooms_count,
                    'totalCapacity': total_capacity,
                    'occupancyRate': occupancy_rate,
                    'serviceUnitName': service_unit.name,
                    'serviceUnitId': service_unit.id,
                    'pendingRequests': 0,  # Will implement when requests model is created
                    'upcomingCheckouts': 0,  # Will implement when checkout system is created
                    'upcomingCheckins': 0   # Will implement when checkin system is created
                }
            else:
                stats = {
                    'totalMembers': 0,
                    'allocatedRooms': 0,
                    'activeAllocations': 0,
                    'pendingRequests': 0,
                    'upcomingCheckouts': 0,
                    'upcomingCheckins': 0,
                    'occupancyRate': 0,
                    'serviceUnitName': 'No Service Unit Assigned',
                    'serviceUnitId': None
                }
                
        elif role == 'Pastor':
            # For Pastor role, show stats across all service units and members they may oversee
            # Assuming pastors have oversight over the accommodation system
            total_members = User.objects.filter(role='Member').count() if User else 0
            total_service_units = ServiceUnit.objects.count() if ServiceUnit else 0
            active_allocations = RoomAllocation.objects.filter(is_active=True).count() if RoomAllocation else 0
            
            # Calculate total assigned rooms across all service units
            assigned_rooms = Room.objects.filter(is_allocated=True).count() if Room else 0
            
            stats = {
                'assignedRooms': assigned_rooms,
                'totalMembers': total_members,
                'totalServiceUnits': total_service_units,
                'activeAllocations': active_allocations,
                'congregationSize': total_members,  # Same as total members for pastoral oversight
                'activeMembers': User.objects.filter(role='Member', is_active=True).count() if User else 0,
                'upcomingServices': 0,  # Will implement when events system is created
                'pendingVisits': 0,     # Will implement when visits tracking is created
                'monthlyReports': 0     # Will implement when reports system is created
            }
            
        elif role == 'Member':
            # Get user's current allocation
            current_allocation = None
            if RoomAllocation:
                current_allocation = RoomAllocation.objects.filter(
                    user=user,
                    is_active=True
                ).first()
            
            if current_allocation:
                room = current_allocation.room
                
                # Get roommates (other active allocations for the same room)
                roommates_count = RoomAllocation.objects.filter(
                    room=room,
                    is_active=True
                ).exclude(user=user).count() if RoomAllocation else 0
                
                # Get total people in the room including user
                total_occupants = roommates_count + 1
                
                stats = {
                    'currentRoom': f'Room {room.room_number}, {room.building.name}',
                    'checkInDate': current_allocation.start_date.strftime('%Y-%m-%d'),
                    'checkOutDate': current_allocation.end_date.strftime('%Y-%m-%d'),
                    'serviceUnit': current_allocation.service_unit.name if current_allocation.service_unit else 'Not Assigned',
                    'allocationType': current_allocation.allocation_type,
                    'roomCapacity': room.capacity,
                    'roommates': roommates_count,
                    'totalOccupants': total_occupants,
                    'roomHasToilet': room.has_toilet,
                    'roomHasWashroom': room.has_washroom,
                    'allocationStatus': 'Active',
                    'messagesCount': 0,  # Will implement when messaging is created
                    'upcomingEvents': 0  # Will implement when events are created
                }
            else:
                # Get user's service unit info even if no allocation
                user_service_unit = getattr(user, 'service_unit', None)
                service_unit_name = user_service_unit.name if user_service_unit else 'Not Assigned'
                
                stats = {
                    'currentRoom': 'No Current Allocation',
                    'checkInDate': None,
                    'checkOutDate': None,
                    'serviceUnit': service_unit_name,
                    'allocationType': None,
                    'allocationStatus': 'No Active Allocation',
                    'roommates': 0,
                    'totalOccupants': 0,
                    'messagesCount': 0,
                    'upcomingEvents': 0
                }
            
        else:  # Guest role
            stats = {
                'message': 'Welcome! Please contact administration for room allocation.',
                'availableBuildings': Building.objects.count() if Building else 0,
                'contactInfo': 'admin@accommodation.com'
            }
            
        return stats
        
    except Exception as e:
        return {
            'error': str(e),
            'message': 'Failed to fetch dashboard statistics'
        }


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_activities(request):
    """
    Get recent activities for dashboard based on user role.
    Returns role-specific recent activities and notifications.
    """
    user = request.user
    role = user.role
    
    try:
        if role == 'SuperAdmin':
            activities = [
                {
                    'id': 1,
                    'type': 'user_registration',
                    'title': 'New User Registration',
                    'description': 'John Doe registered as a new member',
                    'timestamp': (timezone.now() - timedelta(minutes=30)).isoformat(),
                    'icon': 'UserPlus',
                    'priority': 'medium'
                },
                {
                    'id': 2,
                    'type': 'building_created',
                    'title': 'Building Added',
                    'description': 'New building "Heritage Lodge" was added to the system',
                    'timestamp': (timezone.now() - timedelta(hours=2)).isoformat(),
                    'icon': 'Building',
                    'priority': 'high'
                },
                {
                    'id': 3,
                    'type': 'allocation_request',
                    'title': 'Allocation Request',
                    'description': 'Room allocation requested for Youth Service Unit',
                    'timestamp': (timezone.now() - timedelta(hours=4)).isoformat(),
                    'icon': 'ClipboardList',
                    'priority': 'high'
                },
                {
                    'id': 4,
                    'type': 'maintenance_request',
                    'title': 'Maintenance Request',
                    'description': 'Air conditioning repair needed in Room 305',
                    'timestamp': (timezone.now() - timedelta(hours=6)).isoformat(),
                    'icon': 'AlertTriangle',
                    'priority': 'urgent'
                },
                {
                    'id': 5,
                    'type': 'payment_received',
                    'title': 'Payment Received',
                    'description': 'Monthly payment received from Adult Service Unit',
                    'timestamp': (timezone.now() - timedelta(days=1)).isoformat(),
                    'icon': 'DollarSign',
                    'priority': 'low'
                }
            ]
            
        elif role == 'ServiceUnitAdmin':
            activities = [
                {
                    'id': 1,
                    'type': 'member_added',
                    'title': 'New Member Added',
                    'description': 'Sarah Johnson joined your service unit',
                    'timestamp': (timezone.now() - timedelta(hours=1)).isoformat(),
                    'icon': 'UserCheck',
                    'priority': 'medium'
                },
                {
                    'id': 2,
                    'type': 'room_allocated',
                    'title': 'Room Allocated',
                    'description': 'Room 204 allocated to Michael Brown',
                    'timestamp': (timezone.now() - timedelta(hours=3)).isoformat(),
                    'icon': 'Home',
                    'priority': 'high'
                },
                {
                    'id': 3,
                    'type': 'checkout_reminder',
                    'title': 'Checkout Reminder',
                    'description': 'Emma Wilson\'s checkout is scheduled for tomorrow',
                    'timestamp': (timezone.now() - timedelta(hours=5)).isoformat(),
                    'icon': 'Calendar',
                    'priority': 'medium'
                }
            ]
            
        elif role == 'Pastor':
            activities = [
                {
                    'id': 1,
                    'type': 'service_scheduled',
                    'title': 'Service Scheduled',
                    'description': 'Sunday service scheduled in Main Hall',
                    'timestamp': (timezone.now() - timedelta(hours=2)).isoformat(),
                    'icon': 'Calendar',
                    'priority': 'high'
                },
                {
                    'id': 2,
                    'type': 'visit_request',
                    'title': 'Visit Request',
                    'description': 'Mary Williams requested a pastoral visit',
                    'timestamp': (timezone.now() - timedelta(hours=4)).isoformat(),
                    'icon': 'User',
                    'priority': 'medium'
                }
            ]
            
        elif role == 'Member':
            activities = [
                {
                    'id': 1,
                    'type': 'room_assigned',
                    'title': 'Room Assignment',
                    'description': 'You have been assigned to Room 204, Building A',
                    'timestamp': (timezone.now() - timedelta(days=2)).isoformat(),
                    'icon': 'Home',
                    'priority': 'high'
                },
                {
                    'id': 2,
                    'type': 'announcement',
                    'title': 'Announcement',
                    'description': 'Weekly service unit meeting scheduled for Friday',
                    'timestamp': (timezone.now() - timedelta(days=1)).isoformat(),
                    'icon': 'Bell',
                    'priority': 'medium'
                }
            ]
            
        else:  # Guest role
            activities = [
                {
                    'id': 1,
                    'type': 'welcome',
                    'title': 'Welcome',
                    'description': 'Welcome to the accommodation portal. Please contact administration for assistance.',
                    'timestamp': timezone.now().isoformat(),
                    'icon': 'Info',
                    'priority': 'low'
                }
            ]
            
        return Response({
            'success': True,
            'data': activities,
            'role': role,
            'count': len(activities),
            'timestamp': timezone.now()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch dashboard activities'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Helper functions

def get_dashboard_activities_data(user):
    """
    Extract business logic for dashboard activities - returns raw data using real database events.
    """
    from apps.analytics.models import UserEvent
    from apps.allocations.models import RoomAllocation
    from apps.authentication.models import User
    from apps.buildings.models import Building, Room
    from apps.service_units.models import ServiceUnit
    from django.db.models import Q
    
    role = user.role
    activities = []
    
    try:
        # Get recent events based on user role
        if role == 'SuperAdmin':
            # Get all recent events for super admin
            recent_events = UserEvent.objects.filter(
                timestamp__gte=timezone.now() - timedelta(days=7)
            ).order_by('-timestamp')[:10]
            
            for event in recent_events:
                activity = {
                    'id': event.id,
                    'type': event.event_type,
                    'title': _get_activity_title(event.event_type),
                    'description': _get_activity_description(event),
                    'timestamp': event.timestamp.isoformat(),
                    'icon': _get_activity_icon(event.event_type),
                    'priority': _get_activity_priority(event.event_type)
                }
                activities.append(activity)
                
        elif role == 'ServiceUnitAdmin':
            # Get events related to user's service unit
            service_unit = getattr(user, 'service_unit', None)
            if service_unit:
                recent_events = UserEvent.objects.filter(
                    Q(metadata__icontains=service_unit.name) |
                    Q(user__service_unit=service_unit),
                    timestamp__gte=timezone.now() - timedelta(days=7)
                ).order_by('-timestamp')[:8]
                
                for event in recent_events:
                    activity = {
                        'id': event.id,
                        'type': event.event_type,
                        'title': _get_activity_title(event.event_type),
                        'description': _get_activity_description(event),
                        'timestamp': event.timestamp.isoformat(),
                        'icon': _get_activity_icon(event.event_type),
                        'priority': _get_activity_priority(event.event_type)
                    }
                    activities.append(activity)
                    
        elif role == 'Pastor':
            # Get events related to pastoral activities
            recent_events = UserEvent.objects.filter(
                Q(event_type__in=['allocation_created', 'user_registered', 'room_checked_in']) |
                Q(user=user),
                timestamp__gte=timezone.now() - timedelta(days=7)
            ).order_by('-timestamp')[:6]
            
            for event in recent_events:
                activity = {
                    'id': event.id,
                    'type': event.event_type,
                    'title': _get_activity_title(event.event_type),
                    'description': _get_activity_description(event),
                    'timestamp': event.timestamp.isoformat(),
                    'icon': _get_activity_icon(event.event_type),
                    'priority': _get_activity_priority(event.event_type)
                }
                activities.append(activity)
                
        elif role == 'Member':
            # Get events related to this specific user
            recent_events = UserEvent.objects.filter(
                Q(user=user) | Q(metadata__icontains=user.username),
                timestamp__gte=timezone.now() - timedelta(days=14)
            ).order_by('-timestamp')[:5]
            
            for event in recent_events:
                activity = {
                    'id': event.id,
                    'type': event.event_type,
                    'title': _get_activity_title(event.event_type),
                    'description': _get_activity_description(event),
                    'timestamp': event.timestamp.isoformat(),
                    'icon': _get_activity_icon(event.event_type),
                    'priority': _get_activity_priority(event.event_type)
                }
                activities.append(activity)
                
        else:  # Guest role
            activities = [
                {
                    'id': 1,
                    'type': 'welcome',
                    'title': 'Welcome',
                    'description': 'Welcome to the accommodation portal. Please contact administration for assistance.',
                    'timestamp': timezone.now().isoformat(),
                    'icon': 'Info',
                    'priority': 'low'
                }
            ]
            
    except Exception as e:
        # Fallback to basic activities if there's an error
        print(f"Error fetching real activities: {e}")
        activities = [
            {
                'id': 1,
                'type': 'system',
                'title': 'System Active',
                'description': 'Dashboard is running normally',
                'timestamp': timezone.now().isoformat(),
                'icon': 'CheckCircle',
                'priority': 'low'
            }
        ]
        
    return activities


def _get_activity_title(event_type):
    """Get user-friendly title for event type"""
    titles = {
        'user_registered': 'New User Registration',
        'user_login': 'User Login',
        'user_logout': 'User Logout',
        'allocation_created': 'Room Allocation Created',
        'allocation_updated': 'Room Allocation Updated',
        'allocation_deleted': 'Room Allocation Cancelled',
        'room_checked_in': 'Room Check-in',
        'room_checked_out': 'Room Check-out',
        'building_created': 'New Building Added',
        'building_updated': 'Building Updated',
        'room_created': 'New Room Added',
        'room_updated': 'Room Updated',
        'service_unit_created': 'Service Unit Created',
        'service_unit_updated': 'Service Unit Updated',
        'booking_created': 'Booking Created',
        'booking_cancelled': 'Booking Cancelled',
        'maintenance_request': 'Maintenance Request',
        'payment_received': 'Payment Received',
        'report_generated': 'Report Generated',
        'system_backup': 'System Backup',
    }
    return titles.get(event_type, event_type.replace('_', ' ').title())


def _get_activity_description(event):
    """Generate description from event data"""
    try:
        import json
        metadata = json.loads(event.metadata) if event.metadata else {}
        
        if event.event_type == 'user_registered':
            return f"{event.user.first_name} {event.user.last_name} registered as a new {event.user.role}"
        elif event.event_type == 'allocation_created':
            room_info = metadata.get('room_number', 'Unknown')
            building_info = metadata.get('building_name', 'Unknown Building')
            return f"Room {room_info} in {building_info} allocated"
        elif event.event_type == 'user_login':
            return f"{event.user.first_name} {event.user.last_name} logged into the system"
        elif event.event_type == 'room_checked_in':
            room_info = metadata.get('room_number', 'Unknown')
            return f"Check-in completed for Room {room_info}"
        elif event.event_type == 'booking_created':
            return f"New booking created by {event.user.first_name} {event.user.last_name}"
        else:
            return metadata.get('description', f"System activity: {event.event_type}")
    except:
        return f"Activity: {event.event_type.replace('_', ' ').title()}"


def _get_activity_icon(event_type):
    """Get icon for event type"""
    icons = {
        'user_registered': 'UserPlus',
        'user_login': 'LogIn',
        'user_logout': 'LogOut',
        'allocation_created': 'Home',
        'allocation_updated': 'Edit',
        'allocation_deleted': 'Trash2',
        'room_checked_in': 'MapPin',
        'room_checked_out': 'MapPin',
        'building_created': 'Building',
        'building_updated': 'Building',
        'room_created': 'Home',
        'room_updated': 'Home',
        'service_unit_created': 'Users',
        'service_unit_updated': 'Users',
        'booking_created': 'Calendar',
        'booking_cancelled': 'X',
        'maintenance_request': 'AlertTriangle',
        'payment_received': 'DollarSign',
        'report_generated': 'FileText',
        'system_backup': 'Database',
    }
    return icons.get(event_type, 'Activity')


def _get_activity_priority(event_type):
    """Get priority level for event type"""
    priorities = {
        'user_registered': 'medium',
        'user_login': 'low',
        'user_logout': 'low',
        'allocation_created': 'high',
        'allocation_updated': 'medium',
        'allocation_deleted': 'high',
        'room_checked_in': 'medium',
        'room_checked_out': 'medium',
        'building_created': 'high',
        'building_updated': 'medium',
        'room_created': 'medium',
        'room_updated': 'low',
        'service_unit_created': 'medium',
        'service_unit_updated': 'low',
        'booking_created': 'medium',
        'booking_cancelled': 'high',
        'maintenance_request': 'urgent',
        'payment_received': 'low',
        'report_generated': 'low',
        'system_backup': 'low',
    }
    return priorities.get(event_type, 'low')

def _get_new_users_count():
    """Get count of users registered in the current month."""
    try:
        if User:
            current_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return User.objects.filter(date_joined__gte=current_month_start).count()
        return 0
    except:
        return 0
