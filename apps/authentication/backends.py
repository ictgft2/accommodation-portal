"""
Custom authentication backends for the accommodation portal.
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailAuthBackend(ModelBackend):
    """
    Custom authentication backend that allows users to login with email.
    
    This backend supports authentication using email address instead of username.
    It's required because our User model uses email as the USERNAME_FIELD.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user using email and password.
        
        Args:
            request: The HTTP request object
            username: Actually the email address in our case
            password: User's password
            **kwargs: Additional keyword arguments
            
        Returns:
            User instance if authentication succeeds, None otherwise
        """
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
            
        if username is None or password is None:
            return None
            
        try:
            # Try to get user by email
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            # If user doesn't exist, still run check_password to prevent timing attacks
            User().set_password(password)
            return None
        else:
            # Check password and return user if valid
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
    
    def get_user(self, user_id):
        """
        Get user by primary key.
        
        Args:
            user_id: Primary key of the user
            
        Returns:
            User instance if found, None otherwise
        """
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        
        return user if self.user_can_authenticate(user) else None
