# AI-Based Malicious URL Detection

Classifies a URL as **Safe**, **Suspicious** or **Malicious** and explains why.

## How it works

1. **ML model** (`backend/model.onnx`): TF-IDF text features + linear classifiers read the raw URL and output a phishing probability.
2. **Rule-based indicators** (`backend/predict.py`) add explainable signals:
   - Strong: IP-address host, many subdomain levels, brand lookalike (e.g. `paypa1`), `@` in the domain part, punycode (`xn--`).
   - Weak: very long URL, no HTTPS, sensitive keywords (`login`, `verify`...), suspicious TLD (`.xyz`, `.top`...), many hyphens.
3. **Trusted-domain list**: well-known sites (google.com, github.com...) are marked Safe unless a strong red flag appears. Matching is on the exact registered domain, so `paypal.com.evil.tk` is not trusted.
4. **Final score** = model probability + 0.15 per strong indicator + 0.05 per weak indicator.
   - `>= 0.85` Malicious
   - `>= 0.40`, or any strong indicator, or 2+ weak indicators: Suspicious
   - otherwise Safe

## Setup

Requires Python 3.10+ and Node.js 18+.

```bash
pip install -r requirements.txt     # model dependencies
cd backend && npm install           # Express API
cd ../frontend && npm install       # Next.js app
```

## Run

Two terminals:

```bash
cd backend && npm start             # API on http://localhost:5000
cd frontend && npm run dev          # website on http://localhost:3000
```

Open http://localhost:3000, paste a URL and press **Check link**.

Settings (optional): `PORT`, `PYTHON` (python executable) and `FRONTEND_ORIGIN` for the API; `NEXT_PUBLIC_API_URL` for the frontend.

## API

`POST /api/analyze` with `{ "url": "http://paypa1-secure-login.com/verify" }` returns:

- `label` (Safe / Suspicious / Malicious), `prediction` (1 / 2 / 3)
- `phishing_score` (model only) and `adjusted_score` (final risk, 0 to 1)
- `flags`: each risk indicator with `severity` and a plain-language `detail`
- `features`: URL length, dots, hyphens, digits, special characters, HTTPS, domain

Bad input returns HTTP 400 with `{ "error": "..." }`.

## Command line and tests

```bash
cd backend
python predict.py "https://www.wikipedia.org"
python test_urls.py                 # accuracy + confusion matrix on 22 sample URLs
```

## Project layout

```
backend/
  model.onnx      pretrained classifier
  predict.py      feature rules + scoring (run by the API)
  server.js       Express API, calls predict.py
  test_urls.py    sample test set
frontend/         Next.js + Tailwind website
problemstatement.txt
requirements.txt
```

## Known limitations

- The model reads URL text only; it has no knowledge of domain reputation or age. The trusted-domain list compensates for well-known sites.
- Unknown legitimate sites can still be flagged.
- Each request starts a new Python process (about 1 second). A long-running model service would be faster.
