"""
URL patterns for core app dashboard API endpoints.
"""

from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Dashboard endpoints
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('dashboard/activities/', views.dashboard_activities, name='dashboard_activities'),
    path('dashboard/summary/', views.dashboard_summary, name='dashboard_summary'),
]
