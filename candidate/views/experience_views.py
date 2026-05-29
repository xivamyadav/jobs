"""Experience Views — CRUD for candidate work experience."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from candidate.services import experience_service
from candidate.serializers.experience_serializers import ExperienceSerializer
from candidate.exceptions import CandidateException


class ExperienceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exps = experience_service.get_experiences(request.user)
        return Response({
            'success': True,
            'data': ExperienceSerializer(exps, many=True).data,
        })

    def post(self, request):
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            try:
                exp = experience_service.add_experience(request.user, serializer.validated_data)
                return Response({
                    'success': True,
                    'data': ExperienceSerializer(exp).data,
                    'message': 'Experience added successfully.',
                }, status=status.HTTP_201_CREATED)
            except CandidateException as e:
                return Response({
                    'success': False, 'error': e.error_code, 'message': str(e),
                }, status=e.status_code)
        return Response({
            'success': False, 'error': 'VALIDATION_ERROR', 'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ExperienceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            exp = experience_service.get_experience(request.user, pk)
            return Response({'success': True, 'data': ExperienceSerializer(exp).data})
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)

    def patch(self, request, pk):
        serializer = ExperienceSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            try:
                exp = experience_service.update_experience(request.user, pk, serializer.validated_data)
                return Response({
                    'success': True,
                    'data': ExperienceSerializer(exp).data,
                    'message': 'Experience updated successfully.',
                })
            except CandidateException as e:
                return Response({
                    'success': False, 'error': e.error_code, 'message': str(e),
                }, status=e.status_code)
        return Response({
            'success': False, 'error': 'VALIDATION_ERROR', 'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            experience_service.delete_experience(request.user, pk)
            return Response({'success': True, 'message': 'Experience deleted.'}, status=status.HTTP_200_OK)
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)
