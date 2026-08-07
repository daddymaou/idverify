import Tesseract from 'tesseract.js'
import sharp from 'sharp'
import exifr from 'exifr'
import { parse as parseMRZ } from 'mrz'
import { randomUUID } from 'crypto'
import type { VerificationResult, AgeGateResult } from './types'

export type { VerificationResult, AgeGateResult }

// ── Image preprocessing ───────────────────────────────────────────────────────

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.5 })
    .toFormat('png')
    .toBuffer()
}

// ── OCR ───────────────────────────────────────────────────────────────────────

async function runOCR(buffer: Buffer): Promise<{ text: string; confidence: number }> {
  const processed = await preprocessImage(buffer)
  const result = await Tesseract.recognize(processed, 'eng', { logger: () => {} })
  return { text: result.data.text, confidence: Math.round(result.data.confidence) }
}

// ── MRZ extraction ────────────────────────────────────────────────────────────

function extractMRZLines(text: string): string[] | null {
  const lines = text
    .split('\n')
    .map(l => l.replace(/\s+/g, '').replace(/[^A-Z0-9<]/gi, '').toUpperCase())
    .filter(l => l.length >= 30)

  const td3 = lines.filter(l => /^[A-Z0-9<]{44}$/.test(l))
  if (td3.length >= 2) return td3.slice(0, 2)

  const td1 = lines.filter(l => /^[A-Z0-9<]{30}$/.test(l))
  if (td1.length >= 3) return td1.slice(0, 3)

  const td2 = lines.filter(l => /^[A-Z0-9<]{36}$/.test(l))
  if (td2.length >= 2) return td2.slice(0, 2)

  return null
}

function formatDate(yymmdd: string): string | null {
  if (!yymmdd || yymmdd.length !== 6) return null
  const yy = parseInt(yymmdd.slice(0, 2))
  const mm = yymmdd.slice(2, 4)
  const dd = yymmdd.slice(4, 6)
  const year = yy <= 30 ? 2000 + yy : 1900 + yy
  return `${year}-${mm}-${dd}`
}

// ── Screenshot detection ──────────────────────────────────────────────────────

async function isScreenshot(buffer: Buffer): Promise<boolean> {
  try {
    const exif = await exifr.parse(buffer, { tiff: true, exif: true, mergeOutput: true })
    if (!exif) return true
    const hasMake = !!(exif.Make || exif.make)
    const hasModel = !!(exif.Model || exif.model)
    return !(hasMake && hasModel)
  } catch {
    return true
  }
}

// ── Text-based fallbacks ──────────────────────────────────────────────────────

function extractExpiryFromText(text: string): string | null {
  const match = text.match(
    /(?:exp(?:iry|iration|ires)?|valid\s*(?:thru|through|until))[\s:]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i
  )
  if (match) return normalizeDate(match[1])
  const iso = text.match(/\b(20\d{2})[\/\-\.](0[1-9]|1[0-2])[\/\-\.](0[1-9]|[12]\d|3[01])\b/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return null
}

function extractDOBFromText(text: string): string | null {
  const match = text.match(
    /(?:d\.?o\.?b\.?|date\s*of\s*birth|born|dob)[\s:]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i
  )
  if (match) return normalizeDate(match[1])
  return null
}

function normalizeDate(dateStr: string): string {
  const parts = dateStr.split(/[\/\-\.]/)
  if (parts.length !== 3) return dateStr
  const [a, b, c] = parts
  if (c.length === 4) return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
  if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
  const yy = parseInt(c)
  const year = yy <= 30 ? 2000 + yy : 1900 + yy
  return `${year}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
}

function detectDocumentType(text: string): VerificationResult['documentType'] {
  const u = text.toUpperCase()
  if (/PASSPORT/.test(u)) return 'passport'
  if (/DRIVER|LICENSE|LICENCE|PERMIT/.test(u)) return 'drivers_license'
  if (/NATIONAL\s*ID|IDENTITY\s*CARD|ID\s*CARD/.test(u)) return 'national_id'
  return 'unknown'
}

function calculateAge(dobStr: string): { over18: boolean; over21: boolean } | null {
  const dob = new Date(dobStr)
  if (isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  if (age < 0 || age > 130) return null
  return { over18: age >= 18, over21: age >= 21 }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Verify a government ID image.
 * @param buffer - Image buffer (PNG, JPG, WebP)
 * @returns Structured verification result
 */
export async function verifyId(buffer: Buffer): Promise<VerificationResult> {
  const [{ text, confidence: ocrConf }, screenshot] = await Promise.all([
    runOCR(buffer),
    isScreenshot(buffer),
  ])

  let documentType: VerificationResult['documentType'] = 'unknown'
  let issuingCountry = 'UNKNOWN'
  let expiryDate: string | null = null
  let birthDate: string | null = null
  let checksum: VerificationResult['checksum'] = 'not_applicable'
  let confidence = ocrConf
  let mrzValid = false

  const mrzLines = extractMRZLines(text)
  if (mrzLines && mrzLines.length >= 2) {
    try {
      const parsed = parseMRZ(mrzLines)
      mrzValid = parsed.valid
      const fields = parsed.fields as Record<string, unknown>
      const firstLine = mrzLines[0]
      const typeCode = firstLine[0]
      if (typeCode === 'P') documentType = 'passport'
      else if (['I', 'A', 'C'].includes(typeCode)) documentType = 'national_id'
      else if (typeCode === 'D') documentType = 'drivers_license'

      issuingCountry =
        ((fields.issuingState as string | undefined) ||
        (fields.nationality as string | undefined) || 'UNKNOWN').toUpperCase()
      expiryDate = formatDate((fields.expirationDate as string | undefined) || '')
      birthDate = formatDate((fields.birthDate as string | undefined) || '')
      checksum = parsed.valid ? 'passed' : 'failed'
      confidence = parsed.valid
        ? Math.min(95, Math.round(ocrConf * 0.6 + 40))
        : Math.min(70, Math.round(ocrConf * 0.5 + 20))
    } catch {
      checksum = 'failed'
    }
  } else {
    documentType = detectDocumentType(text)
    expiryDate = extractExpiryFromText(text)
    birthDate = extractDOBFromText(text)
    confidence = Math.min(60, Math.round(ocrConf * 0.5 + 10))
  }

  let status: VerificationResult['status'] = 'invalid'
  if (expiryDate && new Date(expiryDate) < new Date()) {
    status = 'expired'
  } else if (mrzValid || documentType !== 'unknown') {
    status = 'valid'
  }

  const ageResult = birthDate ? calculateAge(birthDate) : null

  return {
    id: randomUUID(),
    documentType,
    issuingCountry,
    expiryDate,
    status,
    checksum,
    screenshotDetected: screenshot,
    confidence,
    over18: ageResult?.over18 ?? null,
    over21: ageResult?.over21 ?? null,
  }
}

/**
 * Check age gate from a government ID image.
 * Returns over18 and over21 without exposing the full birthdate.
 */
export async function checkAge(buffer: Buffer): Promise<AgeGateResult> {
  const { text } = await runOCR(buffer)
  let birthDate: string | null = null

  const mrzLines = extractMRZLines(text)
  if (mrzLines && mrzLines.length >= 2) {
    try {
      const parsed = parseMRZ(mrzLines)
      const fields = parsed.fields as Record<string, unknown>
      birthDate = formatDate((fields.birthDate as string | undefined) || '')
    } catch {
      // fall through
    }
  }

  if (!birthDate) birthDate = extractDOBFromText(text)
  if (!birthDate) throw new Error('Date of birth could not be detected from this image.')

  const result = calculateAge(birthDate)
  if (!result) throw new Error('Could not calculate age from detected date.')

  return result
}
