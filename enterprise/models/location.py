from django.db import models
from enterprise.models.state import State
from enterprise.models.country import Country


class Location(models.Model):
    """
    City master table.
    Single source of truth for location data.
    State aur Country derive hote hain isse.
    """
    city = models.CharField(max_length=120)
    state = models.ForeignKey(
        State,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='locations'
    )
    country = models.ForeignKey(
        Country,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='locations'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enterprise_location'
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['country']),
        ]

    def __str__(self):
        parts = [self.city]
        if self.state:
            parts.append(self.state.name)
        if self.country:
            parts.append(self.country.name)
        return ', '.join(parts)
