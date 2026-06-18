import type { StreamState } from "@/hooks/useAgentStream";

const CONFIG: Record<StreamState, { label: string; color: string; dot: string }> = {
  idle: { label: "Bekliyor", color: "text-slate-400", dot: "bg-slate-500" },
  connecting: { label: "Bağlanıyor…", color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse" },
  running: { label: "Çalışıyor", color: "text-blue-400", dot: "bg-blue-400 animate-pulse" },
  done: { label: "Tamamlandı", color: "text-emerald-400", dot: "bg-emerald-400" },
  error: { label: "Hata", color: "text-red-400", dot: "bg-red-400" },
};

export function StatusBadge({ status }: { status: StreamState }) {
  const { label, color, dot } = CONFIG[status];
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
