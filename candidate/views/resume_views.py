"""Resume View — GET/POST/DELETE candidate resume."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from candidate.services import resume_service
from candidate.serializers.resume_serializers import ResumeSerializer
from candidate.exceptions import CandidateException


class ResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        resume = resume_service.get_resume(request.user)
        if resume:
            return Response({
                'success': True,
                'data': ResumeSerializer(resume, context={'request': request}).data,
            })
        return Response({
            'success': True,
            'data': None,
            'message': 'No resume uploaded yet.',
        })

    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)

        # Try multiple common keys frontend might use
        resume_file = request.FILES.get('resume_file') or request.FILES.get('file') or request.FILES.get('resume')
        
        if not resume_file:
            logger.warning(f"Resume upload failed: No file found in request.FILES. Keys present: {list(request.FILES.keys())}")
            return Response({
                'success': False, 'error': 'MISSING_FILE', 'message': 'resume_file (or file) is required.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            resume = resume_service.upload_resume(request.user, resume_file)
            from candidate.services.candidateprofile_service import get_or_create_profile
            from candidate.serializers.profile_serializers import CandidateProfileSerializer
            profile = get_or_create_profile(request.user)
            
            return Response({
                'success': True,
                'data': CandidateProfileSerializer(profile, context={'request': request}).data,
                'message': 'Resume uploaded successfully.',
            }, status=status.HTTP_201_CREATED)
        except CandidateException as e:
            logger.warning(f"Resume upload failed for user {request.user.id}: {e.error_code} - {str(e)}")
            return Response({
                'success': False, 'error': e.error_code, 'message': str(e),
            }, status=e.status_code)

    def delete(self, request):
        resume_service.delete_resume(request.user)
        from candidate.services.candidateprofile_service import get_or_create_profile
        from candidate.serializers.profile_serializers import CandidateProfileSerializer
        profile = get_or_create_profile(request.user)
        
        return Response({
            'success': True, 
            'data': CandidateProfileSerializer(profile, context={'request': request}).data,
            'message': 'Resume deleted.',
        }, status=status.HTTP_200_OK)
