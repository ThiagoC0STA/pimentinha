"use client";

import type { CSSProperties } from "react";
import { useExperience } from "@/app/providers/experience";
import { cn } from "@/lib/cn";

/**
 * Camada de vida entre a cena 3D e a carta.
 *
 * Duas nebulosas passeando bem devagar e uma dúzia de vaga-lumes subindo.
 * Tudo herda a paleta, entao a mesma camada e azul e melancolica antes da
 * casca quebrar e dourada depois, sem trocar uma linha de codigo.
 */

const VAGALUMES = [
  { left: 8, top: 72, size: 3, dur: 24, delay: 0, dx: 5, peak: 0.7 },
  { left: 21, top: 88, size: 2, dur: 31, delay: 4, dx: -4, peak: 0.5 },
  { left: 34, top: 64, size: 4, dur: 27, delay: 9, dx: 6, peak: 0.8 },
  { left: 47, top: 92, size: 2.5, dur: 35, delay: 2, dx: -3, peak: 0.55 },
  { left: 58, top: 76, size: 3, dur: 22, delay: 12, dx: 4, peak: 0.75 },
  { left: 69, top: 85, size: 2, dur: 29, delay: 6, dx: -6, peak: 0.5 },
  { left: 80, top: 68, size: 3.5, dur: 33, delay: 15, dx: 3, peak: 0.7 },
  { left: 91, top: 90, size: 2, dur: 26, delay: 10, dx: -5, peak: 0.45 },
  { left: 14, top: 55, size: 2.5, dur: 38, delay: 18, dx: 7, peak: 0.6 },
  { left: 63, top: 58, size: 2, dur: 30, delay: 21, dx: -4, peak: 0.5 },
  { left: 39, top: 80, size: 2, dur: 25, delay: 7, dx: 5, peak: 0.65 },
  { left: 86, top: 78, size: 2.5, dur: 36, delay: 14, dx: -3, peak: 0.55 },
];

export function Ambient() {
  const { started, reduced, lowPower } = useExperience();
  if (reduced) return null;

  // Celular ganha metade dos vaga-lumes: sao doze elementos animando o tempo
  // todo, e ali cada camada composta custa bateria.
  const bichinhos = lowPower ? VAGALUMES.filter((_, i) => i % 2 === 0) : VAGALUMES;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[6] overflow-hidden transition-opacity duration-[2500ms]",
        started ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Nebulosas */}
      <div
        className="nebula-a absolute -top-[20%] -left-[15%] h-[70vh] w-[80vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--c-glow) 14%, transparent), transparent)",
        }}
      />
      <div
        className="nebula-b absolute -right-[20%] bottom-[-15%] h-[65vh] w-[75vw]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--c-accent) 12%, transparent), transparent)",
        }}
      />

      {/* Vaga-lumes */}
      {bichinhos.map((f, i) => (
        <span
          key={i}
          className="firefly absolute rounded-full"
          style={
            {
              left: `${f.left}%`,
              top: `${f.top}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              background: "var(--c-glow)",
              boxShadow:
                "0 0 8px 2px color-mix(in srgb, var(--c-glow) 55%, transparent)",
              "--ff-dur": `${f.dur}s`,
              "--ff-delay": `-${f.delay}s`,
              "--ff-dx": `${f.dx}vw`,
              "--ff-peak": f.peak,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
