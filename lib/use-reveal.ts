"use client";

import { useEffect, useRef, useState } from "react";

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
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const { rootMargin = "0px 0px -12% 0px", threshold = 0, once = true } = options;
  const ref = useRef<T>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
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
  }, [rootMargin, threshold, once]);

  return [ref, isIn] as const;
}
