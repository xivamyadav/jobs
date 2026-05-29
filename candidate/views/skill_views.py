"""Skill Views — Add/remove skills from candidate profile."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from candidate.services import skill_service
from candidate.serializers.skill_serializers import CandidateSkillSerializer
from candidate.exceptions import CandidateException


class SkillListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = skill_service.get_skills(request.user)
        return Response({
            'success': True,
            'data': CandidateSkillSerializer(skills, many=True).data,
        })

    def post(self, request):
        skill_id = request.data.get('skill_id')
        name = request.data.get('name')
        if not skill_id and not name:
            return Response({
                'success': False, 'error': 'MISSING_FIELD', 'message': 'skill_id or name is required.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            skill = skill_service.add_skill(
                request.user,
                skill_id=skill_id,
                name=name,
                proficiency=request.data.get('proficiency'),
                years_experience=request.data.get('years_experience'),
                is_primary=request.data.get('is_primary', False)
            )
            return Response({
                'success': True,
                'data': CandidateSkillSerializer(skill).data,
                'message': 'Skill added successfully.',
            }, status=status.HTTP_201_CREATED)
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)


class SkillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            skill_service.remove_skill(request.user, pk)
            return Response({'success': True, 'message': 'Skill removed.'}, status=status.HTTP_200_OK)
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)
