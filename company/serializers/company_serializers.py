from rest_framework import serializers
from company.models import Company

class CompanySerializers(serializers.ModelSerializer):
    MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024
    ALLOWED_LOGO_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg"}
    ALLOWED_LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg"}

    logo_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    employees_count = serializers.SerializerMethodField()
    companySize = serializers.CharField(
        source='company_size',
        required=False,
        allow_null=True,
        allow_blank=True,
        write_only=True
    )
    foundedYear = serializers.IntegerField(
        source='founded_year',
        required=False,
        allow_null=True,
        write_only=True
    )
    about = serializers.CharField(
        source='description',
        required=False,
        allow_null=True,
        allow_blank=True,
        write_only=True
    )
    location = serializers.CharField(
        source='address',
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    image = serializers.ImageField(source='logo', required=False, write_only=True)
    imago = serializers.ImageField(source='logo', required=False, write_only=True)
    socialLinks = serializers.JSONField(required=False, write_only=True)
    social_links = serializers.JSONField(required=False, write_only=True)
    techStack = serializers.JSONField(source='tech_stack', required=False, write_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'email', 'phone', 'website',
            'address', 'city', 'country', 'logo', 'logo_url', 'banner', 'banner_url',
            'industry', 'company_size', 'founded_year', 'employees_count',
            'is_verified', 'is_active', 'created_at',
            'companySize', 'foundedYear', 'about', 'location',
            'image', 'imago', 'socialLinks', 'social_links',
            'stage', 'tagline', 'brand_color', 'linkedin_url',
            'twitter_url', 'github_url', 'tech_stack', 'benefits',
            'techStack', 'logo_crop_data', 'banner_crop_data'
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def get_banner_url(self, obj):
        if obj.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.banner.url)
            return obj.banner.url
        return None

    def get_employees_count(self, obj):
        return obj.users.count()

    def _validate_logo_file(self, value):
        if value is None:
            return None
        if value.size > self.MAX_LOGO_SIZE_BYTES:
            raise serializers.ValidationError("File must be 2MB or smaller.")

        content_type = getattr(value, 'content_type', None)
        if content_type and content_type.lower() not in self.ALLOWED_LOGO_MIME_TYPES:
            raise serializers.ValidationError("File must be a PNG or JPG image.")

        name = getattr(value, 'name', '') or ''
        extension = name.lower().rpartition('.')[-1]
        if extension and f".{extension}" not in self.ALLOWED_LOGO_EXTENSIONS:
            raise serializers.ValidationError("File must be a PNG or JPG image.")

        return value

    def validate_logo(self, value):
        return self._validate_logo_file(value)

    def validate_image(self, value):
        return self._validate_logo_file(value)

    def validate_imago(self, value):
        return self._validate_logo_file(value)

    def validate_banner(self, value):
        return self._validate_logo_file(value)

    def _normalize_location(self, validated_data):
        # Treat location/city/address input as a single HQ address and derive city/country
        if 'city' in validated_data and not validated_data.get('address'):
            validated_data['address'] = validated_data['city']

        address_value = validated_data.get('address')
        if address_value:
            parts = [part.strip() for part in address_value.split(',') if part.strip()]
            if len(parts) >= 3:
                validated_data['city'] = parts[0]
                validated_data['country'] = parts[-1]
            elif len(parts) == 2:
                validated_data['city'] = parts[0]
                validated_data['country'] = parts[1]
            elif len(parts) == 1:
                validated_data['city'] = parts[0]
                validated_data['country'] = ''
        return validated_data

    def _process_social_links(self, validated_data, social_links):
        if social_links:
            if 'linkedin' in social_links:
                validated_data['linkedin_url'] = social_links['linkedin']
            if 'twitter' in social_links:
                validated_data['twitter_url'] = social_links['twitter']
            if 'github' in social_links:
                validated_data['github_url'] = social_links['github']

    def create(self, validated_data):
        social_links = validated_data.pop('socialLinks', None) or validated_data.pop('social_links', None)
        self._process_social_links(validated_data, social_links)
        self._normalize_location(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        social_links = validated_data.pop('socialLinks', None) or validated_data.pop('social_links', None)
        self._process_social_links(validated_data, social_links)
        self._normalize_location(validated_data)
        return super().update(instance, validated_data)
