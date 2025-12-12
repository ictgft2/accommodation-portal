"""
Django management command to create test user accounts for all roles.

Usage:
    python manage.py create_test_users

This command creates sample users for:
- Super Admin
- Portal Manager
- Pastor (2 users)
- Deacon (2 users, one for each service unit)
- Unit Member (3 users across different service units)
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.authentication.models import User
from apps.service_units.models import ServiceUnit


class Command(BaseCommand):
    help = 'Creates test user accounts for all roles in the system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete-existing',
            action='store_true',
            help='Delete existing test users before creating new ones',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS('Creating Test Users for Accommodation Portal'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        # Delete existing test users if flag is set
        if options['delete_existing']:
            self.stdout.write(self.style.WARNING('Deleting existing test users...'))
            User.objects.filter(email__contains='@lfc.com').delete()
            self.stdout.write(self.style.SUCCESS('[OK] Existing test users deleted\n'))

        # Create service units first
        service_units = self.create_service_units()

        # Track created users
        created_users = []

        with transaction.atomic():
            # 1. Create Super Admin
            super_admin = self.create_user(
                email='superadmin@lfc.com',
                password='Admin@123',
                first_name='System',
                last_name='Administrator',
                role=User.RoleChoices.SUPER_ADMIN,
                phone_number='+2348012345001'
            )
            if super_admin:
                created_users.append(super_admin)

            # 2. Create Portal Manager
            portal_manager = self.create_user(
                email='portalmanager@lfc.com',
                password='Portal@123',
                first_name='Portal',
                last_name='Manager',
                role=User.RoleChoices.PORTAL_MANAGER,
                phone_number='+2348012345002'
            )
            if portal_manager:
                created_users.append(portal_manager)

            # 3. Create Pastors
            pastor1 = self.create_user(
                email='pastor1@lfc.com',
                password='Pastor@123',
                first_name='John',
                last_name='Pastor',
                role=User.RoleChoices.PASTOR,
                phone_number='+2348012345003'
            )
            if pastor1:
                created_users.append(pastor1)

            pastor2 = self.create_user(
                email='pastor2@lfc.com',
                password='Pastor@123',
                first_name='Mary',
                last_name='Pastor',
                role=User.RoleChoices.PASTOR,
                phone_number='+2348012345004'
            )
            if pastor2:
                created_users.append(pastor2)

            # 4. Create Deacons (assigned to service units)
            deacon1 = self.create_user(
                email='deacon1@lfc.com',
                password='Deacon@123',
                first_name='David',
                last_name='Deacon',
                role=User.RoleChoices.DEACON,
                service_unit=service_units.get('Choir'),
                phone_number='+2348012345005'
            )
            if deacon1:
                created_users.append(deacon1)

            deacon2 = self.create_user(
                email='deacon2@lfc.com',
                password='Deacon@123',
                first_name='Sarah',
                last_name='Deacon',
                role=User.RoleChoices.DEACON,
                service_unit=service_units.get('Ushers'),
                phone_number='+2348012345006'
            )
            if deacon2:
                created_users.append(deacon2)

            # 5. Create Unit Members
            member1 = self.create_user(
                email='member1@lfc.com',
                password='Member@123',
                first_name='James',
                last_name='Member',
                role=User.RoleChoices.MEMBER,
                service_unit=service_units.get('Choir'),
                phone_number='+2348012345007'
            )
            if member1:
                created_users.append(member1)

            member2 = self.create_user(
                email='member2@lfc.com',
                password='Member@123',
                first_name='Grace',
                last_name='Member',
                role=User.RoleChoices.MEMBER,
                service_unit=service_units.get('Ushers'),
                phone_number='+2348012345008'
            )
            if member2:
                created_users.append(member2)

            member3 = self.create_user(
                email='member3@lfc.com',
                password='Member@123',
                first_name='Peter',
                last_name='Member',
                role=User.RoleChoices.MEMBER,
                service_unit=service_units.get('Protocol'),
                phone_number='+2348012345009'
            )
            if member3:
                created_users.append(member3)

        # Display summary
        self.display_summary(created_users)

    def create_service_units(self):
        """Create sample service units if they don't exist."""
        self.stdout.write(self.style.HTTP_INFO('\n[*] Creating Service Units...'))

        service_units_data = [
            {'name': 'Choir', 'description': 'Church choir service unit'},
            {'name': 'Ushers', 'description': 'Ushering and welcoming service unit'},
            {'name': 'Protocol', 'description': 'Protocol and coordination service unit'},
            {'name': 'Media', 'description': 'Media and technical service unit'},
        ]

        service_units = {}
        for data in service_units_data:
            unit, created = ServiceUnit.objects.get_or_create(
                name=data['name'],
                defaults={'description': data['description']}
            )
            service_units[data['name']] = unit
            status = '[OK] Created' if created else '[.] Already exists'
            self.stdout.write(f"  {status}: {data['name']}")

        self.stdout.write('')
        return service_units

    def create_user(self, email, password, first_name, last_name, role,
                    service_unit=None, phone_number=''):
        """Create a user if it doesn't exist."""
        try:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': role,
                    'service_unit': service_unit,
                    'phone_number': phone_number,
                    'is_active': True,
                }
            )

            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'  [OK] Created: {role} - {email}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'  • Already exists: {role} - {email}')
                )

            return user

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'  [ERROR] Failed to create {email}: {str(e)}')
            )
            return None

    def display_summary(self, users):
        """Display a summary table of created users."""
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS('Test Users Summary'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        # Group users by role
        role_groups = {
            User.RoleChoices.SUPER_ADMIN: [],
            User.RoleChoices.PORTAL_MANAGER: [],
            User.RoleChoices.PASTOR: [],
            User.RoleChoices.DEACON: [],
            User.RoleChoices.MEMBER: [],
        }

        for user in users:
            if user.role in role_groups:
                role_groups[user.role].append(user)

        # Display each role group
        for role, users_list in role_groups.items():
            if users_list:
                role_display = User.RoleChoices(role).label
                self.stdout.write(self.style.HTTP_INFO(f'\n{role_display}:'))
                self.stdout.write('-' * 70)

                for user in users_list:
                    service_unit_name = user.service_unit.name if user.service_unit else 'N/A'
                    self.stdout.write(
                        f'  Email:        {user.email}\n'
                        f'  Password:     {"*" * 8} (check command file for actual password)\n'
                        f'  Name:         {user.get_full_name()}\n'
                        f'  Service Unit: {service_unit_name}\n'
                        f'  Phone:        {user.phone_number}\n'
                    )

        # Display credentials table
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS('LOGIN CREDENTIALS'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        self.stdout.write(
            f"{'Role':<20} {'Email':<30} {'Password':<15}\n" +
            '-' * 70
        )

        credentials = [
            ('Super Admin', 'superadmin@test.com', 'Admin@123'),
            ('Portal Manager', 'portalmanager@test.com', 'Portal@123'),
            ('Pastor 1', 'pastor1@test.com', 'Pastor@123'),
            ('Pastor 2', 'pastor2@test.com', 'Pastor@123'),
            ('Deacon 1 (Choir)', 'deacon1@test.com', 'Deacon@123'),
            ('Deacon 2 (Ushers)', 'deacon2@test.com', 'Deacon@123'),
            ('Member 1 (Choir)', 'member1@test.com', 'Member@123'),
            ('Member 2 (Ushers)', 'member2@test.com', 'Member@123'),
            ('Member 3 (Protocol)', 'member3@test.com', 'Member@123'),
        ]

        for role, email, password in credentials:
            self.stdout.write(f"{role:<20} {email:<30} {password:<15}")

        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS(f'[OK] Total users created/verified: {len(users)}'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        # Important notes
        self.stdout.write(self.style.WARNING('\n[!] IMPORTANT NOTES:'))
        self.stdout.write('  - These are TEST ACCOUNTS for development/testing only')
        self.stdout.write('  - DO NOT use these accounts in production')
        self.stdout.write('  - Change passwords after testing')
        self.stdout.write('  - Deacons are assigned to service units (Choir, Ushers)')
        self.stdout.write('  - Members are also assigned to service units\n')
