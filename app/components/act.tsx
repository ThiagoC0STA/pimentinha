"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Cada ato e uma secao marcada com `data-act`. O loop do provider mede essas
 * secoes pra saber em que ponto da historia ela esta, e a cena 3D se move
 * junto. Um ato = um estado do mundo.
 */
export function Act({
  index,
  children,
  className,
  full = true,
}: {
  index: number;
  children: ReactNode;
  className?: string;
  /** Ocupa a tela inteira (padrao) ou so o que o conteudo pedir. */
  full?: boolean;
}) {
  return (
    <section
      data-act={index}
      className={cn(
        "relative z-10 w-full",
        full && "flex min-h-[100dvh] flex-col justify-center",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Container de leitura: largura confortavel no celular e no desktop. */
export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl px-6 sm:px-10", className)}>{children}</div>
  );
}

/**
 * Uma batida da narrativa: um pensamento por tela.
 * E o que faz a leitura ter ritmo de respiracao em vez de parede de texto.
 */
export function Beat({
  children,
  className,
  height = "65vh",
}: {
  children: ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={cn("flex w-full flex-col justify-center py-16", className)}
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
}

/** Numero do ato + nome, discreto, no canto de cima. */
export function ActMark({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-14 flex items-center gap-3">
      <span className="font-display text-sm text-accent italic">{n}</span>
      <span className="h-px w-8 bg-muted/30" />
      <span className="type-label text-muted">{title}</span>
    </div>
  );
}
