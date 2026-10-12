import { Mic, Play, RotateCcw } from "lucide-react";

interface ChatComposerProps {
  isFinished: boolean;
  onNext: () => void;
  onReset: () => void;
}

/**
 * Mock modda mesajlar senaryodan geldiği için input salt okunur.
 * Gerçek LLM entegrasyonunda input ve mikrofon aktif hale gelecek.
 */
export function ChatComposer({ isFinished, onNext, onReset }: ChatComposerProps) {
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

        <input
          readOnly
          placeholder="Mock modda mesajlar senaryodan gelir"
          className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm placeholder:text-muted focus:outline-none"
        />

        {isFinished ? (
          <button
            type="button"
            onClick={onReset}
            className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-surface-muted"
          >
            <RotateCcw className="size-4" aria-hidden />
            Baştan
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:text-zinc-950"
          >
            İleri
            <Play className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
