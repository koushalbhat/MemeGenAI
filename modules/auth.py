import os
import json
import urllib.request
import urllib.error
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Verifies the Supabase JWT token by pinging the native Supabase Edge API."""
    token = credentials.credentials
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase credentials missing.")
        
    endpoint = f"{url}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": key,
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(endpoint, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as response:
            user_data = json.loads(response.read().decode("utf-8"))
            user_id = user_data.get("id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Valid token, but no user ID mapped.")
            return user_id
    except urllib.error.HTTPError:
        raise HTTPException(status_code=401, detail="Token Invalid: Cryptographic rejection by Supabase Edge.")
    except urllib.error.URLError as e:
        raise HTTPException(status_code=500, detail=f"Failed to reach Auth Node: {e.reason}")
