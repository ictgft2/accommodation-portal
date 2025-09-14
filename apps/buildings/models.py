"""
Building and Room models for Accommodation Portal.
Based on the SQL schema design for managing accommodation buildings and rooms.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import os


class Building(models.Model):
    """
    Building model representing accommodation buildings.
    
    Maps to SQL Buildings table:
    - BuildingID (auto-generated primary key)
    - Name (building name)
    - Location (building location/address)
    - Description (building description)
    - CreatedBy (foreign key to User - who created this building)
    - CreatedAt (auto timestamp)
    """
    
    name = models.CharField(
        max_length=150,
        help_text="Name of the building (e.g., Main Hall, Guest House A)"
    )
    
    location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Physical location or address of the building"
    )
    
    description = models.TextField(
        max_length=255,
        blank=True,
        help_text="Description of the building and its facilities"
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,  # Don't allow deletion of user who created buildings
        related_name='created_buildings',
        limit_choices_to={'role': 'SuperAdmin'},
        help_text="Super admin who created this building"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this building was added to the system"
    )
    
    class Meta:
        db_table = 'buildings'
        verbose_name = 'Building'
        verbose_name_plural = 'Buildings'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def total_rooms(self):
        """Return total number of rooms in this building."""
        return self.rooms.count()
    
    def get_total_rooms(self):
        """Method version for admin/API compatibility."""
        return self.total_rooms

    @property
    def available_rooms(self):
        """Return number of available (unallocated) rooms."""
        return self.rooms.filter(is_allocated=False).count()
    
    def get_available_rooms(self):
        """Method version for admin/API compatibility."""
        return self.available_rooms

    @property
    def allocated_rooms(self):
        """Return number of allocated rooms."""
        return self.rooms.filter(is_allocated=True).count()
    
    def get_allocated_rooms(self):
        """Method version for admin/API compatibility."""
        return self.allocated_rooms

    @property
    def total_capacity(self):
        """Return total bed capacity of all rooms in this building."""
        return self.rooms.aggregate(
            total=models.Sum('capacity')
        )['total'] or 0
    
    def get_total_capacity(self):
        """Method version for admin/API compatibility."""
        return self.total_capacity

    @property
    def occupancy_rate(self):
        """Return occupancy rate as percentage."""
        if self.total_rooms == 0:
            return 0
        return (self.allocated_rooms / self.total_rooms) * 100
    
    def get_occupancy_rate(self):
        """Method version for admin/API compatibility."""
        return self.occupancy_rate
class Room(models.Model):
    """
    Room model representing individual rooms within buildings.
    
    Maps to SQL Rooms table:
    - RoomID (auto-generated primary key)
    - BuildingID (foreign key to Building)
    - RoomNumber (room identifier)
    - Capacity (number of beds)
    - HasToilet (boolean)
    - HasWashroom (boolean)
    - IsAllocated (boolean)
    - CreatedAt (auto timestamp)
    """
    
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='rooms',
        help_text="Building this room belongs to"
    )
    
    room_number = models.CharField(
        max_length=50,
        help_text="Room number or identifier (e.g., 101, A1, Room 1)"
    )
    
    capacity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of beds/people this room can accommodate"
    )
    
    has_toilet = models.BooleanField(
        default=False,
        help_text="Whether this room has a private toilet"
    )
    
    has_washroom = models.BooleanField(
        default=False,
        help_text="Whether this room has a private washroom/bathroom"
    )
    
    is_allocated = models.BooleanField(
        default=False,
        help_text="Whether this room is currently allocated to someone"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this room was added to the system"
    )
    
    class Meta:
        db_table = 'rooms'
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['building', 'room_number']
        indexes = [
            models.Index(fields=['building'], name='idx_rooms_building'),
            models.Index(fields=['is_allocated'], name='idx_rooms_allocated'),
            models.Index(fields=['building', 'room_number'], name='idx_rooms_building_number'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['building', 'room_number'],
                name='unique_room_per_building'
            )
        ]
    
    def __str__(self):
        return f"{self.building.name} - Room {self.room_number}"
    
    @property
    def full_name(self):
        """Return full room identifier."""
        return f"{self.building.name} - Room {self.room_number}"
    
    @property
    def amenities_list(self):
        """Return list of amenities based on facilities."""
        amenities = []
        if self.has_toilet:
            amenities.append("Private Toilet")
        if self.has_washroom:
            amenities.append("Private Washroom")
        return amenities
    
    @property
    def current_allocation(self):
        """Get current allocation for this room."""
        return self.allocations.filter(
            allocation_date__isnull=False
        ).order_by('-allocation_date').first()
    
    @property
    def allocated_to(self):
        """Get who this room is allocated to."""
        allocation = self.current_allocation
        if not allocation:
            return None
        
        if allocation.allocation_type == 'ServiceUnit':
            return f"Service Unit: {allocation.service_unit.name}"
        elif allocation.user:
            return f"{allocation.get_allocation_type_display()}: {allocation.user.full_name}"
        return "Allocated (Unknown)"
    
    def can_be_allocated(self):
        """Check if room can be allocated."""
        return not self.is_allocated
    
    def allocate(self):
        """Mark room as allocated."""
        self.is_allocated = True
        self.save(update_fields=['is_allocated'])
    
    def deallocate(self):
        """Mark room as available."""
        self.is_allocated = False
        self.save(update_fields=['is_allocated'])
    
    def save(self, *args, **kwargs):
        """Override save to ensure room_number is properly formatted."""
        if self.room_number:
            self.room_number = self.room_number.strip()
        super().save(*args, **kwargs)


def room_picture_upload_path(instance, filename):
    """Generate upload path for room pictures."""
    # Get file extension
    ext = filename.split('.')[-1]
    # Create filename: room_<room_id>_<timestamp>.<ext>
    import time
    new_filename = f"room_{instance.room.id}_{int(time.time())}.{ext}"
    return os.path.join('room_pictures', str(instance.room.building.id), str(instance.room.id), new_filename)


class RoomPicture(models.Model):
    """
    Room Picture model for storing multiple images per room.
    
    Maps to SQL RoomPictures table:
    - PictureID (auto-generated primary key)
    - RoomID (foreign key to Room)
    - PictureURL (image file path)
    - UploadedAt (auto timestamp)
    """
    
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='pictures',
        help_text="Room this picture belongs to"
    )
    
    picture = models.ImageField(
        upload_to=room_picture_upload_path,
        help_text="Room picture/photo"
    )
    
    caption = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional caption or description for the picture"
    )
    
    is_primary = models.BooleanField(
        default=False,
        help_text="Whether this is the primary/main picture for the room"
    )
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this picture was uploaded"
    )
    
    class Meta:
        db_table = 'room_pictures'
        verbose_name = 'Room Picture'
        verbose_name_plural = 'Room Pictures'
        ordering = ['-is_primary', '-uploaded_at']
    
    def __str__(self):
        return f"Picture for {self.room.full_name}"
    
    @property
    def picture_url(self):
        """Return the URL of the picture."""
        if self.picture and hasattr(self.picture, 'url'):
            return self.picture.url
        return None
    
    def save(self, *args, **kwargs):
        """Override save to ensure only one primary picture per room."""
        if self.is_primary:
            # Set all other pictures for this room as non-primary
            RoomPicture.objects.filter(
                room=self.room,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to remove the actual file."""
        if self.picture:
            # Delete the actual file
            try:
                if os.path.isfile(self.picture.path):
                    os.remove(self.picture.path)
            except (ValueError, OSError):
                pass
        
        super().delete(*args, **kwargs)
