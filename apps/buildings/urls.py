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
    
    # All rooms endpoint (for dropdowns, etc.)
    path('rooms/', views.AllRoomsListView.as_view(), name='all_rooms_list'),
    
    # Room endpoints (nested under buildings)
    path('<int:building_id>/rooms/', views.RoomListCreateView.as_view(), name='room_list_create'),
    path('<int:building_id>/rooms/<int:pk>/', views.RoomDetailView.as_view(), name='room_detail'),
]
