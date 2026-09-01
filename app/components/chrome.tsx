"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useExperience } from "@/app/providers/experience";
import { ATOS, TOTAL_ATOS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/** Grao, vinheta e as duas luzes de ambiente. Tudo fixo, nada re-renderiza. */
export function Atmosphere() {
  const { lowPower } = useExperience();
  return (
    <>
      {/* Grao: em celular custa caro compor a tela inteira todo frame. */}
      {!lowPower && (
        <div className="grain pointer-events-none fixed inset-0 z-40 opacity-50 mix-blend-overlay" />
      )}

      {/* Vinheta e veu de leitura ficam ENTRE a cena (z-0) e a carta (z-10).
          Por cima do texto eles apagariam justamente o que precisa ser lido. */}
      <div className="vignette pointer-events-none fixed inset-0 z-[5]" />
      <div
        className="pointer-events-none fixed inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(ellipse 92% 52% at 50% 50%, color-mix(in srgb, var(--c-bg) 70%, transparent), transparent 72%)",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 8%, color-mix(in srgb, var(--c-glow) 12%, transparent), transparent 70%)," +
            "radial-gradient(70% 50% at 50% 100%, color-mix(in srgb, var(--c-accent) 10%, transparent), transparent 72%)",
        }}
      />
    </>
  );
}

/** Ponto que segue o mouse. So no desktop, e discreto. */
export function Cursor() {
  const { lowPower } = useExperience();
  if (lowPower) return null;
  return <div className="cursor-dot" aria-hidden />;
}

/** Indicador lateral dos nove atos. Da a ela a nocao de que tem chao pela frente. */
export function ActProgress() {
  const { act, started } = useExperience();
  return (
    <div
      className={cn(
        "fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:flex",
        "transition-opacity duration-700",
        started ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      {ATOS.map((nome, i) => (
        <div key={nome} className="group flex items-center gap-2">
          <span
            className={cn(
              "type-label whitespace-nowrap text-[9px] text-muted transition-all duration-500",
              i === act ? "translate-x-0 opacity-70" : "translate-x-2 opacity-0",
            )}
          >
            {nome}
          </span>
          <span
            className={cn(
              "block rounded-full transition-all duration-700",
              i === act
                ? "h-6 w-[2px] bg-accent"
                : i < act
                  ? "h-[2px] w-[2px] bg-muted/70"
                  : "h-[2px] w-[2px] bg-muted/25",
            )}
          />
        </div>
      ))}
    </div>
  );
}

/** Seta piscando no primeiro ato, some assim que ela entende que e pra rolar. */
export function ScrollCue({ label = "role" }: { label?: string }) {
  const { started, act } = useExperience();
  const visible = started && act <= 1;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-7 z-40 flex flex-col items-center gap-2",
        "transition-opacity duration-1000",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <span className="type-label text-muted">{label}</span>
      <svg viewBox="0 0 24 24" className="cue-bounce h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 4v15m0 0 6-6m-6 6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * Barra fininha no topo com o quanto ela ja andou da historia.
 * Escrita direto no DOM pelo loop, sem passar por estado do React.
 */
export function ReadingBar() {
  const { subscribe, started } = useExperience();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribe((frame) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `scaleX(${frame.scroll.toFixed(4)})`;
    });
  }, [subscribe]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] transition-opacity duration-700",
        started ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-transparent via-accent to-glow"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/** Contador que sobe de 0 ate o alvo quando entra na tela. */
export function CountUp({
  to,
  duration = 1600,
  className,
  suffix = "",
  delay = 0,
}: {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let t0 = 0;
    const run = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0 - delay) / duration);
      if (p < 0) {
        raf = requestAnimationFrame(run);
        return;
      }
      // ease-out-expo: chega rapido e desacelera, como conta de verdade
      const eased = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = `${Math.round(to * eased)}${suffix}`;
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration, suffix, delay]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" } as CSSProperties}>
      0{suffix}
    </span>
  );
}

export { TOTAL_ATOS };
