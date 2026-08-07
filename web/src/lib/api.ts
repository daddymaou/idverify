export const API_URL = 'https://idverify-api.onrender.com' 

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
  rawText?: string
}

export interface AgeGateResult {
  over18: boolean
  over21: boolean
}

export async function verifyId(file: File): Promise<VerificationResult> {
  const formData = new FormData()
  formData.append('idImage', file)

  const res = await fetch(`${API_URL}/api/verify`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error: ${res.status}`)
  }

  return res.json()
}

export async function checkAge(file: File): Promise<AgeGateResult> {
  const formData = new FormData()
  formData.append('idImage', file)

  const res = await fetch(`${API_URL}/api/age-gate`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error: ${res.status}`)
  }

  return res.json()
}

export function formatDocumentType(type: VerificationResult['documentType']): string {
  switch (type) {
    case 'passport': return 'Passport'
    case 'drivers_license': return 'Driver\'s License'
    case 'national_id': return 'National ID'
    default: return 'Unknown'
  }
}