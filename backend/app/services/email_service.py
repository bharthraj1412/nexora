"""
Email service for sending OTP and notification emails.
"""
import logging
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from app.core.config import settings


logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        text_content: Plain text fallback (optional)
        
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add text version if provided
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        # Add HTML version
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_otp_email(email: str, otp_code: str, purpose: str) -> bool:
    """
    Send OTP verification email.
    
    Args:
        email: Recipient email address
        otp_code: 6-digit OTP code
        purpose: Purpose of OTP (registration, login, reset)
        
    Returns:
        True if sent successfully, False otherwise
    """
    purpose_text = {
        "registration": "complete your registration",
        "login": "log in to your account",
        "reset": "reset your password"
    }.get(purpose, "verify your email")
    
    subject = f"Your {settings.APP_NAME} Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background: #f9fafb;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
            }}
            .otp-code {{
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #4f46e5;
                text-align: center;
                padding: 20px;
                background: white;
                border-radius: 6px;
                margin: 20px 0;
            }}
            .footer {{
                font-size: 12px;
                color: #6b7280;
                text-align: center;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Verification Code</h1>
            <p>Hello,</p>
            <p>You requested to {purpose_text}. Please use the following code:</p>
            
            <div class="otp-code">{otp_code}</div>
            
            <p>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
        
        <div class="footer">
            <p>© 2026 {settings.APP_NAME}. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Your {settings.APP_NAME} Verification Code
    
    You requested to {purpose_text}.
    
    Your verification code is: {otp_code}
    
    This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
    
    If you didn't request this code, please ignore this email.
    """
    
    return await send_email(email, subject, html_content, text_content)


async def send_welcome_email(email: str, full_name: str) -> bool:
    """
    Send welcome email after successful registration.
    
    Args:
        email: User email address
        full_name: User's full name
        
    Returns:
        True if sent successfully, False otherwise
    """
    subject = f"Welcome to {settings.APP_NAME}!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background: #f9fafb;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background: #4f46e5;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to {settings.APP_NAME}, {full_name}!</h1>
            <p>Thank you for creating an account. We're excited to have you on board.</p>
            <p>You can now start creating collections, managing records, and organizing your data.</p>
            <a href="{settings.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to {settings.APP_NAME}, {full_name}!
    
    Thank you for creating an account. We're excited to have you on board.
    
    You can now start creating collections, managing records, and organizing your data.
    
    Visit {settings.FRONTEND_URL}/dashboard to get started.
    """
    
    return await send_email(email, subject, html_content, text_content)
