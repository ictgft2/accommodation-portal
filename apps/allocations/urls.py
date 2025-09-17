"""
URL configuration for allocations app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import RoomAllocationViewSet, AllocationRequestViewSet

app_name = 'allocations'

# Router for ViewSets
router = DefaultRouter()
router.register(r'allocations', RoomAllocationViewSet, basename='allocation')
router.register(r'allocation-requests', AllocationRequestViewSet, basename='allocation-request')

urlpatterns = [
    path('', include(router.urls)),
]
