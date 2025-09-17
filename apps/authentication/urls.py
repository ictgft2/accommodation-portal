"""
URL patterns for authentication app API endpoints.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # JWT Token endpoints
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/avatar/', views.AvatarManagementView.as_view(), name='avatar_management'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    path('settings/', views.UserSettingsView.as_view(), name='user_settings'),
    
    # User management endpoints (admin)
    path('users/', views.UserListCreateView.as_view(), name='user_list_create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/statistics/', views.user_statistics_view, name='user_statistics'),
    path('users/bulk-delete/', views.bulk_delete_users_view, name='bulk_delete_users'),
    path('users/<int:pk>/role/', views.update_user_role_view, name='update_user_role'),
]
