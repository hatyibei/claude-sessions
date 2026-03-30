"use client";

import { useState, useCallback } from "react";

interface Props {
  sessionId: string;
  sessionName: string;
  onSend: (sessionId: string, command: string) => void;
}

export function InlineCommandInput({ sessionId, sessionName, onSend }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(sessionId, trimmed);
    setValue("");
  }, [sessionId, value, onSend]);

  return (
    <div className="relative">
      <span className="absolute left-2 top-1.5 font-mono text-[10px] text-th-primary">$</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="w-full rounded text-[11px] font-mono pl-5 py-1.5 outline-none transition-colors bg-th-input-bg border border-th-input-border text-th-text"
        placeholder={`${sessionName} に指示...`}
      />
    </div>
  );
}
