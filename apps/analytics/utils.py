from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import UserEvent, EventType
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class EventLogger:
    """
    Utility class for logging user events throughout the application
    """
    
    @staticmethod
    def log_event(
        event_type,
        user=None,
        request=None,
        resource_type=None,
        resource_id=None,
        success=True,
        error_message=None,
        **metadata
    ):
        """
        Log a user event
        
        Args:
            event_type: EventType choice
            user: User instance or None for anonymous
            request: HttpRequest instance for extracting IP, user agent, etc.
            resource_type: Type of resource affected (e.g., 'allocation', 'building')
            resource_id: ID of the affected resource
            success: Whether the event was successful
            error_message: Error message if event failed
            **metadata: Additional metadata to store
        """
        try:
            event_data = {
                'event_type': event_type,
                'user': user,
                'success': success,
                'error_message': error_message,
                'resource_type': resource_type,
                'resource_id': resource_id,
                'metadata': metadata,
            }
            
            if request:
                event_data.update({
                    'ip_address': get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'session_key': request.session.session_key,
                })
                
                # Extract location if available
                if hasattr(request, 'location'):
                    event_data['location'] = request.location
            
            event = UserEvent.objects.create(**event_data)
            logger.info(f"Event logged: {event}")
            return event
            
        except Exception as e:
            logger.error(f"Failed to log event {event_type}: {str(e)}")
            return None
    
    @staticmethod
    def log_auth_event(event_type, user, request, success=True, error_message=None, login_method=None, **metadata):
        """Log authentication-related events"""
        auth_metadata = {
            'auth_method': getattr(user, 'backend', 'default') if user else None,
            'login_method': login_method,
            **metadata
        }
        
        return EventLogger.log_event(
            event_type=event_type,
            user=user,
            request=request,
            success=success,
            error_message=error_message,
            **auth_metadata
        )
    
    @staticmethod
    def log_allocation_event(event_type, user, request, allocation=None, success=True, error_message=None, **metadata):
        """Log allocation-related events"""
        event_metadata = {
            'allocation_details': {
                'id': allocation.id if allocation else None,
                'room_id': allocation.room_id if allocation else None,
                'user_id': allocation.user_id if allocation else None,
                'service_unit_id': allocation.service_unit_id if allocation else None,
            },
            **metadata
        }
        
        return EventLogger.log_event(
            event_type=event_type,
            user=user,
            request=request,
            resource_type='allocation',
            resource_id=allocation.id if allocation else None,
            success=success,
            error_message=error_message,
            **event_metadata
        )
    
    @staticmethod
    def log_building_event(event_type, user, request, building=None, room=None, success=True, error_message=None, **metadata):
        """Log building/room-related events"""
        resource_type = 'room' if room else 'building'
        resource_id = room.id if room else (building.id if building else None)
        
        event_metadata = {
            'building_details': {
                'building_id': building.id if building else None,
                'building_name': building.name if building else None,
                'room_id': room.id if room else None,
                'room_number': room.room_number if room else None,
            },
            **metadata
        }
        
        return EventLogger.log_event(
            event_type=event_type,
            user=user,
            request=request,
            resource_type=resource_type,
            resource_id=resource_id,
            success=success,
            error_message=error_message,
            **event_metadata
        )
    
    @staticmethod
    def log_user_management_event(event_type, admin_user, request, target_user=None, success=True, error_message=None, **metadata):
        """Log user management events"""
        event_metadata = {
            'target_user': {
                'id': target_user.id if target_user else None,
                'username': target_user.username if target_user else None,
                'role': target_user.role if target_user else None,
            },
            **metadata
        }
        
        return EventLogger.log_event(
            event_type=event_type,
            user=admin_user,
            request=request,
            resource_type='user',
            resource_id=target_user.id if target_user else None,
            success=success,
            error_message=error_message,
            **event_metadata
        )
    
    @staticmethod
    def log_report_event(event_type, user, request, report_type=None, export_format=None, filters=None, success=True, error_message=None):
        """Log report generation and export events"""
        event_metadata = {
            'report_type': report_type,
            'export_format': export_format,
            'filters': filters or {},
        }
        
        return EventLogger.log_event(
            event_type=event_type,
            user=user,
            request=request,
            resource_type='report',
            success=success,
            error_message=error_message,
            **event_metadata
        )


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# Convenience functions for common event types
def log_login(user, request, success=True, error_message=None):
    return EventLogger.log_auth_event(EventType.LOGIN, user, request, success, error_message)

def log_logout(user, request):
    return EventLogger.log_auth_event(EventType.LOGOUT, user, request)

def log_allocation_created(user, request, allocation):
    return EventLogger.log_allocation_event(EventType.ALLOCATION_CREATE, user, request, allocation)

def log_allocation_updated(user, request, allocation, changes=None):
    return EventLogger.log_allocation_event(
        EventType.ALLOCATION_UPDATE, 
        user, 
        request, 
        allocation,
        changes=changes
    )

def log_allocation_deleted(user, request, allocation_id, allocation_data=None):
    return EventLogger.log_event(
        EventType.ALLOCATION_DELETE,
        user=user,
        request=request,
        resource_type='allocation',
        resource_id=allocation_id,
        allocation_data=allocation_data
    )

def log_building_created(user, request, building):
    return EventLogger.log_building_event(EventType.BUILDING_CREATE, user, request, building=building)

def log_room_created(user, request, room):
    return EventLogger.log_building_event(EventType.ROOM_CREATE, user, request, building=room.building, room=room)

def log_report_generated(user, request, report_type, filters=None):
    return EventLogger.log_report_event(EventType.REPORT_GENERATE, user, request, report_type, filters=filters)

def log_report_exported(user, request, report_type, export_format, filters=None):
    return EventLogger.log_report_event(EventType.REPORT_EXPORT, user, request, report_type, export_format, filters)
