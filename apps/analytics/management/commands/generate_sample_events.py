from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
import random

from apps.analytics.utils import EventLogger, EventType
from apps.allocations.models import RoomAllocation
from apps.buildings.models import Building, Room

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate sample analytics events for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of events to generate (default: 100)',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days back to generate events (default: 30)',
        )

    def handle(self, *args, **options):
        count = options['count']
        days = options['days']
        
        self.stdout.write(
            self.style.SUCCESS(f'Generating {count} sample events over {days} days...')
        )

        # Get some users for event generation
        users = list(User.objects.all()[:10])
        if not users:
            self.stdout.write(
                self.style.ERROR('No users found. Please create some users first.')
            )
            return

        # Get some rooms and buildings for context
        rooms = list(Room.objects.all()[:10])
        buildings = list(Building.objects.all()[:5])

        # Event types and their weights (more common events have higher weights)
        event_types = [
            (EventType.LOGIN, 0.25),
            (EventType.LOGOUT, 0.20),
            (EventType.PROFILE_UPDATE, 0.05),
            (EventType.ALLOCATION_CREATE, 0.15),
            (EventType.ALLOCATION_UPDATE, 0.10),
            (EventType.ALLOCATION_DELETE, 0.05),
            (EventType.BUILDING_CREATE, 0.02),
            (EventType.ROOM_CREATE, 0.03),
            (EventType.USER_CREATE, 0.05),
            (EventType.REPORT_GENERATE, 0.08),
            (EventType.REPORT_EXPORT, 0.02),
        ]

        # Generate events
        events_created = 0
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        for i in range(count):
            # Random timestamp within the date range
            random_time = start_date + timedelta(
                seconds=random.randint(0, int((end_date - start_date).total_seconds()))
            )

            # Select random event type based on weights
            event_type = random.choices(
                [et[0] for et in event_types],
                weights=[et[1] for et in event_types]
            )[0]

            # Select random user
            user = random.choice(users)

            # Generate appropriate metadata based on event type
            metadata = {}
            resource_type = None
            resource_id = None

            if event_type in [EventType.ALLOCATION_CREATE, EventType.ALLOCATION_UPDATE, EventType.ALLOCATION_DELETE]:
                if rooms:
                    room = random.choice(rooms)
                    metadata = {
                        'room_id': room.id,
                        'room_number': room.room_number,
                        'building_name': room.building.name if room.building else 'Unknown',
                        'allocation_type': random.choice(['Pastor', 'ServiceUnit', 'Member'])
                    }
                    resource_type = 'allocation'
                    resource_id = random.randint(1, 100)

            elif event_type in [EventType.BUILDING_CREATE, EventType.ROOM_CREATE]:
                if buildings:
                    building = random.choice(buildings)
                    metadata = {
                        'building_id': building.id,
                        'building_name': building.name,
                        'location': building.location
                    }
                    resource_type = 'building' if event_type == EventType.BUILDING_CREATE else 'room'
                    resource_id = building.id

            elif event_type in [EventType.REPORT_GENERATE, EventType.REPORT_EXPORT]:
                metadata = {
                    'report_type': random.choice(['user_activity', 'allocation_summary', 'building_utilization']),
                    'filters': {'date_range': f'{days}_days'}
                }
                if event_type == EventType.REPORT_EXPORT:
                    metadata['export_format'] = random.choice(['pdf', 'csv', 'excel'])
                resource_type = 'report'

            # Random success rate (95% success)
            success = random.random() < 0.95
            error_message = None if success else "Sample error message"

            # Generate IP address
            ip_address = f"192.168.1.{random.randint(1, 254)}"

            # Create the event manually (since we want specific timestamps)
            from apps.analytics.models import UserEvent
            event = UserEvent.objects.create(
                user=user,
                event_type=event_type,
                timestamp=random_time,
                ip_address=ip_address,
                user_agent="Mozilla/5.0 (Sample User Agent)",
                resource_type=resource_type,
                resource_id=resource_id,
                metadata=metadata,
                success=success,
                error_message=error_message
            )

            events_created += 1

            if events_created % 20 == 0:
                self.stdout.write(f'Created {events_created} events...')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {events_created} sample events!')
        )
