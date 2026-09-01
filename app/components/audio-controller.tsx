"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience } from "@/app/providers/experience";
import { MUSICA, TOTAL_ATOS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const VOLUME_NORMAL = 0.72;
/** No ato da pergunta a musica recua pra frase acontecer quase no silencio. */
const VOLUME_FINAL = 0.16;

/**
 * Velocidades de fade, em volume por segundo.
 *
 * A saida e rapida de proposito. Fade cruzado longo soa como duas musicas
 * tocando ao mesmo tempo, que foi exatamente o que aconteceu na primeira
 * versao: a trilha antiga levava quase sete segundos pra sumir.
 */
const SAIDA_POR_SEG = 2.2; // ~0.35s pra zerar
const ENTRADA_POR_SEG = 0.5; // ~1.5s pra encher
/** Respiro entre uma trilha e outra: o estouro acontece quase no silencio. */
const ATRASO_ENTRADA_MS = 420;

type Trilha = "fria" | "quente";

const mover = (atual: number, destino: number, passo: number) => {
  if (atual < destino) return Math.min(destino, atual + passo);
  if (atual > destino) return Math.max(destino, atual - passo);
  return destino;
};

/**
 * Duas trilhas com troca no momento exato da quebra.
 *
 * A fria toca enquanto ele ainda esta fechado. Quando ela quebra a casca, a
 * fria some em menos de meio segundo, tem um respiro, e a musica dela entra do
 * comeco. Se o arquivo da trilha fria nao existir, o site toca so a musica
 * dela, do inicio ao fim.
 *
 * Nenhuma das duas pode parar sozinha: um vigia por frame religa qualquer
 * trilha que devia estar tocando e nao esta. Ninguem vai pedir alguem em
 * namoro no silencio por causa de um `ended` que nao disparou.
 */
export function AudioController() {
  const { started, act, broken } = useExperience();
  const friaRef = useRef<HTMLAudioElement>(null);
  const quenteRef = useRef<HTMLAudioElement>(null);
  const ativaRef = useRef<Trilha>("fria");
  const deveTocarRef = useRef<Record<Trilha, boolean>>({ fria: false, quente: false });
  const [temFria, setTemFria] = useState(true);
  const [muted, setMuted] = useState(false);
  const [tocando, setTocando] = useState(false);

  const inicioDe = (t: Trilha) => (t === "fria" ? MUSICA.fria.inicio : MUSICA.quente.inicio);

  const tocar = useCallback((audio: HTMLAudioElement, trilha: Trilha) => {
    deveTocarRef.current[trilha] = true;
    audio.play().catch(() => {});
  }, []);

  /**
   * O play so pode nascer do toque dela no portao: navegador nenhum deixa
   * audio comecar sozinho, e ainda bem.
   *
   * `broken` NAO entra nas dependencias de proposito. Quando entrava, esse
   * efeito rodava junto com a quebra e tomava a troca pra si: pulava o respiro
   * de 420ms e, pior, deixava a trilha fria tocando pra sempre em volume zero,
   * porque quem marca ela como encerrada e o efeito de baixo.
   */
  useEffect(() => {
    if (!started) return;
    const fria = friaRef.current;
    const quente = quenteRef.current;

    if (temFria && fria) {
      fria.volume = 0;
      // Pula a introducao: a trilha do antes entra direto no ponto certo.
      fria.currentTime = MUSICA.fria.inicio;
      ativaRef.current = "fria";
      fria
        .play()
        .then(() => {
          deveTocarRef.current.fria = true;
          setTocando(true);
        })
        .catch(() => setTemFria(false));

      // Destrava a segunda trilha no mesmo gesto. Sem isso, o play dela na
      // hora da quebra seria bloqueado por falta de interacao recente.
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
      return;
    }

    if (quente && ativaRef.current !== "quente") {
      quente.volume = 0;
      quente.currentTime = MUSICA.quente.inicio;
      ativaRef.current = "quente";
      quente
        .play()
        .then(() => {
          deveTocarRef.current.quente = true;
          setTocando(true);
        })
        .catch(() => setTocando(false));
    }
  }, [started, temFria]);

  // A casca quebrou: a fria cai na hora, e a musica dela entra logo depois.
  useEffect(() => {
    if (!broken || !started) return;
    if (ativaRef.current === "quente") return;

    ativaRef.current = "quente";
    deveTocarRef.current.fria = false; // para de religar a antiga

    const t = setTimeout(() => {
      const quente = quenteRef.current;
      if (!quente) return;
      quente.currentTime = MUSICA.quente.inicio;
      quente.volume = 0;
      tocar(quente, "quente");
      setTocando(true);
    }, ATRASO_ENTRADA_MS);

    return () => clearTimeout(t);
  }, [broken, started, tocar]);

  // Um loop so cuida de tudo: fade de entrada, corte da troca, duck do ato
  // final, mute, e o vigia que nunca deixa a musica morrer.
  useEffect(() => {
    let raf = 0;
    let anterior = performance.now();

    const tick = (agora: number) => {
      raf = requestAnimationFrame(tick);
      // Capado: se a aba ficou em segundo plano, o salto nao vira um corte.
      const dt = Math.min(0.1, (agora - anterior) / 1000);
      anterior = agora;

      const alvo = muted ? 0 : act >= TOTAL_ATOS - 1 ? VOLUME_FINAL : VOLUME_NORMAL;
      const trilhas: [HTMLAudioElement | null, Trilha][] = [
        [friaRef.current, "fria"],
        [quenteRef.current, "quente"],
      ];

      for (const [audio, trilha] of trilhas) {
        if (!audio) continue;
        const ativa = ativaRef.current === trilha;
        const destino = ativa ? alvo : 0;
        const deveTocar = deveTocarRef.current[trilha];

        // Volume so sobe com a trilha realmente tocando; descer pode sempre.
        if (destino < audio.volume || !audio.paused) {
          const taxa = destino > audio.volume ? ENTRADA_POR_SEG : SAIDA_POR_SEG;
          audio.volume = mover(audio.volume, destino, taxa * dt);
        }

        // Vigia: se essa trilha devia estar tocando e parou (fim do arquivo,
        // interrupcao do sistema, `ended` que nao disparou), religa do ponto
        // de entrada. E o seguro contra ficar sem musica na hora do pedido.
        if (deveTocar && audio.paused) {
          const fim = audio.duration && audio.currentTime >= audio.duration - 0.25;
          if (fim || audio.currentTime < inicioDe(trilha)) {
            audio.currentTime = inicioDe(trilha);
          }
          audio.play().catch(() => {});
        }

        // A trilha que saiu de cena para de vez quando termina de sumir.
        if (!deveTocar && !audio.paused && audio.volume <= 0.002) audio.pause();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [muted, act]);

  return (
    <>
      {/* Sem `loop` nativo na fria: ele voltaria pro segundo zero, e a
          introducao e justamente o que a gente esta pulando. O onEnded repete
          a partir do ponto de entrada, e o vigia do loop cobre o resto. */}
      <audio
        ref={friaRef}
        src={MUSICA.fria.src}
        preload="auto"
        playsInline
        onEnded={(e) => {
          const a = e.currentTarget;
          if (!deveTocarRef.current.fria) return;
          a.currentTime = MUSICA.fria.inicio;
          a.play().catch(() => {});
        }}
        onError={() => setTemFria(false)}
      />
      {/* A dela repete inteira, do comeco. Loop nativo e vigia, os dois. */}
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
