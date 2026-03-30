"use client";

import { useState, useCallback } from "react";
import type { ThemeColors } from "@/lib/theme";

interface Props {
  sessionId: string;
  sessionName: string;
  onSend: (sessionId: string, command: string) => void;
  theme: ThemeColors;
}

export function InlineCommandInput({ sessionId, sessionName, onSend, theme }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(sessionId, trimmed);
    setValue("");
  }, [sessionId, value, onSend]);

  return (
    <div className="relative">
      <span
        className="absolute left-2 top-1.5 font-mono text-[10px]"
        style={{ color: theme.primary }}
      >
        $
      </span>
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
        className="w-full rounded text-[11px] font-mono pl-5 py-1.5 outline-none transition-colors"
        style={{
          backgroundColor: theme.inputBg,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: theme.inputBorder,
          color: theme.text,
        }}
        placeholder={`${sessionName} \u306B\u6307\u793A...`}
      />
    </div>
  );
}
