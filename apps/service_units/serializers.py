"""
Service Units serializers for REST API endpoints.
Handles service unit management with role-based permissions.
"""

from rest_framework import serializers
from django.apps import apps
from .models import ServiceUnit


class ServiceUnitSerializer(serializers.ModelSerializer):
    """
    Serializer for service unit CRUD operations.
    """
    admin_name = serializers.CharField(source='admin.get_full_name', read_only=True)
    admin_email = serializers.EmailField(source='admin.email', read_only=True)
    member_count = serializers.SerializerMethodField()
    allocated_rooms_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceUnit
        fields = [
            'id', 'name', 'description', 'admin', 'admin_name', 'admin_email',
            'member_count', 'allocated_rooms_count', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_member_count(self, obj):
        """Get the number of members in this service unit."""
        return obj.get_member_count()
    
    def get_allocated_rooms_count(self, obj):
        """Get the number of rooms allocated to this service unit."""
        return obj.get_allocated_rooms_count()
    
    def validate_admin(self, value):
        """Validate that the admin user can manage service units."""
        if value and value.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
            raise serializers.ValidationError(
                "Only SuperAdmin and ServiceUnitAdmin roles can be assigned as service unit admins."
            )
        return value


class ServiceUnitCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new service units.
    """
    class Meta:
        model = ServiceUnit
        fields = ['name', 'description', 'admin']
    
    def validate_name(self, value):
        """Ensure service unit name is unique."""
        if ServiceUnit.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                "A service unit with this name already exists."
            )
        return value
    
    def validate_admin(self, value):
        """Validate admin assignment."""
        if value:
            if value.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
                raise serializers.ValidationError(
                    "Only SuperAdmin and ServiceUnitAdmin roles can be assigned as service unit admins."
                )
            
            # Check if admin is already managing another service unit
            if hasattr(value, 'administered_units') and value.administered_units.exists():
                raise serializers.ValidationError(
                    "This user is already managing another service unit."
                )
        
        return value


class ServiceUnitListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for service unit lists.
    """
    admin_name = serializers.CharField(source='admin.get_full_name', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceUnit
        fields = [
            'id', 'name', 'description', 'admin_name', 
            'member_count', 'created_at'
        ]
    
    def get_member_count(self, obj):
        """Get the number of members in this service unit."""
        return obj.get_member_count()


class ServiceUnitMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for service unit members.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        # Get User model dynamically to avoid circular imports
        model = apps.get_model('authentication', 'User')
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'phone_number', 'role', 'is_service_unit_admin',
            'date_joined'
        ]


class ServiceUnitStatsSerializer(serializers.ModelSerializer):
    """
    Serializer for service unit statistics and analytics.
    """
    admin_name = serializers.CharField(source='admin.get_full_name', read_only=True)
    member_count = serializers.SerializerMethodField()
    allocated_rooms_count = serializers.SerializerMethodField()
    active_allocations = serializers.SerializerMethodField()
    recent_members = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceUnit
        fields = [
            'id', 'name', 'description', 'admin_name', 
            'member_count', 'allocated_rooms_count', 'active_allocations',
            'recent_members', 'created_at'
        ]
    
    def get_member_count(self, obj):
        """Get the number of members in this service unit."""
        return obj.get_member_count()
    
    def get_allocated_rooms_count(self, obj):
        """Get the number of rooms allocated to this service unit."""
        return obj.get_allocated_rooms_count()
    
    def get_active_allocations(self, obj):
        """Get active room allocations for this service unit."""
        try:
            RoomAllocation = apps.get_model('allocations', 'RoomAllocation')
            allocations = RoomAllocation.objects.filter(
                service_unit=obj,
                status='Active'
            ).select_related('room', 'room__building')
            
            return [{
                'id': allocation.id,
                'room_number': allocation.room.room_number,
                'building_name': allocation.room.building.name,
                'allocation_type': allocation.allocation_type,
                'start_date': allocation.start_date,
                'end_date': allocation.end_date
            } for allocation in allocations]
        except:
            return []
    
    def get_recent_members(self, obj):
        """Get recently joined members of this service unit."""
        try:
            User = apps.get_model('authentication', 'User')
            recent_members = User.objects.filter(
                service_unit=obj
            ).order_by('-date_joined')[:5]
            
            return [{
                'id': member.id,
                'full_name': member.get_full_name(),
                'email': member.email,
                'role': member.role,
                'date_joined': member.date_joined
            } for member in recent_members]
        except:
            return []
