"""
URL configuration for allocations app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'allocations'

# Router for ViewSets (we'll add these later)
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    # path('allocations/', views.AllocationListCreateView.as_view(), name='allocation-list'),
    # path('allocations/<int:pk>/', views.AllocationDetailView.as_view(), name='allocation-detail'),
]
