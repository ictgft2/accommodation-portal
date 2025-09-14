"""
Django Admin configuration for allocations app.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import RoomAllocation, AllocationRequest


@admin.register(RoomAllocation)
class RoomAllocationAdmin(admin.ModelAdmin):
    """
    Admin interface for RoomAllocation model.
    """
    list_display = [
        'room', 'get_allocated_to', 'allocation_type', 'is_active',
        'start_date', 'end_date', 'get_duration', 'allocation_date'
    ]
    
    list_filter = [
        'allocation_type', 'is_active', 'start_date', 'end_date', 'allocation_date'
    ]
    
    search_fields = [
        'room__room_number', 'room__building__name',
        'user__username', 'user__email',
        'service_unit__name', 'notes'
    ]
    
    readonly_fields = ['allocation_date']
    
    fieldsets = (
        (None, {
            'fields': ('room', 'allocation_type', 'is_active')
        }),
        ('Allocation Details', {
            'fields': ('user', 'service_unit', 'allocated_by', 'start_date', 'end_date')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('allocation_date',),
            'classes': ('collapse',)
        }),
    )
    
    def get_allocated_to(self, obj):
        """Display allocated to information."""
        if obj.user:
            return f"{obj.user.get_full_name()} ({obj.user.role})"
        elif obj.service_unit:
            return f"{obj.service_unit.name} (Service Unit)"
        return "Unknown"
    get_allocated_to.short_description = 'Allocated To'
    
    def get_duration(self, obj):
        """Calculate and display allocation duration."""
        if obj.start_date and obj.end_date:
            duration = (obj.end_date - obj.start_date).days + 1
            return f"{duration} days"
        return "Unknown"
    get_duration.short_description = 'Duration'
    
    def get_queryset(self, request):
        """Filter based on user permissions."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'service_unit') and request.user.service_unit:
            return qs.filter(service_unit=request.user.service_unit)
        return qs.filter(user=request.user)


@admin.register(AllocationRequest)
class AllocationRequestAdmin(admin.ModelAdmin):
    """
    Admin interface for AllocationRequest model.
    """
    list_display = [
        'requested_by', 'preferred_room', 'status',
        'requested_start_date', 'requested_end_date', 'created_at'
    ]
    
    list_filter = ['status', 'created_at', 'requested_start_date']
    
    search_fields = [
        'requested_by__username', 'requested_by__email',
        'preferred_room__room_number', 'preferred_room__building__name',
        'request_reason', 'review_notes'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('requested_by', 'preferred_room', 'preferred_building', 'status')
        }),
        ('Request Details', {
            'fields': (
                'requested_start_date', 'requested_end_date',
                'request_reason'
            )
        }),
        ('Admin Actions', {
            'fields': ('reviewed_by', 'review_notes', 'reviewed_at', 'created_allocation')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter based on user permissions."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Service unit admins can see requests from their unit
        if hasattr(request.user, 'service_unit') and request.user.service_unit:
            return qs.filter(requested_by__service_unit=request.user.service_unit)
        return qs.filter(requested_by=request.user)
