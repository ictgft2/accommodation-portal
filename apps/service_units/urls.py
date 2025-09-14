"""
URL patterns for service units app API endpoints.
"""

from django.urls import path
from . import views

app_name = 'service_units'

urlpatterns = [
    # Service unit CRUD endpoints
    path('', views.ServiceUnitListCreateView.as_view(), name='service_unit_list_create'),
    path('<int:pk>/', views.ServiceUnitDetailView.as_view(), name='service_unit_detail'),
    
    # Service unit members endpoints
    path('<int:pk>/members/', views.ServiceUnitMembersView.as_view(), name='service_unit_members'),
    path('<int:pk>/assign-member/', views.assign_member_to_service_unit, name='assign_member'),
    path('<int:pk>/remove-member/', views.remove_member_from_service_unit, name='remove_member'),
    
    # Service unit statistics
    path('<int:pk>/stats/', views.ServiceUnitStatsView.as_view(), name='service_unit_stats'),
]
