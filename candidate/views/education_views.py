"""Education Views — CRUD for candidate education records."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from candidate.services import education_service
from candidate.serializers.education_serializers import EducationSerializer
from candidate.exceptions import CandidateException


class EducationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        edus = education_service.get_educations(request.user)
        return Response({
            'success': True,
            'data': EducationSerializer(edus, many=True).data,
        })

    def post(self, request):
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                edu = education_service.add_education(request.user, serializer.validated_data)
                return Response({
                    'success': True,
                    'data': EducationSerializer(edu).data,
                    'message': 'Education added successfully.',
                }, status=status.HTTP_201_CREATED)
            except CandidateException as e:
                return Response({
                    'success': False, 'error': e.error_code, 'message': str(e),
                }, status=e.status_code)
        return Response({
            'success': False, 'error': 'VALIDATION_ERROR', 'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class EducationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            edu = education_service.get_education(request.user, pk)
            return Response({'success': True, 'data': EducationSerializer(edu).data})
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)

    def patch(self, request, pk):
        serializer = EducationSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            try:
                edu = education_service.update_education(request.user, pk, serializer.validated_data)
                return Response({
                    'success': True,
                    'data': EducationSerializer(edu).data,
                    'message': 'Education updated successfully.',
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
            education_service.delete_education(request.user, pk)
            return Response({'success': True, 'message': 'Education deleted.'}, status=status.HTTP_200_OK)
        except CandidateException as e:
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)
