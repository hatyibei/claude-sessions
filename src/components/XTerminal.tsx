"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/sessionStore";

interface Props {
  sessionId: string;
}

export function XTerminal({ sessionId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const sendRawInput = useSessionStore((s) => s.sendRawInput);
  const resizePty = useSessionStore((s) => s.resizePty);
  const onRawOutput = useSessionStore((s) => s.onRawOutput);
  const offRawOutput = useSessionStore((s) => s.offRawOutput);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    // Dynamic import to avoid SSR issues
    Promise.all([
      import("@xterm/xterm"),
      import("@xterm/addon-fit"),
    ]).then(([{ Terminal }, { FitAddon }]) => {
      if (disposed || !containerRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        theme: {
          background: "var(--c-terminal, #07070c)",
          foreground: "var(--c-text, #e4e1ea)",
          cursor: "var(--c-primary, #22d3ee)",
        },
        allowTransparency: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(containerRef.current!);
      fitAddon.fit();

      termRef.current = term;
      fitAddonRef.current = fitAddon;

      // Send keystrokes to PTY
      term.onData((data) => {
        sendRawInput(sessionId, data);
      });

      // Notify server of terminal size
      const { cols, rows } = term;
      resizePty(sessionId, cols, rows);

      term.onResize(({ cols, rows }) => {
        resizePty(sessionId, cols, rows);
      });

      // Listen for raw output from server
      onRawOutput(sessionId, (data: string) => {
        term.write(data);
      });

      // Handle container resize
      const observer = new ResizeObserver(() => {
        fitAddon.fit();
      });
      observer.observe(containerRef.current!);

      // Cleanup on unmount
      const cleanup = () => {
        observer.disconnect();
        offRawOutput(sessionId);
        term.dispose();
      };
      (containerRef.current as any).__cleanup = cleanup;
    });

    return () => {
      disposed = true;
      offRawOutput(sessionId);
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any).__cleanup) {
        (containerRef.current as any).__cleanup();
      }
    };
  }, [sessionId, sendRawInput, resizePty, onRawOutput, offRawOutput]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded overflow-hidden mb-3 border border-th-border"
      style={{ height: "300px" }}
    />
  );
}
