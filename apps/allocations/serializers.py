"""
Serializers for Allocation models.
Handles serialization of RoomAllocation and AllocationRequest models.
"""

from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import RoomAllocation, AllocationRequest
from apps.buildings.serializers import RoomSerializer, BuildingSerializer
from apps.service_units.serializers import ServiceUnitSerializer
from apps.authentication.serializers import UserProfileSerializer

User = get_user_model()


class RoomAllocationSerializer(serializers.ModelSerializer):
    """
    Serializer for RoomAllocation model.
    Includes nested room, user, service_unit, and allocated_by information.
    """
    
    # Nested serializers for read operations
    room = RoomSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)
    service_unit = ServiceUnitSerializer(read_only=True)
    allocated_by = UserProfileSerializer(read_only=True)
    
    # Write-only fields for create/update operations
    room_id = serializers.IntegerField(write_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    service_unit_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    allocated_by_id = serializers.IntegerField(write_only=True, required=False)
    
    # Computed fields
    allocated_to_display = serializers.ReadOnlyField()
    duration_days = serializers.ReadOnlyField()
    
    class Meta:
        model = RoomAllocation
        fields = [
            'id', 'room', 'user', 'service_unit', 'allocated_by',
            'allocation_type', 'allocation_date', 'notes',
            'start_date', 'end_date', 'is_active',
            'allocated_to_display', 'duration_days',
            # Write-only fields
            'room_id', 'user_id', 'service_unit_id', 'allocated_by_id'
        ]
        read_only_fields = ['allocation_date']
    
    def validate(self, data):
        """
        Validate allocation data:
        1. Ensure allocation type matches the provided user/service_unit
        2. Check for room availability (no overlapping active allocations)
        3. Validate date ranges
        """
        allocation_type = data.get('allocation_type')
        user_id = data.get('user_id')
        service_unit_id = data.get('service_unit_id')
        
        # Validate allocation type consistency
        if allocation_type == RoomAllocation.AllocationTypeChoices.SERVICE_UNIT:
            if not service_unit_id:
                raise serializers.ValidationError(
                    "Service unit is required for ServiceUnit allocation type."
                )
            if user_id:
                raise serializers.ValidationError(
                    "User should not be specified for ServiceUnit allocation type."
                )
        else:  # Pastor or Member allocation
            if not user_id:
                raise serializers.ValidationError(
                    f"User is required for {allocation_type} allocation type."
                )
            if service_unit_id:
                raise serializers.ValidationError(
                    f"Service unit should not be specified for {allocation_type} allocation type."
                )
        
        # Validate date range
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "End date must be after start date."
            )
        
        # Check room availability (skip for updates to existing allocation)
        room_id = data.get('room_id')
        if room_id:
            existing_allocations = RoomAllocation.objects.filter(
                room_id=room_id,
                is_active=True
            )
            
            # Exclude current allocation if this is an update
            if self.instance:
                existing_allocations = existing_allocations.exclude(id=self.instance.id)
            
            if existing_allocations.exists():
                raise serializers.ValidationError(
                    "This room already has an active allocation."
                )
        
        return data
    
    def create(self, validated_data):
        """Create allocation and set allocated_by to current user if not provided."""
        if 'allocated_by_id' not in validated_data:
            validated_data['allocated_by_id'] = self.context['request'].user.id
        return super().create(validated_data)


class AllocationRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for AllocationRequest model.
    Includes nested relationships and handles request workflow.
    """
    
    # Nested serializers for read operations
    requested_by = UserProfileSerializer(read_only=True)
    preferred_room = RoomSerializer(read_only=True)
    preferred_building = BuildingSerializer(read_only=True)
    reviewed_by = UserProfileSerializer(read_only=True)
    created_allocation = RoomAllocationSerializer(read_only=True)
    
    # Write-only fields for create/update operations
    requested_by_id = serializers.IntegerField(write_only=True, required=False)
    preferred_room_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    preferred_building_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    reviewed_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_allocation_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = AllocationRequest
        fields = [
            'id', 'requested_by', 'preferred_room', 'preferred_building',
            'request_reason', 'requested_start_date', 'requested_end_date',
            'status', 'reviewed_by', 'review_notes', 'reviewed_at',
            'created_allocation', 'created_at', 'updated_at',
            # Write-only fields
            'requested_by_id', 'preferred_room_id', 'preferred_building_id',
            'reviewed_by_id', 'created_allocation_id'
        ]
        read_only_fields = ['created_at', 'updated_at', 'reviewed_at']
    
    def validate(self, data):
        """
        Validate allocation request data:
        1. Check date range validity
        2. Ensure only pending requests can be modified
        """
        # Validate date range
        start_date = data.get('requested_start_date')
        end_date = data.get('requested_end_date')
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "Requested end date must be after start date."
            )
        
        # For updates, ensure only pending requests can be modified
        if self.instance and self.instance.status != AllocationRequest.StatusChoices.PENDING:
            if 'status' not in data or data['status'] == self.instance.status:
                # Allow status changes but not other modifications for non-pending requests
                allowed_fields = {'status', 'reviewed_by_id', 'review_notes'}
                modified_fields = set(data.keys()) - allowed_fields
                if modified_fields:
                    raise serializers.ValidationError(
                        f"Only review fields can be modified for {self.instance.status.lower()} requests."
                    )
        
        return data
    
    def create(self, validated_data):
        """Create request and set requested_by to current user if not provided."""
        if 'requested_by_id' not in validated_data:
            validated_data['requested_by_id'] = self.context['request'].user.id
        return super().create(validated_data)


class AllocationRequestApprovalSerializer(serializers.Serializer):
    """
    Serializer for approval/rejection of allocation requests.
    Used in custom actions for approve/reject operations.
    """
    review_notes = serializers.CharField(
        max_length=1000, 
        required=False, 
        allow_blank=True,
        help_text="Optional notes for the approval/rejection"
    )
    
    # For approval, optionally specify different room/dates
    room_id = serializers.IntegerField(
        required=False,
        help_text="Room to allocate (if different from requested)"
    )
    
    start_date = serializers.DateField(
        required=False,
        help_text="Allocation start date (if different from requested)"
    )
    
    end_date = serializers.DateField(
        required=False,
        help_text="Allocation end date (if different from requested)"
    )
    
    def validate(self, data):
        """Validate approval data."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "End date must be after start date."
            )
        
        return data


class AllocationRequestSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for AllocationRequest summaries in lists.
    """
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    preferred_room_name = serializers.CharField(source='preferred_room.full_name', read_only=True)
    preferred_building_name = serializers.CharField(source='preferred_building.name', read_only=True)
    
    class Meta:
        model = AllocationRequest
        fields = [
            'id', 'requested_by_name', 'preferred_room_name', 'preferred_building_name',
            'request_reason', 'requested_start_date', 'requested_end_date',
            'status', 'created_at'
        ]


class RoomAllocationSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for RoomAllocation summaries in lists.
    """
    room_name = serializers.CharField(source='room.full_name', read_only=True)
    allocated_to_name = serializers.SerializerMethodField()
    allocated_by_name = serializers.CharField(source='allocated_by.full_name', read_only=True)
    
    class Meta:
        model = RoomAllocation
        fields = [
            'id', 'room_name', 'allocated_to_name', 'allocated_by_name',
            'allocation_type', 'allocation_date', 'start_date', 'end_date',
            'is_active'
        ]
    
    def get_allocated_to_name(self, obj):
        """Get the name of who the room is allocated to."""
        if obj.allocation_type == RoomAllocation.AllocationTypeChoices.SERVICE_UNIT:
            return obj.service_unit.name if obj.service_unit else 'Unknown Service Unit'
        elif obj.user:
            return obj.user.full_name
        return 'Unknown'
