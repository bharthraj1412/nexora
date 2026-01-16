"""
Backend environment validation script.
Checks if all required environment variables are present.
"""
import os
import sys
from pathlib import Path

# Required environment variables
REQUIRED_VARS = [
    "DATABASE_URL",
    "SECRET_KEY",
    "ALGORITHM",
    "CSRF_SECRET_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
    "FRONTEND_URL",
]

def check_env():
    """Check if .env file exists and has required variables."""
    env_file = Path(__file__).parent / ".env"
    
    print("=" * 50)
    print("Backend Environment Validation")
    print("=" * 50)
    print()
    
    # Check if .env file exists
    if not env_file.exists():
        print("[ERROR] .env file not found!")
        print(f"Expected location: {env_file}")
        print("Please copy .env.example to .env and configure it.")
        return False
    
    print(f"[OK] .env file found at {env_file}")
    print()
    
    # Load .env file manually (without python-dotenv to avoid dependency)
    env_vars = {}
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    # Check required variables
    missing_vars = []
    empty_vars = []
    
    print("Checking required environment variables:")
    for var in REQUIRED_VARS:
        if var not in env_vars:
            print(f"  [MISSING] {var}")
            missing_vars.append(var)
        elif not env_vars[var] or env_vars[var].startswith('your-') or env_vars[var].startswith('change-this'):
            print(f"  [EMPTY/PLACEHOLDER] {var}")
            empty_vars.append(var)
        else:
            # Don't print actual values for security
            print(f"  [OK] {var}")
    
    print()
    
    # Report results
    if missing_vars:
        print(f"[ERROR] Missing {len(missing_vars)} required variable(s):")
        for var in missing_vars:
            print(f"  - {var}")
        print()
    
    if empty_vars:
        print(f"[WARNING] {len(empty_vars)} variable(s) have placeholder values:")
        for var in empty_vars:
            print(f"  - {var}")
        print("Please update these with actual values.")
        print()
    
    if not missing_vars and not empty_vars:
        print("[SUCCESS] All required environment variables are configured!")
        print()
        return True
    elif not missing_vars:
        print("[WARNING] Environment has placeholder values but may work for testing.")
        print()
        return True
    else:
        print("[FAILED] Please configure missing environment variables.")
        print()
        return False

if __name__ == "__main__":
    success = check_env()
    sys.exit(0 if success else 1)
