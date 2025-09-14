"""
Django Admin configuration for service units app.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import ServiceUnit


@admin.register(ServiceUnit)
class ServiceUnitAdmin(admin.ModelAdmin):
    """
    Admin interface for ServiceUnit model.
    """
    list_display = [
        'name', 'admin', 'get_member_count', 
        'get_allocated_rooms_count', 'created_at'
    ]
    
    list_filter = ['created_at']
    
    search_fields = ['name', 'description', 'admin__username', 'admin__email']
    
    readonly_fields = ['created_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'admin')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_member_count(self, obj):
        """Display member count in list view."""
        return obj.get_member_count()
    get_member_count.short_description = 'Members'
    get_member_count.admin_order_field = 'members_count'
    
    def get_allocated_rooms_count(self, obj):
        """Display allocated rooms count."""
        return obj.get_allocated_rooms_count()
    get_allocated_rooms_count.short_description = 'Allocated Rooms'
    
    def get_queryset(self, request):
        """Filter based on user permissions."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'service_unit') and request.user.service_unit:
            return qs.filter(id=request.user.service_unit.id)
        return qs.none()
    
    def has_add_permission(self, request):
        """Only superusers can add service units."""
        return request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete service units."""
        return request.user.is_superuser
