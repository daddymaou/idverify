export interface VerificationResult {
  id: string
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'unknown'
  issuingCountry: string
  expiryDate: string | null
  status: 'valid' | 'expired' | 'invalid'
  checksum: 'passed' | 'failed' | 'not_applicable'
  screenshotDetected: boolean
  confidence: number
  over18: boolean | null
  over21: boolean | null
}

export interface AgeGateResult {
  over18: boolean
  over21: boolean
}
