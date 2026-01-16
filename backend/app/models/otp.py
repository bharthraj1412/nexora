"""
OTP model for email verification codes.
"""
import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, Integer, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.core.config import settings


class OTP(Base):
    """One-Time Password for email verification."""
    
    __tablename__ = "otps"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Email and code
    email = Column(String, nullable=False, index=True)
    code_hash = Column(String, nullable=False)  # Hashed OTP code
    
    # Purpose
    purpose = Column(String, nullable=False)  # 'registration', 'login', 'reset'
    
    # Security
    attempts = Column(Integer, default=0, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    
    # Expiration
    expires_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    )
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def is_expired(self) -> bool:
        """Check if OTP is expired."""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self) -> bool:
        """Check if OTP is still valid (not expired, not used, attempts not exceeded)."""
        return (
            not self.is_expired() and
            not self.used and
            self.attempts < settings.OTP_MAX_ATTEMPTS
        )
    
    def __repr__(self) -> str:
        return f"<OTP {self.email} {self.purpose}>"
