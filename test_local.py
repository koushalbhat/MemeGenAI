import os
from modules.meme_assembly import assemble_meme

def test_assembly():
    print("Testing Multimodal Meme Assembly...")
    mock_payload = {
        "selected_template": "Drake rejecting",
        "reasoning": "Mock test.",
        "text_elements": [
            {
                "box_coordinates": {"x1": 114, "y1": 0, "x2": 228, "y2": 110},
                "text": "THOROUGHLY UNDERSTANDING EVERY LECTURE"
            },
            {
                "box_coordinates": {"x1": 114, "y1": 111, "x2": 228, "y2": 221},
                "text": "JUST LOOKING UP PAST PAPER ANSWERS FOR PATTERNS"
            }
        ]
    }
    try:
        output_path = assemble_meme(mock_payload)
        print(f"Success! Mock multimodal meme generated at: {output_path}")
    except Exception as e:
        print(f"Error during assembly test: {e}")

if __name__ == "__main__":
    test_assembly()
