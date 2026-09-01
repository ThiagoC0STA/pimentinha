"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useExperience } from "@/app/providers/experience";
import { cn } from "@/lib/cn";

const HOLD_MS = 2100;
const R = 46;
const CIRC = 2 * Math.PI * R;

/**
 * O feedback do hold nao desenha nada: o mundo prende a respiracao com ela.
 *
 * Enquanto o dedo esta na tela, um veu escurece tudo ao redor do circulo (so
 * opacity, roda no compositor) e la na cena as particulas sao puxadas pra
 * dentro. Rachadura, raio, veia: todas as versoes com linhas radiando do
 * botao foram reprovadas, e com razao. Tensao aqui e falta de luz, nao risco.
 */
function Veu() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={
        {
          background:
            "radial-gradient(circle at 50% 50%, transparent 11vmin, rgb(2 3 6 / 0.93) 52vmin)",
          opacity: "var(--crack, 0)",
        } as CSSProperties
      }
    />
  );
}

/**
 * O unico momento em que ela toca no site.
 *
 * Ela segura o dedo por dois segundos e a casca racha. Nao e enfeite: foi ela
 * quem quebrou a casca dele na vida real, entao aqui a casca so quebra com a
 * mao dela.
 *
 * E a pagina para de andar ate isso acontecer. Se desse pra rolar, ela rolava
 * sem tocar, e o momento inteiro se perdia. Depois de duas tentativas de rolar
 * a dica aparece maior, pra que ninguem fique preso sem entender o porque.
 */
export function HoldToBreak() {
  const { setCrack, breakShell, broken, lockScroll, releaseScroll, scrollLocked, nudges } =
    useExperience();
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const [holding, setHolding] = useState(false);

  // Prende a pagina quando o botao chega ao centro da tela.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || broken) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) lockScroll();
      },
      // Faixa estreita no meio da tela: so trava com o botao bem centralizado,
      // nunca com ele metade pra fora.
      { threshold: 1, rootMargin: "-35% 0px -35% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [broken, lockScroll]);

  // Se ela sair da pagina e voltar com a casca ja quebrada, nada fica preso.
  useEffect(() => {
    if (broken) releaseScroll();
  }, [broken, releaseScroll]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      if (broken) return;

      const p = progressRef.current;
      // Segurando: enche em HOLD_MS. Soltou: esvazia mais devagar, pra quem
      // escorregou o dedo nao perder tudo.
      const next = holdingRef.current
        ? Math.min(1, p + dt / HOLD_MS)
        : Math.max(0, p - dt / (HOLD_MS * 1.8));

      if (next !== p) {
        progressRef.current = next;
        setCrack(next);
        const ring = ringRef.current;
        if (ring) ring.style.strokeDashoffset = `${CIRC * (1 - next)}`;
        // O veu escuro le daqui.
        wrapRef.current?.style.setProperty("--crack", next.toFixed(4));
        // Batidas tateis a cada quarto do caminho: ela sente que esta indo.
        if (navigator.vibrate) {
          for (const marco of [0.25, 0.5, 0.75]) {
            if (p < marco && next >= marco) navigator.vibrate(10);
          }
        }
      }

      if (next >= 1) breakShell();
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [setCrack, breakShell, broken]);

  const startHold = () => {
    if (broken) return;
    holdingRef.current = true;
    setHolding(true);
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const endHold = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const insistindo = scrollLocked && !broken && nudges >= 2;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative flex flex-col items-center gap-6 transition-all duration-1000",
        broken ? "pointer-events-none scale-90 opacity-0" : "opacity-100",
      )}
    >
      <Veu />
      <button
        type="button"
        aria-label="Segure para continuar"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative flex h-28 w-28 touch-none items-center justify-center rounded-full select-none",
          "transition-transform duration-500",
          holding ? "scale-95" : "hold-pulse",
        )}
      >
        {/* Halos que respiram enquanto ela nao toca */}
        {!holding && (
          <>
            <span className="ring-out absolute inset-0 rounded-full border border-accent/30" />
            <span
              className="ring-out absolute inset-0 rounded-full border border-accent/20"
              style={{ ["--ring-delay" as string]: "1.7s" }}
            />
          </>
        )}

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10" />
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-accent"
            style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC }}
          />
        </svg>

        <span
          className={cn(
            "relative h-3 w-3 rounded-full bg-accent transition-all duration-500",
            holding && "scale-[2.2] shadow-[0_0_40px_12px_color-mix(in_srgb,var(--c-accent)_45%,transparent)]",
          )}
        />
      </button>

      <span className="type-label text-muted">{holding ? "não solta" : "segura aqui"}</span>

      {/* Ela tentou rolar. A pagina nao anda, entao explica por quê. */}
      <p
        className={cn(
          "type-small max-w-xs text-balance text-center transition-all duration-700",
          insistindo ? "translate-y-0 text-accent opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        segura o dedo no círculo até ele fechar. daqui em diante quem abre a
        porta é você.
      </p>
    </div>
  );
}
