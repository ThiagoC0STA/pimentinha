"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/app/providers/experience";
import { MUSICA, TOTAL_ATOS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const VOLUME_NORMAL = 0.72;
/** No ato da pergunta a musica recua pra frase acontecer quase no silencio. */
const VOLUME_FINAL = 0.16;

export function AudioController() {
  const { started, act } = useExperience();
  const audioRef = useRef<HTMLAudioElement>(null);
  const targetRef = useRef(0);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  // O play so pode nascer do toque dela no portao: navegador nenhum deixa
  // audio comecar sozinho, e ainda bem.
  useEffect(() => {
    if (!started) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    audio
      .play()
      .then(() => setReady(true))
      .catch(() => setReady(false));
    targetRef.current = VOLUME_NORMAL;
  }, [started]);

  useEffect(() => {
    targetRef.current = act >= TOTAL_ATOS - 1 ? VOLUME_FINAL : VOLUME_NORMAL;
  }, [act]);

  // Fade continuo: entrada suave, duck no final, mute sem corte seco.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const audio = audioRef.current;
      if (!audio) return;
      const target = muted ? 0 : targetRef.current;
      const next = audio.volume + (target - audio.volume) * 0.012;
      audio.volume = Math.max(0, Math.min(1, next));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [muted]);

  return (
    <>
      <audio ref={audioRef} src={MUSICA.src} loop preload="auto" playsInline />

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Ligar a musica" : "Desligar a musica"}
        className={cn(
          "fixed top-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full",
          "border border-white/10 bg-black/30 backdrop-blur-md",
          "transition-all duration-500 hover:scale-105 hover:border-white/25",
          started && ready ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M11 5 6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
          {muted ? (
            <>
              <path d="m17 9 4 6M21 9l-4 6" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" className="breathe" />
              <path d="M18.5 6a9 9 0 0 1 0 12" strokeLinecap="round" opacity="0.5" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
