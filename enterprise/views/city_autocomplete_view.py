"""
City Autocomplete View - For frontend typeahead.

Endpoint:
  GET /api/v1/enterprise/city-search/?q=pun    → Pune, Punjab cities...
  GET /api/v1/enterprise/city-search/?q=noi    → Noida...
  Optional params: state_id, country_id, limit (max 20)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from enterprise.models.location import Location
import logging

logger = logging.getLogger(__name__)


class CityAutocompleteView(APIView):
    """City search with autocomplete — min 2 chars required."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        state_id = request.query_params.get('state_id', '').strip()
        country_id = request.query_params.get('country_id', '').strip()
        limit = request.query_params.get('limit', '10').strip()

        if not query or len(query) < 2:
            return Response({
                'count': 0,
                'results': [],
                'message': 'Type at least 2 characters to search'
            })

        try:
            limit = min(int(limit), 20)
        except ValueError:
            limit = 10

        try:
            qs = Location.objects.select_related(
                'state', 'country',
            ).filter(city__icontains=query)

            if state_id:
                qs = qs.filter(state_id=state_id)
            if country_id:
                qs = qs.filter(country_id=country_id)

            qs = qs.order_by('city')[:limit]

            results = []
            for loc in qs:
                state_name = loc.state.name if loc.state else ''
                country_name = loc.country.name if loc.country else ''

                parts = [loc.city]
                if state_name:
                    parts.append(state_name)
                if country_name:
                    parts.append(country_name)
                label = ', '.join(parts)

                results.append({
                    'id': loc.id,
                    'city': loc.city,
                    'state': state_name,
                    'country': country_name,
                    'label': label,
                })

            return Response({
                'count': len(results),
                'results': results,
            })

        except Exception as e:
            logger.error(f"City autocomplete error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error searching cities'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
