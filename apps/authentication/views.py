"""
Authentication API views for user management and JWT authentication.
Provides endpoints for registration, login, profile management.
"""

import os
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    UserListSerializer,
    UserCreateUpdateSerializer
)
from apps.analytics.utils import EventLogger, EventType


class UserPagination(PageNumberPagination):
    """Custom pagination for user lists."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that includes user data in the response.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user data to include in response
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                user_data = UserProfileSerializer(user).data
                
                response.data['user'] = user_data
        
        return response


class UserRegistrationView(generics.CreateAPIView):
    """
    API view for user registration.
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    API view for user login with username/email and password.
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Log login event
            EventLogger.log_auth_event(
                EventType.LOGIN,
                user,
                request,
                success=True
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        # Log failed login attempt
        EventLogger.log_event(
            EventType.LOGIN,
            user=None,
            request=request,
            success=False,
            error_message=str(serializer.errors)
        )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for viewing and updating user profile.
    GET/PUT /api/auth/profile/
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    """
    API view for changing user password.
    POST /api/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserListCreateView(generics.ListCreateAPIView):
    """
    Enhanced API view for listing and creating users (admin only).
    GET/POST /api/auth/users/
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = UserPagination
    # Temporarily remove filter backends to debug
    # filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # filterset_fields = ['role', 'service_unit', 'is_active', 'is_service_unit_admin']
    # search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    # ordering_fields = ['username', 'email', 'first_name', 'last_name', 'date_joined', 'role']
    ordering = ['-date_joined']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateUpdateSerializer
        return UserListSerializer
    
    def get_queryset(self):
        """Filter users based on requesting user's role."""
        user = self.request.user
        queryset = User.objects.all()
        
        if user.role == 'SuperAdmin':
            # SuperAdmin can see all users
            pass
        elif user.role == 'ServiceUnitAdmin':
            # ServiceUnitAdmin can see users in their service unit
            if user.service_unit:
                queryset = queryset.filter(service_unit=user.service_unit)
            else:
                queryset = queryset.none()
        else:
            # Regular users can't access user lists
            queryset = queryset.none()
        
        return queryset.select_related('service_unit')
    
    def list(self, request, *args, **kwargs):
        """Check permissions before listing users."""
        user = request.user
        
        if user.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
            return Response({
                'error': 'You do not have permission to view user lists'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Check permissions before creating users."""
        user = request.user
        
        if user.role != 'SuperAdmin':
            return Response({
                'error': 'Only SuperAdmin can create users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for user detail operations (admin only).
    GET/PUT/DELETE /api/auth/users/<id>/
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserCreateUpdateSerializer
        return UserProfileSerializer
    
    def get_queryset(self):
        """Filter users based on requesting user's role."""
        user = self.request.user
        
        if user.role == 'SuperAdmin':
            return User.objects.all()
        elif user.role == 'ServiceUnitAdmin':
            if user.service_unit:
                return User.objects.filter(service_unit=user.service_unit)
            else:
                return User.objects.none()
        else:
            return User.objects.none()
    
    def retrieve(self, request, *args, **kwargs):
        """Check permissions before retrieving user."""
        user = request.user
        
        if user.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
            return Response({
                'error': 'You do not have permission to view user details'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Check permissions before updating user."""
        user = request.user
        
        if user.role != 'SuperAdmin':
            return Response({
                'error': 'Only SuperAdmin can update user details'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Check permissions before deleting user."""
        user = request.user
        
        if user.role != 'SuperAdmin':
            return Response({
                'error': 'Only SuperAdmin can delete users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_statistics_view(request):
    """
    API view for user statistics (admin only).
    GET /api/auth/users/statistics/
    """
    user = request.user
    
    if user.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
        return Response({
            'error': 'You do not have permission to view user statistics'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Base queryset based on user role
    if user.role == 'SuperAdmin':
        queryset = User.objects.all()
    else:  # ServiceUnitAdmin
        if user.service_unit:
            queryset = User.objects.filter(service_unit=user.service_unit)
        else:
            queryset = User.objects.none()
    
    # Calculate statistics
    total_users = queryset.count()
    active_users = queryset.filter(is_active=True).count()
    inactive_users = total_users - active_users
    
    # Users by role
    role_stats = queryset.values('role').annotate(count=Count('role'))
    role_distribution = {item['role']: item['count'] for item in role_stats}
    
    # Recent registrations (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_registrations = queryset.filter(date_joined__gte=thirty_days_ago).count()
    
    # Service unit distribution (for SuperAdmin)
    service_unit_stats = []
    if user.role == 'SuperAdmin':
        su_stats = queryset.exclude(service_unit__isnull=True)\
                           .values('service_unit__name')\
                           .annotate(count=Count('service_unit'))\
                           .order_by('-count')
        service_unit_stats = [
            {'name': item['service_unit__name'], 'count': item['count']}
            for item in su_stats
        ]
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'recent_registrations': recent_registrations,
        'role_distribution': role_distribution,
        'service_unit_distribution': service_unit_stats
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_delete_users_view(request):
    """
    API view for bulk deleting users (SuperAdmin only).
    POST /api/auth/users/bulk-delete/
    """
    user = request.user
    
    if user.role != 'SuperAdmin':
        return Response({
            'error': 'Only SuperAdmin can perform bulk delete operations'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_ids = request.data.get('user_ids', [])
    
    if not user_ids:
        return Response({
            'error': 'user_ids list is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Prevent self-deletion
    if user.id in user_ids:
        return Response({
            'error': 'You cannot delete your own account'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get users to delete
    users_to_delete = User.objects.filter(id__in=user_ids)
    deleted_count = users_to_delete.count()
    
    # Delete users
    users_to_delete.delete()
    
    return Response({
        'message': f'Successfully deleted {deleted_count} users',
        'deleted_count': deleted_count
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_role_view(request, pk):
    """
    API view for updating user role (SuperAdmin only).
    PATCH /api/auth/users/<id>/role/
    """
    user = request.user
    
    if user.role != 'SuperAdmin':
        return Response({
            'error': 'Only SuperAdmin can update user roles'
        }, status=status.HTTP_403_FORBIDDEN)
    
    target_user = get_object_or_404(User, pk=pk)
    new_role = request.data.get('role')
    
    if not new_role:
        return Response({
            'error': 'role field is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate role
    valid_roles = [choice[0] for choice in User.RoleChoices.choices]
    if new_role not in valid_roles:
        return Response({
            'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Prevent changing own role
    if target_user.id == user.id:
        return Response({
            'error': 'You cannot change your own role'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    target_user.role = new_role
    target_user.save()
    
    return Response({
        'message': f'User role updated to {new_role}',
        'user': UserListSerializer(target_user).data
    })


class AvatarManagementView(APIView):
    """
    API view for managing user avatars.
    POST /api/auth/profile/avatar/ - Upload avatar
    DELETE /api/auth/profile/avatar/ - Remove avatar
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Upload user avatar."""
        user = request.user
        avatar_file = request.FILES.get('avatar')
        
        if not avatar_file:
            return Response({
                'error': 'Avatar file is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if avatar_file.size > max_size:
            return Response({
                'error': 'File size too large. Maximum size is 5MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old avatar if exists
        if user.avatar:
            old_avatar_path = user.avatar.path
            if os.path.exists(old_avatar_path):
                os.remove(old_avatar_path)
        
        # Save new avatar
        user.avatar = avatar_file
        user.save()
        
        # Return updated profile data
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response({
            'message': 'Avatar uploaded successfully',
            'user': serializer.data
        })
    
    def delete(self, request):
        """Remove user avatar."""
        user = request.user
        
        if not user.avatar:
            return Response({
                'error': 'No avatar to remove'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete avatar file
        avatar_path = user.avatar.path
        if os.path.exists(avatar_path):
            os.remove(avatar_path)
        
        # Clear avatar field
        user.avatar = None
        user.save()
        
        # Return updated profile data
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response({
            'message': 'Avatar removed successfully',
            'user': serializer.data
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    API view for user logout (blacklist refresh token).
    POST /api/auth/logout/
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserSettingsView(APIView):
    """
    API view for managing user settings and preferences.
    GET /api/auth/settings/ - Get user settings
    PUT /api/auth/settings/ - Update user settings
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user's current settings."""
        user = request.user
        
        # Default settings structure
        default_settings = {
            'notifications': {
                'email': {
                    'booking_updates': True,
                    'allocation_changes': True,
                    'system_alerts': True,
                    'weekly_reports': False,
                    'marketing_emails': False
                },
                'push': {
                    'booking_updates': True,
                    'allocation_changes': True,
                    'system_alerts': True,
                    'reminders': True
                },
                'in_app': {
                    'booking_updates': True,
                    'allocation_changes': True,
                    'system_alerts': True,
                    'comments': True,
                    'mentions': True
                }
            },
            'privacy': {
                'profile_visibility': 'organization',
                'show_online_status': True,
                'allow_direct_messages': True,
                'show_activity': True,
                'data_sharing': False
            },
            'language': {
                'primary': 'en',
                'timezone': 'Africa/Lagos',
                'date_format': 'DD/MM/YYYY',
                'time_format': '24h'
            },
            'security': {
                'two_factor_enabled': False,
                'session_timeout': 30,
                'login_alerts': True,
                'allow_multiple_sessions': True
            }
        }

        # Get user's stored settings or return defaults
        user_settings = getattr(user, 'settings', {}) or default_settings
        
        return Response({
            'success': True,
            'data': user_settings
        })

    def put(self, request):
        """Update user's settings."""
        user = request.user
        settings_data = request.data
        
        try:
            # Store settings in user model (you might want to create a separate Settings model)
            user.settings = settings_data
            user.save()
            
            # Log the settings update
            EventLogger.log_user_event(
                user=user,
                event_type=EventType.SETTINGS_UPDATED,
                metadata={'settings_updated': list(settings_data.keys())}
            )
            
            return Response({
                'success': True,
                'data': settings_data,
                'message': 'Settings updated successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Failed to update settings'
            }, status=status.HTTP_400_BAD_REQUEST)
