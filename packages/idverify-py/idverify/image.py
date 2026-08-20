import cv2
import numpy as np
from PIL import Image
import io

async def preprocess_image(buffer: bytes) -> bytes:
    """Resize to 1200px width, grayscale, normalize, sharpen - matching sharp pipeline"""
    # Read image
    img = Image.open(io.BytesIO(buffer))
    
    # Convert to RGB if needed
    if img.mode not in ('L', 'RGB'):
        img = img.convert('RGB')
    
    # Convert to numpy array
    arr = np.array(img)
    
    # Resize (maintain aspect, width = 1200)
    h, w = arr.shape[:2]
    if w > 1200:
        scale = 1200 / w
        new_w = 1200
        new_h = int(h * scale)
        arr = cv2.resize(arr, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    
    # Grayscale
    if len(arr.shape) == 3:
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    else:
        gray = arr
    
    # Normalize (contrast stretch)
    norm = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
    
    # Sharpen (sigma=1.5 equivalent)
    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ])
    sharp = cv2.filter2D(norm, -1, kernel)
    
    # Convert back to PNG bytes
    result = Image.fromarray(sharp)
    output = io.BytesIO()
    result.save(output, format='PNG')
    return output.getvalue()