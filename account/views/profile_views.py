"""
Profile Views - View and update the current user's profile.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from account.serializers.auth_serializers import UserSerializer, UpdateProfileSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    GET /api/v1/auth/user/
    Return the logged-in user's profile.
    """
    return Response(
        {'success': True, 'data': UserSerializer(request.user).data},
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    PATCH /api/v1/auth/user/update/
    Body: { full_name?, phone_number? }
    """
    serializer = UpdateProfileSerializer(
        request.user, data=request.data, partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'success': True, 'data': UserSerializer(request.user).data},
            status=status.HTTP_200_OK
        )

    return Response(
        {'success': False, 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )
