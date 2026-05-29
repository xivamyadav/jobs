from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    page_size_query_description = 'Number of results to return per page.'
    max_page_size = 100

    def get_paginated_response(self, data):
        from rest_framework.response import Response
        return Response({
            'success': True,
            'data': {
                'items': data,
                'pagination': {
                    'count': self.page.paginator.count,
                    'next': self.get_next_link(),
                    'previous': self.get_previous_link(),
                    'page_size': self.page_size,
                    'total_pages': self.page.paginator.num_pages,
                    'current_page': self.page.number,
                }
            }
        })