"""
Django management command to create sample data for testing.
Creates superuser, service units, buildings, rooms, and sample allocations.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.apps import apps

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for testing the accommodation portal'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all data before creating new sample data',
        )
    
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING('Resetting all data...'))
            self.reset_data()
        
        self.stdout.write('Creating sample data...')
        
        # Create superuser
        self.create_superuser()
        
        # Create service units
        service_units = self.create_service_units()
        
        # Create buildings and rooms
        buildings = self.create_buildings()
        
        # Create users
        users = self.create_users(service_units)
        
        # Create some allocations
        self.create_allocations(buildings, users, service_units)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write('SAMPLE DATA CREATED:')
        self.stdout.write('='*50)
        self.stdout.write('Django Admin: http://localhost:8000/admin/')
        self.stdout.write('Username: admin')
        self.stdout.write('Password: admin123')
        self.stdout.write('')
        self.stdout.write('API Base URL: http://localhost:8000/api/')
        self.stdout.write('='*50)
    
    def reset_data(self):
        """Reset all data in the database."""
        RoomAllocation = apps.get_model('allocations', 'RoomAllocation')
        AllocationRequest = apps.get_model('allocations', 'AllocationRequest')
        Room = apps.get_model('buildings', 'Room')
        Building = apps.get_model('buildings', 'Building')
        ServiceUnit = apps.get_model('service_units', 'ServiceUnit')
        
        RoomAllocation.objects.all().delete()
        AllocationRequest.objects.all().delete()
        Room.objects.all().delete()
        Building.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        ServiceUnit.objects.all().delete()
    
    def create_superuser(self):
        """Create or update superuser."""
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@accommodation.com',
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': 'SuperAdmin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created superuser: {admin_user.username}')
        else:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Updated superuser: {admin_user.username}')
        
        return admin_user
    
    def create_service_units(self):
        """Create sample service units."""
        ServiceUnit = apps.get_model('service_units', 'ServiceUnit')
        
        service_units_data = [
            {
                'name': 'Choir',
                'description': 'Church choir members and musicians'
            },
            {
                'name': 'Ushers',
                'description': 'Church ushering and welcoming team'
            },
            {
                'name': 'Protocol',
                'description': 'Church protocol and events team'
            },
            {
                'name': 'Media',
                'description': 'Audio, video, and media production team'
            },
            {
                'name': 'Youth',
                'description': 'Youth ministry and activities'
            }
        ]
        
        service_units = []
        for unit_data in service_units_data:
            unit, created = ServiceUnit.objects.get_or_create(
                name=unit_data['name'],
                defaults=unit_data
            )
            service_units.append(unit)
            if created:
                self.stdout.write(f'Created service unit: {unit.name}')
        
        return service_units
    
    def create_buildings(self):
        """Create sample buildings and rooms."""
        Building = apps.get_model('buildings', 'Building')
        Room = apps.get_model('buildings', 'Room')
        
        # Get the admin user for created_by field
        admin_user = User.objects.get(username='admin')
        
        buildings_data = [
            {
                'name': 'Main Accommodation Block',
                'location': '123 Church Street, City Center',
                'description': 'Main accommodation building for church members',
                'created_by': admin_user
            },
            {
                'name': 'Youth Hostel',
                'location': '456 Youth Avenue, City Center', 
                'description': 'Dedicated accommodation for youth programs',
                'created_by': admin_user
            }
        ]
        
        buildings = []
        for building_data in buildings_data:
            building, created = Building.objects.get_or_create(
                name=building_data['name'],
                defaults=building_data
            )
            buildings.append(building)
            if created:
                self.stdout.write(f'Created building: {building.name}')
                
                # Create rooms for this building
                self.create_rooms_for_building(building)
        
        return buildings
    
    def create_rooms_for_building(self, building):
        """Create sample rooms for a building."""
        Room = apps.get_model('buildings', 'Room')
        
        # Create 10 rooms for each building
        for room_num in range(1, 11):
            room_number = f"{room_num:03d}"  # 001, 002, etc.
            
            # Vary the capacity and facilities
            capacity = 1 if room_num % 4 == 1 else 2 if room_num % 4 == 2 else 3 if room_num % 4 == 3 else 4
            has_toilet = room_num % 3 == 0  # Every 3rd room has toilet
            has_washroom = room_num % 2 == 0  # Every 2nd room has washroom
            
            room, created = Room.objects.get_or_create(
                room_number=room_number,
                building=building,
                defaults={
                    'capacity': capacity,
                    'has_toilet': has_toilet,
                    'has_washroom': has_washroom,
                    'is_allocated': False
                }
            )
            
            if created:
                self.stdout.write(f'  Created room: {room.room_number}')
    
    def create_users(self, service_units):
        """Create sample users."""
        users_data = [
            {
                'username': 'choir_admin',
                'email': 'choir@church.com',
                'first_name': 'Mary',
                'last_name': 'Singer',
                'role': 'ServiceUnitAdmin',
                'service_unit': service_units[0]  # Choir
            },
            {
                'username': 'usher_admin', 
                'email': 'ushers@church.com',
                'first_name': 'David',
                'last_name': 'Welcome',
                'role': 'ServiceUnitAdmin',
                'service_unit': service_units[1]  # Ushers
            },
            {
                'username': 'john_pastor',
                'email': 'pastor@church.com',
                'first_name': 'John',
                'last_name': 'Pastor',
                'role': 'Pastor',
                'service_unit': None
            },
            {
                'username': 'member1',
                'email': 'member1@church.com',
                'first_name': 'Alice',
                'last_name': 'Member',
                'role': 'Member',
                'service_unit': service_units[0]  # Choir
            },
            {
                'username': 'member2',
                'email': 'member2@church.com',
                'first_name': 'Bob',
                'last_name': 'Helper',
                'role': 'Member',
                'service_unit': service_units[1]  # Ushers
            }
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    **user_data,
                    'phone_number': '+234-800-000-0000',
                    'is_active': True
                }
            )
            
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {user.username} ({user.role})')
            
            users.append(user)
        
        return users
    
    def create_allocations(self, buildings, users, service_units):
        """Create sample room allocations."""
        RoomAllocation = apps.get_model('allocations', 'RoomAllocation')
        Room = apps.get_model('buildings', 'Room')
        
        from datetime import date, timedelta
        
        # Get some rooms
        rooms = Room.objects.all()[:3]
        
        if len(rooms) >= 2 and len(users) >= 4:
            # Create individual allocation
            allocation1_data = {
                'room': rooms[0],
                'user': users[3],  # member1
                'service_unit': service_units[0],  # Choir (member1 belongs to choir)
                'allocation_type': 'Member',
                'allocated_by': users[0],  # admin user
                'start_date': date.today(),
                'end_date': date.today() + timedelta(days=30),
                'notes': 'Monthly accommodation for choir member',
                'is_active': True
            }
            
            allocation1, created = RoomAllocation.objects.get_or_create(
                room=allocation1_data['room'],
                defaults=allocation1_data
            )
            
            if created:
                self.stdout.write(f'Created allocation: {allocation1.room.room_number}')
            
            # Create service unit allocation
            allocation2_data = {
                'room': rooms[1],
                'service_unit': service_units[1],  # Ushers
                'allocation_type': 'ServiceUnit',
                'allocated_by': users[0],  # admin user
                'start_date': date.today(),
                'end_date': date.today() + timedelta(days=60),
                'notes': 'Ushers team accommodation',
                'is_active': True
            }
            
            allocation2, created = RoomAllocation.objects.get_or_create(
                room=allocation2_data['room'],
                defaults=allocation2_data
            )
            
            if created:
                self.stdout.write(f'Created allocation: {allocation2.room.room_number}')
