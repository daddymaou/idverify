import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import CheckRow from '../components/CheckRow'
import ThemeToggle from '../components/ThemeToggle'
import { VerificationResult, formatDocumentType } from '../lib/api'

export default function Verify() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) { navigate('/'); return }
    const stored = sessionStorage.getItem(`verify_${id}`)
    if (!stored) { setNotFound(true); return }
    try {
      setResult(JSON.parse(stored))
    } catch {
      setNotFound(true)
    }
  }, [id, navigate])

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white px-4 sm:px-6">
        <div className="border-2 border-black dark:border-white p-8 sm:p-12 text-center max-w-md w-full">
          <p className="font-mono font-bold text-xl mb-4">SESSION EXPIRED</p>
          <p className="font-mono text-sm text-gray-600 dark:text-gray-400 mb-8">
            Results are stored in browser memory. Please upload the document again.
          </p>
          <Link to="/" className="btn-solid inline-block">
            ← VERIFY ANOTHER
          </Link>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <p className="font-mono text-xl font-bold tracking-widest">
          LOADING<span className="animate-blink">_</span>
        </p>
      </div>
    )
  }

  const isValid = result.status === 'valid'
  const isExpired = result.status === 'expired'

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="border-b-2 border-black dark:border-white px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.svg" alt="IDVerify" className="h-6 sm:h-8" />
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="flex gap-3 sm:gap-6">
            <Link
              to="/docs"
              className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase hover:underline"
            >
              API Docs
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        {/* Status Banner */}
        <div className={`border-2 border-black dark:border-white p-4 sm:p-6 mb-6 sm:mb-8 ${
          isValid ? 'bg-black text-white dark:bg-white dark:text-black' : 
          'bg-white text-black dark:bg-black dark:text-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase mb-1 opacity-60">
                VERIFICATION RESULT
              </p>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                {isValid ? '✓ VALID' : isExpired ? '✗ EXPIRED' : '✗ INVALID'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-mono tracking-widest uppercase mb-1 opacity-60">
                CONFIDENCE
              </p>
              <p className="text-3xl sm:text-4xl font-black font-mono">
                {result.confidence}%
              </p>
            </div>
          </div>
        </div>

        {/* Age Gate */}
        {(result.over18 !== null || result.over21 !== null) && (
          <div className="border-2 border-black dark:border-white mb-6 sm:mb-8 grid grid-cols-2">
            <div className={`p-4 sm:p-5 ${
              result.over18 ? 'bg-black text-white dark:bg-white dark:text-black' : 
              'bg-white text-black dark:bg-black dark:text-white'
            } border-r-2 border-black dark:border-white`}>
              <p className="text-xs font-mono tracking-widest uppercase mb-1 opacity-70">OVER 18</p>
              <p className="text-xl sm:text-2xl font-black font-mono">
                {result.over18 === null ? 'N/A' : result.over18 ? 'YES' : 'NO'}
              </p>
            </div>
            <div className={`p-4 sm:p-5 ${
              result.over21 ? 'bg-black text-white dark:bg-white dark:text-black' : 
              'bg-white text-black dark:bg-black dark:text-white'
            }`}>
              <p className="text-xs font-mono tracking-widest uppercase mb-1 opacity-70">OVER 21</p>
              <p className="text-xl sm:text-2xl font-black font-mono">
                {result.over21 === null ? 'N/A' : result.over21 ? 'YES' : 'NO'}
              </p>
            </div>
          </div>
        )}

        {/* Check Grid */}
        <div className="border-2 border-black dark:border-white px-4 sm:px-6 mb-6 sm:mb-8">
          <CheckRow
            label="Document Type"
            value={formatDocumentType(result.documentType)}
            status="neutral"
          />
          <CheckRow
            label="Issuing Country"
            value={result.issuingCountry || 'UNKNOWN'}
            status="neutral"
          />
          <CheckRow
            label="Expiry Date"
            value={result.expiryDate || 'NOT DETECTED'}
            status={result.status === 'expired' ? 'fail' : result.expiryDate ? 'pass' : 'neutral'}
          />
          <CheckRow
            label="Status"
            value={result.status.toUpperCase()}
            status={isValid ? 'pass' : 'fail'}
          />
          <CheckRow
            label="Checksum"
            value={result.checksum === 'not_applicable' ? 'N/A' : result.checksum.toUpperCase()}
            status={
              result.checksum === 'passed' ? 'pass' :
              result.checksum === 'failed' ? 'fail' : 'neutral'
            }
          />
          <CheckRow
            label="Screenshot Detected"
            value={result.screenshotDetected ? 'YES (possible screenshot)' : 'NO (genuine photo)'}
            status={result.screenshotDetected ? 'warn' : 'pass'}
          />
        </div>

        {/* ID reference */}
        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-6 sm:mb-8 break-all">
          SCAN ID: {id}
        </p>

        {/* Action */}
        <Link to="/" className="btn-outline inline-block text-sm font-mono font-bold tracking-widest uppercase">
          ← VERIFY ANOTHER
        </Link>
      </main>

      <footer className="border-t-2 border-black dark:border-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs font-mono">
          Built by{' '}
          <a href="https://maou.name.ng" target="_blank" rel="noopener noreferrer" className="font-bold underline">
            ᗰᗩOᑌ
          </a>
        </p>
        <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
          Images are never stored · No logs · No tracking
        </p>
      </footer>
    </div>
  )
}