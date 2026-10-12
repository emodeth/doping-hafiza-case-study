"use client";

import { useState } from "react";
import { Mic, Play, RotateCcw, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 2000;

function ComposerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2">{children}</div>
    </div>
  );
}

const inputClassName =
  "h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60";

const secondaryButtonClassName =
  "flex h-10 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-surface-muted";

const primaryButtonClassName =
  "flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";

export interface SpeechInputControls {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
}

interface PushToTalkButtonProps extends SpeechInputControls {
  disabled: boolean;
}

function PushToTalkButton({ isSupported, isListening, disabled, onStart, onStop }: PushToTalkButtonProps) {
  const label = !isSupported
    ? "Tarayıcınız konuşma tanımayı desteklemiyor (Chrome veya Edge kullanın)"
    : isListening
      ? "Dinleniyor, göndermek için bırakın"
      : "Konuşmak için basılı tutun";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isListening}
      title={label}
      disabled={!isSupported || disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onStart();
      }}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          onStart();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") onStop();
      }}
      className={cn(
        "relative flex size-10 shrink-0 touch-none select-none items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        isListening
          ? "border-red-500 bg-red-500 text-white"
          : "border-border text-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      {isListening && (
        <span className="absolute inset-0 animate-ping rounded-md bg-red-500/40" aria-hidden />
      )}
      <Mic className="relative size-4" aria-hidden />
    </button>
  );
}

interface LiveComposerProps {
  isStreaming: boolean;
  isClosed: boolean;
  speech: SpeechInputControls;
  onSend: (text: string) => void;
  onRestart: () => void;
}

export function LiveComposer({ isStreaming, isClosed, speech, onSend, onRestart }: LiveComposerProps) {
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
      <PushToTalkButton {...speech} disabled={isStreaming} />
      <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
        <input
          value={speech.isListening ? speech.interimTranscript : value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={speech.isListening}
          maxLength={MAX_LENGTH}
          placeholder={speech.isListening ? "Dinleniyor…" : "Mesajınızı yazın veya mikrofonu basılı tutun"}
          aria-label="Mesaj"
          autoFocus
          className={inputClassName}
        />
        <button
          type="submit"
          aria-label="Gönder"
          disabled={isStreaming || speech.isListening || !value.trim()}
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
