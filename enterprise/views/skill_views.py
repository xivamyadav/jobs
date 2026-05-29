"""
Skill Views — Enterprise master skills CRUD + search.

Endpoints:
  GET    /api/v1/enterprise/skills/           → List all skills (supports ?search=python)
  POST   /api/v1/enterprise/skills/           → Create new skill. Body: { "skill_name": "..." }
  GET    /api/v1/enterprise/skills/<id>/      → Get single skill
  PUT    /api/v1/enterprise/skills/<id>/      → Update skill. Body: { "skill_name": "..." }
  DELETE /api/v1/enterprise/skills/<id>/      → Delete skill
  GET    /api/v1/enterprise/skills/search/    → Search skills. Query: ?q=python (AllowAny)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from enterprise.services.skill_service import SkillService
from enterprise.serializers.skill_serializers import SkillSerializer


class SkillListCreateAPI(APIView):
    """
    GET  → List all skills (optional ?search=)
    POST → Create new skill
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search')
        skills = SkillService.get_all_skills(search=search)
        return Response(SkillSerializer(skills, many=True).data)

    def post(self, request):
        name = request.data.get('skill_name', '').strip()
        if not name:
            return Response(
                {'error': 'skill_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            skill = SkillService.create_skill(skill_name=name)
            return Response(SkillSerializer(skill).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SkillDetailAPI(APIView):
    """
    GET    → Get single skill
    PUT    → Update skill
    DELETE → Delete skill
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, skill_id):
        try:
            skill = SkillService.get_skill_by_id(skill_id)
            return Response(SkillSerializer(skill).data)
        except Exception:
            return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, skill_id):
        name = request.data.get('skill_name', '').strip()
        if not name:
            return Response({'error': 'skill_name is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            skill = SkillService.update_skill(skill_id=skill_id, skill_name=name)
            return Response(SkillSerializer(skill).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, skill_id):
        SkillService.delete_skill(skill_id=skill_id)
        return Response({'message': 'Skill deleted'}, status=status.HTTP_200_OK)


class SkillSearchAPI(APIView):
    """
    GET → Search skills by name (Public — AllowAny)
    Query: ?q=python
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])
        skills = SkillService.get_all_skills(search=query)
        return Response(SkillSerializer(skills[:20], many=True).data)
