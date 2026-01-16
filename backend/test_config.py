"""
Quick test to verify NEXORA backend configuration
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("=" * 50)
    print("NEXORA Backend Configuration Test")
    print("=" * 50)
    print()
    
    # Test 1: Import settings
    print("✓ Testing configuration import...")
    from app.core.config import settings
    print(f"  → App Name: {settings.APP_NAME}")
    print(f"  → Version: {settings.APP_VERSION}")
    print(f"  → Database URL: {settings.DATABASE_URL[:30]}...")
    print()
    
    # Test 2: Check required fields
    print("✓ Checking required environment variables...")
    required_fields = [
        'DATABASE_URL', 'SECRET_KEY', 'CSRF_SECRET_KEY',
        'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI',
        'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM',
        'FRONTEND_URL'
    ]
    
    missing = []
    for field in required_fields:
        value = getattr(settings, field, None)
        if value:
            print(f"  ✓ {field}: OK")
        else:
            print(f"  ✗ {field}: MISSING")
            missing.append(field)
    
    print()
    
    if missing:
        print(f"❌ Missing {len(missing)} required field(s):")
        for field in missing:
            print(f"   - {field}")
        sys.exit(1)
    else:
        print("✅ All environment variables configured correctly!")
        print()
        print("=" * 50)
        print("Backend is ready to start!")
        print("Run: uvicorn app.main:app --reload")
        print("=" * 50)
        sys.exit(0)
        
except Exception as error:
    print(f"❌ Error: {error}")
    print()
    print("This usually means:")
    print("  1. Virtual environment is not activated")
    print("  2. Dependencies are not installed")
    print("  3. .env file is missing or misconfigured")
    print()
    print("Solution:")
    print("  1. Activate venv: .\\venv\\Scripts\\Activate.ps1")
    print("  2. Install deps: pip install -r requirements.txt")
    print("  3. Check .env file exists in backend/ folder")
    sys.exit(1)
