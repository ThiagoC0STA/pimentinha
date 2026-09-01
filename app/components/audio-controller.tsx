"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/app/providers/experience";
import { MUSICA, TOTAL_ATOS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const VOLUME_NORMAL = 0.72;
/** No ato da pergunta a musica recua pra frase acontecer quase no silencio. */
const VOLUME_FINAL = 0.16;
/** Velocidade dos unicos fades que restaram: entrada no portao e duck final. */
const FADE_POR_SEG = 0.55;

type Trilha = "fria" | "quente";

const mover = (atual: number, destino: number, passo: number) => {
  if (atual < destino) return Math.min(destino, atual + passo);
  if (atual > destino) return Math.max(destino, atual - passo);
  return destino;
};

/**
 * Duas trilhas, uma regra: em qualquer instante existe UMA trilha certa.
 *
 * Nada aqui depende de eventos chegarem na ordem esperada. Um reconciliador
 * roda a cada frame e compara o mundo com o que ele deveria ser: trilha errada
 * tocando e pausada na hora, trilha certa parada e religada, muted e espelhado
 * nos dois elementos. Estado inconsistente (hot reload, aba restaurada,
 * interrupcao do sistema) dura no maximo um frame.
 *
 * A troca na quebra e um corte seco, sem crossfade: a fria para no instante do
 * estouro e a musica dela ja entra tocando.
 */
export function AudioController() {
  const { started, act, broken } = useExperience();
  const friaRef = useRef<HTMLAudioElement>(null);
  const quenteRef = useRef<HTMLAudioElement>(null);
  const [temFria, setTemFria] = useState(true);
  const [muted, setMuted] = useState(false);
  const [tocando, setTocando] = useState(false);

  // O reconciliador le daqui; efeitos so escrevem.
  const mundoRef = useRef({ started, broken, temFria, act });
  useEffect(() => {
    mundoRef.current = { started, broken, temFria, act };
  }, [started, broken, temFria, act]);

  /** Ja demos play na trilha certa alguma vez? (gesto ja aconteceu) */
  const liberadoRef = useRef(false);
  /** A quente ja foi resetada pro inicio na hora da quebra? */
  const quenteResetadaRef = useRef(false);

  const inicioDe = (t: Trilha) => (t === "fria" ? MUSICA.fria.inicio : MUSICA.quente.inicio);

  // O primeiro play nasce do toque dela no portao: navegador nenhum deixa
  // audio comecar sozinho. Aqui tambem se destrava a segunda trilha no mesmo
  // gesto (play + pause imediato), senao o play dela na hora da quebra seria
  // bloqueado por falta de interacao recente.
  useEffect(() => {
    if (!started || liberadoRef.current) return;
    liberadoRef.current = true;

    const fria = friaRef.current;
    const quente = quenteRef.current;
    const comecaQuente = broken || !temFria;

    if (!comecaQuente && fria) {
      fria.volume = 0;
      fria.currentTime = MUSICA.fria.inicio;
      fria
        .play()
        .then(() => setTocando(true))
        .catch(() => setTemFria(false));
      if (quente) {
        quente.volume = 0;
        quente
          .play()
          .then(() => {
            quente.pause();
            quente.currentTime = MUSICA.quente.inicio;
          })
          .catch(() => {});
      }
    } else if (quente) {
      quenteResetadaRef.current = true;
      quente.volume = 0;
      quente.currentTime = MUSICA.quente.inicio;
      quente
        .play()
        .then(() => setTocando(true))
        .catch(() => setTocando(false));
    }
  }, [started, broken, temFria]);

  // A quebra: corte seco. A fria morre neste instante e a dela entra do
  // comeco, ja no volume cheio. Sem crossfade: duas musicas ao mesmo tempo,
  // mesmo por dois segundos, soa como defeito.
  useEffect(() => {
    if (!broken || !started) return;
    const fria = friaRef.current;
    const quente = quenteRef.current;

    if (fria) {
      fria.pause();
      fria.volume = 0;
    }
    if (quente && !quenteResetadaRef.current) {
      quenteResetadaRef.current = true;
      quente.currentTime = MUSICA.quente.inicio;
      quente.volume = act >= TOTAL_ATOS - 1 ? VOLUME_FINAL : VOLUME_NORMAL;
      quente.play().catch(() => {});
      setTocando(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broken, started]);

  // Mute instantaneo, na propriedade do elemento. Nao passa por fade nenhum.
  useEffect(() => {
    for (const audio of [friaRef.current, quenteRef.current]) {
      if (audio) audio.muted = muted;
    }
  }, [muted]);

  // O reconciliador.
  useEffect(() => {
    let raf = 0;
    let anterior = performance.now();

    const tick = (agora: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (agora - anterior) / 1000);
      anterior = agora;

      const mundo = mundoRef.current;
      if (!mundo.started || !liberadoRef.current) return;

      const certa: Trilha = mundo.broken || !mundo.temFria ? "quente" : "fria";
      const alvo = mundo.act >= TOTAL_ATOS - 1 ? VOLUME_FINAL : VOLUME_NORMAL;

      const trilhas: [HTMLAudioElement | null, Trilha][] = [
        [friaRef.current, "fria"],
        [quenteRef.current, "quente"],
      ];

      for (const [audio, trilha] of trilhas) {
        if (!audio) continue;

        if (trilha !== certa) {
          // Trilha errada NUNCA fica tocando, venha o estado de onde vier.
          if (!audio.paused) audio.pause();
          if (audio.volume !== 0) audio.volume = 0;
          continue;
        }

        // Entrada do portao e duck do final: os unicos fades que existem.
        audio.volume = mover(audio.volume, alvo, FADE_POR_SEG * dt);

        // Vigia do repeat: se a trilha certa parou (fim de arquivo, `ended`
        // perdido, interrupcao), religa do ponto de entrada. Ninguem pede
        // alguem em namoro no silencio.
        if (audio.paused) {
          const fim = audio.duration && audio.currentTime >= audio.duration - 0.25;
          if (fim || audio.currentTime < inicioDe(trilha)) {
            audio.currentTime = inicioDe(trilha);
          }
          audio.play().catch(() => {});
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Sem `loop` nativo na fria: ele voltaria pro segundo zero, e a
          introducao e justamente o que a gente pula. O vigia religa dos 21s. */}
      <audio
        ref={friaRef}
        src={MUSICA.fria.src}
        preload="auto"
        playsInline
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
