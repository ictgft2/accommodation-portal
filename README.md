# Accommodation Portal - Backend

A Django REST API backend for managing accommodation allocations for church service units.

## Project Structure

```
accommodation_portal/
├── accommodation_portal/       # Main Django project
│   ├── settings/              # Environment-based settings
│   │   ├── base.py           # Common settings
│   │   ├── development.py    # Development settings
│   │   ├── production.py     # Production settings
│   │   └── local.py          # Local overrides
│   └── urls.py               # Main URL configuration
├── apps/                      # Django applications
│   ├── authentication/       # User management & authentication
│   ├── buildings/            # Building & room management
│   ├── service_units/        # Service unit management
│   ├── allocations/          # Room allocation logic
│   ├── members/              # Member management
│   ├── reports/              # Reporting system
│   └── core/                 # Shared utilities
├── requirements/             # Environment-specific requirements
├── static/                   # Static files
├── media/                    # User uploaded files
├── templates/                # Django templates
└── logs/                     # Application logs
```

## Quick Start

1. **Activate Virtual Environment:**
   ```bash
   .\.venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Mac/Linux
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements/development.txt
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Database Setup:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run Development Server:**
   ```bash
   python manage.py runserver
   ```

## Features

### User Roles
- **Super Admin**: Full system control
- **Service Unit Admin**: Manages unit allocations
- **Pastor**: Views allocations and requests
- **Member**: Views assigned rooms
- **Guest**: Limited access

### Core Modules
- **Authentication & Authorization**: Role-based access control
- **Building & Room Management**: Building and room CRUD operations
- **Service Unit Management**: Service unit organization
- **Room Allocation**: Intelligent room assignment system
- **Member Management**: User registration and management
- **Reports & Analytics**: Comprehensive reporting system

## API Endpoints

Base URL: `http://localhost:8000/api/`

- `/auth/` - Authentication endpoints
- `/buildings/` - Building and room management
- `/service-units/` - Service unit operations
- `/allocations/` - Room allocation management
- `/members/` - Member management
- `/reports/` - Reporting and analytics

## Development

### Adding New Features
1. Create models in appropriate app
2. Create serializers for API
3. Create views/viewsets
4. Add URL patterns
5. Write tests
6. Update documentation

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Running Tests
```bash
python manage.py test
# or with pytest
pytest
```

## Deployment

### Production Settings
1. Set environment variables in production
2. Use PostgreSQL database
3. Configure static file serving
4. Set up proper logging
5. Use gunicorn as WSGI server

### Environment Variables
Required environment variables (see `.env.example`):
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DATABASE_URL` (production)
- `CORS_ALLOWED_ORIGINS`

## Next Steps

1. **Database Design**: Create models for all entities
2. **Authentication System**: Implement custom user model with roles
3. **API Development**: Build REST API endpoints
4. **Permission System**: Implement role-based permissions
5. **Business Logic**: Add allocation algorithms
6. **Testing**: Write comprehensive tests
7. **Documentation**: API documentation with Swagger

## Tech Stack

- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens
- **API**: RESTful API with DRF
- **File Storage**: Django's default (development), AWS S3 (production)
- **CORS**: Configured for React frontend
