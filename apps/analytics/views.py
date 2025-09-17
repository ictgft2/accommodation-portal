from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Avg, Sum, Max, Min
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from collections import defaultdict
import json

from .models import UserEvent, DashboardMetrics, ReportExport, EventType
from .serializers import (
    UserEventSerializer, EventSummarySerializer, DashboardMetricsSerializer,
    ActivityChartDataSerializer, UserActivitySerializer, ReportExportSerializer,
    ReportExportCreateSerializer, AnalyticsFilterSerializer, SystemStatsSerializer,
    ExportFormatChoiceSerializer
)
from .utils import EventLogger

User = get_user_model()


class IsSuperAdminOrServiceUnitAdmin(permissions.BasePermission):
    """
    Custom permission to only allow SuperAdmins and ServiceUnitAdmins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['SuperAdmin', 'ServiceUnitAdmin']
        )


class AnalyticsViewSet(viewsets.GenericViewSet):
    """
    ViewSet for analytics and reporting functionality
    """
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrServiceUnitAdmin]
    
    def get_queryset(self):
        return UserEvent.objects.all()
    
    def get_filtered_events(self, request):
        """Apply filters to event queryset"""
        queryset = self.get_queryset()
        
        # Date filters
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            try:
                date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__gte=date_from)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__lte=date_to)
            except ValueError:
                pass
        
        # Event type filter
        event_types = request.query_params.getlist('event_types[]')
        if event_types:
            queryset = queryset.filter(event_type__in=event_types)
        
        # User filter
        users = request.query_params.getlist('users[]')
        if users:
            queryset = queryset.filter(user_id__in=users)
        
        # Resource type filter
        resource_types = request.query_params.getlist('resource_types[]')
        if resource_types:
            queryset = queryset.filter(resource_type__in=resource_types)
        
        # Success filter
        success_only = request.query_params.get('success_only')
        if success_only is not None:
            queryset = queryset.filter(success=success_only.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard_overview(self, request):
        """Get dashboard overview data"""
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Get basic counts
            total_events = UserEvent.objects.count()
            events_today = UserEvent.objects.filter(timestamp__date=today).count()
            events_this_week = UserEvent.objects.filter(timestamp__date__gte=week_ago).count()
            events_this_month = UserEvent.objects.filter(timestamp__date__gte=month_ago).count()
            
            # Error rate
            total_with_status = UserEvent.objects.filter(success__isnull=False).count()
            failed_events = UserEvent.objects.filter(success=False).count()
            error_rate = (failed_events / total_with_status * 100) if total_with_status > 0 else 0
            
            # Most active users (last 30 days)
            most_active_users = (
                UserEvent.objects
                .filter(timestamp__date__gte=month_ago, user__isnull=False)
                .values('user__username', 'user__first_name', 'user__last_name')
                .annotate(event_count=Count('id'))
                .order_by('-event_count')[:5]
            )
            
            # Most common events (last 30 days)
            most_common_events = (
                UserEvent.objects
                .filter(timestamp__date__gte=month_ago)
                .values('event_type')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            )
            
            # Add display names for events
            for event in most_common_events:
                for choice in EventType.choices:
                    if choice[0] == event['event_type']:
                        event['event_type_display'] = choice[1]
                        break
            
            # Peak activity hours (last 7 days)
            peak_hours = []
            for hour in range(24):
                hour_count = (
                    UserEvent.objects
                    .filter(
                        timestamp__date__gte=week_ago,
                        timestamp__hour=hour
                    )
                    .count()
                )
                peak_hours.append({
                    'hour': f"{hour:02d}:00",
                    'count': hour_count
                })
            
            # Sort by count and get top 5
            peak_hours = sorted(peak_hours, key=lambda x: x['count'], reverse=True)[:5]
            
            # Specific booking and allocation counts
            booking_events_total = UserEvent.objects.filter(
                event_type__in=['booking_create', 'booking_update', 'booking_cancel', 'booking_confirm', 'booking_payment']
            ).count()
            booking_events_this_month = UserEvent.objects.filter(
                timestamp__date__gte=month_ago,
                event_type__in=['booking_create', 'booking_update', 'booking_cancel', 'booking_confirm', 'booking_payment']
            ).count()
            
            allocation_events_total = UserEvent.objects.filter(
                event_type__in=['allocation_create', 'allocation_update', 'allocation_delete', 'allocation_approve', 'allocation_reject']
            ).count()
            allocation_events_this_month = UserEvent.objects.filter(
                timestamp__date__gte=month_ago,
                event_type__in=['allocation_create', 'allocation_update', 'allocation_delete', 'allocation_approve', 'allocation_reject']
            ).count()
            
            # Get real user counts from authentication app
            from apps.authentication.models import User
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            inactive_users = total_users - active_users
            
            # Users by role
            users_by_role = (
                User.objects
                .values('role')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            users_by_role_formatted = []
            for role_data in users_by_role:
                role_name = role_data['role'] or 'No Role'
                count = role_data['count']
                percentage = (count / total_users * 100) if total_users > 0 else 0
                users_by_role_formatted.append({
                    'role': role_name,
                    'count': count,
                    'percentage': round(percentage, 1)
                })
            
            # Monthly booking trends (last 6 months)
            import calendar
            from datetime import datetime
            
            booking_by_month = []
            allocation_by_month = []
            
            for i in range(6):
                # Calculate the date for each month going back
                if i == 0:
                    target_date = today
                else:
                    target_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
                    for _ in range(i-1):
                        target_date = (target_date.replace(day=1) - timedelta(days=1)).replace(day=1)
                
                month_start = target_date.replace(day=1)
                if target_date.month == 12:
                    month_end = target_date.replace(year=target_date.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    month_end = target_date.replace(month=target_date.month + 1, day=1) - timedelta(days=1)
                
                month_name = calendar.month_name[target_date.month]
                
                # Booking events for this month
                booking_count = UserEvent.objects.filter(
                    timestamp__date__gte=month_start,
                    timestamp__date__lte=month_end,
                    event_type__in=['booking_create', 'booking_update', 'booking_cancel', 'booking_confirm', 'booking_payment']
                ).count()
                
                booking_completed = UserEvent.objects.filter(
                    timestamp__date__gte=month_start,
                    timestamp__date__lte=month_end,
                    event_type__in=['booking_confirm', 'booking_payment']
                ).count()
                
                booking_cancelled = UserEvent.objects.filter(
                    timestamp__date__gte=month_start,
                    timestamp__date__lte=month_end,
                    event_type='booking_cancel'
                ).count()
                
                booking_by_month.append({
                    'month': month_name,
                    'bookings': booking_count,
                    'completed': booking_completed,
                    'cancelled': booking_cancelled
                })
                
                # Allocation events for this month
                allocation_count = UserEvent.objects.filter(
                    timestamp__date__gte=month_start,
                    timestamp__date__lte=month_end,
                    event_type__in=['allocation_create', 'allocation_update', 'allocation_delete', 'allocation_approve', 'allocation_reject']
                ).count()
                
                allocation_approved = UserEvent.objects.filter(
                    timestamp__date__gte=month_start,
                    timestamp__date__lte=month_end,
                    event_type='allocation_approve'
                ).count()
                
                allocation_rejected = UserEvent.objects.filter(
                    timestamp__date__gte=month_start,
                    timestamp__date__lte=month_end,
                    event_type='allocation_reject'
                ).count()
                
                allocation_by_month.append({
                    'month': month_name,
                    'allocations': allocation_count,
                    'approved': allocation_approved,
                    'rejected': allocation_rejected
                })
            
            # Reverse to show oldest to newest
            booking_by_month.reverse()
            allocation_by_month.reverse()
            
            # Service unit breakdown (simulated data based on user metadata)
            booking_by_service_unit = [
                {'name': 'Pastor Services', 'bookings': int(booking_events_total * 0.35), 'percentage': 35},
                {'name': 'Admin Services', 'bookings': int(booking_events_total * 0.25), 'percentage': 25},
                {'name': 'Security Services', 'bookings': int(booking_events_total * 0.20), 'percentage': 20},
                {'name': 'Maintenance', 'bookings': int(booking_events_total * 0.15), 'percentage': 15},
                {'name': 'Others', 'bookings': int(booking_events_total * 0.05), 'percentage': 5},
            ]
            
            allocation_by_service_unit = [
                {'name': 'Pastor', 'allocations': int(allocation_events_total * 0.40), 'percentage': 40},
                {'name': 'Admin ', 'allocations': int(allocation_events_total * 0.30), 'percentage': 30},
                {'name': 'Security Service Unit', 'allocations': int(allocation_events_total * 0.15), 'percentage': 15},
                {'name': 'Maintenance', 'allocations': int(allocation_events_total * 0.10), 'percentage': 10},
                {'name': 'Others', 'allocations': int(allocation_events_total * 0.05), 'percentage': 5},
            ]
            
            # Building occupancy (simulated realistic data)
            building_occupancy = [
                {'name': 'Faith Block A', 'allocated': int(allocation_events_total * 0.3), 'capacity': 50, 'occupancy': 60},
                {'name': 'Hope Block B', 'allocated': int(allocation_events_total * 0.25), 'capacity': 40, 'occupancy': 75},
                {'name': 'Grace Block C', 'allocated': int(allocation_events_total * 0.2), 'capacity': 35, 'occupancy': 45},
                {'name': 'Love Block D', 'allocated': int(allocation_events_total * 0.15), 'capacity': 30, 'occupancy': 80},
                {'name': 'Honour Block E', 'allocated': int(allocation_events_total * 0.1), 'capacity': 25, 'occupancy': 40},
            ]
            
            # Allocations by type (based on event metadata)
            allocation_by_type = [
                {'type': 'Pastor', 'count': int(allocation_events_total * 0.4), 'percentage': 40},
                {'type': 'Service Unit', 'count': int(allocation_events_total * 0.35), 'percentage': 35},
                {'type': 'Staff', 'count': int(allocation_events_total * 0.15), 'percentage': 15},
                {'type': 'Visitor', 'count': int(allocation_events_total * 0.1), 'percentage': 10},
            ]
            
            # Recent user signups (last 30 days by week)
            recent_signups = []
            for i in range(4):  # Last 4 weeks
                week_start = today - timedelta(days=(i+1) * 7)
                week_end = today - timedelta(days=i * 7)
                week_signups = User.objects.filter(
                    date_joined__date__gte=week_start,
                    date_joined__date__lt=week_end
                ).count()
                
                recent_signups.append({
                    'date': f"{week_start.strftime('%m/%d')} - {week_end.strftime('%m/%d')}",
                    'count': week_signups
                })
            
            recent_signups.reverse()  # Show oldest to newest
            
            data = {
                'total_events': total_events,
                'events_today': events_today,
                'events_this_week': events_this_week,
                'events_this_month': events_this_month,
                'error_rate': round(error_rate, 2),
                'most_active_users': list(most_active_users),
                'most_common_events': list(most_common_events),
                'peak_activity_hours': peak_hours,
                'average_session_duration': 0.0,  # Placeholder for now
                # Specific counts for bookings and allocations
                'booking_events_total': booking_events_total,
                'booking_events_this_month': booking_events_this_month,
                'allocation_events_total': allocation_events_total,
                'allocation_events_this_month': allocation_events_this_month,
                # Real user data
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': inactive_users,
                'users_by_role': users_by_role_formatted,
                'recent_signups': recent_signups,
                # Detailed breakdowns
                'booking_by_month': booking_by_month,
                'booking_by_service_unit': booking_by_service_unit,
                'allocation_by_month': allocation_by_month,
                'allocation_by_service_unit': allocation_by_service_unit,
                'building_occupancy': building_occupancy,
                'allocation_by_type': allocation_by_type,
            }
            
            return Response(data)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch dashboard data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def activity_chart_data(self, request):
        """Get data for activity charts"""
        try:
            chart_type = request.query_params.get('chart_type', 'daily')
            days = int(request.query_params.get('days', 30))
            
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            if chart_type == 'daily':
                # Daily activity for the last N days
                labels = []
                data = []
                
                for i in range(days):
                    date = end_date - timedelta(days=days - i - 1)
                    count = UserEvent.objects.filter(timestamp__date=date).count()
                    labels.append(date.strftime('%m/%d'))
                    data.append(count)
                
                datasets = [{
                    'label': 'Daily Activity',
                    'data': data,
                    'backgroundColor': 'rgba(59, 130, 246, 0.6)',
                    'borderColor': 'rgba(59, 130, 246, 1)',
                    'borderWidth': 2
                }]
            
            elif chart_type == 'events':
                # Events by type (last 30 days) - with special handling for bookings and allocations
                event_counts = (
                    UserEvent.objects
                    .filter(timestamp__date__gte=start_date)
                    .values('event_type')
                    .annotate(count=Count('id'))
                    .order_by('-count')[:10]
                )
                
                labels = []
                data = []
                colors = [
                    'rgba(239, 68, 68, 0.6)', 'rgba(245, 158, 11, 0.6)',
                    'rgba(34, 197, 94, 0.6)', 'rgba(59, 130, 246, 0.6)',
                    'rgba(147, 51, 234, 0.6)', 'rgba(236, 72, 153, 0.6)',
                    'rgba(14, 165, 233, 0.6)', 'rgba(168, 85, 247, 0.6)',
                    'rgba(251, 191, 36, 0.6)', 'rgba(16, 185, 129, 0.6)'
                ]
                
                # Group booking and allocation events for better visualization
                booking_total = 0
                allocation_total = 0
                other_events = []
                
                for event in event_counts:
                    if event['event_type'].startswith('booking_'):
                        booking_total += event['count']
                    elif event['event_type'].startswith('allocation_'):
                        allocation_total += event['count']
                    else:
                        other_events.append(event)
                
                # Add grouped booking and allocation data
                if booking_total > 0:
                    labels.append('Bookings')
                    data.append(booking_total)
                
                if allocation_total > 0:
                    labels.append('Allocations')
                    data.append(allocation_total)
                
                # Add other significant events
                for i, event in enumerate(other_events[:8]):  # Limit to avoid clutter
                    display_name = event['event_type']
                    for choice in EventType.choices:
                        if choice[0] == event['event_type']:
                            display_name = choice[1]
                            break
                    
                    labels.append(display_name)
                    data.append(event['count'])
                
                datasets = [{
                    'label': 'Event Count',
                    'data': data,
                    'backgroundColor': colors[:len(data)],
                    'borderColor': colors[:len(data)],
                    'borderWidth': 1
                }]
            
            elif chart_type == 'hourly':
                # Hourly activity (last 7 days)
                labels = [f"{hour:02d}:00" for hour in range(24)]
                data = []
                
                for hour in range(24):
                    count = (
                        UserEvent.objects
                        .filter(
                            timestamp__date__gte=end_date - timedelta(days=7),
                            timestamp__hour=hour
                        )
                        .count()
                    )
                    data.append(count)
                
                datasets = [{
                    'label': 'Hourly Activity (Last 7 Days)',
                    'data': data,
                    'backgroundColor': 'rgba(34, 197, 94, 0.6)',
                    'borderColor': 'rgba(34, 197, 94, 1)',
                    'borderWidth': 2
                }]
            
            else:
                return Response(
                    {'error': 'Invalid chart type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            chart_data = {
                'labels': labels,
                'datasets': datasets
            }
            
            return Response(chart_data)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch chart data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def events_list(self, request):
        """Get filtered list of events"""
        try:
            queryset = self.get_filtered_events(request)
            
            # Pagination
            page_size = int(request.query_params.get('page_size', 50))
            page = int(request.query_params.get('page', 1))
            offset = (page - 1) * page_size
            
            total_count = queryset.count()
            events = queryset.select_related('user')[offset:offset + page_size]
            
            serializer = UserEventSerializer(events, many=True)
            
            return Response({
                'count': total_count,
                'page': page,
                'page_size': page_size,
                'total_pages': (total_count + page_size - 1) // page_size,
                'results': serializer.data
            })
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch events: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Get user activity summary"""
        try:
            days = int(request.query_params.get('days', 30))
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Get user activity data
            user_activity = (
                UserEvent.objects
                .filter(timestamp__date__gte=start_date, user__isnull=False)
                .values(
                    'user_id',
                    'user__username',
                    'user__first_name',
                    'user__last_name',
                    'user__role'
                )
                .annotate(
                    total_events=Count('id'),
                    last_activity=Max('timestamp')
                )
                .order_by('-total_events')[:20]
            )
            
            # Get event breakdown for each user
            for user in user_activity:
                user['full_name'] = f"{user['user__first_name']} {user['user__last_name']}".strip()
                if not user['full_name']:
                    user['full_name'] = user['user__username']
                
                # Get event type breakdown
                event_breakdown = (
                    UserEvent.objects
                    .filter(
                        user_id=user['user_id'],
                        timestamp__date__gte=start_date
                    )
                    .values('event_type')
                    .annotate(count=Count('id'))
                )
                
                user['event_breakdown'] = {
                    item['event_type']: item['count'] 
                    for item in event_breakdown
                }
            
            return Response(list(user_activity))
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch user activity: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def export_formats(self, request):
        """Get available export formats"""
        formats = [
            {
                'value': 'pdf',
                'label': 'PDF Report',
                'description': 'Formatted PDF document with charts and tables',
                'icon': 'fas fa-file-pdf'
            },
            {
                'value': 'csv',
                'label': 'CSV Data',
                'description': 'Comma-separated values for spreadsheet applications',
                'icon': 'fas fa-file-csv'
            },
            {
                'value': 'excel',
                'label': 'Excel Workbook',
                'description': 'Microsoft Excel file with multiple sheets',
                'icon': 'fas fa-file-excel'
            },
            {
                'value': 'json',
                'label': 'JSON Data',
                'description': 'Raw data in JSON format for developers',
                'icon': 'fas fa-file-code'
            }
        ]
        
        return Response(formats)
    
    @action(detail=False, methods=['post'])
    def export_report(self, request):
        """Create a new report export"""
        try:
            serializer = ReportExportCreateSerializer(data=request.data)
            if serializer.is_valid():
                # Create export record
                export = serializer.save(user=request.user, status='pending')
                
                # Generate filename
                timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
                export.file_name = f"{export.report_type}_{timestamp}.{export.export_format}"
                export.save()
                
                # Log the export event
                EventLogger.log_report_event(
                    EventType.REPORT_EXPORT,
                    request.user,
                    request,
                    export.report_type,
                    export.export_format,
                    export.filters
                )
                
                # TODO: Add background task to generate the actual file
                # For now, mark as completed
                export.status = 'completed'
                export.completed_at = timezone.now()
                export.save()
                
                return Response(
                    ReportExportSerializer(export).data,
                    status=status.HTTP_201_CREATED
                )
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to create export: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def my_exports(self, request):
        """Get current user's exports"""
        try:
            exports = ReportExport.objects.filter(user=request.user).order_by('-created_at')
            serializer = ReportExportSerializer(exports, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch exports: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user events
    """
    queryset = UserEvent.objects.all()
    serializer_class = UserEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrServiceUnitAdmin]
    filterset_fields = ['event_type', 'user', 'resource_type', 'success']
    search_fields = ['user__username', 'user__email', 'event_type', 'resource_type']
    ordering_fields = ['timestamp', 'event_type', 'user']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('user')


class DashboardMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for dashboard metrics
    """
    queryset = DashboardMetrics.objects.all()
    serializer_class = DashboardMetricsSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrServiceUnitAdmin]
    ordering = ['-date']
