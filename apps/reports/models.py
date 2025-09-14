"""
Reports models for Accommodation Portal.
Models for managing and storing report metadata.
Note: Most reports will be generated dynamically, but we can store report configurations and cached results.
"""

from django.db import models
from django.conf import settings


class ReportTemplate(models.Model):
    """
    Model for storing report templates and configurations.
    """
    
    class ReportTypeChoices(models.TextChoices):
        OCCUPANCY = 'occupancy', 'Occupancy Report'
        ALLOCATION = 'allocation', 'Allocation Report'
        SERVICE_UNIT = 'service_unit', 'Service Unit Report'
        MEMBER = 'member', 'Member Report'
        BUILDING = 'building', 'Building Report'
        CUSTOM = 'custom', 'Custom Report'
    
    name = models.CharField(
        max_length=100,
        help_text="Name of the report template"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Description of what this report shows"
    )
    
    report_type = models.CharField(
        max_length=20,
        choices=ReportTypeChoices.choices,
        help_text="Type of report"
    )
    
    query_config = models.JSONField(
        default=dict,
        help_text="Configuration for the report query (filters, parameters, etc.)"
    )
    
    is_public = models.BooleanField(
        default=False,
        help_text="Whether this report can be viewed by all users"
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='report_templates',
        help_text="User who created this report template"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'report_templates'
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ReportExecution(models.Model):
    """
    Model for tracking report executions and storing cached results.
    """
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
    
    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='executions',
        help_text="Report template that was executed"
    )
    
    executed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='report_executions',
        help_text="User who executed the report"
    )
    
    parameters = models.JSONField(
        default=dict,
        help_text="Parameters used for this execution"
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        help_text="Status of the report execution"
    )
    
    result_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Cached report result data"
    )
    
    error_message = models.TextField(
        blank=True,
        help_text="Error message if execution failed"
    )
    
    execution_time_seconds = models.FloatField(
        null=True,
        blank=True,
        help_text="Time taken to execute the report in seconds"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'report_executions'
        verbose_name = 'Report Execution'
        verbose_name_plural = 'Report Executions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.executed_by.full_name} ({self.status})"
