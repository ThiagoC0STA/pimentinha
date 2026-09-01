"use client";

import { useEffect, useRef } from "react";

/**
 * Tilt 3D no mouse. O JS so escreve duas CSS vars, a GPU interpola.
 * Ignorado em touch (o dedo cobre o elemento, o efeito nao existe).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(strength = 9) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--tilt-x", `${(0.5 - y) * strength}deg`);
      el.style.setProperty("--tilt-y", `${(x - 0.5) * strength}deg`);
    };

    const onLeave = () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return ref;
}
