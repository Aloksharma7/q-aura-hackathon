"use client";

import { useRef, useState } from "react";
import { Link, Search, Warning } from "./Icons";
import ResultPanel from "./ResultPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EXAMPLES = [
  { text: "github.com/login", tone: "Safe" },
  { text: "free-gift-cards.top/claim", tone: "Suspicious" },
  { text: "http://paypa1-secure-login.com/verify", tone: "Malicious" },
  { text: "http://192.168.1.5/login", tone: "Malicious" },
];

const TONES = {
  Safe: "bg-emerald-400",
  Suspicious: "bg-amber-400",
  Malicious: "bg-rose-400",
};

async function analyzeUrl(url) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error("Cannot reach the analysis server. Make sure the backend is running.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  async function check(value) {
    const target = value.trim();
    if (!target || loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await analyzeUrl(target);
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setResult(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(url);
        }}
        className="mx-auto w-full max-w-3xl"
      >
        <label htmlFor="url" className="sr-only">
          Website address to check
        </label>
        <div className="relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-2 shadow-2xl shadow-teal-950/40 backdrop-blur focus-within:border-teal-400/60 sm:flex-row sm:items-center">
          <Link className="ml-3 hidden shrink-0 text-slate-400 sm:block" width={22} height={22} />
          <input
            id="url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a link, e.g. https://example.com/login"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none sm:px-0"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search width={20} height={20} />
            {loading ? "Checking..." : "Check link"}
          </button>
          {loading && (
            <div className="absolute inset-x-2 bottom-0 h-0.5 overflow-hidden rounded-full">
              <div className="animate-scan h-full w-1/4 bg-teal-300" />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-slate-400">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.text}
              type="button"
              onClick={() => {
                setUrl(ex.text);
                check(ex.text);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-300 transition hover:border-white/25 hover:text-white"
            >
              <span className={`h-2 w-2 rounded-full ${TONES[ex.tone]}`} />
              {ex.text}
            </button>
          ))}
        </div>
      </form>

      <div ref={resultRef} className="mx-auto mt-10 w-full max-w-5xl scroll-mt-6">
        {error && (
          <div role="alert" className="animate-fade-up flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-100">
            <Warning className="mt-0.5 shrink-0 text-rose-300" width={22} height={22} />
            <p>{error}</p>
          </div>
        )}
        {result && !error && <ResultPanel result={result} />}
      </div>
    </>
  );
}
