"""
Members models for Accommodation Portal.
Extended member information and profiles beyond the core User model.
"""

from django.db import models
from django.conf import settings


class MemberProfile(models.Model):
    """
    Extended profile information for members.
    Stores additional details not in the core User model.
    """
    
    class GenderChoices(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        help_text="User this profile belongs to"
    )
    
    # Additional personal information (matching frontend form)
    gender = models.CharField(
        max_length=10,
        choices=GenderChoices.choices,
        blank=True,
        help_text="Member's gender"
    )
    
    country_code = models.CharField(
        max_length=10,
        default='+234',
        help_text="Phone number country code"
    )
    
    town_city = models.CharField(
        max_length=100,
        blank=True,
        help_text="Town or city of residence"
    )
    
    country = models.CharField(
        max_length=100,
        blank=True,
        help_text="Country of residence"
    )
    
    # Next of kin information (from frontend booking form)
    next_of_kin_name = models.CharField(
        max_length=150,
        blank=True,
        help_text="Next of kin full name"
    )
    
    next_of_kin_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Next of kin phone number"
    )
    
    next_of_kin_country_code = models.CharField(
        max_length=10,
        default='+234',
        help_text="Next of kin phone country code"
    )
    
    next_of_kin_town_city = models.CharField(
        max_length=100,
        blank=True,
        help_text="Next of kin town or city"
    )
    
    next_of_kin_country = models.CharField(
        max_length=100,
        blank=True,
        help_text="Next of kin country"
    )
    
    # Additional member details
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text="Member's date of birth"
    )
    
    emergency_contact = models.CharField(
        max_length=20,
        blank=True,
        help_text="Emergency contact phone number"
    )
    
    medical_conditions = models.TextField(
        blank=True,
        help_text="Any medical conditions or allergies"
    )
    
    dietary_requirements = models.TextField(
        blank=True,
        help_text="Dietary requirements or restrictions"
    )
    
    remarks = models.TextField(
        blank=True,
        help_text="Additional remarks or notes"
    )
    
    # Membership information
    membership_number = models.CharField(
        max_length=50,
        blank=True,
        unique=True,
        help_text="Unique membership number"
    )
    
    date_joined_church = models.DateField(
        null=True,
        blank=True,
        help_text="Date when member joined the church"
    )
    
    is_baptized = models.BooleanField(
        default=False,
        help_text="Whether the member is baptized"
    )
    
    baptism_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date of baptism"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'member_profiles'
        verbose_name = 'Member Profile'
        verbose_name_plural = 'Member Profiles'
    
    def __str__(self):
        return f"Profile for {self.user.full_name}"
    
    @property
    def full_phone_number(self):
        """Return full phone number with country code."""
        if self.user.phone_number:
            return f"{self.country_code}{self.user.phone_number}"
        return ""
    
    @property
    def next_of_kin_full_phone(self):
        """Return next of kin full phone number with country code."""
        if self.next_of_kin_phone:
            return f"{self.next_of_kin_country_code}{self.next_of_kin_phone}"
        return ""
    
    @property
    def age(self):
        """Calculate age from date of birth."""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None


class MemberServiceHistory(models.Model):
    """
    Track member's service history across different service units.
    """
    
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_history',
        help_text="Member whose service history this is"
    )
    
    service_unit = models.ForeignKey(
        'service_units.ServiceUnit',
        on_delete=models.CASCADE,
        related_name='member_history',
        help_text="Service unit the member served in"
    )
    
    position = models.CharField(
        max_length=100,
        blank=True,
        help_text="Position or role in the service unit"
    )
    
    start_date = models.DateField(
        help_text="When the member started serving in this unit"
    )
    
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="When the member stopped serving in this unit (null if still active)"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this service assignment is currently active"
    )
    
    notes = models.TextField(
        blank=True,
        help_text="Notes about the member's service in this unit"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'member_service_history'
        verbose_name = 'Member Service History'
        verbose_name_plural = 'Member Service Histories'
        ordering = ['-start_date']
    
    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.member.full_name} - {self.service_unit.name} ({status})"
