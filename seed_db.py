import os
import json
import urllib.request
import urllib.error
import warnings
warnings.filterwarnings("ignore", module="google.generativeai")
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

url = os.environ.get("SUPABASE_URL", "").rstrip("/")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in .env. Please configure them.")

def get_embedding(text: str) -> list[float]:
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def seed_database():
    print("Loading templates.json...")
    with open("templates.json", "r") as f:
        templates_db = json.load(f)
        
    for name, data in templates_db.items():
        description = data.get("description", name)
        embedding = get_embedding(description)
        metadata = {k: v for k, v in data.items() if k != "description"}
        
        record = {
            "name": name,
            "description": description,
            "embedding": embedding,
            "metadata": metadata
        }
        
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation"
        }
        
        try:
            req = urllib.request.Request(f"{url}/rest/v1/templates", data=json.dumps(record).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req) as response:
                print(f"Success: {name}")
        except urllib.error.URLError as e:
             if hasattr(e, 'read'):
                  print(f"Failed for {name}: {e.read().decode('utf-8')}")
             else:
                  print(f"Failed for {name}: {e}")

if __name__ == "__main__":
    seed_database()
