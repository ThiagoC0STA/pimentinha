"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { useExperience } from "./experience";

/**
 * Scroll com inercia so no desktop. Em touch, o momentum nativo do iOS e do
 * Android e melhor do que qualquer lib consegue, e Lenis briga com ele.
 *
 * O Lenis precisa saber da trava do ato 4. Sem isso ele guarda um alvo de
 * scroll la embaixo e fica a experiencia inteira lutando contra o snap-back
 * do provider: a pagina treme, e depois de destravar ela dispara sozinha pro
 * alvo velho. Era exatamente o "travado" do desktop.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const { scrollLocked } = useExperience();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || touch) return;

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (scrollLocked) {
      // Congela o Lenis E descarta o momentum que ele ja tinha agendado.
      lenis.stop();
      return;
    }

    // Destravou: realinha o alvo interno com onde a pagina realmente esta
    // antes de voltar a andar, senao ele retoma um scroll antigo sozinho.
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis.start();
  }, [scrollLocked]);

  return <>{children}</>;
}
