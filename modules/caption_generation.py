import os
import json
import warnings
warnings.filterwarnings("ignore", module="google.generativeai")
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# Ensure the Gemini API key is set
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Define tiered model failovers
primary_model = genai.GenerativeModel('gemini-2.5-flash')
fallback_model = genai.GenerativeModel('models/gemma-3-4b-it')

def select_best_template(user_idea: str, available_templates: list) -> str:
    """
    If the user doesn't specify a template, this asks Gemini to pick the best fit.
    """
    prompt = f"""
You are the template selection core for a Meme Generator.
The user submitted this idea: "{user_idea}"

Here are the available templates in our database: {available_templates}

Choose exactly one template from the list that best fits the premise.
Return ONLY a JSON response containing the exact string of your chosen template.
{{
  "selected": "template_name_here"
}}
"""
    # Updated prompt instructions to forbid markdown wrapping just in case of fallback
    prompt += "\nIMPORTANT: Do not wrap your response in ```json markdown tags. Return EXACTLY raw JSON and nothing else."
    
    try:
        response = primary_model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
    except Exception as e:
        print(f"[Warn] Primary Model Route Failed on Text Routing ({e}). Failing over to Gemma...")
        response = fallback_model.generate_content(prompt)
    
    try:
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
             raw_text = raw_text[7:]
        if raw_text.startswith("```"):
             raw_text = raw_text[3:]
        if raw_text.endswith("```"):
             raw_text = raw_text[:-3]
             
        data = json.loads(raw_text.strip())
        return data.get("selected", available_templates[0])
    except Exception:
        return available_templates[0] # Default fallback

def generate_meme_caption(user_idea: str, template_name: str, refine_feedback: str = None) -> dict:
    """
    Calls the Gemini API to generate meme text elements and physical layout for a specific template.
    """
    # Look up the image path safely
    try:
        with open("templates.json", "r") as f:
            templates_db = json.load(f)
    except Exception as e:
        raise RuntimeError(f"Could not load templates.json: {e}")
        
    template_info = templates_db.get(template_name)
    if not template_info:
        raise ValueError(f"Template '{template_name}' not found in database.")
        
    filename = template_info["filename"]
    template_path = os.path.join("templates", filename)
    
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template image {template_path} not found.")
        
    # Open image to pass to Gemini
    img = Image.open(template_path)
    width, height = img.size

    prompt = f"""
You are the core Caption Generation and Reasoning Module for an AI-Driven Multimodal Meme System.
Your goal is to visually analyze the provided meme template image, transform the user's "Situation/Idea" into a structured, humorous format, and tell us exactly where to draw the text.

The provided image has a size of {width}x{height} pixels.

Task:
1. Examine the image layout. Find the blank areas (like white boxes or standard text zones) meant for text.
2. Formulate punchy, dry, context-aware internet humor matching the user's situation.
3. For each text part, specify the absolute pixel bounding box [x1, y1, x2, y2] where that text should be drawn.

User Input Idea: "{user_idea}"
Selected Template: "{template_name}"
"""
    if refine_feedback:
        prompt += f"\nCRITICAL USER FEEDBACK: The user requested the following refinement to your previous attempt: \"{refine_feedback}\". Please adapt the humor and text to incorporate this feedback strictly.\n"

    prompt += f"""
Return the response in a clean JSON format matching this schema:
{{
  "selected_template": "{template_name}",
  "reasoning": "Briefly explain why this template matches the humor style.",
  "text_elements": [
    {{
      "text": "TEXT_HERE",
      "box_coordinates": {{"x1": 0, "y1": 0, "x2": 100, "y2": 100}}
    }}
  ]
}}

Ensure box_coordinates represent the [left, top, right, bottom] bounds of the blank drawing regions. Keep the text concise and funny.
"""
    
    # Pre-bundle Gemma safety strings
    gemma_prompt = prompt + "\nIMPORTANT: Do not wrap your response in ```json markdown formatting tags. Return precisely standard JSON only!"
    
    try:
        # STEP 1: Attempt the proprietary 2.5-flash node natively (Extremely strict and mathematically perfect spatial awareness)
        response = primary_model.generate_content(
            [prompt, img],
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e) or "quota" in str(e).lower():
            print(f"[Failover Routing] Primary 2.5-Flash Model Quota Exceeded! Seamlessly cascading visual payload via Gemma 3 4B...")
            # STEP 2: Gracefully failover to Gemma open source architecture
            response = fallback_model.generate_content([gemma_prompt, img])
        else:
            raise e
            
    try:
        raw_text = response.text.strip()
        # Fallback strip logic in case Gemma ignores instructions
        if raw_text.startswith("```json"):
             raw_text = raw_text[7:]
        if raw_text.startswith("```"):
             raw_text = raw_text[3:]
        if raw_text.endswith("```"):
             raw_text = raw_text[:-3]
             
        return json.loads(raw_text.strip())
    except Exception as e:
        raise ValueError(f"Failed to parse AI payload. Error: {e}\nRaw Model String: {response.text}")
