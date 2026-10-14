"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "./Confetti";
import Result from "./Result";
import { Spinner } from "./Ring";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const HISTORY_KEY = "phishguard-history";
const HISTORY_MAX = 5;
const MIN_SCAN_MS = 1800; // keep the checking state on screen long enough to read

const EXAMPLES = ["github.com/login", "free-gift-cards.top/claim", "http://paypa1-secure-login.com/verify"];
const STEPS = ["Reading the address", "Looking at the domain", "Asking the AI model", "Applying the rules"];
const DOT = { Safe: "bg-ok", Suspicious: "bg-warn", Malicious: "bg-bad" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function analyzeUrl(url) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error("Can't reach the API. Is the backend running on " + API_URL + "?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | scanning | done | error
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const runRef = useRef(0); // lets a newer check cancel an older one

  useEffect(() => {
    setHistory(loadHistory());
    // "/" jumps to the input
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // cycle the status text while scanning
  useEffect(() => {
    if (phase !== "scanning") return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 520);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  function remember(data) {
    const entry = { url: data.url, label: data.label, score: Math.round(data.adjusted_score * 100) };
    const next = [entry, ...loadHistory().filter((h) => h.url !== entry.url)].slice(0, HISTORY_MAX);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  }

  async function check(value) {
    const target = value.trim();
    if (!target || phase === "scanning") return;
    const run = ++runRef.current;

    setUrl(target);
    setError("");
    setResult(null);
    setPhase("scanning");
    inputRef.current?.blur();

    try {
      const [data] = await Promise.all([analyzeUrl(target), sleep(MIN_SCAN_MS)]);
      if (runRef.current !== run) return;
      setResult(data);
      remember(data);
      setPhase("done");
    } catch (e) {
      if (runRef.current !== run) return;
      setError(e.message);
      setPhase("error");
    }
  }

  function reset() {
    runRef.current++;
    setUrl("");
    setPhase("idle");
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 400);
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }

  const busy = phase === "scanning";
  const idle = phase === "idle";
  const showRecent = focused && !url && history.length > 0 && !busy;

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      {/* headline folds away after the first check, so the box stays up top */}
      <div className={`grid transition-all duration-500 ${idle ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="pb-9 pt-14 text-center sm:pt-24">
            <h1 className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Is this link safe?
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-snug text-muted">
              Paste any link. We&apos;ll tell you if it&apos;s safe, suspicious or malicious, and show you why.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(url);
        }}
        className={`relative transition-[padding] duration-500 ${idle ? "pt-0" : "pt-8"}`}
      >
        <label htmlFor="url" className="sr-only">
          Link to check
        </label>
        <div className="flex items-center gap-2 rounded-full bg-white py-2 pl-6 pr-2 shadow-[0_10px_40px_-12px_rgba(21,23,26,0.18)] ring-1 ring-black/[0.06] transition-shadow focus-within:ring-2 focus-within:ring-ink">
          <input
            id="url"
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => e.key === "Escape" && reset()}
            placeholder="https://example.com/login"
            className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[15px] placeholder:text-ink/30 focus:outline-none disabled:opacity-60 sm:text-base"
          />
          {!url && !focused && <kbd className="hidden rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted sm:block">/</kbd>}
          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-all hover:bg-black active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {busy ? "Checking" : "Check"}
          </button>
        </div>

        {/* recent checks pop up when you focus the empty box */}
        {showRecent && (
          <div className="swap absolute inset-x-3 top-full z-20 mt-2 overflow-hidden rounded-3xl bg-white p-2 shadow-[0_20px_50px_-15px_rgba(21,23,26,0.25)] ring-1 ring-black/[0.06]">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted">
              <span className="font-medium uppercase tracking-wider">Recent</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearHistory} className="hover:text-ink">
                Clear
              </button>
            </div>
            {history.map((h) => (
              <button
                key={h.url}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => check(h.url)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-paper"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[h.label] || "bg-muted"}`} />
                <span className="min-w-0 flex-1 truncate font-mono text-sm">{h.url}</span>
                <span className="shrink-0 text-xs text-muted">{h.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted">Try</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={busy}
              onClick={() => check(ex)}
              className="rounded-full border border-line bg-white/60 px-3.5 py-1.5 font-mono text-[13px] transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-white disabled:opacity-40"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      <div ref={resultRef} className="scroll-mt-6 pt-12" aria-live="polite">
        {busy && (
          <div className="swap flex flex-col items-center py-10 text-ink">
            <Spinner />
            <p key={step} className="swap mt-6 text-lg text-muted">
              {STEPS[step]}...
            </p>
          </div>
        )}

        {phase === "error" && (
          <p role="alert" className="swap rounded-3xl border border-bad-edge bg-bad-tint px-6 py-5 text-bad">
            {error}
          </p>
        )}

        {phase === "done" && result && (
          <>
            {result.label === "Safe" && <Confetti key={result.url} />}
            <Result key={result.url + result.adjusted_score} result={result} onAgain={reset} />
          </>
        )}
      </div>
    </div>
  );
}
