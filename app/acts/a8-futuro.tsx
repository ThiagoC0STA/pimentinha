"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Reveal, RevealWords } from "@/app/components/reveal";
import { useReveal } from "@/lib/use-reveal";
import { diasJuntos } from "@/lib/constants";

/** Conta os dias no cliente, pra estar certo no dia em que ela abrir. */
function DiasJuntos() {
  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(diasJuntos()), []);

  return (
    <span className="font-display text-5xl text-accent sm:text-7xl" style={{ fontVariantNumeric: "tabular-nums" }}>
      {dias ?? "—"}
    </span>
  );
}

const ESTRELAS: [number, number][] = [
  [12, 68],
  [26, 44],
  [38, 58],
  [50, 26],
  [62, 47],
  [74, 32],
  [86, 60],
  [58, 74],
];

/** Constelacao que se desenha sozinha quando entra na tela. */
function Constelacao() {
  const [ref, isIn] = useReveal<HTMLDivElement>({ rootMargin: "0px 0px -20% 0px" });

  return (
    <div ref={ref} className={isIn ? "is-in w-full" : "w-full"}>
      <svg viewBox="0 0 100 90" className="w-full" fill="none">
        {ESTRELAS.slice(0, -1).map(([x, y], i) => {
          const [nx, ny] = ESTRELAS[i + 1];
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={nx}
              y2={ny}
              pathLength={1}
              stroke="var(--c-accent)"
              strokeWidth="0.25"
              opacity="0.55"
              className="draw-path"
              style={{ ["--rv-delay" as string]: `${i * 180}ms` } as CSSProperties}
            />
          );
        })}

        {ESTRELAS.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle
              cx={x}
              cy={y}
              r={i === 3 ? 1.5 : 0.9}
              fill={i === 3 ? "var(--c-glow)" : "var(--c-fg)"}
              className="twinkle"
              style={
                {
                  ["--tw-delay" as string]: `${i * 0.37}s`,
                  ["--tw-dur" as string]: `${2.6 + (i % 3) * 0.9}s`,
                } as CSSProperties
              }
            />
            <circle cx={x} cy={y} r={i === 3 ? 4 : 2.4} fill="var(--c-glow)" opacity="0.07" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function Futuro() {
  return (
    <Act index={8} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="viii" title="o que eu vejo daqui" />
        </Beat>

        <Beat height="50vh">
          <RevealWords
            text="A gente fala isso um pro outro."
            className="type-line text-muted"
            stagger={50}
          />
        </Beat>

        <Beat height="80vh" className="items-center text-center">
          <RevealWords
            text="Você é o meu futuro."
            className="type-act font-display italic"
            stagger={120}
          />
          <Reveal delay={2200}>
            <p className="type-line mt-10 text-muted">E eu não falo por falar.</p>
          </Reveal>
        </Beat>

        <Beat height="70vh">
          <Constelacao />
        </Beat>

        <Beat height="60vh">
          <Reveal>
            <p className="type-line text-fg/90">
              Eu vejo você médica, cuidando da cabeça das pessoas do jeito que você cuidou da minha
              sem nem perceber.
            </p>
          </Reveal>
        </Beat>

        <Beat height="60vh">
          <Reveal>
            <p className="type-line text-fg/90">
              Eu vejo você mãe, porque eu já vi como você olha pra criança.
            </p>
          </Reveal>
        </Beat>

        <Beat height="55vh" className="items-center text-center">
          <RevealWords text="Eu vejo a gente." className="type-act font-display" stagger={100} />
        </Beat>

        <Beat height="80vh" className="items-center text-center">
          <Reveal>
            <p className="type-label text-muted">faz</p>
          </Reveal>
          <Reveal delay={300} className="mt-4">
            <DiasJuntos />
          </Reveal>
          <Reveal delay={700}>
            <p className="type-label mt-4 text-muted">dias que a gente conversa</p>
          </Reveal>
          <Reveal delay={1500}>
            <p className="type-line mt-12 text-balance">
              E pela primeira vez em muito tempo eu não tô com medo do que vem depois.
            </p>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
