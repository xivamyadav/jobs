"""
Global exception handling for Django REST Framework.
Ensures all errors follow the standard JSON response format.
"""

from rest_framework.views import exception_handler
from core.utils.custom_responses import ErrorResponse


def custom_exception_handler(exc, context):
    """
    Intercepts standard DRF errors and wraps them in our custom format.
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_message = str(exc)
        
        # Extract the most relevant error message string from the DRF dictionary
        if isinstance(response.data, dict) and response.data:
            first_key = list(response.data.keys())[0]
            if isinstance(response.data[first_key], list):
                error_message = f"{first_key}: {response.data[first_key][0]}"
            else:
                error_message = str(response.data[first_key])

        return ErrorResponse(
            message=error_message, 
            data=response.data, 
            status_code=response.status_code
        )

    return response