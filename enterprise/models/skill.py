from django.db import models


class Skill(models.Model):
    """
    Master skill table.
    Jobs aur Candidates dono isse reference karenge.
    """
    skill_id = models.AutoField(primary_key=True)
    skill_name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'enterprise_skills'
        ordering = ['skill_name']

    def __str__(self):
        return self.skill_name
