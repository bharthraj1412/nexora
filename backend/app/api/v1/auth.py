"""
Authentication API endpoints.
Handles registration, login, OAuth, OTP verification, and session management.
"""
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    OTPRequest,
    OTPVerify,
    OTPVerifyWithPassword,
    TokenResponse,
    RefreshTokenRequest,
    MessageResponse
)
from app.models.user import User
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_otp,
    verify_otp_code,
    create_user_session,
    refresh_access_token,
    logout_user
)
from app.services.oauth_service import GoogleOAuthService
from app.services.email_service import send_welcome_email


router = APIRouter(prefix="/auth", tags=["Authentication"])


# ==================== Registration ====================

@router.post("/register/request-otp", response_model=MessageResponse)
async def request_registration_otp(
    request: OTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request OTP for registration.
    Step 1: User provides email, receives OTP code.
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create and send OTP
    await create_otp(db, request.email, "registration")
    
    return MessageResponse(
        message="OTP sent successfully",
        detail=f"Please check your email at {request.email}"
    )


@router.post("/register/verify", response_model=TokenResponse)
async def register_with_otp(
    request: OTPVerifyWithPassword,
    response: Response,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Complete registration with OTP verification.
    Step 2: User provides OTP, password, and name to complete registration.
    """
    # Verify OTP
    await verify_otp_code(db, request.email, request.code, "registration")
    
    # Register user
    user = await register_user(
        db,
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    
    # Mark email as verified
    user.email_verified = True
    await db.commit()
    
    # Send welcome email
    await send_welcome_email(user.email, user.full_name)
    
    # Create session
    device_info = req.headers.get("user-agent")
    ip_address = req.client.host if req.client else None
    access_token, refresh_token = await create_user_session(
        db, user, device_info, ip_address
    )
    
    # Set refresh token in HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


# ==================== Login ====================

@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    response: Response,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password.
    """
    # Authenticate user
    user = await authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first."
        )
    
    # Create session
    device_info = req.headers.get("user-agent")
    ip_address = req.client.host if req.client else None
    access_token, refresh_token = await create_user_session(
        db, user, device_info, ip_address
    )
    
    # Set refresh token in cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


# ==================== OTP Login ====================

@router.post("/login/request-otp", response_model=MessageResponse)
async def request_login_otp(
    request: OTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request OTP for passwordless login.
    """
    # Check if user exists and email is verified
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email"
        )
    
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )
    
    # Create and send OTP
    await create_otp(db, request.email, "login")
    
    return MessageResponse(
        message="OTP sent successfully",
        detail=f"Please check your email at {request.email}"
    )


@router.post("/login/verify-otp", response_model=TokenResponse)
async def login_with_otp(
    request: OTPVerify,
    response: Response,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with OTP verification.
    """
    # Verify OTP
    await verify_otp_code(db, request.email, request.code, "login")
    
    # Get user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create session
    device_info = req.headers.get("user-agent")
    ip_address = req.client.host if req.client else None
    access_token, refresh_token = await create_user_session(
        db, user, device_info, ip_address
    )
    
    # Set refresh token in cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )


# ==================== Google OAuth ====================

@router.get("/oauth/google")
async def google_login():
    """
    Initiate Google OAuth flow.
    Redirects user to Google consent screen.
    """
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Get authorization URL
    auth_url = GoogleOAuthService.get_authorization_url(state)
    
    return {
        "authorization_url": auth_url,
        "state": state
    }


@router.get("/oauth/google/callback")
async def google_callback(
    code: str,
    state: str,
    response: Response,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Google OAuth callback.
    Exchanges code for tokens and creates/logs in user.
    """
    # Exchange code for tokens
    token_data = await GoogleOAuthService.exchange_code_for_token(code)
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    
    # Get user info
    user_info = await GoogleOAuthService.get_user_info(access_token)
    
    # Get or create user
    user = await GoogleOAuthService.get_or_create_user(
        db, user_info, access_token, refresh_token
    )
    
    # Create session
    device_info = req.headers.get("user-agent")
    ip_address = req.client.host if req.client else None
    app_access_token, app_refresh_token = await create_user_session(
        db, user, device_info, ip_address
    )
    
    # Set refresh token in cookie
    response.set_cookie(
        key="refresh_token",
        value=app_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    # In production, redirect to frontend with token
    # For now, return JSON
    return TokenResponse(
        access_token=app_access_token,
        refresh_token=app_refresh_token,
        user=UserResponse.from_orm(user)
    )


# ==================== Token Management ====================

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    # Refresh tokens
    access_token, new_refresh_token = await refresh_access_token(
        db, request.refresh_token
    )
    
    # Update refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    # Get user from session
    from app.core.security import hash_token
    from app.models.session import Session
    token_hash = hash_token(new_refresh_token)
    result = await db.execute(select(Session).where(Session.refresh_token_hash == token_hash))
    session = result.scalar_one_or_none()
    
    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: RefreshTokenRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user by invalidating refresh token.
    """
    await logout_user(db, request.refresh_token)
    
    # Clear cookie
    response.delete_cookie(key="refresh_token")
    
    return MessageResponse(message="Logged out successfully")


# ==================== User Info ====================

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    """
    return UserResponse.from_orm(current_user)
