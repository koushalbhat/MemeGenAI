import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

try:
    print("Available Models for Generation:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
             print(f" - {m.name}")
except Exception as e:
    print(f"Error fetching models: {e}")
