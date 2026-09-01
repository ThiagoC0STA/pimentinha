"use client";

import { useEffect, useRef } from "react";
import { useSectionProgress } from "@/lib/use-section-progress";
import { useExperience } from "@/app/providers/experience";
import { KM_POR_PERNA, KM_POR_VISITA } from "@/lib/constants";
import { CountUp } from "./chrome";

/**
 * Os 25 km, quatro vezes.
 *
 * Quatro arcos entre a casa dele e a casa dela: ele vai, busca, leva de volta,
 * volta sozinho. O traco se desenha conforme ela rola a tela, e um ponto de luz
 * faz o caminho junto. O percurso e o argumento: ninguem dirige cem quilometros
 * por acaso.
 */

const PERNAS = ["eu vou", "eu te busco", "eu te levo em casa", "eu volto"];

/** Quatro arcos com alturas diferentes, pra dar pra ver as quatro passagens. */
const PATH =
  "M12 26 C 34 2 66 2 88 26 C 66 50 34 50 12 26 C 32 8 68 8 88 26 C 68 44 32 44 12 26";

export function Journey() {
  const ref = useSectionProgress<HTMLDivElement>();
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const { subscribe } = useExperience();

  // O ponto de luz anda pelo traco de verdade. `offset-path` do CSS mede em
  // pixels do elemento, nao nas coordenadas do viewBox, entao ele cairia
  // sempre no canto da tela. getPointAtLength resolve isso e e barato.
  useEffect(() => {
    const container = ref.current;
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!container || !path || !dot) return;

    let total = path.getTotalLength();
    const remeasure = () => {
      total = path.getTotalLength();
    };
    window.addEventListener("resize", remeasure);

    const unsubscribe = subscribe(() => {
      // Le o inline style (nao o computed), entao nao força layout.
      const sp = parseFloat(container.style.getPropertyValue("--sp")) || 0;
      const p = path.getPointAtLength(sp * total);
      dot.setAttribute("cx", String(p.x));
      dot.setAttribute("cy", String(p.y));
      dot.style.opacity = sp > 0.01 && sp < 0.995 ? "1" : "0";
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", remeasure);
    };
  }, [ref, subscribe]);

  return (
    <div ref={ref} className="w-full">
      <svg viewBox="0 0 100 56" className="w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="rota" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--c-glow)" />
            <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Trilha apagada: o caminho inteiro, esperando */}
        <path
          ref={pathRef}
          d={PATH}
          pathLength={1}
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-muted/25"
        />

        {/* Trilha viva: desenha conforme ela rola */}
        <path
          d={PATH}
          pathLength={1}
          stroke="url(#rota)"
          strokeWidth="0.7"
          strokeLinecap="round"
          className="draw-scroll"
        />

        {/* As duas casas */}
        <circle cx="12" cy="26" r="1.5" fill="var(--c-accent)" />
        <circle cx="12" cy="26" r="3.2" stroke="var(--c-accent)" strokeWidth="0.2" opacity="0.4" />
        <text x="12" y="34" textAnchor="middle" fontSize="2.6" fill="var(--c-muted)" letterSpacing="0.4">
          minha casa
        </text>

        <circle cx="88" cy="26" r="1.5" fill="var(--c-glow)" />
        <circle
          cx="88"
          cy="26"
          r="3.2"
          stroke="var(--c-glow)"
          strokeWidth="0.2"
          opacity="0.5"
          className="breathe"
        />
        <text x="88" y="34" textAnchor="middle" fontSize="2.6" fill="var(--c-muted)" letterSpacing="0.4">
          você
        </text>

        {/* O carro, digamos assim */}
        <circle ref={dotRef} cx="12" cy="26" r="1.1" fill="var(--c-fg)" style={{ opacity: 0 }} />
      </svg>

      {/* As quatro pernas */}
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        {PERNAS.map((perna) => (
          <li key={perna} className="flex flex-col gap-1.5">
            <span className="font-display text-2xl text-accent/80">{KM_POR_PERNA}</span>
            <span className="type-label text-muted">{perna}</span>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-center">
        <CountUp to={KM_POR_VISITA} suffix=" km" className="font-display text-5xl text-fg sm:text-7xl" />
        <span className="type-label mt-3 block text-muted">toda vez que eu te vejo</span>
      </p>
    </div>
  );
}
