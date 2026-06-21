import type { StepType } from "@/hooks/useAgentStream";

const TOOL_ICONS: Record<string, string> = {
  navigate: "🌐",
  screenshot: "📸",
  click: "🖱️",
  click_text: "🖱️",
  type: "⌨️",
  set_value: "⌨️",
  press_key: "⌨️",
  get_text: "📄",
  get_html: "📄",
  get_options: "🔽",
  select_option: "🔽",
  scroll: "↕️",
  wait_for: "⏳",
  get_url: "🔗",
  go_back: "⬅️",
  pdf: "📑",
};

function truncate(str: string, n = 200) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function downloadPdf(b64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${b64}`;
  link.download = filename;
  link.click();
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
  const isPdf = step.tool === "pdf";

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

      {step.result && !isScreenshot && !isPdf && (
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

      {isPdf && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-950/30 p-3">
          <span className="text-2xl">📄</span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-blue-200">
              {step.pdf?.filename ?? (step.args?.path as string) ?? "belge.pdf"}
            </p>
            {step.pdf ? (
              <p className="text-xs text-blue-400">PDF hazır — indirebilirsin</p>
            ) : (
              <p className="text-xs text-slate-400">
                {step.result ?? "PDF sunucuya kaydedildi"}
              </p>
            )}
          </div>
          {step.pdf && (
            <button
              onClick={() => downloadPdf(step.pdf!.data, step.pdf!.filename)}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              İndir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
