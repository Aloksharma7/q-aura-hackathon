import { Check, Cpu, Lock, ShieldAlert, ShieldCheck, ShieldX, Warning } from "./Icons";

// Everything that differs between the three verdicts lives here.
const VERDICTS = {
  Safe: {
    Icon: ShieldCheck,
    title: "This link looks safe",
    text: "We found no major warning signs. Stay alert, and only share details if you trust the site.",
    banner: "border-emerald-500/30 from-emerald-500/15",
    iconBox: "bg-emerald-500/15 text-emerald-400",
    chip: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    advice: [
      "You can open the link normally.",
      "Check that the address bar shows the site you expect.",
      "Never share a password you were asked for by email or chat.",
    ],
  },
  Suspicious: {
    Icon: ShieldAlert,
    title: "Be careful with this link",
    text: "Some warning signs were detected. Do not enter passwords or payment details unless you are sure.",
    banner: "border-amber-500/30 from-amber-500/15",
    iconBox: "bg-amber-500/15 text-amber-400",
    chip: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    advice: [
      "Do not enter passwords, card or personal details.",
      "Go to the website by typing its address yourself.",
      "If it came in a message, confirm with the sender another way.",
    ],
  },
  Malicious: {
    Icon: ShieldX,
    title: "Dangerous link. Do not open it",
    text: "This link shows strong signs of phishing or fraud. Opening it or entering details could cost you your accounts or money.",
    banner: "border-rose-500/40 from-rose-500/20",
    iconBox: "bg-rose-500/15 text-rose-400",
    chip: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    advice: [
      "Do not click the link or enter any information.",
      "Delete the message and report it as phishing.",
      "If you already entered a password, change it now and enable two-step login.",
    ],
  },
};

const SEVERITY = {
  high: { label: "High risk", chip: "bg-rose-500/15 text-rose-300 ring-rose-500/30", dot: "bg-rose-400" },
  medium: { label: "Warning", chip: "bg-amber-500/15 text-amber-300 ring-amber-500/30", dot: "bg-amber-400" },
  good: { label: "Trusted", chip: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30", dot: "bg-emerald-400" },
};

function RiskMeter({ score }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="text-sm font-medium text-slate-300">Risk score</p>
        <p className="text-3xl font-semibold tabular-nums text-white">
          {pct}
          <span className="text-base text-slate-400"> / 100</span>
        </p>
      </div>
      <div className="relative mt-4">
        <div className="flex h-3 overflow-hidden rounded-full">
          <div className="bg-emerald-500/80" style={{ width: "40%" }} />
          <div className="bg-amber-500/80" style={{ width: "45%" }} />
          <div className="bg-rose-500/80" style={{ width: "15%" }} />
        </div>
        <div
          className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(5,11,20,0.9)] transition-all duration-700"
          style={{ left: `${Math.min(Math.max(pct, 1), 99)}%` }}
        />
      </div>
      <div className="mt-2 flex text-xs text-slate-400">
        <span style={{ width: "40%" }}>Safe</span>
        <span style={{ width: "45%" }}>Suspicious</span>
        <span style={{ width: "15%" }} className="text-right">
          Malicious
        </span>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur ${className}`}>
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>}
      {children}
    </section>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${warn ? "text-amber-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

export default function ResultPanel({ result }) {
  const v = VERDICTS[result.label] || VERDICTS.Suspicious;
  const f = result.features;
  const warnings = result.flags.filter((x) => x.severity !== "good");
  const trusted = result.flags.find((x) => x.severity === "good");

  return (
    <div className="animate-fade-up space-y-5" aria-live="polite">
      {/* Verdict banner */}
      <div className={`flex flex-col gap-5 rounded-2xl border bg-linear-to-br to-transparent p-6 sm:flex-row sm:items-center sm:p-8 ${v.banner}`}>
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${v.iconBox}`}>
          <v.Icon width={36} height={36} />
        </div>
        <div className="min-w-0 flex-1">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ${v.chip}`}>
            {result.label}
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{v.title}</h2>
          <p className="mt-2 max-w-2xl text-slate-300">{v.text}</p>
          <p className="mt-4 truncate rounded-lg bg-black/30 px-3 py-2 font-mono text-sm text-slate-300" title={result.url}>
            {result.url}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <RiskMeter score={result.adjusted_score} />
          </Card>

          <Card title="Why we say this">
            {trusted && (
              <div className="mb-3 flex items-start gap-3 rounded-xl bg-emerald-500/10 p-4">
                <Check className="mt-0.5 shrink-0 text-emerald-400" width={20} height={20} />
                <div>
                  <p className="font-medium text-emerald-200">{trusted.title}</p>
                  <p className="text-sm text-slate-300">{trusted.detail}</p>
                </div>
              </div>
            )}
            {warnings.length === 0 && !trusted && (
              <p className="flex items-center gap-2 text-slate-300">
                <Check className="text-emerald-400" width={20} height={20} /> No warning signs were detected in this address.
              </p>
            )}
            <ul className="space-y-3">
              {warnings.map((flag) => {
                const s = SEVERITY[flag.severity];
                return (
                  <li key={flag.title} className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-4">
                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-white">{flag.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${s.chip}`}>{s.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{flag.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex items-start gap-2 text-sm text-slate-400">
              <Cpu className="mt-0.5 shrink-0" width={18} height={18} />
              <span>
                AI model phishing probability: <span className="font-semibold text-slate-200">{Math.round(result.phishing_score * 100)}%</span>
                {trusted && result.phishing_score >= 0.4 && (
                  <> (the text-only model is cautious here, but this is a trusted domain, so the verdict stays Safe)</>
                )}
              </span>
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="What you should do">
            <ul className="space-y-3">
              {v.advice.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-slate-200">
                  <Warning className="mt-0.5 shrink-0 text-slate-400" width={18} height={18} />
                  {a}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Address details">
            <p className="mb-1 text-xs text-slate-400">Website you would actually visit</p>
            <p className="mb-4 break-all font-mono text-sm font-semibold text-white">{f.domain}</p>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Length" value={f.length} warn={f.length > 100} />
              <Stat
                label="Connection"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {f.https && <Lock width={16} height={16} />} {f.https ? "HTTPS" : "HTTP"}
                  </span>
                }
                warn={!f.https}
              />
              <Stat label="Dots in host" value={f.dots} warn={f.dots >= 4} />
              <Stat label="Hyphens" value={f.hyphens} warn={f.hyphens >= 3} />
              <Stat label="Digits in host" value={f.digits} />
              <Stat label="Special chars" value={f.special_chars} warn={f.special_chars > 0} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
