import re
from typing import Optional, Dict, Any

def extract_expiry_from_text(text: str) -> Optional[str]:
    """Extract expiry date using regex - matches JS exactly"""
    patterns = [
        r'(?:exp(?:iry|iration|ires)?|valid\s*(?:thru|through|until))[\s:]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
        r'\b(20\d{2})[\/\-\.](0[1-9]|1[0-2])[\/\-\.](0[1-9]|[12]\d|3[01])\b'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            return normalize_date(date_str)
    return None

def extract_dob_from_text(text: str) -> Optional[str]:
    """Extract DOB using regex - matches JS exactly"""
    pattern = r'(?:d\.?o\.?b\.?|date\s*of\s*birth|born|dob)[\s:]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return normalize_date(match.group(1))
    return None

def normalize_date(date_str: str) -> str:
    """Normalize various date formats to YYYY-MM-DD - matches JS"""
    parts = re.split(r'[\/\-\.]', date_str)
    if len(parts) != 3:
        return date_str
    
    a, b, c = parts
    
    # YYYY-MM-DD
    if len(c) == 4:
        return f"{c}-{a.zfill(2)}-{b.zfill(2)}"
    
    # YYYY-MM-DD (year first)
    if len(a) == 4:
        return f"{a}-{b.zfill(2)}-{c.zfill(2)}"
    
    # MM-DD-YY or DD-MM-YY (assume MM-DD-YY like JS)
    try:
        yy = int(c)
        year = 2000 + yy if yy <= 30 else 1900 + yy
        return f"{year}-{a.zfill(2)}-{b.zfill(2)}"
    except ValueError:
        return date_str

def detect_document_type(text: str) -> str:
    """Detect document type from text - matches JS"""
    upper = text.upper()
    if re.search(r'PASSPORT', upper):
        return 'passport'
    if re.search(r'DRIVER|LICENSE|LICENCE|PERMIT', upper):
        return 'drivers_license'
    if re.search(r'NATIONAL\s*ID|IDENTITY\s*CARD|ID\s*CARD', upper):
        return 'national_id'
    return 'unknown'

def calculate_age(dob_str: str) -> Optional[Dict[str, bool]]:
    """Calculate age from DOB - matches JS logic"""
    try:
        from datetime import datetime
        dob = datetime.strptime(dob_str, '%Y-%m-%d')
        now = datetime.now()
        
        age = now.year - dob.year
        if (now.month, now.day) < (dob.month, dob.day):
            age -= 1
        
        if age < 0 or age > 130:
            return None
        
        return {'over18': age >= 18, 'over21': age >= 21}
    except ValueError:
        return None