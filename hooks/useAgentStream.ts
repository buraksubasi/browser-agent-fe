import { useCallback, useRef, useState } from "react";

export type StepType = {
  type: "tool_call" | "final" | "done" | "error";
  tool?: string;
  args?: Record<string, unknown>;
  result?: string;
  screenshot?: string;
  text?: string;
  message?: string;
};

export type StreamState = "idle" | "connecting" | "running" | "done" | "error";

export function useAgentStream(wsUrl: string) {
  const [steps, setSteps] = useState<StepType[]>([]);
  const [status, setStatus] = useState<StreamState>("idle");
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const run = useCallback(
    (task: string) => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      setSteps([]);
      setFinalResult(null);
      setStatus("connecting");

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("running");
        ws.send(JSON.stringify({ task }));
      };

      ws.onmessage = (event) => {
        const data: StepType = JSON.parse(event.data);

        if (data.type === "done") {
          setFinalResult(data.result ?? null);
          setStatus("done");
          ws.close();
          return;
        }

        if (data.type === "error") {
          setFinalResult(data.message ?? "Bilinmeyen hata");
          setStatus("error");
          ws.close();
          return;
        }

        setSteps((prev) => [...prev, data]);
      };

      ws.onerror = () => {
        setStatus("error");
        setFinalResult("Sunucuya bağlanılamadı.");
      };

      ws.onclose = () => {
        if (status === "running") setStatus("done");
      };
    },
    [wsUrl, status]
  );

  const stop = useCallback(() => {
    wsRef.current?.close();
    setStatus("idle");
  }, []);

  return { steps, status, finalResult, run, stop };
}
