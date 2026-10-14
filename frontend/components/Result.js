"use client";

import { useState } from "react";
import { ScoreRing } from "./Ring";

const VERDICT = {
  Safe: {
    title: "Looks safe",
    summary: "We didn't find anything suspicious in this link. Still, check the site name before you type anything private.",
    panel: "bg-ok-tint border-ok-edge text-ok",
    dot: "bg-ok",
    steps: ["Open it normally.", "Never type a password into a page you reached from a message."],
  },
  Suspicious: {
    title: "Be careful",
    summary: "Some things about this link look off. Treat it as unsafe until you have checked it another way.",
    panel: "bg-warn-tint border-warn-edge text-warn",
    dot: "bg-warn",
    steps: [
      "Don't enter passwords, card numbers or personal details.",
      "Go to the site by typing its address yourself.",
      "If it came in a message, confirm with the sender another way.",
    ],
  },
  Malicious: {
    title: "Don't open this link",
    summary: "This link has strong signs of phishing or fraud. Opening it or entering details could cost you your accounts or money.",
    panel: "bg-bad-tint border-bad-edge text-bad",
    dot: "bg-bad",
    steps: [
      "Don't click it or enter anything.",
      "Delete the message and report it as phishing.",
      "If you already entered a password, change it now and turn on two-step login.",
    ],
  },
};

const SEVERITY = {
  high: { label: "High risk", dot: "bg-bad", text: "text-bad" },
  medium: { label: "Warning", dot: "bg-warn", text: "text-warn" },
  good: { label: "Good sign", dot: "bg-ok", text: "text-ok" },
};
const ORDER = { high: 0, medium: 1, good: 2 };

// The URL with the real host picked out, so you can see where the link really goes.
function HighlightedUrl({ url, host }) {
  const i = host ? url.toLowerCase().indexOf(host) : -1;
  if (i < 0) return <span>{url}</span>;
  return (
    <>
      <span className="text-muted">{url.slice(0, i)}</span>
      <span className="rounded bg-ink px-1 text-paper">{url.slice(i, i + host.length)}</span>
      <span className="text-muted">{url.slice(i + host.length)}</span>
    </>
  );
}

function Fact({ label, value, warn }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-mono text-[13px] ${warn ? "font-medium text-warn" : ""}`}>{value}</dd>
    </div>
  );
}

export default function Result({ result, onAgain }) {
  const [copied, setCopied] = useState(false);
  const v = VERDICT[result.label] || VERDICT.Suspicious;
  const f = result.features;
  const score = Math.round(result.adjusted_score * 100);
  const trusted = result.flags.some((x) => x.severity === "good");
  const flags = [...result.flags].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <article>
      {/* verdict */}
      <section className={`rise rounded-[2rem] border p-6 sm:p-9 ${v.panel}`}>
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <ScoreRing score={score} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{v.title}</h2>
            <p className="mt-2 max-w-xl text-lg leading-snug text-ink/75">{v.summary}</p>
          </div>
        </div>
        <p className="mt-7 break-all rounded-2xl bg-white/70 px-4 py-3 font-mono text-[13px] text-ink sm:text-sm" title={result.url}>
          <HighlightedUrl url={result.url} host={f.host} />
        </p>
      </section>

      {/* findings timeline */}
      <section className="rise-2 mt-12">
        <h3 className="font-display text-2xl font-semibold">What we found</h3>
        <ol className="relative mt-6 ml-2 border-l border-line">
          {flags.map((flag) => {
            const s = SEVERITY[flag.severity];
            return (
              <li key={flag.title} className="relative pb-7 pl-7 last:pb-0">
                <span className={`absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-paper ${s.dot}`} />
                <p className={`text-xs font-semibold uppercase tracking-wider ${s.text}`}>{s.label}</p>
                <p className="mt-0.5 text-lg font-medium leading-snug">{flag.title}</p>
                <p className="mt-1 max-w-xl text-muted">{flag.detail}</p>
              </li>
            );
          })}
          <li className="relative pl-7 pt-7">
            <span className="absolute -left-[7px] top-8.5 h-3.5 w-3.5 rounded-full bg-muted/40 ring-4 ring-paper" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">AI model</p>
            <p className="mt-0.5 text-lg font-medium leading-snug">
              {Math.round(result.phishing_score * 100)}% phishing probability
            </p>
            <p className="mt-1 max-w-xl text-muted">
              A model trained on phishing links reads the text of the address.
              {trusted && result.phishing_score >= 0.4 && " It is unsure about this one, but the domain is well known, so the verdict stays Safe."}
            </p>
          </li>
        </ol>
      </section>

      {/* what to do */}
      <section className="rise-3 mt-14">
        <h3 className="font-display text-2xl font-semibold">What to do</h3>
        <ol className="mt-5 space-y-3">
          {v.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4 rounded-2xl border border-line bg-white px-5 py-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">{i + 1}</span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onAgain} className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-black">
            Check another link
          </button>
          <button onClick={copy} className="rounded-full border border-line bg-white px-6 py-3 font-medium transition-colors hover:border-ink">
            {copied ? "Copied" : "Copy report"}
          </button>
        </div>
      </section>

      {/* technical details, out of the way */}
      <details className="mt-12 rounded-2xl border border-line bg-white open:pb-2">
        <summary className="cursor-pointer select-none px-5 py-4 font-medium">Technical details</summary>
        <div className="px-5">
          <dl className="grid gap-x-10 sm:grid-cols-2">
            <Fact label="Domain" value={f.domain} />
            <Fact label="Scheme" value={f.https ? "https" : "http"} warn={!f.https} />
            <Fact label="Length" value={f.length} warn={f.length > 100} />
            <Fact label="Dots in host" value={f.dots} warn={f.dots >= 4} />
            <Fact label="Hyphens in host" value={f.hyphens} warn={f.hyphens >= 3} />
            <Fact label="Digits in host" value={f.digits} />
            <Fact label="Special characters" value={f.special_chars} warn={f.special_chars > 0} />
            <Fact label="Risk score" value={`${score} / 100`} />
          </dl>
          <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-paper p-3 font-mono text-xs leading-relaxed">{JSON.stringify(result, null, 2)}</pre>
        </div>
      </details>
    </article>
  );
}
