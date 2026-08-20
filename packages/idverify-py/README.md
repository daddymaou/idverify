# idverify

> ID verification library — OCR, MRZ parsing, screenshot detection, and age gate for government IDs.

Built by [ᗰᗩOᑌ](https://maou.name.ng) · [GitHub](https://github.com/daddymaou/idverify)

## Install

```bash
pip install idverify
```

## Usage

```python
from idverify import verify_id, check_age

with open('./passport.jpg', 'rb') as f:
    buffer = f.read()

# Full verification
result = verify_id(buffer)
print(result.status)                 # "valid" | "expired" | "invalid"
print(result.documentType)           # "passport" | "drivers_license" | ...
print(result.checksum)               # "passed" | "failed" | "not_applicable"
print(result.screenshotDetected)     # False

# Age gate only (no birthdate exposed)
age = check_age(buffer)
print(age.over18)  # True
print(age.over21)  # False
```

## API

### `verify_id(buffer: bytes) -> VerificationResult`

Accepts an image buffer (PNG, JPG, WebP). Returns:

| Field | Type | Description |
|---|---|---|
| `id` | `str` | Unique scan UUID |
| `documentType` | `str` | passport / drivers_license / national_id / unknown |
| `issuingCountry` | `str` | ISO country code |
| `expiryDate` | `str \| None` | YYYY-MM-DD |
| `status` | `str` | valid / expired / invalid |
| `checksum` | `str` | passed / failed / not_applicable |
| `screenshotDetected` | `bool` | EXIF-based detection |
| `confidence` | `int` | 0–100 |
| `over18` | `bool \| None` | None if DOB not found |
| `over21` | `bool \| None` | None if DOB not found |

### `check_age(buffer: bytes) -> AgeGateResult`

Returns `{ over18: bool, over21: bool }` without exposing the full birthdate.

## How it works

1. **Preprocessing** — OpenCV resizes, grayscales, normalizes, and sharpens the image
2. **OCR** — pytesseract extracts all text
3. **MRZ parsing** — looks for Machine Readable Zone lines, validates checksums with the `mrz` package
4. **Fallback extraction** — regex-based date and country parsing if no MRZ found
5. **Screenshot detection** — exifread checks for camera EXIF metadata (Make, Model)
6. **Age gate** — calculates age from DOB without returning the raw date

## Requirements

- Python 3.9+
- Tesseract OCR installed on your system

### Install Tesseract

| OS | Command |
|---|---|
| **macOS** | `brew install tesseract` |
| **Ubuntu/Debian** | `sudo apt-get install tesseract-ocr` |
| **Windows** | Download from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki) |

## License

MIT