import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import UploadZone from '../components/UploadZone'
import ThemeToggle from '../components/ThemeToggle'
import { verifyId } from '../lib/api'

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dots, setDots] = useState('.')

  async function handleFile(file: File) {
    setLoading(true)
    setError(null)

    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 400)

    try {
      const result = await verifyId(file)
      const id = result.id || crypto.randomUUID()
      sessionStorage.setItem(`verify_${id}`, JSON.stringify(result))
      clearInterval(interval)
      navigate(`/verify/${id}`)
    } catch (err: unknown) {
      clearInterval(interval)
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Verification failed. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col transition-colors duration-300">
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
            <a
              href="https://github.com/daddymaou/idverify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase hover:underline"
            >
              GitHub
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-16 pb-8 sm:pb-16 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="w-full mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-none tracking-tight mb-3 sm:mb-4 uppercase">
            Verify Any ID.<br />Instantly.
          </h1>
          <p className="text-base sm:text-lg font-mono text-gray-600 dark:text-gray-400 mb-6 sm:mb-10">
            Passport. Driver's License. National ID. No account needed.
          </p>

          {loading ? (
            <div className="border-2 border-black dark:border-white p-8 sm:p-12 text-center">
              <p className="text-xl sm:text-2xl font-mono font-bold tracking-widest">
                ANALYZING DOCUMENT{dots}
              </p>
              <p className="text-xs sm:text-sm font-mono text-gray-500 dark:text-gray-400 mt-4">
                Running OCR · Parsing MRZ · Detecting anomalies
              </p>
            </div>
          ) : (
            <UploadZone onFile={handleFile} disabled={loading} />
          )}

          {error && !loading && (
            <div className="mt-4 border-2 border-black dark:border-white px-4 py-3 bg-white dark:bg-black">
              <p className="font-mono text-sm font-bold text-black dark:text-white">
                ✗ {error}
              </p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-black dark:border-white">
          {[
            {
              title: 'Privacy First',
              body: 'Images processed and deleted immediately. No storage. No logs. No tracking.',
            },
            {
              title: 'Instant Analysis',
              body: 'MRZ checksum validation, expiry detection, and screenshot analysis in seconds.',
            },
            {
              title: 'Open Source',
              body: 'Verify the code yourself. Core logic available as npm and Python packages.',
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`p-4 sm:p-6 ${i < 2 ? 'sm:border-r-2 border-black dark:border-white' : ''} border-b sm:border-b-0 border-black dark:border-white last:border-b-0`}
            >
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-3 border-b border-black dark:border-white pb-2">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black dark:border-white px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-xs font-mono">
          Built by{' '}
          <a
            href="https://maou.name.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
          >
            ᗰᗩOᑌ
          </a>
        </p>
        <div className="flex gap-6 text-xs font-mono">
          <a
            href="https://github.com/daddymaou/idverify"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@daddymaou/idverify"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            npm
          </a>
          <a
            href="https://pypi.org/project/idverify"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            PyPI
          </a>
          <Link to="/docs" className="hover:underline">
            API Docs
          </Link>
        </div>
      </footer>
    </div>
  )
}
