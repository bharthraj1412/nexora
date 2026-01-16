"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field, validator


# ==================== User Schemas ====================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)


class UserResponse(UserBase):
    """Schema for user response."""
    id: str
    email_verified: bool
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)


class PasswordChange(BaseModel):
    """Schema for password change."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


# ==================== Auth Schemas ====================

class LoginRequest(BaseModel):
    """Schema for email/password login."""
    email: EmailStr
    password: str


class OTPRequest(BaseModel):
    """Schema for requesting OTP."""
    email: EmailStr
    purpose: str = Field(..., pattern="^(registration|login|reset)$")


class OTPVerify(BaseModel):
    """Schema for verifying OTP."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


class OTPVerifyWithPassword(OTPVerify):
    """Schema for OTP verification with password during registration."""
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


# ==================== Collection Schemas ====================

class CollectionBase(BaseModel):
    """Base collection schema."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    schema: Optional[Dict[str, Any]] = None


class CollectionCreate(CollectionBase):
    """Schema for creating collection."""
    pass


class CollectionUpdate(BaseModel):
    """Schema for updating collection."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    schema: Optional[Dict[str, Any]] = None


class CollectionResponse(CollectionBase):
    """Schema for collection response."""
    id: str
    user_id: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    record_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


# ==================== Record Schemas ====================

class RecordBase(BaseModel):
    """Base record schema."""
    data: Dict[str, Any] = Field(..., min_length=1)


class RecordCreate(RecordBase):
    """Schema for creating record."""
    pass


class RecordUpdate(BaseModel):
    """Schema for updating record."""
    data: Dict[str, Any] = Field(..., min_length=1)


class RecordResponse(RecordBase):
    """Schema for record response."""
    id: str
    collection_id: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# ==================== Activity Log Schemas ====================

class ActivityLogResponse(BaseModel):
    """Schema for activity log response."""
    id: str
    user_id: str
    action: str
    entity_type: str
    entity_id: str
    changes: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# ==================== Generic Response Schemas ====================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    detail: Optional[str] = None
    field: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
