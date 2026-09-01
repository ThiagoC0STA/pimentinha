"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(fallback);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Toque + tela pequena = celular. A cena 3D corta contagem de particulas e
 * efeitos por aqui. Comeca `false` no SSR e vira `true` na hidratacao, entao
 * nada que dependa disso pode ficar preso num estado inicial (a lição que o
 * lilicarvalho deu com a foto embaçada).
 */
export function useLowPower() {
  const coarse = useMediaQuery("(pointer: coarse)");
  const small = useMediaQuery("(max-width: 768px)");
  return coarse || small;
}
