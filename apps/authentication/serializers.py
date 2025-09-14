"""
Authentication serializers for REST API endpoints.
Handles user registration, login, profile management with role-based validation.
"""

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with role-based validation.
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'role',
            'service_unit', 'is_service_unit_admin'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Custom validation for password confirmation and role-based rules."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        
        # Role-based validation
        role = attrs.get('role')
        service_unit = attrs.get('service_unit')
        is_service_unit_admin = attrs.get('is_service_unit_admin', False)
        
        if role == 'ServiceUnitAdmin' and not service_unit:
            raise serializers.ValidationError(
                {"service_unit": "Service Unit Admins must be assigned to a service unit."}
            )
        
        if is_service_unit_admin and role not in ['ServiceUnitAdmin', 'SuperAdmin']:
            raise serializers.ValidationError(
                {"is_service_unit_admin": "Only ServiceUnitAdmin and SuperAdmin roles can be service unit admins."}
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create user with encrypted password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login with username/email and password.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Authenticate user with username or email."""
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Try to authenticate with username first, then email
            user = authenticate(username=username, password=password)
            
            if not user:
                # Try with email if username authentication failed
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include "username" and "password".'
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile viewing and updating.
    """
    service_unit_name = serializers.CharField(
        source='service_unit.name', 
        read_only=True
    )
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'role', 'service_unit', 'service_unit_name',
            'is_service_unit_admin', 'date_joined', 'last_login'
        )
        read_only_fields = ('id', 'username', 'date_joined', 'last_login')
    
    def validate_service_unit(self, value):
        """Validate service unit assignment based on user role."""
        user = self.instance
        if user and user.role == 'ServiceUnitAdmin' and not value:
            raise serializers.ValidationError(
                "Service Unit Admins must be assigned to a service unit."
            )
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        """Check that the old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "New password fields didn't match."}
            )
        return attrs
    
    def save(self, **kwargs):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for user lists (admin views).
    """
    service_unit_name = serializers.CharField(
        source='service_unit.name', 
        read_only=True
    )
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'service_unit_name', 'is_service_unit_admin',
            'is_active', 'date_joined'
        )
