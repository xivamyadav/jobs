from django.contrib import admin
from enterprise.models import Country, State, Location, Skill


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'country')
    list_filter = ('country',)
    search_fields = ('name',)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'city', 'state', 'country')
    list_filter = ('country', 'state')
    search_fields = ('city',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('skill_id', 'skill_name')
    search_fields = ('skill_name',)
