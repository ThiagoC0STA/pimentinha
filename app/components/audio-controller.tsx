"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/app/providers/experience";
import { MUSICA, TOTAL_ATOS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const VOLUME_NORMAL = 0.72;
/** No ato da pergunta a musica recua pra frase acontecer quase no silencio. */
const VOLUME_FINAL = 0.16;
/** Quanto o volume caminha por frame. ~3s de crossfade a 60fps. */
const PASSO = 0.012;

/**
 * Duas trilhas com troca no momento exato da quebra.
 *
 * A fria toca enquanto ele ainda esta fechado. Quando ela quebra a casca, a
 * musica dela entra por cima em crossfade e a outra se despede. Se o arquivo
 * da trilha fria nao existir, o site toca so a musica dela, do inicio ao fim.
 */
export function AudioController() {
  const { started, act, broken } = useExperience();
  const friaRef = useRef<HTMLAudioElement>(null);
  const quenteRef = useRef<HTMLAudioElement>(null);
  const ativaRef = useRef<"fria" | "quente">("fria");
  const [temFria, setTemFria] = useState(true);
  const [muted, setMuted] = useState(false);
  const [tocando, setTocando] = useState(false);

  // O play so pode nascer do toque dela no portao: navegador nenhum deixa
  // audio comecar sozinho, e ainda bem.
  useEffect(() => {
    if (!started) return;
    const fria = friaRef.current;
    const quente = quenteRef.current;

    if (temFria && fria && !broken) {
      fria.volume = 0;
      // Pula a introducao: a trilha do antes entra direto no ponto certo.
      fria.currentTime = MUSICA.fria.inicio;
      fria
        .play()
        .then(() => setTocando(true))
        .catch(() => setTemFria(false));
      ativaRef.current = "fria";

      // Destrava a segunda trilha no mesmo gesto. Sem isso, o play dela na
      // hora da quebra seria bloqueado por falta de interacao recente.
      if (quente) {
        quente.volume = 0;
        quente
          .play()
          .then(() => {
            quente.pause();
            quente.currentTime = 0;
          })
          .catch(() => {});
      }
      return;
    }

    if (quente) {
      quente.volume = 0;
      quente
        .play()
        .then(() => setTocando(true))
        .catch(() => setTocando(false));
      ativaRef.current = "quente";
    }
  }, [started, temFria, broken]);

  // A casca quebrou: entra a musica dela, do comeco.
  useEffect(() => {
    if (!broken || !started) return;
    if (ativaRef.current === "quente") return;
    const quente = quenteRef.current;
    if (!quente) return;
    quente.currentTime = MUSICA.quente.inicio;
    quente.play().catch(() => {});
    ativaRef.current = "quente";
  }, [broken, started]);

  // Um loop so cuida dos dois volumes: fade de entrada, crossfade da troca,
  // duck do ato final e mute, tudo perseguindo um alvo.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const alvo = muted ? 0 : act >= TOTAL_ATOS - 1 ? VOLUME_FINAL : VOLUME_NORMAL;

      const passos: [HTMLAudioElement | null, boolean][] = [
        [friaRef.current, ativaRef.current === "fria"],
        [quenteRef.current, ativaRef.current === "quente"],
      ];

      for (const [audio, ativa] of passos) {
        if (!audio) continue;
        const destino = ativa ? alvo : 0;
        const proximo = audio.volume + (destino - audio.volume) * PASSO;
        audio.volume = Math.max(0, Math.min(1, proximo));
        if (!ativa && audio.volume < 0.005 && !audio.paused) audio.pause();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [muted, act]);

  return (
    <>
      {/* Sem `loop` nativo: ele voltaria pro segundo zero, e a introducao
          e justamente o que a gente esta pulando. Repete na mao a partir
          do ponto de entrada. */}
      <audio
        ref={friaRef}
        src={MUSICA.fria.src}
        preload="auto"
        playsInline
        onEnded={(e) => {
          const a = e.currentTarget;
          a.currentTime = MUSICA.fria.inicio;
          a.play().catch(() => {});
        }}
        onError={() => setTemFria(false)}
      />
      <audio ref={quenteRef} src={MUSICA.quente.src} loop preload="auto" playsInline />

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Ligar a musica" : "Desligar a musica"}
        className={cn(
          "fixed top-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full",
          "border border-white/10 bg-black/30 backdrop-blur-md",
          "transition-all duration-500 hover:scale-105 hover:border-white/25",
          started && tocando ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M11 5 6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
          {muted ? (
            <path d="m17 9 4 6M21 9l-4 6" strokeLinecap="round" />
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
