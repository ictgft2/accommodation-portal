"""
Django Admin configuration for authentication app.
Provides Super Admin UI for user management and testing.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for custom User model with role-based management.
    """
    list_display = [
        'username', 'email', 'first_name', 'last_name', 
        'role', 'service_unit',
        'is_active', 'date_joined'
    ]
    
    list_filter = [
        'role', 'service_unit', 
        'is_active', 'is_staff', 'date_joined'
    ]
    
    search_fields = [
        'username', 'email', 'first_name', 'last_name', 'phone_number'
    ]
    
    ordering = ['-date_joined']
    
    readonly_fields = ['date_joined', 'last_login']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number')
        }),
        ('Role & Permissions', {
            'fields': (
                'role', 'service_unit',
                'is_active', 'is_staff', 'is_superuser'
            )
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'phone_number',
                'role', 'service_unit'
            ),
        }),
    )
    
    def get_queryset(self, request):
        """Filter users based on admin permissions."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Non-superusers can only see users in their service unit
        if hasattr(request.user, 'service_unit') and request.user.service_unit:
            return qs.filter(service_unit=request.user.service_unit)
        return qs.none()
    
    def has_change_permission(self, request, obj=None):
        """Control change permissions."""
        if request.user.is_superuser:
            return True
        if obj and hasattr(request.user, 'service_unit'):
            return obj.service_unit == request.user.service_unit
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete users."""
        return request.user.is_superuser
