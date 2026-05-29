from rest_framework import serializers
from candidate.models.skill import CandidateSkill
from enterprise.serializers.skill_serializers import SkillSerializer


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill_detail = SkillSerializer(source='skill', read_only=True)

    class Meta:
        model = CandidateSkill
        fields = '__all__'
        read_only_fields = ['candidate']
