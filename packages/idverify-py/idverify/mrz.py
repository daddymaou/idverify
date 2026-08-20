import re
from typing import Optional, List, Dict, Any
from mrz import mrz
from mrz.base import MRZ

def extract_mrz_lines(text: str) -> Optional[List[str]]:
    """Extract MRZ lines - matches JS version exactly"""
    # Clean lines: remove spaces, keep alnum + <, uppercase
    lines = []
    for line in text.split('\n'):
        cleaned = re.sub(r'\s+', '', line)
        cleaned = re.sub(r'[^A-Z0-9<]', '', cleaned.upper())
        if len(cleaned) >= 30:
            lines.append(cleaned)
    
    # TD3: 44 chars, 2 lines
    td3 = [l for l in lines if re.match(r'^[A-Z0-9<]{44}$', l)]
    if len(td3) >= 2:
        return td3[:2]
    
    # TD1: 30 chars, 3 lines
    td1 = [l for l in lines if re.match(r'^[A-Z0-9<]{30}$', l)]
    if len(td1) >= 3:
        return td1[:3]
    
    # TD2: 36 chars, 2 lines
    td2 = [l for l in lines if re.match(r'^[A-Z0-9<]{36}$', l)]
    if len(td2) >= 2:
        return td2[:2]
    
    return None

def format_date(yymmdd: str) -> Optional[str]:
    """Format YYMMDD to YYYY-MM-DD - matches JS version"""
    if not yymmdd or len(yymmdd) != 6:
        return None
    try:
        yy = int(yymmdd[:2])
        mm = yymmdd[2:4]
        dd = yymmdd[4:6]
        year = 2000 + yy if yy <= 30 else 1900 + yy
        return f"{year}-{mm}-{dd}"
    except ValueError:
        return None

def parse_mrz(lines: List[str]) -> Optional[Dict[str, Any]]:
    """Parse MRZ using mrz package - matches JS version"""
    try:
        # Join lines with newline (mrz package expects this)
        mrz_text = '\n'.join(lines)
        parsed = mrz.parse(mrz_text)
        
        # Get fields
        fields = parsed.fields
        
        return {
            'valid': parsed.valid,
            'document_type': getattr(parsed, 'document_type', None),
            'issuing_state': fields.get('issuing_state', fields.get('nationality')),
            'nationality': fields.get('nationality'),
            'expiration_date': fields.get('expiration_date'),
            'birth_date': fields.get('birth_date'),
            'document_number': fields.get('document_number'),
            'fields': fields,
            'raw': parsed
        }
    except Exception:
        return None

def get_mrz_info(mrz_lines: List[str], parsed: Optional[Dict]) -> Dict[str, Any]:
    """Extract info from MRZ - matches JS logic"""
    result = {
        'documentType': 'unknown',
        'issuingCountry': 'UNKNOWN',
        'expiryDate': None,
        'birthDate': None,
        'checksum': 'not_applicable',
        'mrzValid': False,
        'confidence': 0
    }
    
    if not parsed:
        return result
    
    result['mrzValid'] = parsed.get('valid', False)
    
    # Detect document type from first line
    first_line = mrz_lines[0] if mrz_lines else ''
    if first_line:
        type_code = first_line[0] if first_line else ''
        if type_code == 'P':
            result['documentType'] = 'passport'
        elif type_code in ['I', 'A', 'C']:
            result['documentType'] = 'national_id'
        elif type_code == 'D':
            result['documentType'] = 'drivers_license'
    
    # Issuing country
    issuing = parsed.get('issuing_state') or parsed.get('nationality')
    if issuing:
        result['issuingCountry'] = issuing.upper()
    
    # Dates
    exp_date = parsed.get('expiration_date')
    if exp_date:
        result['expiryDate'] = format_date(exp_date)
    
    birth_date = parsed.get('birth_date')
    if birth_date:
        result['birthDate'] = format_date(birth_date)
    
    # Checksum
    result['checksum'] = 'passed' if parsed.get('valid') else 'failed'
    
    return result