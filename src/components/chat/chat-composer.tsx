"use client";

import { useState } from "react";
import { Mic, Play, RotateCcw, SendHorizontal } from "lucide-react";

const MAX_LENGTH = 2000;

function ComposerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <button
          type="button"
          aria-label="Sesli mod"
          title="Sesli mod yakında"
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Mic className="size-4" aria-hidden />
        </button>
        {children}
      </div>
    </div>
  );
}

const inputClassName =
  "h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60";

const secondaryButtonClassName =
  "flex h-10 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-surface-muted";

const primaryButtonClassName =
  "flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:text-zinc-950";

interface LiveComposerProps {
  isStreaming: boolean;
  isClosed: boolean;
  onSend: (text: string) => void;
  onRestart: () => void;
}

export function LiveComposer({ isStreaming, isClosed, onSend, onRestart }: LiveComposerProps) {
  const [value, setValue] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  if (isClosed) {
    return (
      <ComposerShell>
        <p className="flex-1 text-sm text-muted">Görüşme kapandı.</p>
        <button type="button" onClick={onRestart} className={secondaryButtonClassName}>
          <RotateCcw className="size-4" aria-hidden />
          Yeni görüşme
        </button>
      </ComposerShell>
    );
  }

  return (
    <ComposerShell>
      <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="Mesajınızı yazın"
          aria-label="Mesaj"
          autoFocus
          className={inputClassName}
        />
        <button
          type="submit"
          aria-label="Gönder"
          disabled={isStreaming || !value.trim()}
          className={primaryButtonClassName}
        >
          <SendHorizontal className="size-4" aria-hidden />
        </button>
      </form>
    </ComposerShell>
  );
}

interface ScenarioComposerProps {
  isFinished: boolean;
  onNext: () => void;
  onReset: () => void;
}

/** Senaryo modunda mesajlar hazır senaryodan gelir, input salt okunurdur. */
export function ScenarioComposer({ isFinished, onNext, onReset }: ScenarioComposerProps) {
  return (
    <ComposerShell>
      <input
        readOnly
        placeholder="Senaryo modunda mesajlar senaryodan gelir"
        aria-label="Mesaj (salt okunur)"
        className={inputClassName}
      />
      {isFinished ? (
        <button type="button" onClick={onReset} className={secondaryButtonClassName}>
          <RotateCcw className="size-4" aria-hidden />
          Baştan
        </button>
      ) : (
        <button type="button" onClick={onNext} className={primaryButtonClassName}>
          İleri
          <Play className="size-4" aria-hidden />
        </button>
      )}
    </ComposerShell>
  );
}
