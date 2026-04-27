import os
import json
import textwrap
from PIL import Image, ImageDraw, ImageFont

def fit_text_in_box(draw, text, box, font_path, color="white", custom_stroke_width=None, font_size_override=None):
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
        
    font_size = font_size_override if font_size_override else min(box_w, box_h)
    
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
        
        if "\n" in text:
            wrapped_text = text # Respect manual line breaks added via Editor
        else:
            # Calculate chars per line using standard 0.5 font aspect ratio
            chars_per_line = max(1, int((box_w * 2.0) / font_size))
            wrapped_text = "\n".join(textwrap.wrap(text, width=chars_per_line, break_long_words=False))
        
        bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        if text_w <= box_w and text_h <= box_h:
            break
            
        font_size -= 2
        
    center_x = x1 + box_w / 2
    center_y = y1 + box_h / 2
    
    # Stroke is black if text is white, otherwise no stroke for "in-universe" look
    default_stroke = max(2, int(font_size / 15)) if color == "white" else 0
    stroke_width = custom_stroke_width if custom_stroke_width is not None else default_stroke
    stroke_fill = "black" if color == "white" else None
    
    draw.multiline_text(
        (center_x, center_y), 
        wrapped_text, 
        fill=color, 
        font=font, 
        stroke_width=stroke_width, 
        stroke_fill=stroke_fill,
        align="center",
        anchor="mm"
    )

from typing import Tuple

def assemble_meme(template_name: str, elements: list, variant_index: int = 0, custom_image_path: str = None) -> Tuple[bytes, str]:
    """
    Renders exactly one variant of the text elements onto the base image.
    Supports predefined templates or custom user-uploaded images via `custom_image_path`.
    """
    import urllib.request
    from io import BytesIO
    
    if custom_image_path and os.path.exists(custom_image_path):
        filename = os.path.basename(custom_image_path)
        img = Image.open(custom_image_path).convert("RGB")
    else:
        from modules.database import get_all_templates
        templates_db = get_all_templates()
            
        template_info = templates_db.get(template_name)
        if not template_info:
            raise ValueError(f"Template '{template_name}' not found in database.")
            
        filename = template_info.get("filename", "")
        url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        import urllib.parse
        encoded_filename = urllib.parse.quote(filename)
        public_url = f"{url}/storage/v1/object/public/template-assets/{encoded_filename}"
        
        try:
             req = urllib.request.Request(public_url)
             with urllib.request.urlopen(req) as response:
                 img_data = response.read()
             img = Image.open(BytesIO(img_data)).convert("RGB")
        except urllib.error.URLError as e:
             raise FileNotFoundError(f"Template image Cloud URL unreachable: {public_url} ({e})")
            
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
             raw_box = element.get("box_coordinates", {})
             # Convert from 0-1000 normalized coordinates (if generated correctly by AI) to absolute pixels
             # If AI hallucinates values > 1000 (pixels), we assume it failed to normalize and cap it just in case, or treat it as pixels.
             x1 = raw_box.get("x1", 0)
             y1 = raw_box.get("y1", 0)
             x2 = raw_box.get("x2", 1000)
             y2 = raw_box.get("y2", 1000)
             
             # Auto-detect if AI used 0-1000 or absolute pixels (to prevent massive breakage if AI ignores prompt)
             if max(x1, y1, x2, y2) <= 1000:
                 box = {
                     "x1": (x1 / 1000.0) * width,
                     "y1": (y1 / 1000.0) * height,
                     "x2": (x2 / 1000.0) * width,
                     "y2": (y2 / 1000.0) * height
                 }
             else:
                 box = raw_box
        
        if text and box:
            color = element.get("color", "white")
            fit_text_in_box(draw, text, box, font_path, color=color)
            
    import uuid
    import io
    unique_id = uuid.uuid4().hex[:8]
    output_filename = f"generated_{template_name.replace(' ', '_')}_{variant_index}_{unique_id}.jpg"
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    return img_byte_arr.getvalue(), output_filename
