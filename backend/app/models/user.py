"""
User model for authentication and profile management.
"""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """User account model."""
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Authentication
    email = Column(String, unique=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for OAuth-only users
    
    # Profile
    full_name = Column(String, nullable=False)
    
    # Security
    is_active = Column(Boolean, default=True, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_failed_login = Column(DateTime, nullable=True)
    
    # Timestamps - Database-generated UTC
    created_at = Column(
        DateTime,
        server_default=text("(datetime('now'))"),
        nullable=False
    )
    updated_at = Column(
        DateTime,
        server_default=text("(datetime('now'))"),
        onupdate=text("(datetime('now'))"),
        nullable=False
    )
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
