import Scanner from "@/components/Scanner";

// Weights mirror backend/predict.py
const STRONG = ["IP address as the host", "Brand look-alike (paypa1, g00gle)", "@ before the real domain", "Punycode (xn--) in the host", "4+ dots in the host"];
const WEAK = ["No HTTPS", "URL longer than 100 characters", "login / verify / bank in the URL", "Cheap TLD (.xyz, .top, .tk)", "3+ hyphens in the host"];

const STEPS = [
  ["A model reads the text", "It turns the link into text features and returns a phishing probability. It has never heard of a famous website, though."],
  ["Rules add context", "Plain checks nudge the score up. Well-known domains skip the keyword and look-alike checks."],
  ["The score picks a verdict", "85 and up is Malicious. 40 and up, or any strong hit, is Suspicious. Anything else is Safe."],
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-semibold tracking-tight">
          PhishGuard<span className="text-muted">AI</span>
        </span>
        <a href="#how" className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-black/5 hover:text-ink">
          How it works
        </a>
      </header>

      <main>
        <Scanner />

        <section id="how" className="mx-auto mt-32 max-w-3xl scroll-mt-6 px-5">
          <h2 className="font-display text-3xl font-semibold tracking-tight">How it works</h2>

          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="font-display text-4xl font-semibold text-ink/20">{i + 1}</span>
                <h3 className="mt-2 font-medium">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>

          <details className="group mt-10 rounded-2xl border border-line bg-white">
            <summary className="cursor-pointer select-none px-5 py-4 font-medium">See every rule</summary>
            <div className="grid gap-8 px-5 pb-6 pt-1 sm:grid-cols-2">
              {[
                ["Strong signs", "+15 points each", STRONG],
                ["Weak signs", "+5 points each", WEAK],
              ].map(([title, weight, list]) => (
                <div key={title}>
                  <h3 className="font-medium">
                    {title} <span className="font-normal text-muted">{weight}</span>
                  </h3>
                  <ul className="mt-2 divide-y divide-line text-[15px]">
                    {list.map((item) => (
                      <li key={item} className="py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </section>
      </main>

      <footer className="mx-auto mt-24 max-w-3xl px-5 pb-12 text-sm text-muted">
        A decision aid, not a guarantee. If in doubt, don&apos;t enter personal details.
      </footer>
    </>
  );
}
