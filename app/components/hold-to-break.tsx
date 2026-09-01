"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/app/providers/experience";
import { cn } from "@/lib/cn";

const HOLD_MS = 2100;
const R = 46;
const CIRC = 2 * Math.PI * R;

/**
 * O unico momento em que ela toca no site.
 *
 * Ela segura o dedo por dois segundos e a casca racha. Nao e enfeite: foi ela
 * quem quebrou a casca dele na vida real, entao aqui a casca so quebra com a
 * mao dela. Se ela nao entender e continuar rolando, o provider quebra sozinho
 * no fim da secao, entao a experiencia nunca trava.
 */
export function HoldToBreak() {
  const { setCrack, breakShell, broken } = useExperience();
  const ringRef = useRef<SVGCircleElement>(null);
  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      if (broken) return;

      const p = progressRef.current;
      // Segurando: enche em HOLD_MS. Soltou: esvazia em ~2x mais devagar.
      const next = holdingRef.current
        ? Math.min(1, p + dt / HOLD_MS)
        : Math.max(0, p - dt / (HOLD_MS * 1.8));

      if (next !== p) {
        progressRef.current = next;
        setCrack(next);
        const ring = ringRef.current;
        if (ring) ring.style.strokeDashoffset = `${CIRC * (1 - next)}`;
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

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 transition-all duration-1000",
        broken ? "pointer-events-none scale-90 opacity-0" : "opacity-100",
      )}
    >
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

      <span className="type-label text-muted">
        {holding ? "não solta" : "segura aqui"}
      </span>
    </div>
  );
}
