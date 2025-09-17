"""
User models for Accommodation Portal authentication system.
Based on the SQL schema design with Django best practices.
"""

import os
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


def user_avatar_path(instance, filename):
    """Generate upload path for user avatars."""
    # Get file extension
    ext = filename.split('.')[-1]
    # Generate new filename
    filename = f"avatar_{instance.id}.{ext}"
    return os.path.join('avatars', filename)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    
    Maps to SQL Users table with the following fields:
    - UserID (auto-generated primary key)
    - FullName (split into first_name, last_name from AbstractUser)
    - Email (from AbstractUser, made required and unique)
    - PasswordHash (handled by AbstractUser password field)
    - PhoneNumber
    - Role (choices: SuperAdmin, ServiceUnitAdmin, Pastor, Member)
    - ServiceUnitID (foreign key to ServiceUnit)
    - IsActive (from AbstractUser is_active field)
    - CreatedAt, UpdatedAt (auto timestamps)
    """
    
    # Role choices matching SQL CHECK constraint
    class RoleChoices(models.TextChoices):
        SUPER_ADMIN = 'SuperAdmin', 'Super Admin'
        SERVICE_UNIT_ADMIN = 'ServiceUnitAdmin', 'Service Unit Admin'
        PASTOR = 'Pastor', 'Pastor'
        MEMBER = 'Member', 'Member'
    
    # Phone number validator
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    # Additional fields beyond AbstractUser
    phone_number = models.CharField(
        max_length=20,
        validators=[phone_regex],
        blank=True,
        help_text="Phone number in international format"
    )
    
    role = models.CharField(
        max_length=30,
        choices=RoleChoices.choices,
        default=RoleChoices.MEMBER,
        help_text="User role in the system"
    )
    
    service_unit = models.ForeignKey(
        'service_units.ServiceUnit',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',
        help_text="Service unit this user belongs to"
    )
    
    # Override email to make it required and unique
    email = models.EmailField(
        unique=True,
        help_text="Email address (must be unique)"
    )
    
    # Avatar/Profile picture
    avatar = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        help_text="User profile picture/avatar"
    )
    
    # User settings (JSON field for storing user preferences)
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="User settings and preferences stored as JSON"
    )
    
    # Timestamps (created_at, updated_at)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email for authentication instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['role'], name='idx_users_role'),
            models.Index(fields=['email'], name='idx_users_email'),
            models.Index(fields=['service_unit'], name='idx_users_service_unit'),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        """Return full name combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_super_admin(self):
        """Check if user is a super admin."""
        return self.role == self.RoleChoices.SUPER_ADMIN
    
    def is_service_unit_admin(self):
        """Check if user is a service unit admin."""
        return self.role == self.RoleChoices.SERVICE_UNIT_ADMIN
    
    def is_pastor(self):
        """Check if user is a pastor."""
        return self.role == self.RoleChoices.PASTOR
    
    def is_member(self):
        """Check if user is a regular member."""
        return self.role == self.RoleChoices.MEMBER
    
    def can_manage_service_unit(self, service_unit=None):
        """Check if user can manage a specific service unit."""
        if self.is_super_admin():
            return True
        if self.is_service_unit_admin() and service_unit:
            return self.service_unit == service_unit
        return False
    
    def can_allocate_rooms(self):
        """Check if user can allocate rooms."""
        return self.role in [
            self.RoleChoices.SUPER_ADMIN,
            self.RoleChoices.SERVICE_UNIT_ADMIN
        ]
    
    def save(self, *args, **kwargs):
        """Override save to ensure email is used as username."""
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)
