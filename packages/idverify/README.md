# idverify

> ID verification library — OCR, MRZ parsing, screenshot detection, and age gate for government IDs.

Built by [ᗰᗩOᑌ](https://maou.name.ng) · [GitHub](https://github.com/daddymaou/idverify)

## Install

```bash
npm install @daddymaou/idverify
```

## Usage

```typescript
import { verifyId, checkAge } from '@daddymaou/idverify';
import { readFileSync } from 'fs';

const buffer = readFileSync('./passport.jpg');

// Full verification
const result = await verifyId(buffer);
console.log(result.status);          // "valid" | "expired" | "invalid"
console.log(result.documentType);    // "passport" | "drivers_license" | ...
console.log(result.checksum);        // "passed" | "failed" | "not_applicable"
console.log(result.screenshotDetected); // false

// Age gate only (no birthdate exposed)
const age = await checkAge(buffer);
console.log(age.over18); // true
console.log(age.over21); // false
```

## API

### `verifyId(buffer: Buffer): Promise<VerificationResult>`

Accepts an image buffer (PNG, JPG, WebP). Returns:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique scan UUID |
| `documentType` | `string` | passport / drivers_license / national_id / unknown |
| `issuingCountry` | `string` | ISO country code |
| `expiryDate` | `string \| null` | YYYY-MM-DD |
| `status` | `string` | valid / expired / invalid |
| `checksum` | `string` | passed / failed / not_applicable |
| `screenshotDetected` | `boolean` | EXIF-based detection |
| `confidence` | `number` | 0–100 |
| `over18` | `boolean \| null` | null if DOB not found |
| `over21` | `boolean \| null` | null if DOB not found |

### `checkAge(buffer: Buffer): Promise<AgeGateResult>`

Returns `{ over18: boolean, over21: boolean }` without exposing the full birthdate.

## How it works

1. **Preprocessing** — sharp resizes, grayscales, normalizes, and sharpens the image
2. **OCR** — tesseract.js extracts all text
3. **MRZ parsing** — looks for Machine Readable Zone lines, validates checksums with the `mrz` package
4. **Fallback extraction** — regex-based date and country parsing if no MRZ found
5. **Screenshot detection** — exifr checks for camera EXIF metadata (Make, Model)
6. **Age gate** — calculates age from DOB without returning the raw date

## Requirements

- Node.js 18+
- The `sharp` package requires a native build — `npm install` handles this automatically

## License

MIT