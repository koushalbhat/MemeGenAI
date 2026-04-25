import os
import json
import urllib.request
import urllib.error

def _make_supabase_request(endpoint: str, method: str, data: dict = None, access_token: str = None):
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("[Warning] Supabase credentials missing.")
        return None
        
    full_url = f"{url}/rest/v1/{endpoint}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {access_token if access_token else key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(full_url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[Supabase Database Error] HTTP Error {e.code}: {e.reason} for {endpoint}. (Did you forget to run supa_schema.sql?)")
        return None
    except urllib.error.URLError as e:
        print(f"[Supabase Database Error] URL Error: {e.reason}")
        return None

def log_meme_history(user_prompt: str, ai_payload: dict, image_url: str, template_name: str, user_id: str, access_token: str = None) -> None:
    """Saves a successfully generated meme to the meme_history table."""
    _make_supabase_request(
        endpoint="meme_history",
        method="POST",
        data={
            "user_prompt": user_prompt,
            "ai_caption": ai_payload,
            "image_url": image_url,
            "template_name": template_name,
            "user_id": user_id
        },
        access_token=access_token
    )

def upload_to_storage(image_bytes: bytes, filename: str) -> str:
    """Uploads literal image bytes to the specific memes bucket and returns the public URL."""
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("[Warning] Supabase credentials missing. Cannot upload to cloud storage.")
        return ""
        
    endpoint = f"{url}/storage/v1/object/memes/{filename}"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "image/jpeg"
    }
    
    req = urllib.request.Request(endpoint, data=image_bytes, headers=headers, method="POST")
    try:
        urllib.request.urlopen(req)
        public_url = f"{url}/storage/v1/object/public/memes/{filename}"
        return public_url
    except urllib.error.HTTPError as e:
        print(f"[Supabase Storage Error] HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return ""
    except urllib.error.URLError as e:
        print(f"[Supabase Storage Error] URL Error: {e.reason}")
        return ""
