"use client";

import { useState, useCallback, type Ref } from "react";
import { showToast } from "@/stores/toastStore";

interface Props {
  onCreateSession: (name: string, task: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}

export function GlobalCommandBar({ onCreateSession, inputRef }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onCreateSession(trimmed, trimmed);
    setValue("");
    showToast(`セッション「${trimmed}」を作成しました`);
  }, [value, onCreateSession]);

  return (
    <div className="backdrop-blur-md px-6 py-4 flex items-center gap-4 z-50 bg-th-footer-bg border-t border-th-footer-border">
      <div className="flex-1 relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-th-primary">$</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full rounded-lg pl-10 pr-20 py-3 text-sm font-mono transition-all outline-none bg-th-surface-high border border-th-border text-th-text"
          placeholder="新規セッション..."
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-th-surface-high text-th-text-muted border border-th-border">
            {"⌘K"}
          </span>
          <button
            onClick={handleSubmit}
            className="font-mono text-[11px] font-bold px-4 py-1.5 rounded uppercase tracking-tighter hover:brightness-110 active:scale-95 transition-all bg-th-primary text-th-bg"
          >
            {"起動"}
          </button>
        </div>
      </div>
    </div>
  );
}
