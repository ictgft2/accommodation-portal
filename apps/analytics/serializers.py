from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import UserEvent, DashboardMetrics, ReportExport, EventType

User = get_user_model()


class UserEventSerializer(serializers.ModelSerializer):
    """Serializer for UserEvent model"""
    user_display = serializers.SerializerMethodField()
    event_type_display = serializers.SerializerMethodField()
    formatted_timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = UserEvent
        fields = [
            'id', 'user', 'user_display', 'event_type', 'event_type_display',
            'timestamp', 'formatted_timestamp', 'ip_address', 'user_agent',
            'resource_type', 'resource_id', 'metadata', 'location',
            'success', 'error_message', 'session_key'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_user_display(self, obj):
        """Return user display name"""
        if obj.user:
            return f"{obj.user.get_full_name()} ({obj.user.username})"
        return "Anonymous"
    
    def get_event_type_display(self, obj):
        """Return human-readable event type"""
        return obj.get_event_type_display()
    
    def get_formatted_timestamp(self, obj):
        """Return formatted timestamp"""
        return obj.timestamp.strftime("%Y-%m-%d %H:%M:%S")


class EventSummarySerializer(serializers.Serializer):
    """Serializer for event summary data"""
    event_type = serializers.CharField()
    event_type_display = serializers.CharField()
    count = serializers.IntegerField()
    success_rate = serializers.FloatField()
    last_occurrence = serializers.DateTimeField()


class DashboardMetricsSerializer(serializers.ModelSerializer):
    """Serializer for dashboard metrics"""
    formatted_date = serializers.SerializerMethodField()
    occupancy_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = DashboardMetrics
        fields = [
            'date', 'formatted_date', 'total_users', 'active_users',
            'total_allocations', 'new_allocations', 'total_buildings',
            'total_rooms', 'occupied_rooms', 'occupancy_rate', 'pending_requests',
            'login_count', 'allocation_events', 'system_events'
        ]
    
    def get_formatted_date(self, obj):
        """Return formatted date"""
        return obj.date.strftime("%Y-%m-%d")
    
    def get_occupancy_rate(self, obj):
        """Calculate occupancy rate percentage"""
        if obj.total_rooms > 0:
            return round((obj.occupied_rooms / obj.total_rooms) * 100, 2)
        return 0.0


class ActivityChartDataSerializer(serializers.Serializer):
    """Serializer for chart data"""
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField(child=serializers.DictField())


class UserActivitySerializer(serializers.Serializer):
    """Serializer for user activity data"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    role = serializers.CharField()
    total_events = serializers.IntegerField()
    last_activity = serializers.DateTimeField()
    event_breakdown = serializers.DictField()


class ReportExportSerializer(serializers.ModelSerializer):
    """Serializer for report exports"""
    user_display = serializers.SerializerMethodField()
    formatted_created_at = serializers.SerializerMethodField()
    formatted_completed_at = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportExport
        fields = [
            'id', 'user', 'user_display', 'report_type', 'export_format',
            'file_name', 'file_size', 'file_size_mb', 'date_from', 'date_to',
            'filters', 'status', 'created_at', 'formatted_created_at',
            'completed_at', 'formatted_completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']
    
    def get_user_display(self, obj):
        """Return user display name"""
        return f"{obj.user.get_full_name()} ({obj.user.username})"
    
    def get_formatted_created_at(self, obj):
        """Return formatted creation date"""
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S")
    
    def get_formatted_completed_at(self, obj):
        """Return formatted completion date"""
        if obj.completed_at:
            return obj.completed_at.strftime("%Y-%m-%d %H:%M:%S")
        return None
    
    def get_file_size_mb(self, obj):
        """Return file size in MB"""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None


class ReportExportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating report exports"""
    
    class Meta:
        model = ReportExport
        fields = [
            'report_type', 'export_format', 'date_from', 'date_to', 'filters'
        ]
    
    def validate_export_format(self, value):
        """Validate export format"""
        valid_formats = ['pdf', 'csv', 'excel', 'json']
        if value not in valid_formats:
            raise serializers.ValidationError(f"Invalid format. Must be one of: {', '.join(valid_formats)}")
        return value
    
    def validate(self, data):
        """Validate date range"""
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError("Start date must be before end date")
        return data


class AnalyticsFilterSerializer(serializers.Serializer):
    """Serializer for analytics filters"""
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    event_types = serializers.ListField(
        child=serializers.ChoiceField(choices=EventType.choices),
        required=False
    )
    users = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    resource_types = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    success_only = serializers.BooleanField(required=False, default=None)
    
    def validate(self, data):
        """Validate filter data"""
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError("Start date must be before end date")
        
        # Limit date range to prevent performance issues
        if data.get('date_from') and data.get('date_to'):
            date_range = data['date_to'] - data['date_from']
            if date_range.days > 365:
                raise serializers.ValidationError("Date range cannot exceed 365 days")
        
        return data


class SystemStatsSerializer(serializers.Serializer):
    """Serializer for system statistics"""
    total_events = serializers.IntegerField()
    events_today = serializers.IntegerField()
    events_this_week = serializers.IntegerField()
    events_this_month = serializers.IntegerField()
    most_active_users = serializers.ListField()
    most_common_events = serializers.ListField()
    peak_activity_hours = serializers.ListField()
    error_rate = serializers.FloatField()
    average_session_duration = serializers.FloatField()


class ExportFormatChoiceSerializer(serializers.Serializer):
    """Serializer for export format choices"""
    value = serializers.CharField()
    label = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
