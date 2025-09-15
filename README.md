# Accommodation Portal - Full Stack Application

A comprehensive accommodation management system for church service units, featuring a Django REST API backend and a modern React frontend.

## 🏗️ Architecture Overview

This project consists of two main components:

- **Backend**: Django REST API (`/`) - Handles business logic, database operations, and API endpoints
- **Frontend**: React Application (`/accommodation-frontend`) - Provides user interface and user experience

```
accommodation_portal/
├── accommodation_portal/          # Django Backend
│   ├── settings/                 # Environment-based settings
│   │   ├── base.py              # Common settings
│   │   ├── development.py       # Development settings
│   │   ├── production.py        # Production settings
│   │   └── local.py             # Local overrides
│   └── urls.py                  # Main URL configuration
├── apps/                         # Django applications
│   ├── authentication/          # User management & authentication
│   ├── buildings/               # Building & room management
│   ├── service_units/           # Service unit management
│   ├── allocations/             # Room allocation logic
│   ├── members/                 # Member management
│   ├── reports/                 # Reporting system
│   └── core/                    # Shared utilities
├── accommodation-frontend/       # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   └── layout/          # Layout components (AdminLayout, ProtectedRoute)
│   │   ├── contexts/            # React contexts (AuthContext, ThemeContext)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   ├── Admin/           # Admin dashboard pages
│   │   │   ├── Auth/            # Authentication pages
│   │   │   ├── Booking/         # Booking flow pages
│   │   │   └── Home/            # Public pages
│   │   └── services/            # API service functions
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
├── requirements/                 # Backend requirements
├── static/                      # Django static files
├── media/                       # User uploaded files
├── templates/                   # Django templates
└── logs/                        # Application logs
```

## 🚀 Quick Start (Full Stack)

### Prerequisites

- Python 3.8+
- Node.js 14+
- pip and npm

### Backend Setup

1. **Activate Virtual Environment:**

   ```bash
   .\.venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Mac/Linux
   ```

2. **Install Backend Dependencies:**

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

5. **Run Backend Server:**
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup

1. **Navigate to Frontend Directory:**

   ```bash
   cd accommodation-frontend
   ```

2. **Install Frontend Dependencies:**

   ```bash
   npm install
   ```

3. **Start Frontend Development Server:**
   ```bash
   npm start
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## ✨ Features

### Backend Features

- **User Roles**: Super Admin, Service Unit Admin, Pastor, Member, Guest
- **Authentication & Authorization**: JWT-based role-based access control
- **Building & Room Management**: CRUD operations for buildings and rooms
- **Service Unit Management**: Organization of church service units
- **Room Allocation**: Intelligent room assignment algorithms
- **Member Management**: User registration and profile management
- **Reports & Analytics**: Comprehensive reporting system
- **RESTful API**: Well-documented API endpoints

### Frontend Features

- **Modern UI/UX**: Responsive design with Tailwind CSS
- **Admin Dashboard**: Role-based dashboards with analytics
- **Room Booking System**: Complete reservation flow
- **User Authentication**: Secure login and registration
- **Protected Routes**: Route-based access control
- **Mobile-First Design**: Optimized for all screen sizes
- **Real-time Updates**: Dynamic content updates

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens
- **API**: RESTful API with comprehensive documentation
- **File Storage**: Django's default (development), AWS S3 (production)
- **CORS**: Configured for React frontend

### Frontend

- **Framework**: React 18+
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS 3.4+
- **Icons**: Lucide React
- **Build Tool**: Create React App / Vite
- **Testing**: React Testing Library & Jest
- **State Management**: React Context API

## 📡 API Endpoints

Base URL: `http://localhost:8000/api/`

### Authentication

- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `POST /auth/logout/` - User logout
- `POST /auth/refresh/` - Refresh JWT token

### Buildings & Rooms

- `GET /buildings/` - List all buildings
- `POST /buildings/` - Create new building
- `GET /buildings/{id}/` - Get building details
- `GET /buildings/{id}/rooms/` - Get rooms in building

### Service Units

- `GET /service-units/` - List service units
- `POST /service-units/` - Create service unit
- `GET /service-units/{id}/` - Get service unit details

### Allocations

- `GET /allocations/` - List allocations
- `POST /allocations/` - Create allocation
- `PUT /allocations/{id}/` - Update allocation

### Members

- `GET /members/` - List members
- `POST /members/` - Add member
- `GET /members/{id}/` - Get member details

### Reports

- `GET /reports/` - Get reports data
- `GET /reports/occupancy/` - Occupancy reports
- `GET /reports/allocations/` - Allocation reports

## 🧪 Development & Testing

### Backend Testing

```bash
# Run Django tests
python manage.py test

# Run with pytest
pytest

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing

```bash
# Navigate to frontend directory
cd accommodation-frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

## 🔐 Authentication & Permissions

### User Roles & Permissions

1. **Super Admin**: Full system access

   - Manage all users, buildings, and allocations
   - Access to all reports and analytics
   - System configuration

2. **Service Unit Admin**: Unit-level management

   - Manage unit members and allocations
   - View unit-specific reports
   - Request room allocations

3. **Pastor**: Supervisory access

   - View allocations and member information
   - Generate reports for their units
   - Approve allocation requests

4. **Member**: Basic user access

   - View personal allocation information
   - Update personal profile
   - Submit allocation requests

5. **Guest**: Limited access
   - View public information
   - Submit initial registration

## 🚀 Deployment

### Production Backend Setup

1. **Environment Variables:**

   ```bash
   export SECRET_KEY="your-secret-key"
   export DEBUG=False
   export ALLOWED_HOSTS="yourdomain.com"
   export DATABASE_URL="postgresql://user:pass@localhost/dbname"
   ```

2. **Database Setup:**
   ```bash
   python manage.py collectstatic
   python manage.py migrate
   gunicorn accommodation_portal.wsgi:application
   ```

### Production Frontend Setup

1. **Build for Production:**

   ```bash
   cd accommodation-frontend
   npm run build
   ```

2. **Deploy to Static Hosting:**
   - Deploy the `build` folder to Netlify, Vercel, or AWS S3
   - Configure environment variables for API endpoints

### Docker Deployment (Optional)

```dockerfile
# Dockerfile example for backend
FROM python:3.9
WORKDIR /app
COPY requirements/ requirements/
RUN pip install -r requirements/production.txt
COPY . .
CMD ["gunicorn", "accommodation_portal.wsgi:application"]
```

## 🔧 Configuration

### Backend Environment Variables

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend Environment Variables

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENVIRONMENT=development
```

## 📱 Responsive Design

The frontend is designed with a mobile-first approach:

- **Mobile**: 375px+ (Hamburger menu, stacked layouts)
- **Tablet**: 768px+ (Collapsible sidebar, grid layouts)
- **Desktop**: 1024px+ (Full sidebar, multi-column layouts)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes to backend (`/`) or frontend (`/accommodation-frontend`)
4. Write tests for your changes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow Django best practices for backend
- Follow React best practices for frontend
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📝 License

This project is private and proprietary.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with basic functionality
- **v1.1.0** - Added admin dashboard and service unit management
- **v1.2.0** - Enhanced responsive design and mobile optimization

---

Built with ❤️ using Django REST Framework and React
