from rest_framework import serializers
from enterprise.models import Location, Country, State


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name']


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'name']


class LocationSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True, default=None)
    country_name = serializers.CharField(source='country.name', read_only=True, default=None)
    label = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ['id', 'city', 'state', 'state_name', 'country', 'country_name', 'label']

    def get_label(self, obj):
        parts = [obj.city]
        if obj.state:
            parts.append(obj.state.name)
        if obj.country:
            parts.append(obj.country.name)
        return ', '.join(parts)
