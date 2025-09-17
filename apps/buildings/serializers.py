"""
Buildings and Rooms serializers for REST API endpoints.
Handles building management, room CRUD, and availability checking.
"""

from rest_framework import serializers
from .models import Building, Room, RoomPicture


class RoomPictureSerializer(serializers.ModelSerializer):
    """
    Serializer for room pictures.
    """
    class Meta:
        model = RoomPicture
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for room CRUD operations.
    """
    pictures = RoomPictureSerializer(many=True, read_only=True)
    building_name = serializers.CharField(source='building.name', read_only=True)
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = [
            'id', 'room_number', 'building', 'building_name', 'capacity',
            'has_toilet', 'has_washroom', 'is_allocated', 'is_available',
            'pictures', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_is_available(self, obj):
        """Check if room is currently available."""
        return not obj.is_allocated


class RoomListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for room lists.
    """
    building_name = serializers.CharField(source='building.name', read_only=True)
    building = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = [
            'id', 'room_number', 'building', 'building_name', 'capacity',
            'has_toilet', 'has_washroom', 'is_allocated', 'is_available'
        ]
    
    def get_building(self, obj):
        """Return building info for frontend compatibility."""
        if obj.building:
            return {
                'id': obj.building.id,
                'name': obj.building.name
            }
        return None
    
    def get_is_available(self, obj):
        """Check if room is currently available."""
        return not obj.is_allocated


class RoomCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating rooms.
    """
    class Meta:
        model = Room
        fields = [
            'room_number', 'building', 'capacity', 'has_toilet', 'has_washroom'
        ]
    
    def validate(self, attrs):
        """Custom validation for room data."""
        building = attrs.get('building')
        room_number = attrs.get('room_number')
        
        # Check for duplicate room numbers in the same building
        if building and room_number:
            existing_room = Room.objects.filter(
                building=building,
                room_number=room_number
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_room = existing_room.exclude(id=self.instance.id)
            
            if existing_room.exists():
                raise serializers.ValidationError({
                    'room_number': 'Room with this number already exists in this building.'
                })
        
        # Validate capacity
        capacity = attrs.get('capacity', 0)
        if capacity <= 0:
            raise serializers.ValidationError({
                'capacity': 'Room capacity must be greater than 0.'
            })
        
        return attrs


class BuildingSerializer(serializers.ModelSerializer):
    """
    Serializer for building CRUD operations.
    """
    total_rooms = serializers.SerializerMethodField()
    available_rooms = serializers.SerializerMethodField()
    allocated_rooms = serializers.SerializerMethodField()
    total_capacity = serializers.SerializerMethodField()
    occupancy_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Building
        fields = [
            'id', 'name', 'location', 'description', 'created_by',
            'total_rooms', 'available_rooms', 'allocated_rooms',
            'total_capacity', 'occupancy_rate', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_total_rooms(self, obj):
        """Get total number of rooms in building."""
        return obj.total_rooms
    
    def get_available_rooms(self, obj):
        """Get number of available rooms."""
        return obj.available_rooms
    
    def get_allocated_rooms(self, obj):
        """Get number of allocated rooms."""
        return obj.allocated_rooms
    
    def get_total_capacity(self, obj):
        """Get total capacity of building."""
        return obj.total_capacity
    
    def get_occupancy_rate(self, obj):
        """Get occupancy rate percentage."""
        return obj.occupancy_rate


class BuildingListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for building lists.
    """
    total_rooms = serializers.SerializerMethodField()
    available_rooms = serializers.SerializerMethodField()
    occupancy_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Building
        fields = [
            'id', 'name', 'location', 'description', 'total_rooms',
            'available_rooms', 'occupancy_rate'
        ]
    
    def get_total_rooms(self, obj):
        return obj.total_rooms
    
    def get_available_rooms(self, obj):
        return obj.available_rooms
    
    def get_occupancy_rate(self, obj):
        return obj.occupancy_rate


class BuildingCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating buildings.
    """
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    class Meta:
        model = Building
        fields = [
            'name', 'location', 'description', 'created_by'
        ]
    
    def validate_name(self, value):
        """Ensure building name is unique."""
        existing_building = Building.objects.filter(name__iexact=value)
        
        # Exclude current instance if updating
        if self.instance:
            existing_building = existing_building.exclude(id=self.instance.id)
        
        if existing_building.exists():
            raise serializers.ValidationError(
                "A building with this name already exists."
            )
        
        return value
    
    def update(self, instance, validated_data):
        """Override update to exclude created_by field."""
        # Remove created_by from validated_data for updates
        validated_data.pop('created_by', None)
        return super().update(instance, validated_data)


