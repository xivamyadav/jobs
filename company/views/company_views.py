from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from company.models import Company
from company.serializers import company_serializers


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = company_serializers.CompanySerializers
    permission_classes = [IsAuthenticated]
    queryset = Company.objects.all()
    # SECURITY: Block generic create/delete/update — all mutations go through my_company
    http_method_names = ['get', 'head', 'options', 'patch', 'put', 'post']

    def create(self, request, *args, **kwargs):
        """Block POST /api/v1/company/ — use my_company endpoint instead."""
        return Response(
            {'success': False, 'message': 'Use /api/v1/company/my_company/ to create your company.'},
            status=status.HTTP_403_FORBIDDEN
        )

    def destroy(self, request, *args, **kwargs):
        """Block DELETE /api/v1/company/{id}/ — companies cannot be deleted via API."""
        return Response(
            {'success': False, 'message': 'Company deletion is not allowed.'},
            status=status.HTTP_403_FORBIDDEN
        )

    def get_queryset(self):
        user = self.request.user
        # Prevent AttributeError if Candidate accesses this view
        if user.__class__.__name__ == 'CandidateUser':
            return Company.objects.none()
        return user.companies.all()

    @action(detail=False, methods=['get', 'patch', 'put'])
    def my_company(self, request):
        # Prevent AttributeError if Candidate accesses this view
        if request.user.__class__.__name__ == 'CandidateUser':
            return Response({
                'success': False,
                'message': 'Candidates do not have company profiles.'
            }, status=status.HTTP_403_FORBIDDEN)

        company = request.user.companies.first()
        if not company:
            if request.method == 'GET':
                return Response({
                    'success': False,
                    'message': 'No company found'
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = company_serializers.CompanySerializers(data=request.data, context={'request': request})
            if serializer.is_valid():
                company = serializer.save()
                company.users.add(request.user)
                data = company_serializers.CompanySerializers(company, context={'request': request}).data
                return Response({
                    'success': True,
                    'data': data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'GET':
            data = company_serializers.CompanySerializers(company, context={'request': request}).data
            return Response({
                'success': True,
                'data': data
            })

        serializer = company_serializers.CompanySerializers(
            company,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'data': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def upload_logo(self, request, pk=None):
        company = self.get_object()
        file_key = next((key for key in ('logo', 'image', 'imago') if key in request.FILES), None)
        if file_key:
            data = request.data.copy()
            if file_key != 'logo':
                data['logo'] = request.FILES[file_key]
            serializer = company_serializers.CompanySerializers(
                company,
                data=data,
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'success': False,
            'message': 'No logo file provided'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='my_company/upload_logo')
    def upload_my_company_logo(self, request):
        # Prevent AttributeError if Candidate accesses this view
        if request.user.__class__.__name__ == 'CandidateUser':
            return Response({
                'success': False,
                'message': 'Candidates do not have company profiles.'
            }, status=status.HTTP_403_FORBIDDEN)

        company = request.user.companies.first()
        if not company:
            return Response({
                'success': False,
                'message': 'No company found'
            }, status=status.HTTP_404_NOT_FOUND)

        file_key = next((key for key in ('logo', 'image', 'imago') if key in request.FILES), None)
        if file_key:
            data = request.data.copy()
            if file_key != 'logo':
                data['logo'] = request.FILES[file_key]
            serializer = company_serializers.CompanySerializers(
                company,
                data=data,
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'success': False,
            'message': 'No logo file provided'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='my_company/upload_banner')
    def upload_my_company_banner(self, request):
        if request.user.__class__.__name__ == 'CandidateUser':
            return Response({
                'success': False,
                'message': 'Candidates do not have company profiles.'
            }, status=status.HTTP_403_FORBIDDEN)

        company = request.user.companies.first()
        if not company:
            return Response({
                'success': False,
                'message': 'No company found'
            }, status=status.HTTP_404_NOT_FOUND)

        if 'banner' in request.FILES:
            serializer = company_serializers.CompanySerializers(
                company,
                data={'banner': request.FILES['banner']},
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'success': False,
            'message': 'No banner file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
