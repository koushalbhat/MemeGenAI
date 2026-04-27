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

def log_meme_history(user_prompt: str, ai_payload: dict, image_url: str, template_name: str, user_id: str, access_token: str = None) -> str:
    """Saves a successfully generated meme to the meme_history table and returns the ID."""
    response = _make_supabase_request(
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
    if response and len(response) > 0:
         return response[0].get("id", "")
    return ""

def update_meme_history(history_id: str, new_image_url: str, new_payload: dict, access_token: str = None) -> bool:
    """Updates an existing meme history record with a new edited image."""
    response = _make_supabase_request(
        endpoint=f"meme_history?id=eq.{history_id}",
        method="PATCH",
        data={
            "image_url": new_image_url,
            "ai_caption": new_payload
        },
        access_token=access_token
    )
    return response is not None

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

def upload_template_asset(image_bytes: bytes, filename: str) -> str:
    """Uploads literal image bytes to the template-assets bucket and returns the public URL."""
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("[Warning] Supabase credentials missing. Cannot upload to cloud storage.")
        return ""
        
    import urllib.parse
    encoded_filename = urllib.parse.quote(filename)
    endpoint = f"{url}/storage/v1/object/template-assets/{encoded_filename}"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "image/jpeg"
    }
    
    req = urllib.request.Request(endpoint, data=image_bytes, headers=headers, method="POST")
    try:
        urllib.request.urlopen(req)
        public_url = f"{url}/storage/v1/object/public/template-assets/{encoded_filename}"
        return public_url
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        # Only safely skip if it explicitly says Duplicate
        if "Duplicate" in error_body or "already exists" in error_body:
             return f"{url}/storage/v1/object/public/template-assets/{encoded_filename}"
        print(f"[Supabase Storage Error] HTTP Error {e.code}: {error_body}")
        return ""
    except urllib.error.URLError as e:
        print(f"[Supabase Storage Error] URL Error: {e.reason}")
        return ""

def get_all_templates() -> dict:
    """Fetches all template metadata from Supabase database natively."""
    try:
        response = _make_supabase_request("templates?select=name,metadata", "GET")
        if response is None:
             return {}
        
        # Translate to our expected templates.json structure via memory dictionary
        templates_db = {}
        for row in response:
            name = row.get("name")
            metadata = row.get("metadata", {})
            if name:
                 templates_db[name] = metadata
        return templates_db
    except Exception as e:
        print(f"[Supabase Database Error] Failed to get templates: {e}")
        return {}
