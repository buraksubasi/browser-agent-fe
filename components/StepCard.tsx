import type { StepType } from "@/hooks/useAgentStream";

const TOOL_ICONS: Record<string, string> = {
  navigate: "🌐",
  screenshot: "📸",
  click: "🖱️",
  type: "⌨️",
  press_key: "⌨️",
  get_text: "📄",
  get_html: "📄",
  scroll: "↕️",
  wait_for: "⏳",
  get_url: "🔗",
  go_back: "⬅️",
  pdf: "📑",
};

function truncate(str: string, n = 200) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function StepCard({ step, index }: { step: StepType; index: number }) {
  if (step.type === "final") {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Sonuç
        </p>
        <p className="whitespace-pre-wrap text-sm text-emerald-100">{step.text}</p>
      </div>
    );
  }

  const icon = TOOL_ICONS[step.tool ?? ""] ?? "🔧";
  const argsText = step.args ? JSON.stringify(step.args, null, 2) : null;
  const isScreenshot = step.tool === "screenshot";

  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
          {index + 1}
        </span>
        <span className="text-lg">{icon}</span>
        <span className="font-mono text-sm font-semibold text-white">
          {step.tool}
        </span>
      </div>

      {argsText && !isScreenshot && (
        <pre className="mb-2 overflow-x-auto rounded-lg bg-black/30 p-2 text-xs text-slate-300">
          {argsText}
        </pre>
      )}

      {step.result && !isScreenshot && (
        <p className="mt-1 rounded-lg bg-black/20 px-3 py-2 text-xs text-slate-400">
          {truncate(step.result)}
        </p>
      )}

      {isScreenshot && step.screenshot && (
        <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
          <img
            src={`data:image/png;base64,${step.screenshot}`}
            alt="Screenshot"
            className="w-full object-cover"
          />
        </div>
      )}

      {isScreenshot && !step.screenshot && (
        <p className="text-xs text-slate-500 italic">Screenshot alındı (önizleme stream'de kısıtlı)</p>
      )}
    </div>
  );
}
