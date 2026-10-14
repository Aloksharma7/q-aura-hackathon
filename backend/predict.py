import sys
import json
import re
import ipaddress
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
import onnxruntime as ort

MODEL_PATH = Path(__file__).parent / "model.onnx"

_session = None


def get_session():
    """Load the model on first use so importing this file never crashes."""
    global _session
    if _session is None:
        _session = ort.InferenceSession(
            str(MODEL_PATH),
            providers=["CPUExecutionProvider"]
        )
    return _session


# ---------------------------------------------------------------------------
# Config (tune these against labeled data)
# ---------------------------------------------------------------------------
MALICIOUS_THRESHOLD = 0.85      # adjusted score at/above this -> Malicious
SUSPICIOUS_THRESHOLD = 0.40     # adjusted score at/above this -> Suspicious
STRONG_WEIGHT = 0.15            # score boost per strong indicator
WEAK_WEIGHT = 0.05              # score boost per weak indicator
TRUSTED_SCORE_CAP = 0.10        # trusted domains never score above this

# Well-known sites the ML model cannot recognise from text alone.
# Matched against the exact registered domain, so paypal.com.evil.tk is NOT trusted.
LEGIT_BRAND_DOMAINS = {
    "google.com", "paypal.com", "microsoft.com", "microsoftonline.com",
    "live.com", "office.com", "apple.com", "amazon.com", "facebook.com",
    "instagram.com", "twitter.com", "x.com", "linkedin.com", "github.com",
    "youtube.com", "wikipedia.org", "netflix.com", "dropbox.com",
    "stackoverflow.com", "reddit.com", "whatsapp.com", "yahoo.com",
    "ebay.com", "adobe.com", "zoom.us", "slack.com",
}

BRAND_PATTERNS = [r"paypa[l1]", r"g[o0]{2}gle", r"micr[o0]s[o0]ft"]

RISKY_WORDS = [
    "login", "verify", "secure", "account",
    "update", "password", "bank", "signin",
]

# Cheap TLDs that are heavily abused for scams
SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq",
    "click", "icu", "work", "support", "zip",
}

TRUSTED = "Trusted well-known domain"

STRONG = {
    "IP-address hostname",
    "Many subdomain levels",
    "Possible brand-name lookalike",
    "Contains @ in URL authority",
    "Punycode (disguised characters) in hostname",
}
WEAK = {
    "Unusually long URL",
    "Not using HTTPS",
    "Contains sensitive-action keywords",
    "Suspicious top-level domain",
    "Many hyphens in hostname",
}

# Common two-part public suffixes (extend as needed, or use tldextract)
TWO_PART_SUFFIXES = {"co.uk", "com.au", "co.in", "co.jp", "com.br", "org.uk"}


def registered_domain(host):
    parts = host.split(".")
    if len(parts) >= 3 and ".".join(parts[-2:]) in TWO_PART_SUFFIXES:
        return ".".join(parts[-3:])
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


def analyze_url(url):
    try:
        parsed = urlparse(url if "://" in url else "https://" + url)
        host = (parsed.hostname or "").lower().rstrip(".")
    except ValueError:
        return None, ["Invalid or malformed URL"]

    indicators = []

    if not host:
        return None, ["Invalid or missing hostname"]

    trusted = registered_domain(host) in LEGIT_BRAND_DOMAINS
    if trusted:
        indicators.append(TRUSTED)

    try:
        ipaddress.ip_address(host)
        indicators.append("IP-address hostname")
    except ValueError:
        pass

    if len(url) > 100:
        indicators.append("Unusually long URL")

    if host.count(".") >= 4:
        indicators.append("Many subdomain levels")

    if "@" in parsed.netloc:
        indicators.append("Contains @ in URL authority")

    if parsed.scheme != "https":
        indicators.append("Not using HTTPS")

    # Keywords like "login" are normal on real sites, so only flag unknown domains
    if not trusted and any(word in url.lower() for word in RISKY_WORDS):
        indicators.append("Contains sensitive-action keywords")

    if "xn--" in host:
        indicators.append("Punycode (disguised characters) in hostname")

    if host.rsplit(".", 1)[-1] in SUSPICIOUS_TLDS:
        indicators.append("Suspicious top-level domain")

    if host.count("-") >= 3:
        indicators.append("Many hyphens in hostname")

    # Lookalike heuristic; skip the genuine brand domains themselves
    if not trusted and any(re.search(p, host) for p in BRAND_PATTERNS):
        indicators.append("Possible brand-name lookalike")

    return parsed, indicators


def get_phishing_score(url):
    session = get_session()
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: np.array([url], dtype=str)})

    result = outputs[1][0]

    # ZipMap-style output: dict of class -> probability
    if isinstance(result, dict):
        for key in (1, "1", "phishing", "bad", "malicious", "unsafe"):
            if key in result:
                return float(result[key])
        raise ValueError(f"Could not find phishing class in model output keys: {list(result.keys())}")

    # Plain array output: [P(class0), P(class1)]
    result = np.asarray(result).ravel()
    if result.size >= 2:
        return float(result[1])
    return float(result[0])


def classify(score, indicators):
    strong = sum(i in STRONG for i in indicators)
    weak = sum(i in WEAK for i in indicators)

    # Heuristics nudge the model score instead of gating it
    adjusted = min(1.0, score + STRONG_WEIGHT * strong + WEAK_WEIGHT * weak)

    # Known-good domain with no red flags: trust reputation over the text model
    if TRUSTED in indicators and strong == 0:
        return 1, "Safe", min(score, TRUSTED_SCORE_CAP)

    if adjusted >= MALICIOUS_THRESHOLD:
        return 3, "Malicious", adjusted
    if adjusted >= SUSPICIOUS_THRESHOLD or strong >= 1 or weak >= 2:
        return 2, "Suspicious", adjusted
    return 1, "Safe", adjusted


def predict_url(url):
    url = url.strip() if isinstance(url, str) else ""
    parsed, indicators = analyze_url(url) if url else (None, ["Empty URL"])

    if parsed is None:
        return {
            "url": url,
            "prediction": 2,
            "label": "Suspicious",
            "phishing_score": None,
            "adjusted_score": None,
            "indicators": indicators,
        }

    score = get_phishing_score(url)
    prediction, label, adjusted = classify(score, indicators)
    indicators.append(f"ML model phishing probability: {score:.0%}")

    return {
        "url": url,
        "prediction": prediction,
        "label": label,
        "phishing_score": round(score, 4),
        "adjusted_score": round(adjusted, 4),
        "indicators": indicators,
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python predict.py <URL>"}))
        sys.exit(1)

    try:
        print(json.dumps(predict_url(sys.argv[1])))
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)