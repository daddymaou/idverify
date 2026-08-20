from dataclasses import dataclass
from typing import Optional, Literal

DocumentType = Literal['passport', 'drivers_license', 'national_id', 'unknown']
Status = Literal['valid', 'expired', 'invalid']
Checksum = Literal['passed', 'failed', 'not_applicable']

@dataclass
class VerificationResult:
    id: str
    documentType: DocumentType
    issuingCountry: str
    expiryDate: Optional[str]
    status: Status
    checksum: Checksum
    screenshotDetected: bool
    confidence: int
    over18: Optional[bool]
    over21: Optional[bool]

@dataclass
class AgeGateResult:
    over18: bool
    over21: bool