from django.db import models
from .country import Country


class State(models.Model):
    """
    Master table for states/UTs.
    Linked to Country via ForeignKey.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='states'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enterprise_state'
        ordering = ['name']
        unique_together = ('name', 'country')

    def __str__(self):
        return f"{self.name} ({self.country.name})"
