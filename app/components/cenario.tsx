"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useExperience } from "@/app/providers/experience";
import { cn } from "@/lib/cn";

/**
 * O cenario que muda com a historia.
 *
 * Antes dela: chuva fininha, tempo fechado. Ela quebra a casca: a chuva PARA,
 * e do buque em diante caem petalas raras. No ato dos 100 km, a estrada de
 * madrugada passa em farois. Nada disso e decoracao aleatoria: cada camada e
 * um pedaco da historia, e cada uma so existe no seu proprio capitulo.
 */

/** Monta so quando `ativo`, e desmonta depois que o fade de saida termina. */
function useMontado(ativo: boolean, saidaMs = 1800) {
  const [montado, setMontado] = useState(ativo);
  useEffect(() => {
    if (ativo) {
      setMontado(true);
      return;
    }
    const t = setTimeout(() => setMontado(false), saidaMs);
    return () => clearTimeout(t);
  }, [ativo, saidaMs]);
  return montado;
}

/* --------------------------------------------------------------------------
   A chuva do antes
   -------------------------------------------------------------------------- */

const GOTAS = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 41.7 + 13) % 100,
  dur: 1.5 + ((i * 7) % 10) / 11,
  delay: -((i * 13) % 20) / 8,
  alto: 12 + ((i * 5) % 9),
  op: 0.1 + ((i * 3) % 6) / 40,
}));

function Chuva() {
  const { broken, started, lowPower } = useExperience();
  const ativo = started && !broken;
  const montado = useMontado(ativo);
  if (!montado) return null;

  const gotas = lowPower ? GOTAS.filter((_, i) => i % 2 === 0) : GOTAS;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[4] overflow-hidden transition-opacity duration-[1600ms]",
        ativo ? "opacity-100" : "opacity-0",
      )}
    >
      {gotas.map((g, i) => (
        <span
          key={i}
          className="gota absolute top-0 w-px"
          style={
            {
              left: `${g.left}%`,
              height: `${g.alto}px`,
              opacity: g.op,
              background:
                "linear-gradient(to bottom, transparent, rgb(158 180 210 / 0.9))",
              "--dur": `${g.dur}s`,
              "--delay": `${g.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   As petalas da rosa
   -------------------------------------------------------------------------- */

const PETALAS = Array.from({ length: 7 }, (_, i) => ({
  left: (i * 37 + 9) % 96,
  dur: 14 + ((i * 11) % 9),
  delay: -((i * 17) % 26),
  escala: 0.5 + ((i * 7) % 5) / 8,
  dx: ((i % 3) - 1) * 9,
  op: 0.18 + ((i * 3) % 4) / 22,
}));

function Petalas() {
  const { broken, lowPower } = useExperience();
  const montado = useMontado(broken, 0);
  if (!montado) return null;

  const petalas = lowPower ? PETALAS.filter((_, i) => i % 2 === 0) : PETALAS;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[4] overflow-hidden transition-opacity duration-[2500ms]",
        broken ? "opacity-100" : "opacity-0",
      )}
    >
      {petalas.map((p, i) => (
        <span
          key={i}
          className="petala-solta absolute top-0"
          style={
            {
              left: `${p.left}%`,
              opacity: p.op,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--dx": `${p.dx}vw`,
            } as CSSProperties
          }
        >
          <svg
            viewBox="0 0 40 44"
            width={22 * p.escala + 10}
            height={24 * p.escala + 11}
            fill="none"
          >
            <path
              d="M20 42 C 8 36, 4 20, 9 9 C 12 2, 28 2, 31 9 C 36 20, 32 36, 20 42 Z"
              fill="#c2415c"
              opacity="0.7"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   A estrada de madrugada (ato 7)
   -------------------------------------------------------------------------- */

const FAROIS = [
  { top: 58, dur: 4.2, delay: 0, largura: 34, peak: 0.4, contrario: false },
  { top: 66, dur: 5.6, delay: 2.1, largura: 26, peak: 0.28, contrario: false },
  { top: 74, dur: 4.8, delay: 3.4, largura: 30, peak: 0.34, contrario: true },
  { top: 82, dur: 6.2, delay: 1.2, largura: 22, peak: 0.22, contrario: true },
  { top: 62, dur: 7.1, delay: 4.6, largura: 20, peak: 0.18, contrario: false },
  { top: 78, dur: 5.1, delay: 5.3, largura: 28, peak: 0.26, contrario: true },
];

function Farois() {
  const { act, lowPower } = useExperience();
  const ativo = act === 7;
  const montado = useMontado(act >= 6 && act <= 8, 1400);
  if (!montado) return null;

  const farois = lowPower ? FAROIS.slice(0, 4) : FAROIS;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[4] overflow-hidden transition-opacity duration-[1300ms]",
        ativo ? "opacity-100" : "opacity-0",
      )}
    >
      {farois.map((f, i) => (
        <span
          key={i}
          className={cn("absolute", f.contrario ? "farol-contrario" : "farol")}
          style={
            {
              top: `${f.top}%`,
              width: `${f.largura}vw`,
              height: "2px",
              background: f.contrario
                ? "linear-gradient(to left, color-mix(in srgb, var(--c-fg) 55%, transparent), transparent)"
                : "linear-gradient(to right, transparent, color-mix(in srgb, var(--c-accent) 65%, transparent))",
              "--dur": `${f.dur}s`,
              "--delay": `${f.delay}s`,
              "--peak": f.peak,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function Cenario() {
  return (
    <>
      <Chuva />
      <Petalas />
      <Farois />
    </>
  );
}
