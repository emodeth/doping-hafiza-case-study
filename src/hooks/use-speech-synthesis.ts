"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBrowserSupport } from "./use-browser-support";

/**
 * Chrome uzun tek bir utterance'ı ~15 saniyede kesebiliyor; metni cümlelere
 * bölüp sırayla okumak hem bunu önler hem de daha doğal duraklar sağlar.
 */
function splitSentences(text: string) {
  return text.match(/[^.!?…]+[.!?…]*\s*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

function pickVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.split("-")[0].toLowerCase();
  const matching = voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
  // Bulut tabanlı sesler (Google, Microsoft Online/Natural) genellikle daha doğal.
  return (
    matching.find((v) => /natural|online|google/i.test(v.name)) ?? matching[0] ?? null
  );
}

export function useSpeechSynthesis(lang = "tr-TR") {
  const isSupported = useBrowserSupport(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const pendingRef = useRef(0);

  // Sesler bazı tarayıcılarda asenkron yüklenir; ilk getVoices() boş dönebilir.
  useEffect(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    const load = () => synth.getVoices();
    load();
    synth.addEventListener("voiceschanged", load);
    return () => {
      synth.removeEventListener("voiceschanged", load);
      synth.cancel();
    };
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    pendingRef.current = 0;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;
      const synth = window.speechSynthesis;
      synth.cancel();

      const voice = pickVoice(lang);
      const sentences = splitSentences(text);
      pendingRef.current = sentences.length;
      setIsSpeaking(true);

      for (const sentence of sentences) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = lang;
        if (voice) utterance.voice = voice;
        const done = () => {
          pendingRef.current = Math.max(0, pendingRef.current - 1);
          if (pendingRef.current === 0) setIsSpeaking(false);
        };
        utterance.onend = done;
        utterance.onerror = done;
        synth.speak(utterance);
      }
    },
    [isSupported, lang],
  );

  const hasVoiceForLang = useCallback(
    () => isSupported && pickVoice(lang) !== null,
    [isSupported, lang],
  );

  return { isSupported, isSpeaking, speak, cancel, hasVoiceForLang };
}
