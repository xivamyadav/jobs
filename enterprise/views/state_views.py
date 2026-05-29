"""
State/Country Views — List countries, states, search, populate India data.

Endpoints:
  GET  /api/v1/enterprise/countries/          → List all countries (Public)
  GET  /api/v1/enterprise/states/             → List states. Optional: ?country_id=1 (Public)
  GET  /api/v1/enterprise/states/search/      → Search states. Query: ?q=utt (Public)
  POST /api/v1/enterprise/states/populate/    → Populate India states (one-time, Auth required)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from enterprise.models import Country, State
from enterprise.serializers.location_serializers import CountrySerializer, StateSerializer


class CountryListView(APIView):
    """GET → List all countries (Public)"""
    permission_classes = [AllowAny]

    def get(self, request):
        countries = Country.objects.all()
        return Response(CountrySerializer(countries, many=True).data)


class StateListView(APIView):
    """GET → List all states, optionally filter by country (Public)"""
    permission_classes = [AllowAny]

    def get(self, request):
        country_id = request.query_params.get('country_id')
        states = State.objects.all().select_related('country')
        if country_id:
            states = states.filter(country_id=country_id)
        return Response(StateSerializer(states, many=True).data)


class StateSearchView(APIView):
    """GET → Search states by name (Public)"""
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        country_id = request.query_params.get('country_id')
        if not query:
            return Response([])

        states = State.objects.filter(name__icontains=query).select_related('country')
        if country_id:
            states = states.filter(country_id=country_id)
        return Response(StateSerializer(states[:20], many=True).data)



