"""
Views for Allocation management.
Provides REST API endpoints for RoomAllocation and AllocationRequest models.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db import transaction
from django.db import models
from django.shortcuts import get_object_or_404

from .models import RoomAllocation, AllocationRequest
from .serializers import (
    RoomAllocationSerializer, 
    RoomAllocationSummarySerializer,
    AllocationRequestSerializer,
    AllocationRequestSummarySerializer, 
    AllocationRequestApprovalSerializer
)
from apps.buildings.models import Room
from apps.analytics.utils import EventLogger, EventType


class IsSuperAdminOrServiceUnitAdmin(permissions.BasePermission):
    """
    Permission class that allows access to SuperAdmin and ServiceUnitAdmin users.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['SuperAdmin', 'ServiceUnitAdmin']
        )


class RoomAllocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing room allocations.
    
    Provides CRUD operations for room allocations with:
    - Filtering by room, user, service_unit, allocation_type, is_active
    - Search by room name, user name, service unit name
    - Ordering by allocation_date, start_date, end_date
    - Permission-based access control
    """
    
    queryset = RoomAllocation.objects.select_related(
        'room', 'room__building', 'user', 'service_unit', 'allocated_by'
    ).all()
    
    serializer_class = RoomAllocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrServiceUnitAdmin]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'room': ['exact'],
        'room__building': ['exact'],
        'user': ['exact'],
        'service_unit': ['exact'],
        'allocation_type': ['exact'],
        'is_active': ['exact'],
        'allocation_date': ['gte', 'lte'],
        'start_date': ['gte', 'lte'],
        'end_date': ['gte', 'lte'],
    }
    search_fields = [
        'room__room_number', 'room__building__name',
        'user__first_name', 'user__last_name', 'user__email',
        'service_unit__name', 'notes'
    ]
    ordering_fields = ['allocation_date', 'start_date', 'end_date', 'room__room_number']
    ordering = ['-allocation_date']
    
    def get_serializer_class(self):
        """Use summary serializer for list view."""
        if self.action == 'list':
            return RoomAllocationSummarySerializer
        return RoomAllocationSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # SuperAdmin can see all allocations
        if user.role == 'SuperAdmin':
            return queryset
        
        # ServiceUnitAdmin can see allocations for their service unit
        if user.role == 'ServiceUnitAdmin':
            return queryset.filter(
                models.Q(service_unit__admin=user) |
                models.Q(allocated_by=user)
            )
        
        # Regular users can only see their own allocations
        return queryset.filter(user=user)
    
    def perform_create(self, serializer):
        """Set allocated_by to current user and log event."""
        allocation = serializer.save(allocated_by=self.request.user)
        
        # Log allocation creation event
        EventLogger.log_allocation_event(
            EventType.ALLOCATION_CREATE,
            self.request.user,
            self.request,
            allocation
        )
    
    @action(detail=False, methods=['get'])
    def my_allocations(self, request):
        """Get current user's active allocations."""
        allocations = self.get_queryset().filter(
            user=request.user,
            is_active=True
        )
        serializer = self.get_serializer(allocations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_rooms(self, request):
        """Get rooms that are available for allocation."""
        # Get rooms that don't have active allocations
        allocated_room_ids = RoomAllocation.objects.filter(
            is_active=True
        ).values_list('room_id', flat=True)
        
        from apps.buildings.models import Room
        from apps.buildings.serializers import RoomSerializer
        
        available_rooms = Room.objects.exclude(
            id__in=allocated_room_ids
        ).select_related('building', 'room_type')
        
        # Apply building filter if provided
        building_id = request.query_params.get('building')
        if building_id:
            available_rooms = available_rooms.filter(building_id=building_id)
        
        serializer = RoomSerializer(available_rooms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an allocation."""
        allocation = self.get_object()
        allocation.is_active = False
        allocation.save()
        
        serializer = self.get_serializer(allocation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Reactivate an allocation (if room is available)."""
        allocation = self.get_object()
        
        # Check if room is available
        conflicting_allocations = RoomAllocation.objects.filter(
            room=allocation.room,
            is_active=True
        ).exclude(id=allocation.id)
        
        if conflicting_allocations.exists():
            return Response(
                {'error': 'Room is already allocated to another user/unit.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        allocation.is_active = True
        allocation.save()
        
        serializer = self.get_serializer(allocation)
        return Response(serializer.data)


class AllocationRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing allocation requests.
    
    Provides CRUD operations for allocation requests with:
    - Filtering by status, requested_by, preferred_room, preferred_building
    - Search by request reason, user name, room name
    - Custom actions for approval/rejection workflow
    - Permission-based access control
    """
    
    queryset = AllocationRequest.objects.select_related(
        'requested_by', 'preferred_room', 'preferred_room__building',
        'preferred_building', 'reviewed_by', 'created_allocation'
    ).all()
    
    serializer_class = AllocationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'requested_by': ['exact'],
        'preferred_room': ['exact'],
        'preferred_building': ['exact'],
        'created_at': ['gte', 'lte'],
        'requested_start_date': ['gte', 'lte'],
        'requested_end_date': ['gte', 'lte'],
    }
    search_fields = [
        'request_reason', 'review_notes',
        'requested_by__first_name', 'requested_by__last_name',
        'preferred_room__name', 'preferred_building__name'
    ]
    ordering_fields = ['created_at', 'requested_start_date', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use summary serializer for list view."""
        if self.action == 'list':
            return AllocationRequestSummarySerializer
        return AllocationRequestSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['approve', 'reject']:
            # Only SuperAdmin and ServiceUnitAdmin can approve/reject
            permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrServiceUnitAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user permissions."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # SuperAdmin can see all requests
        if user.role == 'SuperAdmin':
            return queryset
        
        # ServiceUnitAdmin can see requests for their service unit members
        if user.role == 'ServiceUnitAdmin':
            # Get service unit members
            from apps.members.models import Member
            service_unit_member_ids = Member.objects.filter(
                service_unit__admin=user
            ).values_list('user_id', flat=True)
            
            return queryset.filter(
                models.Q(requested_by=user) |
                models.Q(requested_by_id__in=service_unit_member_ids)
            )
        
        # Regular users can only see their own requests
        return queryset.filter(requested_by=user)
    
    def perform_create(self, serializer):
        """Set requested_by to current user."""
        serializer.save(requested_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending allocation requests."""
        pending_requests = self.get_queryset().filter(
            status=AllocationRequest.StatusChoices.PENDING
        )
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's allocation requests."""
        my_requests = self.get_queryset().filter(requested_by=request.user)
        serializer = self.get_serializer(my_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an allocation request and create allocation."""
        allocation_request = self.get_object()
        
        if allocation_request.status != AllocationRequest.StatusChoices.PENDING:
            return Response(
                {'error': 'Only pending requests can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approval_serializer = AllocationRequestApprovalSerializer(data=request.data)
        if not approval_serializer.is_valid():
            return Response(approval_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        approval_data = approval_serializer.validated_data
        
        try:
            with transaction.atomic():
                # Update request status
                allocation_request.status = AllocationRequest.StatusChoices.APPROVED
                allocation_request.reviewed_by = request.user
                allocation_request.reviewed_at = timezone.now()
                allocation_request.review_notes = approval_data.get('review_notes', '')
                
                # Create allocation
                allocation_data = {
                    'room_id': approval_data.get('room_id') or allocation_request.preferred_room_id,
                    'user_id': allocation_request.requested_by_id,
                    'allocated_by_id': request.user.id,
                    'allocation_type': RoomAllocation.AllocationTypeChoices.MEMBER,  # Default for requests
                    'start_date': approval_data.get('start_date') or allocation_request.requested_start_date,
                    'end_date': approval_data.get('end_date') or allocation_request.requested_end_date,
                    'notes': f"Created from request #{allocation_request.id}. {approval_data.get('review_notes', '')}"
                }
                
                # Validate room availability
                room_id = allocation_data['room_id']
                if RoomAllocation.objects.filter(room_id=room_id, is_active=True).exists():
                    return Response(
                        {'error': 'Selected room is already allocated.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                allocation = RoomAllocation.objects.create(**allocation_data)
                allocation_request.created_allocation = allocation
                allocation_request.save()
                
                # Return the updated request
                serializer = AllocationRequestSerializer(allocation_request)
                return Response(serializer.data)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to approve request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an allocation request."""
        allocation_request = self.get_object()
        
        if allocation_request.status != AllocationRequest.StatusChoices.PENDING:
            return Response(
                {'error': 'Only pending requests can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approval_serializer = AllocationRequestApprovalSerializer(data=request.data)
        if not approval_serializer.is_valid():
            return Response(approval_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        approval_data = approval_serializer.validated_data
        
        # Update request status
        allocation_request.status = AllocationRequest.StatusChoices.REJECTED
        allocation_request.reviewed_by = request.user
        allocation_request.reviewed_at = timezone.now()
        allocation_request.review_notes = approval_data.get('review_notes', '')
        allocation_request.save()
        
        serializer = AllocationRequestSerializer(allocation_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an allocation request (only by the requester)."""
        allocation_request = self.get_object()
        
        # Only the requester can cancel their own request
        if allocation_request.requested_by != request.user:
            return Response(
                {'error': 'You can only cancel your own requests.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if allocation_request.status != AllocationRequest.StatusChoices.PENDING:
            return Response(
                {'error': 'Only pending requests can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        allocation_request.status = AllocationRequest.StatusChoices.CANCELLED
        allocation_request.save()
        
        serializer = AllocationRequestSerializer(allocation_request)
        return Response(serializer.data)
