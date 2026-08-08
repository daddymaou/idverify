```markdown
# IDVerify

**Verify Any ID. Instantly.**

A single-purpose ID verification web app that scans government IDs — passports, driver's licenses, and national IDs — and tells you if they're valid.

**Live Demo:** [idverify-tan.vercel.app](https://idverify-tan.vercel.app)  
**API:** [idverify-api.onrender.com](https://idverify-api.onrender.com)  
**npm Package:** [@daddymaou/idverify](https://www.npmjs.com/package/@daddymaou/idverify)

Built by [ᗰᗩOᑌ](https://maou.name.ng) · [GitHub](https://github.com/daddymaou/idverify)

---

## What It Does

- **MRZ checksum validation** — proves the document isn't randomly generated
- **Expiration detection** — instantly flags expired IDs
- **Screenshot detection** — tells you if someone's holding a real document or showing a screen
- **Age gate** — simple yes/no without exposing the full birthdate (privacy-preserving)
- **No storage** — images are never written to disk or logged

---

## Project Structure

```
idverify/
├── web/                    # React + Vite frontend (deployed on Vercel)
├── api/                    # Express backend API (deployed on Render)
└── packages/
    └── idverify/           # npm package @daddymaou/idverify (core logic)
```

---

## Quick Start

See **guide.txt** for full setup, local development, Vercel deployment, and Render deployment instructions.

### Frontend

```bash
cd web
npm install
cp .env.example .env.local
# Edit .env.local — set VITE_API_URL to your API server URL
npm run dev
# → http://localhost:5173
```

### Backend API

```bash
cd api
npm install
npm run dev
# → http://localhost:3001
```

### npm Package

```bash
cd packages/idverify
npm install
npm run build
npm publish --access=public
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/verify` | Full ID verification |
| `POST` | `/api/age-gate` | Age gate only |
| `GET` | `/api/health` | Health check |

All endpoints accept `multipart/form-data` with an `idImage` field. No auth required. CORS enabled for all origins.

---

## npm Package

The core verification logic is published as the `@daddymaou/idverify` npm package:

```bash
npm install @daddymaou/idverify
```

```typescript
import { verifyId, checkAge } from '@daddymaou/idverify';
const result = await verifyId(buffer);
```

See `packages/idverify/README.md` for full documentation.

---

## Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS
- **Backend**: Express 4, TypeScript, multer, tesseract.js, mrz, sharp, exifr
- **Design**: Brutalist black-and-white, Inter + JetBrains Mono fonts, zero border-radius
- **Deployment**: Vercel (web) + Render (API)

---

## Live Deployments

| Service | URL | Status |
|---------|-----|--------|
| **Web App** | [idverify-tan.vercel.app](https://idverify-tan.vercel.app) | ✅ Live |
| **API** | [idverify-api.onrender.com](https://idverify-api.onrender.com) | ✅ Live |
| **npm Package** | [@daddymaou/idverify](https://www.npmjs.com/package/@daddymaou/idverify) | ✅ Published |

---

## License

MIT
```