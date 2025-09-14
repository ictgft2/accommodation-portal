"""
Room Allocation models for Accommodation Portal.
Based on the SQL schema design for managing room allocations to service units, pastors, and members.
"""

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class RoomAllocation(models.Model):
    """
    Room Allocation model for managing room assignments.
    
    Maps to SQL RoomAllocations table:
    - AllocationID (auto-generated primary key)
    - RoomID (foreign key to Room)
    - UserID (foreign key to User - nullable for service unit allocations)
    - ServiceUnitID (foreign key to ServiceUnit - nullable for individual allocations)
    - AllocatedBy (foreign key to User - who made the allocation)
    - AllocationType (choices: ServiceUnit, Pastor, Member)
    - AllocationDate (auto timestamp)
    """
    
    # Allocation type choices matching SQL CHECK constraint
    class AllocationTypeChoices(models.TextChoices):
        SERVICE_UNIT = 'ServiceUnit', 'Service Unit'
        PASTOR = 'Pastor', 'Pastor'
        MEMBER = 'Member', 'Member'
    
    room = models.ForeignKey(
        'buildings.Room',
        on_delete=models.CASCADE,
        related_name='allocations',
        help_text="Room being allocated"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='room_allocations',
        help_text="User receiving the room allocation (null for service unit allocations)"
    )
    
    service_unit = models.ForeignKey(
        'service_units.ServiceUnit',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='room_allocations',
        help_text="Service unit receiving the room allocation (null for individual allocations)"
    )
    
    allocated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='allocations_made',
        limit_choices_to={'role__in': ['SuperAdmin', 'ServiceUnitAdmin']},
        help_text="User who made this allocation"
    )
    
    allocation_type = models.CharField(
        max_length=30,
        choices=AllocationTypeChoices.choices,
        help_text="Type of allocation: ServiceUnit, Pastor, or Member"
    )
    
    allocation_date = models.DateTimeField(
        auto_now_add=True,
        help_text="When this allocation was made"
    )
    
    # Additional fields for tracking allocation details
    notes = models.TextField(
        blank=True,
        help_text="Optional notes about the allocation"
    )
    
    start_date = models.DateField(
        null=True,
        blank=True,
        help_text="When the allocation starts (optional)"
    )
    
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="When the allocation ends (optional)"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this allocation is currently active"
    )
    
    class Meta:
        db_table = 'room_allocations'
        verbose_name = 'Room Allocation'
        verbose_name_plural = 'Room Allocations'
        ordering = ['-allocation_date']
        indexes = [
            models.Index(fields=['room'], name='idx_allocations_room'),
            models.Index(fields=['user'], name='idx_allocations_user'),
            models.Index(fields=['service_unit'], name='idx_allocations_service_unit'),
            models.Index(fields=['allocation_type'], name='idx_allocations_type'),
            models.Index(fields=['allocated_by'], name='idx_allocations_allocated_by'),
            models.Index(fields=['is_active'], name='idx_allocations_active'),
        ]
    
    def __str__(self):
        if self.allocation_type == self.AllocationTypeChoices.SERVICE_UNIT:
            return f"{self.room.full_name} → {self.service_unit.name}"
        elif self.user:
            return f"{self.room.full_name} → {self.user.full_name} ({self.get_allocation_type_display()})"
        return f"{self.room.full_name} → Unknown Allocation"
    
    def clean(self):
        """Validate allocation data."""
        super().clean()
        
        # Ensure allocation type matches the provided data
        if self.allocation_type == self.AllocationTypeChoices.SERVICE_UNIT:
            if not self.service_unit:
                raise ValidationError("Service unit must be specified for ServiceUnit allocation type.")
            if self.user:
                raise ValidationError("User should not be specified for ServiceUnit allocation type.")
        
        elif self.allocation_type in [self.AllocationTypeChoices.PASTOR, self.AllocationTypeChoices.MEMBER]:
            if not self.user:
                raise ValidationError(f"User must be specified for {self.allocation_type} allocation type.")
            if not self.service_unit:
                raise ValidationError(f"Service unit must be specified for {self.allocation_type} allocation type.")
        
        # Validate user role matches allocation type
        if self.user and self.allocation_type == self.AllocationTypeChoices.PASTOR:
            if not self.user.is_pastor():
                raise ValidationError("User must have Pastor role for Pastor allocation type.")
        
        if self.user and self.allocation_type == self.AllocationTypeChoices.MEMBER:
            if not self.user.is_member():
                raise ValidationError("User must have Member role for Member allocation type.")
        
        # Validate end date is after start date
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date.")
        
        # Check if room is already allocated (only for active allocations)
        if self.is_active and self.room_id:
            existing_active = RoomAllocation.objects.filter(
                room=self.room,
                is_active=True
            ).exclude(id=self.id)
            
            if existing_active.exists():
                raise ValidationError(f"Room {self.room.full_name} is already actively allocated.")
    
    def save(self, *args, **kwargs):
        """Override save to update room allocation status."""
        self.clean()
        
        # Update room allocation status
        if self.is_active:
            self.room.allocate()
            # Deactivate other allocations for this room
            RoomAllocation.objects.filter(
                room=self.room,
                is_active=True
            ).exclude(id=self.id).update(is_active=False)
        
        super().save(*args, **kwargs)
        
        # Update room status based on active allocations
        active_allocations = RoomAllocation.objects.filter(
            room=self.room,
            is_active=True
        ).count()
        
        if active_allocations == 0:
            self.room.deallocate()
    
    def deactivate(self):
        """Deactivate this allocation."""
        self.is_active = False
        self.save()
    
    def can_be_modified_by(self, user):
        """Check if a user can modify this allocation."""
        if not user or not user.is_authenticated:
            return False
        
        # Super admin can modify any allocation
        if user.is_super_admin():
            return True
        
        # Service unit admin can modify allocations they made or in their unit
        if user.is_service_unit_admin():
            # They made the allocation
            if self.allocated_by == user:
                return True
            # It's for their service unit
            if self.service_unit and self.service_unit.admin == user:
                return True
        
        return False
    
    @property
    def allocated_to_display(self):
        """Return a human-readable string of who this is allocated to."""
        if self.allocation_type == self.AllocationTypeChoices.SERVICE_UNIT:
            return f"Service Unit: {self.service_unit.name}"
        elif self.user:
            return f"{self.get_allocation_type_display()}: {self.user.full_name}"
        return "Unknown"
    
    @property
    def duration_days(self):
        """Return allocation duration in days if start and end dates are set."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days
        return None


class AllocationRequest(models.Model):
    """
    Model for tracking room allocation requests from pastors and members.
    This is an extension to support workflow where users can request rooms.
    """
    
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'
        CANCELLED = 'Cancelled', 'Cancelled'
    
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='allocation_requests',
        help_text="User requesting the allocation"
    )
    
    preferred_room = models.ForeignKey(
        'buildings.Room',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='allocation_requests',
        help_text="Preferred room (optional)"
    )
    
    preferred_building = models.ForeignKey(
        'buildings.Building',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='allocation_requests',
        help_text="Preferred building (optional)"
    )
    
    request_reason = models.TextField(
        help_text="Reason for the room allocation request"
    )
    
    requested_start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Requested start date for allocation"
    )
    
    requested_end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Requested end date for allocation"
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        help_text="Status of the allocation request"
    )
    
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='allocation_requests_reviewed',
        help_text="User who reviewed this request"
    )
    
    review_notes = models.TextField(
        blank=True,
        help_text="Notes from the reviewer"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this request was reviewed"
    )
    
    created_allocation = models.ForeignKey(
        RoomAllocation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_request',
        help_text="Allocation created from this request (if approved)"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this request was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When this request was last updated"
    )
    
    class Meta:
        db_table = 'allocation_requests'
        verbose_name = 'Allocation Request'
        verbose_name_plural = 'Allocation Requests'
        ordering = ['-created_at']
    
    def __str__(self):
        room_info = f" for {self.preferred_room.full_name}" if self.preferred_room else ""
        return f"Request by {self.requested_by.full_name}{room_info} ({self.status})"
