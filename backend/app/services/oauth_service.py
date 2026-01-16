"""
Google OAuth service for third-party authentication.
"""
import logging
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
import httpx

from app.models.user import User
from app.models.oauth_account import OAuthAccount
from app.core.config import settings
from app.services.email_service import send_welcome_email


logger = logging.getLogger(__name__)


class GoogleOAuthService:
    """Google OAuth 2.0 authentication service."""
    
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    @staticmethod
    def get_authorization_url(state: str) -> str:
        """
        Get Google OAuth authorization URL.
        
        Args:
            state: Random state for CSRF protection
            
        Returns:
            Authorization URL
        """
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{GoogleOAuthService.GOOGLE_AUTH_URL}?{query_string}"
    
    @staticmethod
    async def exchange_code_for_token(code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from Google
            
        Returns:
            Token response with access_token, refresh_token, etc.
            
        Raises:
            HTTPException: If token exchange fails
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    GoogleOAuthService.GOOGLE_TOKEN_URL,
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": settings.GOOGLE_REDIRECT_URI
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                if response.status_code != 200:
                    logger.error(f"Google token exchange failed: {response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to exchange code for token"
                    )
                
                return response.json()
                
            except httpx.RequestError as e:
                logger.error(f"Google token exchange request error: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to connect to Google OAuth"
                )
    
    @staticmethod
    async def get_user_info(access_token: str) -> Dict[str, Any]:
        """
        Get user information from Google.
        
        Args:
            access_token: Google access token
            
        Returns:
            User information (email, name, etc.)
            
        Raises:
            HTTPException: If request fails
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    GoogleOAuthService.GOOGLE_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code != 200:
                    logger.error(f"Google userinfo request failed: {response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to get user info from Google"
                    )
                
                return response.json()
                
            except httpx.RequestError as e:
                logger.error(f"Google userinfo request error: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to connect to Google"
                )
    
    @staticmethod
    async def get_or_create_user(
        db: AsyncSession,
        google_user_info: Dict[str, Any],
        access_token: str,
        refresh_token: Optional[str] = None
    ) -> User:
        """
        Get existing user or create new user from Google OAuth.
        
        Args:
            db: Database session
            google_user_info: User info from Google
            access_token: Google access token
            refresh_token: Google refresh token (optional)
            
        Returns:
            User object
        """
        email = google_user_info.get("email")
        google_id = google_user_info.get("id")
        name = google_user_info.get("name", email.split("@")[0])
        
        if not email or not google_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user info from Google"
            )
        
        # Check if OAuth account exists
        result = await db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == "google",
                OAuthAccount.provider_user_id == google_id
            )
        )
        oauth_account = result.scalar_one_or_none()
        
        if oauth_account:
            # Update tokens
            oauth_account.access_token = access_token
            oauth_account.refresh_token = refresh_token
            await db.commit()
            
            # Get user
            result = await db.execute(
                select(User).where(User.id == oauth_account.user_id)
            )
            user = result.scalar_one_or_none()
            
            if user:
                user.last_login = datetime.utcnow()
                await db.commit()
                return user
        
        # Check if user exists by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        is_new_user = False
        
        if not user:
            # Create new user
            user = User(
                email=email,
                full_name=name,
                email_verified=True,  # Google has verified the email
                password_hash=None  # OAuth-only user
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            is_new_user = True
            logger.info(f"New user created via Google OAuth: {email}")
        
        # Create or update OAuth account
        if not oauth_account:
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider="google",
                provider_user_id=google_id,
                access_token=access_token,
                refresh_token=refresh_token
            )
            db.add(oauth_account)
            await db.commit()
        
        # Send welcome email for new users
        if is_new_user:
            await send_welcome_email(email, name)
        
        return user


# Add missing import
from datetime import datetime
