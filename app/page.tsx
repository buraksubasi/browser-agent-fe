"use client";

import { useEffect, useRef, useState } from "react";
import { useAgentStream } from "@/hooks/useAgentStream";
import { StepCard } from "@/components/StepCard";
import { StatusBadge } from "@/components/StatusBadge";

const RAW_WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/agent/stream";

// HTTPS sayfalarında tarayıcı ws:// bağlantısını reddeder (Mixed Content).
// Güvenli bağlam tespit edildiğinde ws:// → wss:// otomatik yükselt.
const WS_URL =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? RAW_WS_URL.replace(/^ws:\/\//, "wss://")
    : RAW_WS_URL;

const EXAMPLES = [
  "cimri.com'da 'Samsung Galaxy S24 Ultra' ara, en ucuz fiyatları bul",
  "tr.investing.com'da dolar/TL kurunu bul",
  "wikipedia.org'a git ve istanbul araması yap gelen  sayfasıyı PDF olarak kaydet",
];

export default function Home() {
  const [input, setInput] = useState("");
  const { steps, status, finalResult, run, stop } = useAgentStream(WS_URL);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [steps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "running" || status === "connecting") return;
    run(input.trim());
  };

  const isActive = status === "running" || status === "connecting";

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold">
              B
            </div>
            <span className="font-semibold">Browser Agent</span>
          </div>
          <StatusBadge status={status} />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">

        {/* Task Input */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="mb-1 text-lg font-semibold">Görev Ver</h1>
          <p className="mb-4 text-sm text-slate-400">
            Agent tarayıcıyı açar, görevi adım adım gerçekleştirir ve canlı olarak aktar.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Örn: youtube.com'da lo-fi müzik ara ve ilk videoyu aç"
              disabled={isActive}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50"
            />
            {isActive ? (
              <button
                type="button"
                onClick={stop}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-500"
              >
                Durdur
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-40"
              >
                Başlat
              </button>
            )}
          </form>

          {/* Example tasks */}
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                disabled={isActive}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              >
                {ex}
              </button>
            ))}
          </div>
        </section>

        {/* Live Feed */}
        {(steps.length > 0 || isActive) && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">
                Adımlar
                {steps.length > 0 && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {steps.length}
                  </span>
                )}
              </h2>
              {isActive && (
                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-blue-400" />
                  Canlı
                </span>
              )}
            </div>

            <div
              ref={feedRef}
              className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1"
            >
              {steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} />
              ))}

              {isActive && (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </span>
                  <span className="text-sm text-slate-400">Agent düşünüyor…</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Final Result */}
        {finalResult && (
          <section
            className={`rounded-2xl border p-6 ${
              status === "error"
                ? "border-red-500/40 bg-red-950/30"
                : "border-emerald-500/30 bg-emerald-950/20"
            }`}
          >
            <h2
              className={`mb-2 text-sm font-semibold uppercase tracking-widest ${
                status === "error" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {status === "error" ? "Hata" : "Görev Tamamlandı"}
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {finalResult}
            </p>
          </section>
        )}

        {/* Empty state */}
        {steps.length === 0 && !isActive && !finalResult && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="text-4xl">🤖</div>
            <p className="text-slate-400">Yukarıya bir görev yaz ve <strong className="text-white">Başlat</strong>'a bas.</p>
            <p className="text-xs text-slate-600">Agent tarayıcıyı açacak ve adımları buraya akıtacak.</p>
          </div>
        )}
      </main>
    </div>
  );
}
