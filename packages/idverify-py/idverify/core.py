import uuid
import asyncio
from typing import Optional
from .ocr import run_ocr
from .exif import is_screenshot
from .mrz import extract_mrz_lines, parse_mrz, get_mrz_info
from .fallback import (
    extract_expiry_from_text,
    extract_dob_from_text,
    detect_document_type,
    calculate_age
)
from .types import VerificationResult, AgeGateResult

async def verify_id(buffer: bytes) -> VerificationResult:
    """Verify a government ID image - exact match to JS version"""
    
    # Run OCR and screenshot detection in parallel (matches Promise.all)
    ocr_task = run_ocr(buffer)
    screenshot_task = is_screenshot(buffer)
    
    ocr_result, screenshot = await asyncio.gather(ocr_task, screenshot_task)
    
    text = ocr_result['text']
    ocr_conf = ocr_result['confidence']
    
    # Initialize result
    document_type = 'unknown'
    issuing_country = 'UNKNOWN'
    expiry_date = None
    birth_date = None
    checksum = 'not_applicable'
    confidence = ocr_conf
    mrz_valid = False
    
    # Try MRZ parsing
    mrz_lines = extract_mrz_lines(text)
    if mrz_lines and len(mrz_lines) >= 2:
        try:
            parsed = parse_mrz(mrz_lines)
            if parsed:
                mrz_info = get_mrz_info(mrz_lines, parsed)
                mrz_valid = mrz_info['mrzValid']
                document_type = mrz_info['documentType']
                issuing_country = mrz_info['issuingCountry']
                expiry_date = mrz_info['expiryDate']
                birth_date = mrz_info['birthDate']
                checksum = mrz_info['checksum']
                
                # Confidence calculation (matches JS)
                if mrz_valid:
                    confidence = min(95, int(ocr_conf * 0.6 + 40))
                else:
                    confidence = min(70, int(ocr_conf * 0.5 + 20))
        except Exception:
            checksum = 'failed'
    else:
        # Fallback to text extraction
        document_type = detect_document_type(text)
        expiry_date = extract_expiry_from_text(text)
        birth_date = extract_dob_from_text(text)
        confidence = min(60, int(ocr_conf * 0.5 + 10))
    
    # Determine status (matches JS)
    status = 'invalid'
    if expiry_date:
        from datetime import datetime
        exp_date = datetime.strptime(expiry_date, '%Y-%m-%d')
        if exp_date < datetime.now():
            status = 'expired'
        elif mrz_valid or document_type != 'unknown':
            status = 'valid'
    
    # Calculate age
    age_result = calculate_age(birth_date) if birth_date else None
    
    return VerificationResult(
        id=str(uuid.uuid4()),
        documentType=document_type,
        issuingCountry=issuing_country,
        expiryDate=expiry_date,
        status=status,
        checksum=checksum,
        screenshotDetected=screenshot,
        confidence=confidence,
        over18=age_result.get('over18') if age_result else None,
        over21=age_result.get('over21') if age_result else None,
    )

async def check_age(buffer: bytes) -> AgeGateResult:
    """Check age gate without exposing DOB - matches JS"""
    ocr_result = await run_ocr(buffer)
    text = ocr_result['text']
    
    birth_date = None
    
    # Try MRZ first
    mrz_lines = extract_mrz_lines(text)
    if mrz_lines and len(mrz_lines) >= 2:
        try:
            parsed = parse_mrz(mrz_lines)
            if parsed:
                from .mrz import format_date
                fields = parsed.get('fields', {})
                birth_date = format_date(fields.get('birth_date', ''))
        except Exception:
            pass
    
    # Fallback to text extraction
    if not birth_date:
        birth_date = extract_dob_from_text(text)
    
    if not birth_date:
        raise ValueError('Date of birth could not be detected from this image.')
    
    age_result = calculate_age(birth_date)
    if not age_result:
        raise ValueError('Could not calculate age from detected date.')
    
    return AgeGateResult(
        over18=age_result['over18'],
        over21=age_result['over21']
    )