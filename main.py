from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional, List
import json
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
from pydantic import BaseModel
from modules.caption_generation import generate_meme_caption
from modules.meme_assembly import assemble_meme
from modules.moderation import moderate_input
from modules.template_retrieval import get_best_template
from modules.database import log_meme_history, upload_to_storage
from fastapi import Depends
from modules.auth import get_current_user

app = FastAPI(title="AI-Driven Meme Generation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount directory for static UI (index.html backup frontend)
import os
os.makedirs("static", exist_ok=True)

try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except Exception:
    pass # folder might be missing briefly

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

@app.get("/api/templates")
def get_templates():
    try:
        with open("templates.json", "r") as f:
            templates_db = json.load(f)
        return {"status": "success", "templates": list(templates_db.keys())}
    except Exception as e:
        return {"status": "error", "templates": []}

@app.get("/api/history")
def get_history(user_id: str = Depends(get_current_user)):
    from modules.database import _make_supabase_request
    try:
        response = _make_supabase_request(f"meme_history?select=*&order=timestamp.desc&user_id=eq.{user_id}&limit=50", "GET")
        if response is not None:
             return {"history": response}
    except Exception as e:
        print(f"[Supabase DB Error] {e}")
    return {"history": []}

class GenerateRequest(BaseModel):
    user_idea: str
    template_name: Optional[str] = None
    refine_feedback: Optional[str] = None

@app.post("/generate")
def generate_endpoint(request: GenerateRequest, user_id: str = Depends(get_current_user)) -> dict:
    """
    Core API pipeline endpoint.
    Recieves user ideation, processes semantic routing, generates multimodal text instructions,
    assembles physical JPEGs, and commits history telemetry.
    """
    try:
        # Step 1: Content Moderation Firewall
        moderate_input(request.user_idea)
        
        # Step 2: Semantic AI Template Routing 
        target_templates = [request.template_name] if request.template_name else []
        if not target_templates:
            target_templates = get_best_template(request.user_idea)
        
        output_image_paths = []
        payloads = []
        
        # Step 3 & 4: Deep loop across all matching templates!
        for i, tmpl in enumerate(target_templates):
             try:
                 caption_payload = generate_meme_caption(
                     user_idea=request.user_idea,
                     template_name=tmpl,
                     refine_feedback=request.refine_feedback
                 )
                 
                 # Assembly maps visual JPEGs dynamically into a memory stream array
                 elements = caption_payload.get("text_elements", [])
                 img_bytes, filename = assemble_meme(tmpl, elements, variant_index=i)
                 
                 # Push natively to Supabase Cloud Storage Bucket
                 cloud_url = upload_to_storage(img_bytes, filename)
                 
                 if cloud_url:
                     # Log public URL directly into Postgres
                     log_meme_history(
                         user_prompt=request.user_idea + (f" (Refinement: {request.refine_feedback})" if request.refine_feedback else ""),
                         ai_payload=caption_payload,
                         image_url=cloud_url,
                         template_name=tmpl,
                         user_id=user_id
                     )
                     
                     output_image_paths.append(cloud_url)
                     payloads.append(caption_payload)
                 else:
                     print(f"Skipped {tmpl} due to cloud storage upload fault.")
             except Exception as load_err:
                 print(f"Skipped template {tmpl} due to error: {load_err}")
        
        return {
            "status": "success",
            "output_image_paths": output_image_paths,
            "ai_payload": payloads
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
