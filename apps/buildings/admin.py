"""
Django Admin configuration for buildings app.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Building, Room, RoomPicture


class RoomInline(admin.TabularInline):
    """Inline admin for rooms within buildings."""
    model = Room
    extra = 0
    fields = [
        'room_number', 'capacity', 'has_toilet', 'has_washroom'
    ]
    readonly_fields = []


class RoomPictureInline(admin.TabularInline):
    """Inline admin for room pictures."""
    model = RoomPicture
    extra = 0
    fields = ['image', 'caption', 'is_primary']


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    """
    Admin interface for Building model.
    """
    list_display = [
        'name', 'location', 'get_total_rooms',
        'get_available_rooms', 'get_occupancy_rate', 'created_at'
    ]
    
    list_filter = ['created_at']
    
    search_fields = ['name', 'location', 'description']
    
    readonly_fields = ['created_at']
    
    inlines = [RoomInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'location', 'description')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_total_rooms(self, obj):
        """Display total rooms count."""
        return obj.get_total_rooms()
    get_total_rooms.short_description = 'Total Rooms'
    
    def get_available_rooms(self, obj):
        """Display available rooms count."""
        return obj.get_available_rooms()
    get_available_rooms.short_description = 'Available'
    
    def get_occupancy_rate(self, obj):
        """Display occupancy rate."""
        rate = obj.occupancy_rate  # Use property directly instead of method
        return f"{rate:.1f}%"
    get_occupancy_rate.short_description = 'Occupancy Rate'
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete buildings."""
        return request.user.is_superuser


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """
    Admin interface for Room model.
    """
    list_display = [
        'room_number', 'building', 'capacity',
        'has_toilet', 'has_washroom', 'is_available_status'
    ]
    
    list_filter = [
        'building', 'capacity'
    ]
    
    search_fields = ['room_number', 'building__name']
    
    readonly_fields = ['created_at']
    
    inlines = [RoomPictureInline]
    
    fieldsets = (
        (None, {
            'fields': ('room_number', 'building', 'capacity')
        }),
        ('Facilities', {
            'fields': ('has_toilet', 'has_washroom')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def is_available_status(self, obj):
        """Display availability status with color coding."""
        if not obj.is_allocated:
            return format_html('<span style="color: green;">✓ Available</span>')
        else:
            return format_html('<span style="color: red;">✗ Occupied</span>')
    is_available_status.short_description = 'Status'
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete rooms."""
        return request.user.is_superuser


@admin.register(RoomPicture)
class RoomPictureAdmin(admin.ModelAdmin):
    """
    Admin interface for RoomPicture model.
    """
    list_display = ['room', 'caption', 'is_primary', 'uploaded_at']
    list_filter = ['is_primary', 'uploaded_at']
    search_fields = ['room__room_number', 'room__building__name', 'caption']
    readonly_fields = ['uploaded_at']
