"""
Core models for Accommodation Portal.
Shared utilities and base models used across the application.
"""

from django.db import models
from django.conf import settings


class TimeStampedModel(models.Model):
    """
    Abstract base model that provides self-updating 'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class AuditLog(models.Model):
    """
    Audit Log model for tracking user actions across the system.
    
    Maps to SQL AuditLogs table (optional but recommended):
    - LogID (auto-generated primary key)
    - UserID (foreign key to User)
    - Action (action description)
    - TableName (table affected)
    - RecordID (record ID affected)
    - CreatedAt (auto timestamp)
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        help_text="User who performed the action"
    )
    
    action = models.CharField(
        max_length=255,
        help_text="Description of the action performed"
    )
    
    table_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Database table affected by the action"
    )
    
    record_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="ID of the record affected"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the user"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string of the browser/client"
    )
    
    additional_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional data related to the action"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this action was performed"
    )
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user'], name='idx_audit_logs_user'),
            models.Index(fields=['table_name'], name='idx_audit_logs_table'),
            models.Index(fields=['created_at'], name='idx_audit_logs_created'),
        ]
    
    def __str__(self):
        return f"{self.user.full_name}: {self.action} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    @classmethod
    def log_action(cls, user, action, table_name=None, record_id=None, request=None, **kwargs):
        """
        Convenience method to create audit log entries.
        
        Args:
            user: User who performed the action
            action: Description of the action
            table_name: Table affected (optional)
            record_id: Record ID affected (optional)
            request: Django request object (optional, for IP and user agent)
            **kwargs: Additional data to store
        """
        ip_address = None
        user_agent = None
        
        if request:
            # Get IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Get user agent
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        return cls.objects.create(
            user=user,
            action=action,
            table_name=table_name,
            record_id=record_id,
            ip_address=ip_address,
            user_agent=user_agent,
            additional_data=kwargs
        )


class SystemSetting(models.Model):
    """
    System settings model for storing application configuration.
    """
    
    key = models.CharField(
        max_length=100,
        unique=True,
        help_text="Setting key/name"
    )
    
    value = models.TextField(
        help_text="Setting value"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Description of what this setting controls"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this setting is active"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
        ordering = ['key']
    
    def __str__(self):
        return f"{self.key}: {self.value[:50]}..."
    
    @classmethod
    def get_setting(cls, key, default=None):
        """Get a setting value by key."""
        try:
            setting = cls.objects.get(key=key, is_active=True)
            return setting.value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_setting(cls, key, value, description=''):
        """Set a setting value."""
        setting, created = cls.objects.update_or_create(
            key=key,
            defaults={
                'value': value,
                'description': description,
                'is_active': True
            }
        )
        return setting
