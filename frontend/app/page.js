import Scanner from "@/components/Scanner";
import { Cpu, Search, ShieldCheck } from "@/components/Icons";

const STEPS = [
  {
    Icon: Search,
    title: "Read the address",
    text: "We break the link apart: domain, length, symbols, connection type and keywords.",
  },
  {
    Icon: Cpu,
    title: "Ask the AI model",
    text: "A machine learning model trained on phishing links gives a risk probability.",
  },
  {
    Icon: ShieldCheck,
    title: "Explain the verdict",
    text: "Clear rules add context so you see exactly why a link is Safe, Suspicious or Malicious.",
  },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
            <ShieldCheck width={22} height={22} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            PhishGuard<span className="text-teal-300">AI</span>
          </span>
        </div>
        <p className="hidden text-sm text-slate-400 sm:block">AI-based malicious URL detection</p>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        <section className="pt-10 pb-12 text-center sm:pt-16">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-4 py-1.5 text-sm text-teal-200">
            <span className="h-2 w-2 rounded-full bg-teal-300" />
            Free link checker
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Check any link before you click it
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Paste a URL and get an instant verdict: <span className="text-emerald-300">Safe</span>,{" "}
            <span className="text-amber-300">Suspicious</span> or <span className="text-rose-300">Malicious</span>, with the reasons explained in plain language.
          </p>
        </section>

        <Scanner />

        <section className="mx-auto mt-24 max-w-5xl">
          <h2 className="text-center text-2xl font-semibold text-white">How it works</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map(({ Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
                    <Icon width={22} height={22} />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        PhishGuardAI is a decision aid, not a guarantee. When in doubt, do not enter personal details.
      </footer>
    </>
  );
}
