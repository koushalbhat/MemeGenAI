import urllib.request
import os
from PIL import Image, ImageDraw

def setup_assets():
    print("Setting up assets...")
    
    # Download Anton font (using a known raw github link or similar, or just google fonts api url)
    font_url = "https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf"
    # Wait, Anton is better for memes, let me use Anton:
    anton_url = "https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf"
    
    font_path = os.path.join("fonts", "impact.ttf") # We'll call it impact to fit the previous code
    
    if not os.path.exists(font_path):
        print("Downloading font...")
        try:
            urllib.request.urlretrieve(anton_url, font_path)
            print("Font downloaded.")
        except Exception as e:
            print(f"Failed to download font: {e}")
            
    # Create dummy monkey_puppet.jpg
    template_path = os.path.join("templates", "monkey_puppet.jpg")
    
    if not os.path.exists(template_path):
        print("Creating dummy template image...")
        # Create a simple colored background image
        img = Image.new("RGB", (600, 600), color=(200, 200, 200))
        # Draw some rectangles to simulate a meme
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 250, 250], fill=(150, 150, 150))
        draw.rectangle([350, 50, 550, 250], fill=(100, 100, 100))
        img.save(template_path, "JPEG")
        print("Template image created.")

if __name__ == "__main__":
    setup_assets()
    print("Done!")
