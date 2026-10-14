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

```bash
pip install -r requirements.txt
```

## Usage

```bash
cd backend
python predict.py "https://www.wikipedia.org"
```

Output (JSON): `label`, `prediction` (1 Safe, 2 Suspicious, 3 Malicious), `phishing_score`, `adjusted_score` and `indicators` (the reasons).

From Python:

```python
from predict import predict_url
print(predict_url("http://paypa1-secure-login.com/verify"))
```

## Testing

```bash
cd backend
python test_urls.py
```

Prints accuracy and a confusion matrix for a small hand-written set of 22 URLs. This is a sanity check, not a benchmark.

## Project layout

```
backend/
  model.onnx      pretrained classifier
  predict.py      feature rules + scoring + CLI
  test_urls.py    sample test set
problemstatement.txt
requirements.txt
```

## Known limitations

- The model reads URL text only; it has no knowledge of domain reputation or age. The trusted-domain list compensates for well-known sites.
- Unknown legitimate sites can still be flagged.
- Frontend and API are not built yet.
