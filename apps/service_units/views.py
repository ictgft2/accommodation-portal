"""
Service Units API views for managing service units and their members.
Provides endpoints for CRUD operations with role-based permissions.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.apps import apps

from .models import ServiceUnit
from .serializers import (
    ServiceUnitSerializer,
    ServiceUnitCreateSerializer,
    ServiceUnitListSerializer,
    ServiceUnitMemberSerializer,
    ServiceUnitStatsSerializer
)


class ServiceUnitListCreateView(generics.ListCreateAPIView):
    """
    API view for listing and creating service units.
    GET/POST /api/service-units/
    """
    queryset = ServiceUnit.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceUnitCreateSerializer
        return ServiceUnitListSerializer
    
    def get_queryset(self):
        """Filter service units based on user role."""
        user = self.request.user
        
        if user.role == 'SuperAdmin':
            return ServiceUnit.objects.all()
        elif user.role == 'ServiceUnitAdmin':
            # ServiceUnitAdmin can see their own service unit
            if user.service_unit:
                return ServiceUnit.objects.filter(id=user.service_unit.id)
            else:
                return ServiceUnit.objects.none()
        else:
            # Regular users can see all service units (read-only)
            return ServiceUnit.objects.all()
    
    def create(self, request, *args, **kwargs):
        """Create a new service unit (SuperAdmin only)."""
        if request.user.role != 'SuperAdmin':
            return Response({
                'error': 'Only SuperAdmin can create service units'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)


class ServiceUnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for service unit detail operations.
    GET/PUT/DELETE /api/service-units/<id>/
    """
    queryset = ServiceUnit.objects.all()
    serializer_class = ServiceUnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter service units based on user role."""
        user = self.request.user
        
        if user.role == 'SuperAdmin':
            return ServiceUnit.objects.all()
        elif user.role == 'ServiceUnitAdmin':
            if user.service_unit:
                return ServiceUnit.objects.filter(id=user.service_unit.id)
            else:
                return ServiceUnit.objects.none()
        else:
            # Regular users can view service units
            return ServiceUnit.objects.all()
    
    def update(self, request, *args, **kwargs):
        """Update service unit (SuperAdmin or assigned admin only)."""
        service_unit = self.get_object()
        user = request.user
        
        if user.role == 'SuperAdmin':
            # SuperAdmin can update any service unit
            pass
        elif user.role == 'ServiceUnitAdmin' and user.service_unit == service_unit:
            # ServiceUnitAdmin can update their own service unit (limited fields)
            allowed_fields = ['description']
            for field in request.data.keys():
                if field not in allowed_fields:
                    return Response({
                        'error': f'ServiceUnitAdmin can only update: {", ".join(allowed_fields)}'
                    }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'error': 'You do not have permission to update this service unit'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete service unit (SuperAdmin only)."""
        if request.user.role != 'SuperAdmin':
            return Response({
                'error': 'Only SuperAdmin can delete service units'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)


class ServiceUnitMembersView(generics.ListAPIView):
    """
    API view for listing service unit members.
    GET /api/service-units/<id>/members/
    """
    serializer_class = ServiceUnitMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get members of the specified service unit."""
        service_unit_id = self.kwargs['pk']
        user = self.request.user
        
        # Check permissions
        if user.role == 'SuperAdmin':
            # SuperAdmin can view any service unit's members
            pass
        elif user.role == 'ServiceUnitAdmin':
            # ServiceUnitAdmin can only view their own service unit's members
            if not user.service_unit or user.service_unit.id != int(service_unit_id):
                return apps.get_model('authentication', 'User').objects.none()
        else:
            # Regular users can view service unit members
            pass
        
        try:
            service_unit = ServiceUnit.objects.get(id=service_unit_id)
            User = apps.get_model('authentication', 'User')
            return User.objects.filter(service_unit=service_unit)
        except ServiceUnit.DoesNotExist:
            return apps.get_model('authentication', 'User').objects.none()


class ServiceUnitStatsView(generics.RetrieveAPIView):
    """
    API view for service unit statistics and analytics.
    GET /api/service-units/<id>/stats/
    """
    queryset = ServiceUnit.objects.all()
    serializer_class = ServiceUnitStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter service units based on user role."""
        user = self.request.user
        
        if user.role == 'SuperAdmin':
            return ServiceUnit.objects.all()
        elif user.role == 'ServiceUnitAdmin':
            if user.service_unit:
                return ServiceUnit.objects.filter(id=user.service_unit.id)
            else:
                return ServiceUnit.objects.none()
        else:
            # Regular users can view basic stats
            return ServiceUnit.objects.all()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_member_to_service_unit(request, pk):
    """
    Assign a member to a service unit.
    POST /api/service-units/<id>/assign-member/
    """
    user = request.user
    
    # Check permissions
    if user.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
        return Response({
            'error': 'Only SuperAdmin and ServiceUnitAdmin can assign members'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        service_unit = ServiceUnit.objects.get(id=pk)
        
        # ServiceUnitAdmin can only assign to their own service unit
        if user.role == 'ServiceUnitAdmin' and user.service_unit != service_unit:
            return Response({
                'error': 'You can only assign members to your own service unit'
            }, status=status.HTTP_403_FORBIDDEN)
        
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({
                'error': 'member_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        User = apps.get_model('authentication', 'User')
        member = get_object_or_404(User, id=member_id)
        
        # Update member's service unit
        member.service_unit = service_unit
        member.save()
        
        return Response({
            'message': f'{member.get_full_name()} assigned to {service_unit.name} successfully'
        }, status=status.HTTP_200_OK)
        
    except ServiceUnit.DoesNotExist:
        return Response({
            'error': 'Service unit not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_member_from_service_unit(request, pk):
    """
    Remove a member from a service unit.
    POST /api/service-units/<id>/remove-member/
    """
    user = request.user
    
    # Check permissions
    if user.role not in ['SuperAdmin', 'ServiceUnitAdmin']:
        return Response({
            'error': 'Only SuperAdmin and ServiceUnitAdmin can remove members'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        service_unit = ServiceUnit.objects.get(id=pk)
        
        # ServiceUnitAdmin can only remove from their own service unit
        if user.role == 'ServiceUnitAdmin' and user.service_unit != service_unit:
            return Response({
                'error': 'You can only remove members from your own service unit'
            }, status=status.HTTP_403_FORBIDDEN)
        
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({
                'error': 'member_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        User = apps.get_model('authentication', 'User')
        member = get_object_or_404(User, id=member_id, service_unit=service_unit)
        
        # Remove member from service unit
        member.service_unit = None
        member.save()
        
        return Response({
            'message': f'{member.get_full_name()} removed from {service_unit.name} successfully'
        }, status=status.HTTP_200_OK)
        
    except ServiceUnit.DoesNotExist:
        return Response({
            'error': 'Service unit not found'
        }, status=status.HTTP_404_NOT_FOUND)
