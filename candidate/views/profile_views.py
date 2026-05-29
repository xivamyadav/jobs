"""Profile View — GET/PATCH candidate profile."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from candidate.services import candidateprofile_service
from candidate.serializers.profile_serializers import (
    CandidateProfileSerializer, CandidateProfileUpdateSerializer,
)
from candidate.exceptions import CandidateException


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = candidateprofile_service.get_or_create_profile(request.user)
        return Response({
            'success': True,
            'data': CandidateProfileSerializer(profile, context={'request': request}).data,
        })

    def patch(self, request):
        serializer = CandidateProfileUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            try:
                profile = candidateprofile_service.update_profile(request.user, serializer.validated_data)
                return Response({
                    'success': True,
                    'data': CandidateProfileSerializer(profile, context={'request': request}).data,
                    'message': 'Profile updated successfully.',
                })
            except CandidateException as e:
                return Response({
                    'success': False, 'error': e.error_code, 'message': str(e),
                }, status=e.status_code)
        return Response({
            'success': False, 'error': 'VALIDATION_ERROR', 'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """Handle PUT requests by routing them to the PATCH logic since all fields are optional."""
        return self.patch(request)
