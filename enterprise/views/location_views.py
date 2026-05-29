"""
Location Views — List, search, statistics.

Endpoints:
  GET /api/v1/enterprise/locations/            → List all locations
  GET /api/v1/enterprise/locations/search/      → Search by city. Query: ?q=mum
  GET /api/v1/enterprise/locations/statistics/  → Location stats
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from enterprise.services.location_service import LocationService
from enterprise.serializers.location_serializers import LocationSerializer


class LocationListView(APIView):
    """GET → List all locations"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        locations = LocationService.get_all_locations()
        return Response(LocationSerializer(locations, many=True).data)


class LocationSearchView(APIView):
    """
    GET → Search locations by city name.
    Query: ?q=mumbai
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])
        locations = LocationService.search_locations(query)
        return Response(LocationSerializer(locations, many=True).data)


class LocationStatisticsView(APIView):
    """GET → Location usage statistics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = LocationService.get_location_statistics()
        return Response(stats)
