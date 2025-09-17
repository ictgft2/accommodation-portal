from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from apps.allocations.models import RoomAllocation, AllocationRequest
from apps.buildings.models import Building, Room
from apps.service_units.models import ServiceUnit
from .utils import EventLogger, EventType

User = get_user_model()


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log user login events"""
    EventLogger.log_auth_event(
        event_type=EventType.LOGIN,
        user=user,
        request=request,
        login_method=getattr(user, 'backend', 'default')
    )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Log user logout events"""
    if user and user.is_authenticated:
        EventLogger.log_auth_event(
            event_type=EventType.LOGOUT,
            user=user,
            request=request
        )


@receiver(post_save, sender=RoomAllocation)
def log_allocation_save(sender, instance, created, **kwargs):
    """Log allocation creation and updates"""
    if created:
        # New allocation created
        EventLogger.log_event(
            event_type=EventType.ALLOCATION_CREATE,
            user=instance.created_by if hasattr(instance, 'created_by') else None,
            resource_type='allocation',
            resource_id=instance.id,
            allocation_details={
                'room_id': instance.room_id,
                'user_id': instance.user_id,
                'service_unit_id': instance.service_unit_id,
                'allocation_type': instance.allocation_type,
            }
        )
    else:
        # Allocation updated
        EventLogger.log_event(
            event_type=EventType.ALLOCATION_UPDATE,
            user=instance.updated_by if hasattr(instance, 'updated_by') else None,
            resource_type='allocation',
            resource_id=instance.id,
            allocation_details={
                'room_id': instance.room_id,
                'user_id': instance.user_id,
                'service_unit_id': instance.service_unit_id,
                'allocation_type': instance.allocation_type,
            }
        )


@receiver(post_delete, sender=RoomAllocation)
def log_allocation_delete(sender, instance, **kwargs):
    """Log allocation deletions"""
    EventLogger.log_event(
        event_type=EventType.ALLOCATION_DELETE,
        user=instance.deleted_by if hasattr(instance, 'deleted_by') else None,
        resource_type='allocation',
        resource_id=instance.id,
        allocation_details={
            'room_id': instance.room_id,
            'user_id': instance.user_id,
            'service_unit_id': instance.service_unit_id,
            'allocation_type': instance.allocation_type,
        }
    )


@receiver(post_save, sender=AllocationRequest)
def log_allocation_request_save(sender, instance, created, **kwargs):
    """Log allocation request events"""
    if created:
        EventLogger.log_event(
            event_type=EventType.ALLOCATION_REQUEST,
            user=instance.user,
            resource_type='allocation_request',
            resource_id=instance.id,
            request_details={
                'room_type': instance.room_type,
                'service_unit_id': instance.service_unit_id,
                'justification': instance.justification[:100] if instance.justification else None,
            }
        )
    else:
        # Check if status changed
        if hasattr(instance, '_previous_status'):
            if instance.status == 'approved' and instance._previous_status != 'approved':
                EventLogger.log_event(
                    event_type=EventType.ALLOCATION_APPROVE,
                    user=instance.approved_by if hasattr(instance, 'approved_by') else None,
                    resource_type='allocation_request',
                    resource_id=instance.id,
                    request_details={
                        'user_id': instance.user_id,
                        'room_type': instance.room_type,
                        'service_unit_id': instance.service_unit_id,
                    }
                )
            elif instance.status == 'rejected' and instance._previous_status != 'rejected':
                EventLogger.log_event(
                    event_type=EventType.ALLOCATION_REJECT,
                    user=instance.approved_by if hasattr(instance, 'approved_by') else None,
                    resource_type='allocation_request',
                    resource_id=instance.id,
                    request_details={
                        'user_id': instance.user_id,
                        'room_type': instance.room_type,
                        'service_unit_id': instance.service_unit_id,
                        'rejection_reason': instance.admin_notes[:100] if instance.admin_notes else None,
                    }
                )


@receiver(post_save, sender=Building)
def log_building_save(sender, instance, created, **kwargs):
    """Log building creation and updates"""
    event_type = EventType.BUILDING_CREATE if created else EventType.BUILDING_UPDATE
    EventLogger.log_event(
        event_type=event_type,
        user=instance.created_by if hasattr(instance, 'created_by') else None,
        resource_type='building',
        resource_id=instance.id,
        metadata={
            'name': instance.name,
            'location': instance.location,
            'description': instance.description,
            'total_rooms': instance.total_rooms,
        }
    )


@receiver(post_delete, sender=Building)
def log_building_delete(sender, instance, **kwargs):
    """Log building deletions"""
    EventLogger.log_event(
        event_type=EventType.BUILDING_DELETE,
        user=instance.deleted_by if hasattr(instance, 'deleted_by') else None,
        resource_type='building',
        resource_id=instance.id,
        metadata={
            'name': instance.name,
            'location': instance.location,
            'description': instance.description,
            'total_rooms': instance.total_rooms,
        }
    )


@receiver(post_save, sender=Room)
def log_room_save(sender, instance, created, **kwargs):
    """Log room creation and updates"""
    event_type = EventType.ROOM_CREATE if created else EventType.ROOM_UPDATE
    EventLogger.log_event(
        event_type=event_type,
        user=instance.created_by if hasattr(instance, 'created_by') else None,
        resource_type='room',
        resource_id=instance.id,
        metadata={
            'room_number': instance.room_number,
            'building_id': instance.building_id,
            'building_name': instance.building.name,
            'capacity': instance.capacity,
            'has_toilet': instance.has_toilet,
            'has_washroom': instance.has_washroom,
        }
    )


@receiver(post_delete, sender=Room)
def log_room_delete(sender, instance, **kwargs):
    """Log room deletions"""
    EventLogger.log_event(
        event_type=EventType.ROOM_DELETE,
        user=instance.deleted_by if hasattr(instance, 'deleted_by') else None,
        resource_type='room',
        resource_id=instance.id,
        metadata={
            'room_number': instance.room_number,
            'building_id': instance.building_id,
            'building_name': instance.building.name,
            'capacity': instance.capacity,
            'has_toilet': instance.has_toilet,
            'has_washroom': instance.has_washroom,
        }
    )


@receiver(post_save, sender=ServiceUnit)
def log_service_unit_save(sender, instance, created, **kwargs):
    """Log service unit creation and updates"""
    event_type = EventType.SERVICE_UNIT_CREATE if created else EventType.SERVICE_UNIT_UPDATE
    EventLogger.log_event(
        event_type=event_type,
        user=instance.created_by if hasattr(instance, 'created_by') else None,
        resource_type='service_unit',
        resource_id=instance.id,
        service_unit_details={
            'name': instance.name,
            'description': instance.description[:100] if instance.description else None,
        }
    )


@receiver(post_delete, sender=ServiceUnit)
def log_service_unit_delete(sender, instance, **kwargs):
    """Log service unit deletions"""
    EventLogger.log_event(
        event_type=EventType.SERVICE_UNIT_DELETE,
        user=instance.deleted_by if hasattr(instance, 'deleted_by') else None,
        resource_type='service_unit',
        resource_id=instance.id,
        service_unit_details={
            'name': instance.name,
            'description': instance.description[:100] if instance.description else None,
        }
    )


@receiver(post_save, sender=User)
def log_user_save(sender, instance, created, **kwargs):
    """Log user creation and updates"""
    if created:
        EventLogger.log_event(
            event_type=EventType.USER_CREATE,
            user=instance.created_by if hasattr(instance, 'created_by') else None,
            resource_type='user',
            resource_id=instance.id,
            user_details={
                'username': instance.username,
                'email': instance.email,
                'role': instance.role,
                'is_active': instance.is_active,
            }
        )
    else:
        # Check for specific updates
        changes = {}
        if hasattr(instance, '_previous_is_active'):
            if instance.is_active != instance._previous_is_active:
                event_type = EventType.USER_ACTIVATE if instance.is_active else EventType.USER_DEACTIVATE
                EventLogger.log_event(
                    event_type=event_type,
                    user=instance.updated_by if hasattr(instance, 'updated_by') else None,
                    resource_type='user',
                    resource_id=instance.id,
                    user_details={
                        'username': instance.username,
                        'previous_status': instance._previous_is_active,
                        'new_status': instance.is_active,
                    }
                )
                return
        
        # General user update
        EventLogger.log_event(
            event_type=EventType.USER_UPDATE,
            user=instance.updated_by if hasattr(instance, 'updated_by') else None,
            resource_type='user',
            resource_id=instance.id,
            user_details={
                'username': instance.username,
                'email': instance.email,
                'role': instance.role,
                'is_active': instance.is_active,
            }
        )


@receiver(post_delete, sender=User)
def log_user_delete(sender, instance, **kwargs):
    """Log user deletions"""
    EventLogger.log_event(
        event_type=EventType.USER_DELETE,
        user=instance.deleted_by if hasattr(instance, 'deleted_by') else None,
        resource_type='user',
        resource_id=instance.id,
        user_details={
            'username': instance.username,
            'email': instance.email,
            'role': instance.role,
        }
    )
