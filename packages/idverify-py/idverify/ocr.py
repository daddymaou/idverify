import pytesseract
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .image import preprocess_image

executor = ThreadPoolExecutor(max_workers=4)

async def run_ocr(buffer: bytes) -> dict:
    """Run Tesseract OCR - matches JS version"""
    processed = await preprocess_image(buffer)
    
    def _ocr():
        # Use same config as JS: PSM 6, English
        text = pytesseract.image_to_string(
            processed,
            lang='eng',
            config='--psm 6'
        )
        # Get confidence (tesseract doesn't give per-doc confidence easily)
        # We'll approximate with character confidence
        return text.strip()
    
    loop = asyncio.get_event_loop()
    text = await loop.run_in_executor(executor, _ocr)
    
    # Approximate confidence (since tesseract doesn't give global confidence easily)
    # Use text length as proxy: more text = higher confidence
    confidence = min(95, 30 + len(text.split()) * 2) if text.strip() else 0
    
    return {
        'text': text,
        'confidence': confidence
    }