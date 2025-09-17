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
    Serializer for user login with email/username and password.
    Accepts both email and username for flexible authentication.
    """
    email = serializers.CharField(help_text="Email address or username")
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Authenticate user with email or username."""
        email_or_username = attrs.get('email')
        password = attrs.get('password')
        
        if email_or_username and password:
            # Try to authenticate with username first
            user = authenticate(username=email_or_username, password=password)
            
            if not user:
                # Try with email if username authentication failed
                try:
                    user_obj = User.objects.get(email=email_or_username)
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
                'Must include "email" and "password".'
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile viewing and updating.
    """
    service_unit_name = serializers.CharField(
        source='service_unit.name', 
        read_only=True
    )
    avatar_url = serializers.SerializerMethodField()
    is_service_unit_admin = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    current_allocation = serializers.SerializerMethodField()
    allocation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'service_unit', 'service_unit_name',
            'is_service_unit_admin', 'avatar', 'avatar_url', 'date_joined', 
            'last_login', 'created_at', 'updated_at', 'current_allocation', 'allocation_count'
        )
        read_only_fields = ('id', 'username', 'date_joined', 'last_login', 'created_at', 'updated_at')
    
    def get_avatar_url(self, obj):
        """Get avatar URL if avatar exists."""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_is_service_unit_admin(self, obj):
        """Check if user is a service unit admin."""
        return obj.role == 'ServiceUnitAdmin'
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_current_allocation(self, obj):
        """Get user's current room allocation."""
        from apps.allocations.models import RoomAllocation
        
        current_allocation = RoomAllocation.objects.filter(
            user=obj, 
            status__in=['active', 'confirmed']
        ).first()
        
        if current_allocation:
            return {
                'id': current_allocation.id,
                'room_number': current_allocation.room.room_number,
                'building_name': current_allocation.room.building.name,
                'allocation_date': current_allocation.allocation_date,
                'status': current_allocation.status,
                'room_capacity': current_allocation.room.capacity,
                'room_type': current_allocation.room.room_type
            }
        return None
    
    def get_allocation_count(self, obj):
        """Get total number of allocations for this user."""
        from apps.allocations.models import RoomAllocation
        return RoomAllocation.objects.filter(user=obj).count()
    
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


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating users (admin operations).
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        help_text="Leave blank to keep current password when updating"
    )
    password_confirm = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'role',
            'service_unit', 'is_active'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Custom validation for password confirmation and role-based rules."""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        # Password validation only if password is provided
        if password and password != password_confirm:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        
        # Role-based validation
        role = attrs.get('role')
        service_unit = attrs.get('service_unit')
        
        if role == 'ServiceUnitAdmin' and not service_unit:
            raise serializers.ValidationError(
                {"service_unit": "Service Unit Admins must be assigned to a service unit."}
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create user with encrypted password."""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        if not password:
            raise serializers.ValidationError(
                {"password": "Password is required when creating a user."}
            )
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user
    
    def update(self, instance, validated_data):
        """Update user, optionally updating password."""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for user lists (admin views).
    """
    service_unit_name = serializers.CharField(
        source='service_unit.name', 
        read_only=True
    )
    avatar_url = serializers.SerializerMethodField()
    is_service_unit_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'service_unit_name', 'is_service_unit_admin',
            'is_active', 'avatar_url', 'date_joined'
        )
    
    def get_avatar_url(self, obj):
        """Get avatar URL if avatar exists."""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_is_service_unit_admin(self, obj):
        """Check if user is a service unit admin."""
        return obj.role == 'ServiceUnitAdmin'
