from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()


class EventType(models.TextChoices):
    # Authentication Events
    LOGIN = 'login', 'User Login'
    LOGOUT = 'logout', 'User Logout'
    PASSWORD_CHANGE = 'password_change', 'Password Change'
    PROFILE_UPDATE = 'profile_update', 'Profile Update'
    
    # Allocation Events
    ALLOCATION_CREATE = 'allocation_create', 'Allocation Created'
    ALLOCATION_UPDATE = 'allocation_update', 'Allocation Updated'
    ALLOCATION_DELETE = 'allocation_delete', 'Allocation Deleted'
    ALLOCATION_REQUEST = 'allocation_request', 'Allocation Requested'
    ALLOCATION_APPROVE = 'allocation_approve', 'Allocation Approved'
    ALLOCATION_REJECT = 'allocation_reject', 'Allocation Rejected'
    
    # Booking Events
    BOOKING_CREATE = 'booking_create', 'Booking Created'
    BOOKING_UPDATE = 'booking_update', 'Booking Updated'
    BOOKING_CANCEL = 'booking_cancel', 'Booking Cancelled'
    BOOKING_CONFIRM = 'booking_confirm', 'Booking Confirmed'
    BOOKING_PAYMENT = 'booking_payment', 'Booking Payment'
    
    # Building Management Events
    BUILDING_CREATE = 'building_create', 'Building Created'
    BUILDING_UPDATE = 'building_update', 'Building Updated'
    BUILDING_DELETE = 'building_delete', 'Building Deleted'
    ROOM_CREATE = 'room_create', 'Room Created'
    ROOM_UPDATE = 'room_update', 'Room Updated'
    ROOM_DELETE = 'room_delete', 'Room Deleted'
    
    # User Management Events
    USER_CREATE = 'user_create', 'User Created'
    USER_UPDATE = 'user_update', 'User Updated'
    USER_DELETE = 'user_delete', 'User Deleted'
    USER_ACTIVATE = 'user_activate', 'User Activated'
    USER_DEACTIVATE = 'user_deactivate', 'User Deactivated'
    
    # Service Unit Events
    SERVICE_UNIT_CREATE = 'service_unit_create', 'Service Unit Created'
    SERVICE_UNIT_UPDATE = 'service_unit_update', 'Service Unit Updated'
    SERVICE_UNIT_DELETE = 'service_unit_delete', 'Service Unit Deleted'
    
    # Report Events
    REPORT_GENERATE = 'report_generate', 'Report Generated'
    REPORT_EXPORT = 'report_export', 'Report Exported'
    REPORT_VIEW = 'report_view', 'Report Viewed'
    
    # System Events
    SYSTEM_BACKUP = 'system_backup', 'System Backup'
    SYSTEM_MAINTENANCE = 'system_maintenance', 'System Maintenance'
    DATA_IMPORT = 'data_import', 'Data Import'
    DATA_EXPORT = 'data_export', 'Data Export'


class UserEvent(models.Model):
    """
    Model to track all user activities in the system for analytics and auditing
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='events'
    )
    event_type = models.CharField(
        max_length=50,
        choices=EventType.choices,
        db_index=True
    )
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    # Additional context data
    resource_type = models.CharField(max_length=50, null=True, blank=True)  # e.g., 'allocation', 'building'
    resource_id = models.PositiveIntegerField(null=True, blank=True)  # ID of the affected resource
    
    # Metadata for storing additional event details
    metadata = models.JSONField(default=dict, blank=True)
    
    # Location information
    location = models.CharField(max_length=255, null=True, blank=True)
    
    # Success/Failure status
    success = models.BooleanField(default=True)
    error_message = models.TextField(null=True, blank=True)
    
    # Session information
    session_key = models.CharField(max_length=40, null=True, blank=True)
    
    class Meta:
        db_table = 'analytics_user_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['timestamp', 'event_type']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['success']),
        ]
    
    def __str__(self):
        username = self.user.username if self.user else 'Anonymous'
        return f"{username} - {self.get_event_type_display()} at {self.timestamp}"
    
    @property
    def formatted_metadata(self):
        """Return formatted metadata for display"""
        if not self.metadata:
            return None
        return json.dumps(self.metadata, indent=2)
    
    def set_metadata(self, **kwargs):
        """Helper method to set metadata"""
        self.metadata.update(kwargs)
        self.save(update_fields=['metadata'])


class DashboardMetrics(models.Model):
    """
    Model to store pre-calculated dashboard metrics for performance
    """
    date = models.DateField(db_index=True)
    total_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    total_allocations = models.PositiveIntegerField(default=0)
    new_allocations = models.PositiveIntegerField(default=0)
    total_buildings = models.PositiveIntegerField(default=0)
    total_rooms = models.PositiveIntegerField(default=0)
    occupied_rooms = models.PositiveIntegerField(default=0)
    pending_requests = models.PositiveIntegerField(default=0)
    
    # Event counts
    login_count = models.PositiveIntegerField(default=0)
    allocation_events = models.PositiveIntegerField(default=0)
    system_events = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analytics_dashboard_metrics'
        unique_together = ['date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Metrics for {self.date}"


class ReportExport(models.Model):
    """
    Model to track report exports for analytics
    """
    EXPORT_FORMATS = (
        ('pdf', 'PDF'),
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_exports')
    report_type = models.CharField(max_length=100)
    export_format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(null=True, blank=True)  # in bytes
    
    # Filter parameters used
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    filters = models.JSONField(default=dict, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'analytics_report_exports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.export_format} by {self.user.username}"
