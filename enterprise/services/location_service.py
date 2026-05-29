import logging
from enterprise.models.location import Location
from enterprise.models.country import Country
from enterprise.models.state import State

logger = logging.getLogger(__name__)


class LocationService:

    @staticmethod
    def search_locations(query):
        """Search by city name - for autocomplete."""
        return Location.objects.select_related('state', 'country').filter(
            city__icontains=query.strip()
        ).order_by('city')[:20]

    @staticmethod
    def get_location_by_id(location_id):
        try:
            return Location.objects.select_related('state', 'country').get(id=location_id)
        except Location.DoesNotExist:
            return None

    @staticmethod
    def get_all_locations():
        return Location.objects.select_related('state', 'country').all().order_by('city')

    @staticmethod
    def get_or_create_location_from_dict(location_data):
        """Create/fetch location from dict."""
        if not location_data:
            return None
        city = location_data.get('city', '').strip()
        country_name = location_data.get('country', 'India').strip()
        state_name = location_data.get('state', '').strip()

        if not city:
            raise ValueError("City is required")

        country = Country.objects.filter(name__iexact=country_name).first()
        if not country:
            country = Country.objects.create(name=country_name)

        state = None
        if state_name:
            state = State.objects.filter(name__iexact=state_name, country=country).first()
            if not state:
                state = State.objects.create(name=state_name, country=country)

        existing = Location.objects.filter(
            city__iexact=city, state=state, country=country
        ).first()

        if existing:
            return {
                'id': existing.id, 'city': existing.city,
                'state': existing.state.name if existing.state else None,
                'country': existing.country.name if existing.country else None,
                'created': False,
            }

        location = Location.objects.create(city=city, state=state, country=country)
        return {
            'id': location.id, 'city': location.city,
            'state': location.state.name if location.state else None,
            'country': location.country.name if location.country else None,
            'created': True,
        }

    @staticmethod
    def get_location_statistics():
        total = Location.objects.count()
        with_profiles = Location.objects.filter(
            candidate_profiles__isnull=False
        ).distinct().count()
        return {
            'total_locations': total,
            'locations_with_profiles': with_profiles,
            'empty_locations': total - with_profiles,
        }
