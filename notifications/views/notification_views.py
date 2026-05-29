"""
API Views handling notification retrieval and read status updates.
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.utils.custom_responses import SuccessResponse, ErrorResponse
from notifications.serializers.notification_serializers import NotificationSerializer
from notifications.services.notification_service import NotificationService


class NotificationListView(APIView):
    """
    GET /api/v1/notifications/
    Retrieves the paginated list of notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            queryset = NotificationService.get_user_notifications(user)
            
            # Calculate unread count for the frontend badge
            unread_count = queryset.filter(is_read=False).count()
            
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 20))
            start = (page - 1) * limit
            end = start + limit
            
            paginated_queryset = queryset[start:end]
            total_count = queryset.count()
            
            serializer = NotificationSerializer(paginated_queryset, many=True)
            data = serializer.data
            
            return SuccessResponse(
                data={
                    "notifications": data,
                    "unread_count": unread_count,
                    "total": total_count,
                    "page": page,
                    "limit": limit
                },
                message="Notifications retrieved successfully."
            )
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            return ErrorResponse(message=f"Server Error: {str(e)} \n {error_trace}", status_code=500)


class NotificationReadView(APIView):
    """
    PATCH /api/v1/notifications/{id}/read/
    Marks a single specific notification as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = NotificationService.mark_as_read(notification_id=pk, user=request.user)
            serializer = NotificationSerializer(notification)
            return SuccessResponse(data=serializer.data, message="Notification marked as read.")
        except ValueError as ve:
            return ErrorResponse(message=str(ve), status_code=404)


class NotificationReadAllView(APIView):
    """
    PATCH /api/v1/notifications/read-all/
    Marks all unread notifications for the user as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated_count = NotificationService.mark_all_as_read(user=request.user)
        return SuccessResponse(
            message=f"{updated_count} notifications marked as read.", 
            status_code=200
        )