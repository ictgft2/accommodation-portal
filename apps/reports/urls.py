"""
URL configuration for reports app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'reports'

# Router for ViewSets (we'll add these later)
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    # path('occupancy/', views.OccupancyReportView.as_view(), name='occupancy-report'),
    # path('allocations/', views.AllocationReportView.as_view(), name='allocation-report'),
    # path('service-units/', views.ServiceUnitReportView.as_view(), name='service-unit-report'),
]
