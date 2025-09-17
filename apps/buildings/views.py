"""
Buildings and Rooms API views.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Building, Room, RoomPicture
from .serializers import (
    BuildingSerializer, BuildingListSerializer, BuildingCreateUpdateSerializer,
    RoomSerializer, RoomListSerializer, RoomCreateUpdateSerializer,
    RoomPictureSerializer
)


class AllRoomsListView(generics.ListAPIView):
    """GET /api/buildings/rooms/ - Get all rooms from all buildings"""
    queryset = Room.objects.select_related('building').all()
    serializer_class = RoomListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Order by building name, then room number for better UX
        return queryset.order_by('building__name', 'room_number')


class BuildingListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/buildings/"""
    queryset = Building.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BuildingCreateUpdateSerializer
        return BuildingListSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'SuperAdmin':
            return Response({'error': 'Only SuperAdmin can create buildings'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


class BuildingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/buildings/<id>/"""
    queryset = Building.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BuildingCreateUpdateSerializer
        return BuildingSerializer
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'SuperAdmin':
            return Response({'error': 'Only SuperAdmin can update buildings'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'SuperAdmin':
            return Response({'error': 'Only SuperAdmin can delete buildings'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class RoomListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/buildings/<building_id>/rooms/"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        building_id = self.kwargs['building_id']
        return Room.objects.filter(building_id=building_id)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RoomCreateUpdateSerializer
        return RoomListSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'SuperAdmin':
            return Response({'error': 'Only SuperAdmin can create rooms'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        building_id = self.kwargs['building_id']
        building = get_object_or_404(Building, id=building_id)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(building=building)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/buildings/<building_id>/rooms/<id>/"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        building_id = self.kwargs['building_id']
        return Room.objects.filter(building_id=building_id)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RoomCreateUpdateSerializer
        return RoomSerializer
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'SuperAdmin':
            return Response({'error': 'Only SuperAdmin can update rooms'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'SuperAdmin':
            return Response({'error': 'Only SuperAdmin can delete rooms'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
