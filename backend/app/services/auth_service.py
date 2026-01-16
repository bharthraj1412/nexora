"""
Authentication service for user registration, login, and OTP management.
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status

from app.models.user import User
from app.models.session import Session
from app.models.otp import OTP
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
    generate_otp,
    hash_otp,
    verify_otp,
    validate_password_strength
)
from app.core.config import settings
from app.services.email_service import send_otp_email, send_welcome_email


logger = logging.getLogger(__name__)


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str
) -> User:
    """
    Register a new user.
   
    Args:
        db: Database session
        email: User email
        password: User password
        full_name: User's full name
        
    Returns:
        Created user
        
    Raises:
        HTTPException: If email already exists or password is invalid
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password strength
    is_valid, error_msg = validate_password_strength(password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        email_verified=False
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"User registered: {email}")
    return user


async def create_otp(
    db: AsyncSession,
    email: str,
    purpose: str
) -> str:
    """
    Create and send an OTP code.
    
    Args:
        db: Database session
        email: Email address
        purpose: OTP purpose (registration, login, reset)
        
    Returns:
        OTP code (for testing; don't return in production)
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    # Check rate limiting
    recent_time = datetime.utcnow() - timedelta(hours=1)
    result = await db.execute(
        select(OTP).where(
            and_(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.created_at >= recent_time
            )
        )
    )
    recent_otps = result.scalars().all()
    
    if len(recent_otps) >= settings.OTP_RATE_LIMIT_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many OTP requests. Please try again in 1 hour."
        )
    
    # Invalidate previous OTPs for this email/purpose
    await db.execute(
        select(OTP).where(
            and_(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.used == False
            )
        )
    )
    previous_otps = (await db.execute(
        select(OTP).where(
            and_(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.used == False
            )
        )
    )).scalars().all()
    
    for old_otp in previous_otps:
        old_otp.used = True
    
    # Generate new OTP
    otp_code = generate_otp()
    otp = OTP(
        email=email,
        code_hash=hash_otp(otp_code),
        purpose=purpose
    )
    
    db.add(otp)
    await db.commit()
    
    # Send email
    await send_otp_email(email, otp_code, purpose)
    
    logger.info(f"OTP created for {email} ({purpose})")
    return otp_code  # Return for testing; remove in production


async def verify_otp_code(
    db: AsyncSession,
    email: str,
    code: str,
    purpose: str
) -> bool:
    """
    Verify an OTP code.
    
    Args:
        db: Database session
        email: Email address
        code: OTP code to verify
        purpose: Expected OTP purpose
        
    Returns:
        True if valid, False otherwise
        
    Raises:
        HTTPException: If OTP is invalid or expired
    """
    # Get latest valid OTP
    result = await db.execute(
        select(OTP).where(
            and_(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.used == False
            )
        ).order_by(OTP.created_at.desc())
    )
    otp = result.scalar_one_or_none()
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid OTP found. Please request a new code."
        )
    
    # Check expiration
    if otp.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new code."
        )
    
    # Check attempts
    if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts. Please request a new code."
        )
    
    # Increment attempts
    otp.attempts += 1
    
    # Verify code
    if not verify_otp(code, otp.code_hash):
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP code. {settings.OTP_MAX_ATTEMPTS - otp.attempts} attempts remaining."
        )
    
    # Mark as used
    otp.used = True
    await db.commit()
    
    logger.info(f"OTP verified successfully for {email}")
    return True


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str
) -> Optional[User]:
    """
    Authenticate user with email and password.
    
    Args:
        db: Database session
        email: User email
        password: User password
        
    Returns:
        User if authenticated, None otherwise
        
    Raises:
        HTTPException: If account is locked
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    # Check if account is locked
    if user.is_locked:
        # Check if lockout period has expired
        if user.last_failed_login:
            lockout_until = user.last_failed_login + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
            if datetime.utcnow() < lockout_until:
                remaining = (lockout_until - datetime.utcnow()).seconds // 60
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Account locked. Try again in {remaining} minutes."
                )
            else:
                # Unlock account
                user.is_locked = False
                user.failed_login_attempts = 0
    
    # Verify password
    if not user.password_hash or not verify_password(password, user.password_hash):
        # Increment failed attempts
        user.failed_login_attempts += 1
        user.last_failed_login = datetime.utcnow()
        
        # Lock account if max attempts exceeded
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            user.is_locked = True
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Too many failed login attempts. Account locked for 30 minutes."
            )
        
        await db.commit()
        return None
    
    # Reset failed attempts on successful login
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return user


async def create_user_session(
    db: AsyncSession,
    user: User,
    device_info: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Tuple[str, str]:
    """
    Create access and refresh tokens for user.
    
    Args:
        db: Database session
        user: User object
        device_info: User agent string (optional)
        ip_address: Client IP address (optional)
        
    Returns:
        Tuple of (access_token, refresh_token)
    """
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Create refresh token
    refresh_token = create_refresh_token()
    
    # Store session
    session = Session(
        user_id=user.id,
        refresh_token_hash=hash_token(refresh_token),
        device_info=device_info,
        ip_address=ip_address
    )
    
    db.add(session)
    await db.commit()
    
    logger.info(f"Session created for user {user.email}")
    return access_token, refresh_token


async def refresh_access_token(
    db: AsyncSession,
    refresh_token: str
) -> Tuple[str, str]:
    """
    Refresh access token using refresh token.
    
    Args:
        db: Database session
        refresh_token: Refresh token
        
    Returns:
        Tuple of (new_access_token, new_refresh_token)
        
    Raises:
        HTTPException: If refresh token is invalid or expired
    """
    token_hash = hash_token(refresh_token)
    
    result = await db.execute(
        select(Session).where(Session.refresh_token_hash == token_hash)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    if session.is_expired():
        await db.delete(session)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please log in again."
        )
    
    # Get user
    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Delete old session
    await db.delete(session)
    
    # Create new tokens (token rotation)
    access_token, new_refresh_token = await create_user_session(
        db, user, session.device_info, session.ip_address
    )
    
    return access_token, new_refresh_token


async def logout_user(
    db: AsyncSession,
    refresh_token: str
) -> bool:
    """
    Logout user by invalidating refresh token.
    
    Args:
        db: Database session
        refresh_token: Refresh token to invalidate
        
    Returns:
        True if logged out successfully
    """
    token_hash = hash_token(refresh_token)
    
    result = await db.execute(
        select(Session).where(Session.refresh_token_hash == token_hash)
    )
    session = result.scalar_one_or_none()
    
    if session:
        await db.delete(session)
        await db.commit()
        logger.info(f"User logged out: session {session.id}")
    
    return True
