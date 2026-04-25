import os
import json
import textwrap
from PIL import Image, ImageDraw, ImageFont

def fit_text_in_box(draw, text, box, font_path):
    x1, y1, x2, y2 = box.get("x1", 0), box.get("y1", 0), box.get("x2", 100), box.get("y2", 100)
    
    # Optional padding
    padding = 5
    x1 += padding
    y1 += padding
    x2 -= padding
    y2 -= padding
    
    box_w = x2 - x1
    box_h = y2 - y1
    
    if box_w <= 0 or box_h <= 0:
        return
        
    # Start with a very large font
    font_size = min(box_w, box_h)
    
    wrapped_text = text
    font = ImageFont.load_default()
    
    while font_size > 6:
        try:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
            else:
                font = ImageFont.load_default()
        except:
             font = ImageFont.load_default()
             break # Cannot scale default font dynamically easily
        
        # Approximate characters per line for this font size
        chars_per_line = max(1, int((box_w * 1.5) / font_size))
        # Disable break_long_words so single long words (e.g. "TOMORROW") shrink font size instead of hyphenating
        wrapped_text = "\n".join(textwrap.wrap(text, width=chars_per_line, break_long_words=False))
        
        # Measure text block dimensions
        bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        if text_w <= box_w and text_h <= box_h:
            break
            
        font_size -= 2
        
    center_x = x1 + box_w / 2
    center_y = y1 + box_h / 2
    
    # Ensure stroke width is at least 2px so it's legible on white backgrounds
    stroke_width = max(2, int(font_size / 15))
    
    draw.multiline_text(
        (center_x, center_y), 
        wrapped_text, 
        fill="white", 
        font=font, 
        stroke_width=stroke_width, 
        stroke_fill="black",
        align="center",
        anchor="mm"
    )

from typing import Tuple

def assemble_meme(template_name: str, elements: list, variant_index: int = 0, custom_image_path: str = None) -> Tuple[bytes, str]:
    """
    Renders exactly one variant of the text elements onto the base image.
    Supports predefined templates or custom user-uploaded images via `custom_image_path`.
    """
    
    if custom_image_path and os.path.exists(custom_image_path):
        template_path = custom_image_path
        filename = os.path.basename(custom_image_path)
    else:
        try:
            with open("templates.json", "r") as f:
                templates_db = json.load(f)
        except Exception as e:
            raise RuntimeError(f"Could not load templates.json: {e}")
            
        template_info = templates_db.get(template_name)
        if not template_info:
            raise ValueError(f"Template '{template_name}' not found in database.")
            
        filename = template_info.get("filename", "")
        template_path = os.path.join("templates", filename)
        
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template image {template_path} not found.")
            
    # Open image
    img = Image.open(template_path).convert("RGB")
    width, height = img.size
    draw = ImageDraw.Draw(img)
    
    # Check font
    font_path = os.path.join("fonts", "impact.ttf")
    if not os.path.exists(font_path):
        font_path = os.path.join("fonts", "anton.ttf")
        
    # HARDCODED DYNAMIC OVERRIDES
    # The 4B parameter model is too small to predict exact visual layout coordinates mathematically.
    # We dynamically calculate bounds based on true image width/height percentage ratios.
    hardcoded_map = {
        "Two_Buttons": [
            {"x1": 0.05 * width, "y1": 0.70 * height, "x2": 0.45 * width, "y2": 0.95 * height},
            {"x1": 0.55 * width, "y1": 0.70 * height, "x2": 0.95 * width, "y2": 0.95 * height}
        ],
        "Distracted_Boyfriend": [
            {"x1": 0.70 * width, "y1": 0.40 * height, "x2": 0.95 * width, "y2": 0.65 * height}, # The new object (right)
            {"x1": 0.40 * width, "y1": 0.35 * height, "x2": 0.70 * width, "y2": 0.60 * height}, # The distracted guy (center)
            {"x1": 0.05 * width, "y1": 0.40 * height, "x2": 0.35 * width, "y2": 0.60 * height}  # The offended girlfriend (left)
        ],
        "Monkey_Puppet": [
             {"x1": 0.05 * width, "y1": 0.05 * height, "x2": 0.95 * width, "y2": 0.30 * height},
             {"x1": 0.05 * width, "y1": 0.70 * height, "x2": 0.95 * width, "y2": 0.95 * height}
        ],
        "Drake rejecting": [
             {"x1": 0.50 * width, "y1": 0.05 * height, "x2": 0.95 * width, "y2": 0.45 * height},
             {"x1": 0.50 * width, "y1": 0.55 * height, "x2": 0.95 * width, "y2": 0.95 * height}
        ]
    }
    
    # Draw logic based on AI text but Overridden bounds!
    overrides = hardcoded_map.get(template_name, [])
    
    for i, element in enumerate(elements):
        text = element.get("text", "").upper()
        
        # Use hardcoded box if it exists for this index, otherwise fallback to AI's guess
        if i < len(overrides):
             box = overrides[i]
        else:
             box = element.get("box_coordinates")
        
        if text and box:
            fit_text_in_box(draw, text, box, font_path)
            
    import uuid
    import io
    unique_id = uuid.uuid4().hex[:8]
    output_filename = f"generated_{template_name.replace(' ', '_')}_{variant_index}_{unique_id}.jpg"
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    return img_byte_arr.getvalue(), output_filename
