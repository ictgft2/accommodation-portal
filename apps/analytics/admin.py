from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import UserEvent, DashboardMetrics, ReportExport


@admin.register(UserEvent)
class UserEventAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_display', 'event_type_badge', 'timestamp', 
        'resource_info', 'success_badge', 'ip_address'
    ]
    list_filter = [
        'event_type', 'success', 'timestamp', 'resource_type'
    ]
    search_fields = [
        'user__username', 'user__email', 'event_type', 
        'resource_type', 'ip_address'
    ]
    readonly_fields = [
        'id', 'timestamp', 'formatted_metadata_display'
    ]
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'event_type', 'timestamp', 'success')
        }),
        ('Request Information', {
            'fields': ('ip_address', 'user_agent', 'session_key', 'location'),
            'classes': ('collapse',)
        }),
        ('Resource Information', {
            'fields': ('resource_type', 'resource_id'),
        }),
        ('Additional Data', {
            'fields': ('error_message', 'formatted_metadata_display'),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        if obj.user:
            return f"{obj.user.get_full_name()} ({obj.user.username})"
        return "Anonymous"
    user_display.short_description = "User"
    
    def event_type_badge(self, obj):
        colors = {
            'login': 'green',
            'logout': 'blue',
            'allocation_create': 'purple',
            'allocation_update': 'orange',
            'allocation_delete': 'red',
            'building_create': 'teal',
            'user_create': 'indigo',
        }
        color = colors.get(obj.event_type, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_event_type_display()
        )
    event_type_badge.short_description = "Event Type"
    
    def resource_info(self, obj):
        if obj.resource_type and obj.resource_id:
            return f"{obj.resource_type} #{obj.resource_id}"
        return "-"
    resource_info.short_description = "Resource"
    
    def success_badge(self, obj):
        if obj.success:
            return format_html(
                '<span style="color: green;">✓ Success</span>'
            )
        else:
            return format_html(
                '<span style="color: red;">✗ Failed</span>'
            )
    success_badge.short_description = "Status"
    
    def formatted_metadata_display(self, obj):
        if obj.metadata:
            import json
            return format_html(
                '<pre style="background: #f5f5f5; padding: 10px; '
                'border-radius: 3px; max-height: 200px; overflow-y: auto;">{}</pre>',
                json.dumps(obj.metadata, indent=2)
            )
        return "No metadata"
    formatted_metadata_display.short_description = "Metadata"
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user')


@admin.register(DashboardMetrics)
class DashboardMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_users', 'active_users', 'total_allocations',
        'occupancy_rate_display', 'login_count', 'system_events'
    ]
    list_filter = ['date']
    ordering = ['-date']
    readonly_fields = ['occupancy_rate_display']
    
    fieldsets = (
        ('Date', {
            'fields': ('date',)
        }),
        ('User Metrics', {
            'fields': ('total_users', 'active_users', 'login_count')
        }),
        ('Allocation Metrics', {
            'fields': ('total_allocations', 'new_allocations', 'pending_requests')
        }),
        ('Building Metrics', {
            'fields': ('total_buildings', 'total_rooms', 'occupied_rooms', 'occupancy_rate_display')
        }),
        ('Activity Metrics', {
            'fields': ('allocation_events', 'system_events')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def occupancy_rate_display(self, obj):
        if obj.total_rooms > 0:
            rate = (obj.occupied_rooms / obj.total_rooms) * 100
            color = 'green' if rate > 80 else 'orange' if rate > 60 else 'red'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
                color,
                rate
            )
        return "0%"
    occupancy_rate_display.short_description = "Occupancy Rate"


@admin.register(ReportExport)
class ReportExportAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_display', 'report_type', 'export_format',
        'status_badge', 'file_size_display', 'created_at'
    ]
    list_filter = ['export_format', 'status', 'created_at', 'report_type']
    search_fields = ['user__username', 'report_type', 'file_name']
    readonly_fields = ['created_at', 'file_size_display']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'report_type', 'export_format', 'file_name')
        }),
        ('Parameters', {
            'fields': ('date_from', 'date_to', 'filters'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('status', 'file_size', 'file_size_display')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'completed_at')
        }),
    )
    
    def user_display(self, obj):
        return f"{obj.user.get_full_name()} ({obj.user.username})"
    user_display.short_description = "User"
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.status.title()
        )
    status_badge.short_description = "Status"
    
    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
        return "Not generated"
    file_size_display.short_description = "File Size"


# Custom admin site configuration
admin.site.site_header = "Accommodation Portal Analytics"
admin.site.site_title = "Analytics Admin"
admin.site.index_title = "Analytics Administration"
