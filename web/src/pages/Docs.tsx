import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { API_URL } from '../lib/api'

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-black dark:bg-white text-white dark:text-black p-4 sm:p-5 overflow-x-auto text-xs font-mono leading-relaxed border-l-4 border-white dark:border-black">
      <code>{code}</code>
    </pre>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 sm:mb-14">
      <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest mb-4 sm:mb-6 border-b-2 border-black dark:border-white pb-2 sm:pb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function Docs() {
  const base = API_URL

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
              to="/"
              className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase hover:underline"
            >
              Home
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

      <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 border-r-2 border-black dark:border-white px-6 py-10 sticky top-0 h-screen overflow-y-auto">
          <p className="text-xs font-mono font-bold tracking-widest uppercase mb-4 text-gray-500 dark:text-gray-400">
            Contents
          </p>
          {[
            { href: '#overview', label: 'Overview' },
            { href: '#base-url', label: 'Base URL' },
            { href: '#post-verify', label: 'POST /verify' },
            { href: '#post-age-gate', label: 'POST /age-gate' },
            { href: '#get-health', label: 'GET /health' },
            { href: '#response-schema', label: 'Response Schema' },
            { href: '#rate-limits', label: 'Rate Limits' },
            { href: '#errors', label: 'Errors' },
            { href: '#npm', label: 'npm Package' },
            { href: '#python', label: 'Python Package' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="block text-xs font-mono py-2 border-b border-gray-200 dark:border-gray-800 hover:font-bold"
            >
              {item.label}
            </a>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-10 overflow-x-hidden">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">API Reference</h1>
          <p className="font-mono text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 text-sm">
            No authentication required. All endpoints return JSON.
          </p>

          <Section id="overview" title="Overview">
            <p className="text-sm leading-relaxed mb-4">
              IDVerify exposes a simple REST API that accepts image uploads and returns structured verification results.
              All processing happens on the server — images are never written to disk or stored in any database.
            </p>
            <p className="text-sm leading-relaxed">
              All responses include CORS headers, so you can call this API directly from a browser or any server.
            </p>
          </Section>

          <Section id="base-url" title="Base URL">
            <CodeBlock code={`${base}`} />
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-2">
              Self-hosted: replace with your own Render/Railway/VPS URL.
            </p>
          </Section>

          <Section id="post-verify" title="POST /api/verify">
            <p className="text-sm mb-4">
              Accepts a multipart image upload. Returns full verification results including document type,
              expiry, checksum validity, and screenshot detection.
            </p>

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mb-3">Request</h3>
            <div className="border border-gray-300 dark:border-gray-700 mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <span className="font-mono text-xs font-bold dark:text-white">Content-Type: multipart/form-data</span>
              </div>
              <div className="px-4 py-3">
                <p className="font-mono text-xs dark:text-white"><span className="font-bold">idImage</span> — file (PNG, JPG, WebP, max 10MB)</p>
              </div>
            </div>

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mb-3">curl</h3>
            <CodeBlock code={`curl -X POST ${base}/api/verify \\
  -F "idImage=@/path/to/id.jpg"`} />

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mt-6 mb-3">JavaScript</h3>
            <CodeBlock code={`const formData = new FormData();
formData.append('idImage', file); // File object from <input>

const res = await fetch('${base}/api/verify', {
  method: 'POST',
  body: formData,
});

const result = await res.json();
console.log(result);`} />

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mt-6 mb-3">Response</h3>
            <CodeBlock code={`{
  "id": "a1b2c3d4-...",
  "documentType": "passport",
  "issuingCountry": "US",
  "expiryDate": "2027-03-15",
  "status": "valid",
  "checksum": "passed",
  "screenshotDetected": false,
  "confidence": 91,
  "over18": true,
  "over21": true
}`} />
          </Section>

          <Section id="post-age-gate" title="POST /api/age-gate">
            <p className="text-sm mb-4">
              Returns age gate result without exposing the full date of birth. Privacy-preserving.
            </p>

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mb-3">curl</h3>
            <CodeBlock code={`curl -X POST ${base}/api/age-gate \\
  -F "idImage=@/path/to/id.jpg"`} />

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mt-6 mb-3">JavaScript</h3>
            <CodeBlock code={`const formData = new FormData();
formData.append('idImage', file);

const res = await fetch('${base}/api/age-gate', {
  method: 'POST',
  body: formData,
});

const { over18, over21 } = await res.json();`} />

            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mt-6 mb-3">Response</h3>
            <CodeBlock code={`{
  "over18": true,
  "over21": false
}`} />
          </Section>

          <Section id="get-health" title="GET /api/health">
            <CodeBlock code={`curl ${base}/api/health`} />
            <div className="mt-4">
              <CodeBlock code={`{ "status": "ok" }`} />
            </div>
          </Section>

          <Section id="response-schema" title="Response Schema">
            <div className="border-2 border-black dark:border-white overflow-x-auto">
              {[
                { field: 'id', type: 'string', desc: 'Unique scan UUID' },
                { field: 'documentType', type: '"passport" | "drivers_license" | "national_id" | "unknown"', desc: '' },
                { field: 'issuingCountry', type: 'string', desc: 'ISO 3166-1 alpha-2 or alpha-3' },
                { field: 'expiryDate', type: 'string | null', desc: 'YYYY-MM-DD format' },
                { field: 'status', type: '"valid" | "expired" | "invalid"', desc: '' },
                { field: 'checksum', type: '"passed" | "failed" | "not_applicable"', desc: 'MRZ checksum result' },
                { field: 'screenshotDetected', type: 'boolean', desc: 'EXIF-based screenshot detection' },
                { field: 'confidence', type: 'number', desc: 'OCR + parsing confidence (0–100)' },
                { field: 'over18', type: 'boolean | null', desc: 'null if DOB not detected' },
                { field: 'over21', type: 'boolean | null', desc: 'null if DOB not detected' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs font-bold dark:text-white break-all">{row.field}</div>
                  <div className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 break-all">{row.type}</div>
                  <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 break-words">{row.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="rate-limits" title="Rate Limits">
            <p className="text-sm mb-4">
              30 requests per minute per IP address. Limits are enforced in-memory (no Redis required).
            </p>
            <div className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-mono text-xs dark:text-white">
              <p><span className="font-bold">429 Too Many Requests</span> — {"{ \"error\": \"Too many requests. Limit: 30/min\" }"}</p>
            </div>
          </Section>

          <Section id="errors" title="Errors">
            <div className="border-2 border-black dark:border-white overflow-x-auto">
              {[
                { code: '400', msg: 'No image provided or invalid file type' },
                { code: '413', msg: 'File too large (max 10MB)' },
                { code: '422', msg: 'Image could not be processed' },
                { code: '429', msg: 'Rate limit exceeded' },
                { code: '500', msg: 'Internal server error' },
              ].map((err, i) => (
                <div key={i} className="flex border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs font-black w-14 sm:w-16 dark:text-white">{err.code}</div>
                  <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs border-l border-gray-200 dark:border-gray-700 dark:text-white break-words">{err.msg}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="npm" title="npm Package">
            <p className="text-sm mb-4">
              Use the core logic directly in your own Node.js project without hitting the API.
            </p>
            <CodeBlock code={`npm install @daddymaou/idverify`} />
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mt-6 mb-3">Usage</h3>
            <CodeBlock code={`import { verifyId, checkAge } from '@daddymaou/idverify';
import { readFileSync } from 'fs';

const buffer = readFileSync('./passport.jpg');

// Full verification
const result = await verifyId(buffer);
console.log(result.status);   // "valid"
console.log(result.checksum); // "passed"

// Age gate only
const age = await checkAge(buffer);
console.log(age.over18); // true
console.log(age.over21); // false`} />
          </Section>

          <Section id="python" title="Python Package">
            <p className="text-sm mb-4">
              Use the core logic directly in your Python project without hitting the API.
            </p>
            <CodeBlock code={`pip install idverify`} />
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase mt-6 mb-3">Usage</h3>
            <CodeBlock code={`from idverify import verify_id, check_age

with open('./passport.jpg', 'rb') as f:
    buffer = f.read()

# Full verification
result = verify_id(buffer)
print(result.status)   # "valid"
print(result.checksum) # "passed"

# Age gate only
age = check_age(buffer)
print(age.over18)  # True
print(age.over21)  # False`} />
          </Section>
        </main>
      </div>

      <footer className="border-t-2 border-black dark:border-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs font-mono">
          Built by{' '}
          <a href="https://maou.name.ng" target="_blank" rel="noopener noreferrer" className="font-bold underline">
            ᗰᗩOᑌ
          </a>
        </p>
        <div className="flex gap-6 text-xs font-mono">
          <a href="https://github.com/daddymaou/idverify" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          <a href="https://www.npmjs.com/package/@daddymaou/idverify" target="_blank" rel="noopener noreferrer" className="hover:underline">npm</a>
          <a href="https://pypi.org/project/idverify" target="_blank" rel="noopener noreferrer" className="hover:underline">PyPI</a>
        </div>
      </footer>
    </div>
  )
}