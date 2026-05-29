from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAuthenticated

from candidate.models.certification import Certification
from candidate.serializers.certification_serializers import CertificationSerializer

class CertificationListView(generics.ListCreateAPIView):
    """
    GET /api/v1/candidate/certifications/  - List all certifications for the user
    POST /api/v1/candidate/certifications/ - Add a new certification
    """
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """User only sees their own certifications"""
        return Certification.objects.filter(candidate=self.request.user.candidate_profile)

    def perform_create(self, serializer):
        """Link to current user's profile on create"""
        serializer.save(candidate=self.request.user.candidate_profile)

class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/candidate/certifications/<id>/    - View single certification
    PATCH /api/v1/candidate/certifications/<id>/  - Edit certification
    DELETE /api/v1/candidate/certifications/<id>/ - Delete certification
    """
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """User can only edit/delete their own certifications"""
        return Certification.objects.filter(candidate=self.request.user.candidate_profile)

    def destroy(self, request, *args, **kwargs):
        """Delete file from storage when certification is deleted (optional but good practice)"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
