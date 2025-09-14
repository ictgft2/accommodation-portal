"""
URL configuration for members app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'members'

# Router for ViewSets (we'll add these later)
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    # path('members/', views.MemberListCreateView.as_view(), name='member-list'),
    # path('members/<int:pk>/', views.MemberDetailView.as_view(), name='member-detail'),
    # path('pastors/', views.PastorListCreateView.as_view(), name='pastor-list'),
]
