import os
import json
import warnings
warnings.filterwarnings("ignore", module="google.generativeai")
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
from dotenv import load_dotenv
from modules.database import _make_supabase_request

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def get_embedding(text: str) -> list[float]:
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def get_best_template(user_idea: str) -> list[str]:
    user_vector = get_embedding(user_idea)
    
    # RPC call via REST
    matches = _make_supabase_request(
        endpoint="rpc/match_templates",
        method="POST",
        data={
            "query_embedding": user_vector,
            "match_threshold": 0.55,
            "match_count": 3
        }
    )
    
    if not matches:
         print("[Semantic Routing] Response missing or below threshold. Falling back to default.")
         return ["Monkey_Puppet"]
         
    top_templates = []
    for match in matches:
         print(f"[Semantic Routing] Vector mapped to '{match.get('name')}' with confidence {match.get('similarity', 0):.3f}")
         top_templates.append(match.get('name'))
         
    return list(dict.fromkeys(top_templates))
