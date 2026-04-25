import os
import jwt
from dotenv import load_dotenv

load_dotenv()
secret = os.environ.get("SUPABASE_JWT_SECRET")

# Test decoding a basic dummy token just to trace PyJWT's exact behavior
print(f"Loaded Secret: {secret}")
try:
    # Build a dummy token to see exactly how PyJWT responds to this environment
    encoded = jwt.encode({"sub": "123", "aud": "authenticated"}, secret, algorithm="HS256")
    decoded = jwt.decode(encoded, secret, algorithms=["HS256"], audience="authenticated")
    print("Self-test decode successful.")
except Exception as e:
    print(f"Self-test failed: {type(e).__name__} - {str(e)}")

