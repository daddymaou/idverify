import exifread
from io import BytesIO
from typing import Dict, Any

async def is_screenshot(buffer: bytes) -> bool:
    """Detect screenshot via EXIF - matches JS version exactly"""
    try:
        tags = exifread.process_file(BytesIO(buffer), details=False)
        
        # Check for Make and Model (camera metadata)
        has_make = 'Image Make' in tags
        has_model = 'Image Model' in tags
        
        # JS version: returns true if !(hasMake && hasModel)
        return not (has_make and has_model)
        
    except Exception:
        # If can't parse EXIF, assume screenshot (matches JS try/catch)
        return True