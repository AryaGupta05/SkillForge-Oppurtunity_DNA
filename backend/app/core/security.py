import datetime
from typing import Optional, Dict, Any
import bcrypt
import jwt
from backend.app.core.config import settings

def hash_password(password: str) -> str:
    """Securely hash a password using bcrypt."""
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hashed password."""
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generate a JWT access token."""
    to_encode = data.copy()
    now = datetime.datetime.now(datetime.timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=getattr(settings, 'JWT_EXPIRE_MINUTES', 1440))
    to_encode.update({"exp": expire, "iat": now})
    secret = settings.SECRET_KEY
    algorithm = getattr(settings, 'JWT_ALGORITHM', 'HS256')
    return jwt.encode(to_encode, secret, algorithm=algorithm)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        secret = settings.SECRET_KEY
        algorithm = getattr(settings, 'JWT_ALGORITHM', 'HS256')
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        return payload
    except jwt.PyJWTError:
        return None

import secrets
import hmac
import hashlib
import os

def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP."""
    num = secrets.randbelow(1_000_000)
    return f"{num:06d}"

def hash_otp(otp: str) -> str:
    """Hash an OTP using HMAC-SHA256 with server-side OTP_HASH_SECRET."""
    secret = settings.OTP_HASH_SECRET or "dev-otp-secret-change-in-prod"
    return hmac.new(secret.encode('utf-8'), otp.strip().encode('utf-8'), hashlib.sha256).hexdigest()

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """Verify plain OTP against stored HMAC-SHA256 hash using timing-safe comparison."""
    if not plain_otp or not hashed_otp:
        return False
    computed_hash = hash_otp(plain_otp)
    return hmac.compare_digest(computed_hash, hashed_otp)

