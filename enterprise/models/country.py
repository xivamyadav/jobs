from django.db import models


class Country(models.Model):
    """
    Master table for countries.
    Abhi sirf India rakhenge, baad mein aur add kar sakte hain.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enterprise_country'
        ordering = ['name']
        verbose_name_plural = 'Countries'

    def __str__(self):
        return self.name
