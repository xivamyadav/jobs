from rest_framework.response import Response
from rest_framework import status

class SuccessResponse(Response):
    def __init__(self, data=None, message="Success", status_code=status.HTTP_200_OK, **kwargs):
        response_data = {
            "success": True,
            "data": data,
            "message": message
        }
        super().__init__(data=response_data, status=status_code, **kwargs)

class ErrorResponse(Response):
    def __init__(self, error=None, message="Error", status_code=status.HTTP_400_BAD_REQUEST, **kwargs):
        response_data = {
            "success": False,
            "error": error,
            "message": message
        }
        super().__init__(data=response_data, status=status_code, **kwargs)