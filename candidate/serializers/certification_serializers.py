from rest_framework import serializers
from candidate.models.certification import Certification

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization', 'completion_id', 'url',
            'valid_from_month', 'valid_from_year',
            'valid_to_month', 'valid_to_year',
            'does_not_expire',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Custom validation for validity dates.
        """
        valid_from_year = data.get('valid_from_year')
        valid_from_month = data.get('valid_from_month')
        valid_to_year = data.get('valid_to_year')
        valid_to_month = data.get('valid_to_month')
        does_not_expire = data.get('does_not_expire', False)

        # If it expires, it must have a valid_to year (and optionally month)
        if not does_not_expire:
            if valid_to_year and valid_from_year:
                if valid_to_year < valid_from_year:
                    raise serializers.ValidationError({"valid_to_year": "Valid to year cannot be before valid from year."})
                if valid_to_year == valid_from_year and valid_to_month and valid_from_month:
                    if valid_to_month < valid_from_month:
                        raise serializers.ValidationError({"valid_to_month": "Valid to month cannot be before valid from month."})
        else:
            # If it doesn't expire, ignore valid_to fields
            data['valid_to_month'] = None
            data['valid_to_year'] = None

        return data
