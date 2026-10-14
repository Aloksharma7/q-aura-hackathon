"""Run: python test_urls.py  -> prints accuracy and a confusion matrix."""
from predict import predict_url

# (url, expected label)
CASES = [
    # Safe
    ("https://www.google.com", "Safe"),
    ("https://github.com/login", "Safe"),
    ("https://www.paypal.com/signin", "Safe"),
    ("https://accounts.google.com/signin", "Safe"),
    ("https://login.microsoftonline.com", "Safe"),
    ("https://amazon.com", "Safe"),
    ("https://www.wikipedia.org/wiki/Account", "Safe"),
    ("https://stackoverflow.com/questions", "Safe"),
    ("https://www.linkedin.com/in/someone", "Safe"),
    ("https://www.youtube.com/watch?v=abc123", "Safe"),
    # Suspicious
    ("http://free-gift-cards.top/claim", "Suspicious"),
    ("http://g00gle.com", "Suspicious"),
    ("http://xn--pypal-4ve.com", "Suspicious"),
    ("http://example.com/a@evil.com", "Suspicious"),
    ("http://cheap-deals-today.xyz", "Suspicious"),
    # Malicious
    ("http://paypa1-secure-login.com/verify", "Malicious"),
    ("http://192.168.1.5/login", "Malicious"),
    ("https://paypal.com.evil.tk/signin", "Malicious"),
    ("https://google.com.verify-account.ru/", "Malicious"),
    ("https://secure-update-account.xyz/login.php", "Malicious"),
    ("http://micr0soft-support-verify.top/password", "Malicious"),
    ("http://paypal.com@evil.com/login", "Malicious"),
]

LABELS = ["Safe", "Suspicious", "Malicious"]


def main():
    matrix = {e: {p: 0 for p in LABELS} for e in LABELS}
    correct = 0
    for url, expected in CASES:
        got = predict_url(url)["label"]
        matrix[expected][got] += 1
        correct += got == expected
        if got != expected:
            print(f"MISS  expected {expected:<10} got {got:<10} {url}")

    print(f"\nAccuracy: {correct}/{len(CASES)} = {correct / len(CASES):.0%}\n")
    print(f"{'expected \\ predicted':<22}" + "".join(f"{p:<12}" for p in LABELS))
    for e in LABELS:
        print(f"{e:<22}" + "".join(f"{matrix[e][p]:<12}" for p in LABELS))


if __name__ == "__main__":
    main()
