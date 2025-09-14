"""
Authentication API views for user management and JWT authentication.
Provides endpoints for registration, login, profile management.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    UserListSerializer
)


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


class UserListView(generics.ListAPIView):
    """
    API view for listing users (admin only).
    GET /api/auth/users/
    """
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on requesting user's role."""
        user = self.request.user
        
        if user.role == 'SuperAdmin':
            # SuperAdmin can see all users
            return User.objects.all()
        elif user.role == 'ServiceUnitAdmin':
            # ServiceUnitAdmin can see users in their service unit
            if user.service_unit:
                return User.objects.filter(service_unit=user.service_unit)
            else:
                return User.objects.none()
        else:
            # Regular users can't access user lists
            return User.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Check permissions before listing users."""
        user = request.user
        
        if user.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
            return Response({
                'error': 'You do not have permission to view user lists'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().list(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for user detail operations (admin only).
    GET/PUT/DELETE /api/auth/users/<id>/
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
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
