"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBrowserSupport } from "./use-browser-support";

const getRecognitionConstructor = () =>
  typeof window === "undefined"
    ? undefined
    : (window.SpeechRecognition ?? window.webkitSpeechRecognition);

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Mikrofon izni verilmedi.",
  "service-not-allowed": "Mikrofon izni verilmedi.",
  "audio-capture": "Mikrofon bulunamadı.",
  network: "Konuşma tanıma servisine ulaşılamadı.",
};

interface UseSpeechRecognitionOptions {
  lang?: string;
  onFinal: (transcript: string) => void;
}

export function useSpeechRecognition({ lang = "tr-TR", onFinal }: UseSpeechRecognitionOptions) {
  const isSupported = useBrowserSupport(() => Boolean(getRecognitionConstructor()));
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef("");
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  });

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition || recognitionRef.current) return;

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    finalTextRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTextRef.current += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimTranscript((finalTextRef.current + interim).trim());
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(ERROR_MESSAGES[event.error] ?? "Ses tanınamadı.");
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      setInterimTranscript("");
      const transcript = finalTextRef.current.trim();
      finalTextRef.current = "";
      if (transcript) onFinalRef.current(transcript);
    };

    setError(null);
    setInterimTranscript("");
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [lang]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { isSupported, isListening, interimTranscript, error, start, stop };
}
