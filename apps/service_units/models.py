"""
Service Unit models for Accommodation Portal.
Based on the SQL schema design for managing service units like Choir, Ushers, Protocol, Media, etc.
"""

from django.db import models
from django.conf import settings


class ServiceUnit(models.Model):
    """
    Service Unit model representing groups like Choir, Ushers, Protocol, Media.
    
    Maps to SQL ServiceUnits table:
    - ServiceUnitID (auto-generated primary key)
    - Name (unique service unit name)
    - Description
    - AdminID (foreign key to User)
    - CreatedAt (auto timestamp)
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the service unit (e.g., Choir, Ushers, Protocol, Media)"
    )
    
    description = models.TextField(
        max_length=255,
        blank=True,
        help_text="Description of the service unit's purpose and activities"
    )
    
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='administered_units',
        limit_choices_to={'role__in': ['SuperAdmin', 'Deacon']},
        help_text="Admin user responsible for managing this service unit"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this service unit was created"
    )
    
    class Meta:
        db_table = 'service_units'
        verbose_name = 'Service Unit'
        verbose_name_plural = 'Service Units'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        """Return the number of members in this service unit."""
        return self.members.filter(is_active=True).count()
    
    def get_member_count(self):
        """Method version of member_count for API serializers."""
        return self.member_count

    @property
    def allocated_rooms_count(self):
        """Return the number of rooms allocated to this service unit."""
        return self.room_allocations.count()
    
    def get_allocated_rooms_count(self):
        """Method version of allocated_rooms_count for API serializers."""
        return self.allocated_rooms_count
    
    def can_be_managed_by(self, user):
        """Check if a user can manage this service unit."""
        if not user or not user.is_authenticated:
            return False
        
        # Super admin can manage any service unit
        if user.is_super_admin():
            return True

        # Deacon can only manage their assigned unit
        if user.is_deacon():
            return self.admin == user

        return False
    
    def get_available_rooms(self):
        """Get rooms that are allocated to this service unit but not assigned to individuals."""
        from django.apps import apps
        RoomAllocation = apps.get_model('allocations', 'RoomAllocation')
        Room = apps.get_model('buildings', 'Room')
        
        allocated_room_ids = RoomAllocation.objects.filter(
            service_unit=self,
            allocation_type='ServiceUnit'
        ).values_list('room_id', flat=True)
        
        # Get rooms that are allocated to service unit but not individually assigned
        individual_allocated_room_ids = RoomAllocation.objects.filter(
            service_unit=self,
            allocation_type__in=['Pastor', 'Member'],
            user__isnull=False
        ).values_list('room_id', flat=True)
        
        return Room.objects.filter(
            id__in=allocated_room_ids
        ).exclude(
            id__in=individual_allocated_room_ids
        )
    
    def save(self, *args, **kwargs):
        """Override save to perform validation."""
        # Ensure admin has appropriate role
        if self.admin and not self.admin.can_allocate_rooms():
            raise ValueError("Admin must be either SuperAdmin or ServiceUnitAdmin")
        
        super().save(*args, **kwargs)
