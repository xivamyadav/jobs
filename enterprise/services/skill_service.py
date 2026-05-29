from django.db import transaction
from enterprise.models.skill import Skill


class SkillService:

    @staticmethod
    def get_all_skills(search=None):
        qs = Skill.objects.all()
        if search:
            qs = qs.filter(skill_name__istartswith=search)
        return qs

    @staticmethod
    def get_skill_by_id(skill_id):
        return Skill.objects.get(skill_id=skill_id)

    @staticmethod
    @transaction.atomic
    def create_skill(*, skill_name):
        return Skill.objects.create(skill_name=skill_name.strip())

    @staticmethod
    @transaction.atomic
    def update_skill(*, skill_id, skill_name):
        skill = Skill.objects.get(skill_id=skill_id)
        skill.skill_name = skill_name.strip()
        skill.save()
        return skill

    @staticmethod
    def delete_skill(*, skill_id):
        Skill.objects.filter(skill_id=skill_id).delete()
