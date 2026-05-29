"""
Company Service - Company management business logic.
"""

from company.models.company_model import Company


class CompanyService:

    @staticmethod
    def get_user_company(user) -> Company | None:
        """Return the user's company, None if not found."""
        return user.companies.first()

    @staticmethod
    def update_company(company: Company, validated_data: dict) -> Company:
        for attr, value in validated_data.items():
            setattr(company, attr, value)
        company.save()
        return company

    @staticmethod
    def calculate_profile_completion(company: Company) -> int:
        """Calculate profile completion percentage."""
        fields = [
            company.name,
            company.phone,
            company.industry,
            company.company_size,
            company.founded_year,
            company.website,
            company.address,
            company.logo,
        ]
        filled = sum(1 for f in fields if f)
        return int((filled / len(fields)) * 100)
