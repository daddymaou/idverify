<div align="center">

# IDVerify

**Verify Any ID. Instantly.**

A single-purpose ID verification web app that scans government IDs — passports, driver's licenses, and national IDs — and tells you if they're valid.

[![Live Demo](https://img.shields.io/badge/demo-live-black?style=flat-square)](https://idverify-app.vercel.app)
[![API](https://img.shields.io/badge/api-live-black?style=flat-square)](https://idverify-api.onrender.com)
[![npm](https://img.shields.io/npm/v/%40daddymaou%2Fidverify?style=flat-square&color=black)](https://www.npmjs.com/package/@daddymaou/idverify)
[![PyPI](https://img.shields.io/pypi/v/idverify?style=flat-square&color=black)](https://pypi.org/project/idverify)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](#license)

Built by [ᗰᗩOᑌ](https://maou.name.ng) · [GitHub](https://github.com/daddymaou/idverify)

</div>

---

## Table of Contents

- [What It Does](#what-it-does)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Packages](#packages)
- [Tech Stack](#tech-stack)
- [Live Deployments](#live-deployments)
- [License](#license)

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
    ├── idverify/            # npm package @daddymaou/idverify (core logic)
    └── idverify-py/         # Python package idverify (core logic)
```

> Full setup, local development, and deployment instructions live in `guide.txt`.

---

## Quick Start

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

### Publishing the npm package

```bash
cd packages/idverify
npm install
npm run build
npm publish --access=public
```

### Publishing the Python package

```bash
cd packages/idverify-py
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -e .
python -m build
twine upload dist/*
```

---

## API Endpoints

| Method | Path             | Description          |
|--------|------------------|-----------------------|
| `POST` | `/api/verify`    | Full ID verification |
| `POST` | `/api/age-gate`  | Age gate only         |
| `GET`  | `/api/health`    | Health check          |

All endpoints accept `multipart/form-data` with an `idImage` field. No auth required. CORS enabled for all origins.

---

## Packages

### npm — `@daddymaou/idverify`

```bash
npm install @daddymaou/idverify
```

```typescript
import { verifyId, checkAge } from '@daddymaou/idverify';

const result = await verifyId(buffer);
```

Full docs: [`packages/idverify/README.md`](packages/idverify/README.md)

### Python — `idverify`

```bash
pip install idverify
```

```python
from idverify import verify_id, check_age

result = verify_id(buffer)
```

Full docs: [`packages/idverify-py/README.md`](packages/idverify-py/README.md)

---

## Tech Stack

| Layer            | Stack                                                              |
|-------------------|---------------------------------------------------------------------|
| Frontend          | React 18, Vite 5, TypeScript, Tailwind CSS                         |
| Backend           | Express 4, TypeScript, multer, tesseract.js, mrz, sharp, exifr     |
| Python package    | OpenCV, Pillow, pytesseract, mrz, exifread                         |
| Design            | Brutalist black-and-white, Inter + JetBrains Mono, zero border-radius |
| Deployment        | Vercel (web) · Render (API) · npm (JS) · PyPI (Python)             |

---

## Live Deployments

| Service         | URL                                                                | Status    |
|------------------|---------------------------------------------------------------------|-----------|
| Web App          | [idverify-app.vercel.app](https://idverify-app.vercel.app)          | ✅ Live   |
| API              | [idverify-api.onrender.com](https://idverify-api.onrender.com)      | ✅ Live   |
| npm Package      | [@daddymaou/idverify](https://www.npmjs.com/package/@daddymaou/idverify) | ✅ Published |
| Python Package   | [idverify](https://pypi.org/project/idverify)                       | ✅ Published |

---

## License

MIT