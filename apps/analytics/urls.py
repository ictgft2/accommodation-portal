from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, UserEventViewSet, DashboardMetricsViewSet

router = DefaultRouter()
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'events', UserEventViewSet, basename='events')
router.register(r'metrics', DashboardMetricsViewSet, basename='metrics')

urlpatterns = [
    path('', include(router.urls)),
]
