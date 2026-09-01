"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/app/providers/experience";

interface RevealOptions {
  /** Margem do observer. Negativo = espera o elemento entrar mais. */
  rootMargin?: string;
  threshold?: number | number[];
  /** Se false, o elemento volta a esconder ao sair da tela. */
  once?: boolean;
}

/**
 * Substitui `whileInView` de biblioteca de animacao: um IntersectionObserver
 * por elemento, uma classe, e o CSS faz o resto na GPU.
 *
 * Nada observa antes do portao abrir. O overlay do portao nao conta como
 * oclusao pro IntersectionObserver, entao numa tela alta de desktop os
 * primeiros atos "revelavam" invisiveis atras dele, e quando ela entrava o
 * texto ja estava la, parado, como se a animacao tivesse falhado.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const { rootMargin = "0px 0px -12% 0px", threshold = 0, once = true } = options;
  const { started } = useExperience();
  const ref = useRef<T>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    if (!started) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsIn(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIn(true);
          if (once) io.disconnect();
        } else if (!once) {
          setIsIn(false);
        }
      },
      { rootMargin, threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [started, rootMargin, threshold, once]);

  return [ref, isIn] as const;
}
