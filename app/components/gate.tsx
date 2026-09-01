"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/app/providers/experience";
import { cn } from "@/lib/cn";

/**
 * O portao.
 *
 * Existe por dois motivos. O primeiro e tecnico: navegador nenhum deixa audio
 * tocar sozinho, entao precisa de um toque dela pra musica comecar. O segundo
 * e o que importa: ninguem entra numa carta dessas no meio de outra coisa. Ela
 * toca, o mundo escurece, a musica entra, e so entao a historia comeca.
 */
export function Gate() {
  const { start, started } = useExperience();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setGone(true), 1600);
    return () => clearTimeout(t);
  }, [started]);

  if (gone) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 text-center",
        "transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        started ? "pointer-events-none scale-105 opacity-0 blur-md" : "opacity-100",
      )}
      style={{ background: "var(--c-bg)" }}
    >
      <span
        className="type-label flicker-in text-muted"
        style={{ ["--flicker-delay" as string]: "0.25s" }}
      >
        para
      </span>

      <h1
        className="type-hero font-display mt-5 italic flicker-in text-white/95"
        style={{ ["--flicker-delay" as string]: "0.6s" }}
      >
        Sophya
      </h1>

      <button
        type="button"
        onClick={start}
        className={cn(
          "group relative mt-16 flex h-32 w-32 items-center justify-center rounded-full",
          "border border-white/12 transition-all duration-700",
          "hover:scale-105 hover:border-accent/50",
          "flicker-in",
        )}
        style={{ ["--flicker-delay" as string]: "1.2s" }}
      >
        <span className="ring-out absolute inset-0 rounded-full border border-accent/25" />
        <span
          className="ring-out absolute inset-0 rounded-full border border-accent/15"
          style={{ ["--ring-delay" as string]: "1.7s" }}
        />
        <span className="type-label z-10 text-fg/80 transition-colors group-hover:text-accent">
          toca aqui
        </span>
      </button>

      <p
        className="type-small mt-14 max-w-xs text-balance text-muted flicker-in"
        style={{ ["--flicker-delay" as string]: "1.75s" }}
      >
        aumenta o volume, e vai devagar.
        <br />
        eu levei um tempo fazendo isso.
      </p>
    </div>
  );
}
