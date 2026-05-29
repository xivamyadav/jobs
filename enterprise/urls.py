from django.urls import path
from enterprise.views.skill_views import SkillListCreateAPI, SkillDetailAPI, SkillSearchAPI
from enterprise.views.location_views import LocationListView, LocationSearchView, LocationStatisticsView
from enterprise.views.state_views import CountryListView, StateListView, StateSearchView
from enterprise.views.city_autocomplete_view import CityAutocompleteView

urlpatterns = [
    path('city-search/',           CityAutocompleteView.as_view(),  name='city-autocomplete'),   # GET ?q=mum
    path('skills/search/',         SkillSearchAPI.as_view(),         name='skill-search'),        # GET ?q=py  (Public, no auth)
    path('skills/',                SkillListCreateAPI.as_view(),     name='skill-list-create'),   # GET | POST: { skill_name }
    path('skills/<int:skill_id>/', SkillDetailAPI.as_view(),         name='skill-detail'),        # GET | PUT: { skill_name } | DELETE
    path('locations/',             LocationListView.as_view(),        name='location-list'),       # GET
    path('locations/search/',      LocationSearchView.as_view(),      name='location-search'),     # GET ?q=delhi
    path('locations/statistics/',  LocationStatisticsView.as_view(), name='location-statistics'), # GET
    path('countries/',             CountryListView.as_view(),         name='country-list'),        # GET (Public)
    path('states/',                StateListView.as_view(),           name='state-list'),          # GET ?country_id=1 (Public)
    path('states/search/',         StateSearchView.as_view(),         name='state-search'),        # GET ?q=utt (Public)
]
