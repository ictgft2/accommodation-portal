"""
URL patterns for buildings app API endpoints.
"""

from django.urls import path
from . import views

app_name = 'buildings'

urlpatterns = [
    # Building endpoints
    path('', views.BuildingListCreateView.as_view(), name='building_list_create'),
    path('<int:pk>/', views.BuildingDetailView.as_view(), name='building_detail'),
    
    # Room endpoints
    path('<int:building_id>/rooms/', views.RoomListCreateView.as_view(), name='room_list_create'),
    path('<int:building_id>/rooms/<int:pk>/', views.RoomDetailView.as_view(), name='room_detail'),
]
