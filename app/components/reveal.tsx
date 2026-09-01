"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReveal } from "@/lib/use-reveal";

/*
 * Primitivas de entrada. Todas seguem a mesma receita: um IntersectionObserver
 * liga uma classe, e o CSS faz a animacao na GPU. Nenhuma biblioteca de
 * animacao no bundle, nenhum tween brigando com o scroll do celular.
 */

interface BaseProps {
  children: ReactNode;
  className?: string;
  /** Atraso em ms antes de comecar. */
  delay?: number;
  once?: boolean;
  style?: CSSProperties;
}

/** Bloco que sobe, desfoca e assenta. O basico do site inteiro. */
export function Reveal({ children, className, delay = 0, once = true, style }: BaseProps) {
  const [ref, isIn] = useReveal<HTMLDivElement>({ once });
  return (
    <div
      ref={ref}
      className={cn("rv", isIn && "is-in", className)}
      style={{ "--rv-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** Linha que sobe de dentro de um recorte, como cortina de teatro. */
export function RevealLine({ children, className, delay = 0, once = true }: BaseProps) {
  const [ref, isIn] = useReveal<HTMLSpanElement>({ once });
  return (
    <span
      ref={ref}
      className={cn("rv-mask", isIn && "is-in", className)}
      style={{ "--rv-delay": `${delay}ms` } as CSSProperties}
    >
      <span>{children}</span>
    </span>
  );
}

interface TextProps {
  text: string;
  className?: string;
  delay?: number;
  /** Intervalo entre palavras (ou letras), em ms. */
  stagger?: number;
  once?: boolean;
  style?: CSSProperties;
}

/** Texto que aparece palavra por palavra. O ritmo da carta inteira. */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 55,
  once = true,
  style,
}: TextProps) {
  const [ref, isIn] = useReveal<HTMLParagraphElement>({ once });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={cn("rv-words", isIn && "is-in", className)}
      style={
        {
          "--rv-delay": `${delay}ms`,
          "--rv-stagger": `${stagger}ms`,
          ...style,
        } as CSSProperties
      }
    >
      {/* O espaco vai FORA do span. Dentro de um inline-block ele e colapsado
          e as palavras grudam ("Antesdevoce"). */}
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="w" style={{ "--i": i } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

/** Letra por letra. So pros dois ou tres momentos que merecem. */
export function RevealChars({ text, className, delay = 0, stagger = 34, once = true }: TextProps) {
  const [ref, isIn] = useReveal<HTMLSpanElement>({ once });
  const chars = [...text];

  return (
    <span
      ref={ref}
      className={cn("rv-chars inline-block", isIn && "is-in", className)}
      style={
        {
          "--rv-delay": `${delay}ms`,
          "--rv-stagger": `${stagger}ms`,
        } as CSSProperties
      }
    >
      {chars.map((ch, i) => (
        <span key={i} className="ch" style={{ "--i": i } as CSSProperties}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/** Escala suave. Bom pra fotos e cartoes. */
export function RevealScale({ children, className, delay = 0, once = true, style }: BaseProps) {
  const [ref, isIn] = useReveal<HTMLDivElement>({ once });
  return (
    <div
      ref={ref}
      className={cn("rv-scale", isIn && "is-in", className)}
      style={{ "--rv-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
