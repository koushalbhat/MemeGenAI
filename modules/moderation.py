import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')

def moderate_input(user_idea: str) -> bool:
    """
    Evaluates the user's idea for safety.
    Raises ValueError to halt the pipeline if the content is flagged.
    """
    prompt = f"""
You are a strict content moderation system for a meme generator. 
Evaluate the following user input.
You MUST block any content related to:
- Racism or racial themes
- Hate speech, harassment, or bullying
- Violence, harm, or illegal acts
- Explicit or NSFW content
- Sensitive political or tragic events

User Input: "{user_idea}"

Return ONLY a JSON response matching this schema:
{{
  "is_safe": true or false,
  "reason": "Brief explanation if false, otherwise empty string"
}}
"""
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        raw_text = response.text.strip()
        
        # Cleanup in case the model returns markdown JSON blocks
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        data = json.loads(raw_text.strip())
        
        if not data.get("is_safe", True):
            raise ValueError(f"Content Policy Violation: {data.get('reason', 'Unethical or sensitive topic.')}")
        
        return True
    except ValueError as ve:
        raise ve
    except Exception as e:
        print(f"Moderation API Error: {e}")
        # Defaulting to failing open if the moderation API is down, or you could fail closed.
        return True
