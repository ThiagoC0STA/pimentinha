"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/app/providers/experience";

/**
 * Escreve `--sp` (0 a 1) no proprio elemento conforme ele atravessa a tela.
 * Quem consome e o CSS: tracos de SVG que se desenham, parallax, contadores.
 *
 * O rect fica em cache e so e remedido de tempos em tempos, senao seria um
 * getBoundingClientRect por elemento por frame, que e exatamente o tipo de
 * layout thrash que trava scroll em celular.
 */
export function useSectionProgress<T extends HTMLElement = HTMLDivElement>(
  varName = "--sp",
) {
  const ref = useRef<T>(null);
  const { subscribe } = useExperience();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let top = 0;
    let height = 1;
    let sinceMeasure = 999;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY;
      height = rect.height;
      sinceMeasure = 0;
    };

    measure();

    const unsubscribe = subscribe((frame) => {
      if (++sinceMeasure > 30) measure();
      const span = height + frame.vh;
      const raw = (frame.scrollY + frame.vh - top) / Math.max(1, span);
      const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      el.style.setProperty(varName, p.toFixed(4));
    });

    window.addEventListener("resize", measure);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", measure);
    };
  }, [subscribe, varName]);

  return ref;
}
