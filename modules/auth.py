import os
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Verifies the Supabase JWT token and extracts the user ID."""
    token = credentials.credentials
    secret = os.environ.get("SUPABASE_JWT_SECRET")
    
    if not secret:
        raise HTTPException(status_code=500, detail="SUPABASE_JWT_SECRET environment variable is missing")
        
    try:
        # Supabase uses HS256 for signing its JWTs natively.
        # "aud" claim is usually "authenticated" for logged in users
        payload = jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid auth payload, missing sub")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
