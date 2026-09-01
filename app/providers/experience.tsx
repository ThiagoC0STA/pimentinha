"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ATO_QUEBRA, TOTAL_ATOS } from "@/lib/constants";

/* ==========================================================================
   Um unico loop rAF dirige o site inteiro.

   Todo mundo (cena 3D, trajeto dos 25 km, parallax, paleta) le do mesmo
   objeto mutavel. Nada disso passa por estado do React, entao rolar a pagina
   nao dispara re-render nenhum. So mudanca de ATO re-renderiza, e sao 10 no
   site todo.
   ========================================================================== */

export interface Frame {
  /** Progresso do documento inteiro, 0 a 1. */
  scroll: number;
  scrollY: number;
  /** Ato ativo (indice) e progresso dentro dele. */
  act: number;
  actProgress: number;
  /** Ato em ponto flutuante: 3.4 = 40% do caminho do ato 3 pro 4. */
  actFloat: number;
  /** Formacao alvo da nuvem de particulas (0 a 4, continuo). */
  phase: number;
  /** Temperatura da paleta, 0 frio, 1 quente. */
  warmth: number;
  /** Opacidade da casca. */
  shell: number;
  /** Rachaduras crescendo enquanto ela segura o dedo, 0 a 1. */
  crack: number;
  /** 1 no instante da quebra, decaindo em ~2.5s. Serve pra shockwave e shake. */
  burst: number;
  /** Desintegracao da casca: 0 inteira, 1 dissolvida. Sobe em ~1s pos-quebra. */
  dissolve: number;
  /** Fade final: 1 = tudo apagado no ato da pergunta. */
  fade: number;
  pointerX: number;
  pointerY: number;
  vw: number;
  vh: number;
  time: number;
}

type FrameListener = (frame: Frame) => void;

interface ExperienceApi {
  frame: Frame;
  subscribe: (fn: FrameListener) => () => void;
  started: boolean;
  start: () => void;
  broken: boolean;
  breakShell: () => void;
  /** Enquanto ela segura o dedo: 0 a 1. */
  setCrack: (v: number) => void;
  /** Prende a pagina onde ela esta ate a casca quebrar. */
  lockScroll: () => void;
  releaseScroll: () => void;
  scrollLocked: boolean;
  /** Quantas vezes ela tentou rolar enquanto estava presa. */
  nudges: number;
  act: number;
  reduced: boolean;
  lowPower: boolean;
}

const ExperienceContext = createContext<ExperienceApi | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience precisa estar dentro de <Experience>");
  return ctx;
}

/* --------------------------------------------------------------------------
   Paletas. A quente so existe depois que a casca quebra.
   -------------------------------------------------------------------------- */

type Rgb = [number, number, number];

/**
 * O frio e noite de luar, nao cinza de escritorio. A primeira paleta fria
 * era azul-aco apagado e a parte inteira parecia morta perto da quente.
 */
const COLD: Record<string, Rgb> = {
  bg: [5, 7, 15],
  surface: [11, 15, 24],
  fg: [188, 198, 216],
  muted: [110, 122, 146],
  accent: [142, 168, 216],
  glow: [122, 152, 208],
};

const WARM: Record<string, Rgb> = {
  bg: [14, 8, 9],
  surface: [28, 16, 15],
  fg: [255, 226, 209],
  muted: [181, 137, 120],
  accent: [242, 178, 114],
  glow: [255, 145, 164],
};

const PALETTE_KEYS = Object.keys(COLD);

/** Formacao alvo da nuvem em cada ato. Interpolado entre atos vizinhos. */
const PHASE_BY_ACT = [0, 0.55, 1, 1, 1, 2.35, 2.7, 3, 4, 4];
/**
 * Presenca da casca em cada ato. No ato da quebra ela ja saiu de cena: o
 * momento do dedo dela e tela escura, o circulo e o vidro trincando. A
 * esfera 3D brilhando ali em cima era exatamente o excesso que estava feio.
 */
const SHELL_BY_ACT = [0, 0.5, 0.9, 1, 0, 0, 0, 0, 0, 0];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function Experience({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [broken, setBroken] = useState(false);
  const [act, setAct] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  const frameRef = useRef<Frame>({
    scroll: 0,
    scrollY: 0,
    act: 0,
    actProgress: 0,
    actFloat: 0,
    phase: 0,
    warmth: 0,
    shell: 0,
    crack: 0,
    burst: 0,
    dissolve: 0,
    fade: 0,
    pointerX: 0,
    pointerY: 0,
    vw: 1280,
    vh: 800,
    time: 0,
  });

  const listeners = useRef(new Set<FrameListener>());
  const brokenRef = useRef(false);
  const brokenAtRef = useRef(0);
  const crackRef = useRef(0);
  const actRef = useRef(0);
  const lockYRef = useRef<number | null>(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [nudges, setNudges] = useState(0);

  const subscribe = useCallback((fn: FrameListener) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const setCrack = useCallback((v: number) => {
    crackRef.current = clamp01(v);
  }, []);

  const breakShell = useCallback(() => {
    if (brokenRef.current) return;
    brokenRef.current = true;
    brokenAtRef.current = performance.now();
    crackRef.current = 1;
    setBroken(true);
    // Vibração curta: ela sente a casca estourar na mão.
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([18, 40, 90]);
    }
  }, []);

  const start = useCallback(() => {
    setStarted(true);
  }, []);

  /* Trava do ato 4 -------------------------------------------------------- */

  const lockScroll = useCallback(() => {
    if (lockYRef.current !== null) return;
    lockYRef.current = window.scrollY;
    setScrollLocked(true);
  }, []);

  const releaseScroll = useCallback(() => {
    if (lockYRef.current === null) return;
    lockYRef.current = null;
    setScrollLocked(false);
    setNudges(0);
  }, []);

  /**
   * Enquanto a casca nao quebra, a pagina nao anda. Rolar tem que nao dar em
   * nada: e o unico jeito de garantir que ela realmente encoste o dedo, em vez
   * de passar batido rolando.
   *
   * `passive: false` e obrigatorio aqui, senao o preventDefault e ignorado e o
   * touch do celular continua rolando.
   */
  useEffect(() => {
    if (!scrollLocked) return;

    const bloquear = (e: Event) => {
      e.preventDefault();
      setNudges((n) => (n < 99 ? n + 1 : n));
    };
    const bloquearTeclas = (e: KeyboardEvent) => {
      const teclas = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (teclas.includes(e.key)) {
        e.preventDefault();
        setNudges((n) => (n < 99 ? n + 1 : n));
      }
    };

    window.addEventListener("wheel", bloquear, { passive: false });
    window.addEventListener("touchmove", bloquear, { passive: false });
    window.addEventListener("keydown", bloquearTeclas);

    return () => {
      window.removeEventListener("wheel", bloquear);
      window.removeEventListener("touchmove", bloquear);
      window.removeEventListener("keydown", bloquearTeclas);
    };
  }, [scrollLocked]);

  // A casca quebrou: a pagina volta a andar.
  useEffect(() => {
    if (broken) releaseScroll();
  }, [broken, releaseScroll]);

  /* Preferencias do aparelho ---------------------------------------------- */
  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mp = window.matchMedia("(pointer: coarse), (max-width: 768px)");
    const sync = () => {
      setReduced(mm.matches);
      setLowPower(mp.matches);
    };
    sync();
    mm.addEventListener("change", sync);
    mp.addEventListener("change", sync);
    return () => {
      mm.removeEventListener("change", sync);
      mp.removeEventListener("change", sync);
    };
  }, []);

  /* Trava o scroll ate ela tocar no portao --------------------------------- */
  useEffect(() => {
    document.body.dataset.locked = started ? "false" : "true";
    if (!started) window.scrollTo(0, 0);
  }, [started]);

  /* Ponteiro --------------------------------------------------------------- */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const f = frameRef.current;
      f.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      f.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
      document.documentElement.style.setProperty("--cx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--cy", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /* O loop ----------------------------------------------------------------- */
  useEffect(() => {
    let rafId = 0;
    let sections: { top: number; height: number }[] = [];
    let docHeight = 0;
    let lastPaletteWrite = -1;
    const root = document.documentElement;

    const measure = () => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-act]");
      const next: { top: number; height: number }[] = [];
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        next[Number(node.dataset.act)] = {
          top: rect.top + window.scrollY,
          height: rect.height,
        };
      });
      sections = next;
      docHeight = document.body.scrollHeight;
    };

    const writePalette = (warmth: number) => {
      if (Math.abs(warmth - lastPaletteWrite) < 0.004) return;
      lastPaletteWrite = warmth;
      root.style.setProperty("--warmth", warmth.toFixed(3));
      for (const key of PALETTE_KEYS) {
        const c = COLD[key];
        const w = WARM[key];
        root.style.setProperty(
          `--c-${key}`,
          `rgb(${Math.round(lerp(c[0], w[0], warmth))} ${Math.round(
            lerp(c[1], w[1], warmth),
          )} ${Math.round(lerp(c[2], w[2], warmth))})`,
        );
      }
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (document.hidden) return;

      const f = frameRef.current;
      f.time = now / 1000;
      f.vw = window.innerWidth;
      f.vh = window.innerHeight;

      // O documento cresce conforme imagens carregam. Remedir e barato.
      if (document.body.scrollHeight !== docHeight || sections.length === 0) {
        measure();
      }

      // Presa no ato 4: qualquer resvalo de scroll volta pro lugar. Isso pega
      // ate o momentum do iOS, que ignora preventDefault depois que começou.
      if (lockYRef.current !== null && window.scrollY !== lockYRef.current) {
        window.scrollTo(0, lockYRef.current);
      }

      const scrollY = window.scrollY;
      f.scrollY = scrollY;
      f.scroll = clamp01(scrollY / Math.max(1, docHeight - f.vh));

      // Ato ativo: aquele que ocupa o meio da tela.
      const probe = scrollY + f.vh * 0.5;
      let current = 0;
      let progress = 0;
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        if (!s) continue;
        if (probe >= s.top && probe < s.top + s.height) {
          current = i;
          progress = clamp01((probe - s.top) / Math.max(1, s.height));
          break;
        }
        if (probe >= s.top + s.height) {
          current = i;
          progress = 1;
        }
      }
      f.act = current;
      f.actProgress = progress;
      f.actFloat = current + progress;

      if (current !== actRef.current) {
        actRef.current = current;
        setAct(current);
      }

      // Rede de seguranca de ultimo caso: se por qualquer motivo ela chegar
      // depois do ato da quebra sem ter quebrado (link direto, restauracao de
      // scroll do navegador), a casca quebra sozinha. Dentro do ato 4 nao tem
      // atalho nenhum: so quebra com o dedo dela.
      if (!brokenRef.current && current > ATO_QUEBRA) breakShell();

      // Formacao da nuvem: interpolada entre o ato atual e o proximo.
      const nextAct = Math.min(TOTAL_ATOS - 1, current + 1);
      let phase = lerp(PHASE_BY_ACT[current], PHASE_BY_ACT[nextAct], progress);
      let shell = lerp(SHELL_BY_ACT[current], SHELL_BY_ACT[nextAct], progress);

      // Antes de quebrar, a nuvem nao passa da casca por mais que ela role.
      // A casca em si so e forcada nos atos 2 e 3: no 4 ela sai de cena de
      // proposito pra deixar o momento do dedo dela limpo.
      if (!brokenRef.current) {
        phase = Math.min(phase, 1);
        if (current >= 2 && current <= 3) shell = Math.max(shell, 1);
      }

      f.phase = lerp(f.phase, phase, 0.06);
      f.shell = lerp(f.shell, brokenRef.current ? 0 : shell, 0.08);
      f.crack = lerp(f.crack, crackRef.current, 0.18);

      // Impulso da quebra: 1 no estouro, some em ~2.5s.
      f.burst = brokenRef.current
        ? Math.max(0, 1 - (now - brokenAtRef.current) / 2500)
        : 0;

      // A casca nao explode em cacos: ela se desintegra em ~1.1s.
      f.dissolve = brokenRef.current
        ? Math.min(1, (now - brokenAtRef.current) / 1100)
        : 0;

      // Temperatura. So esquenta depois da casca quebrar.
      const targetWarmth = brokenRef.current ? 1 : crackRef.current * 0.12;
      f.warmth = lerp(f.warmth, targetWarmth, 0.035);
      writePalette(f.warmth);

      // Ato final: a cena inteira se apaga pra sobrar a frase.
      const finalAct = TOTAL_ATOS - 1;
      const targetFade =
        current >= finalAct ? clamp01(progress * 2.2) : current === finalAct - 1 ? clamp01((progress - 0.6) * 1.2) : 0;
      f.fade = lerp(f.fade, targetFade, 0.05);

      for (const fn of listeners.current) fn(f);
    };

    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [breakShell]);

  const api = useMemo<ExperienceApi>(
    () => ({
      frame: frameRef.current,
      subscribe,
      started,
      start,
      broken,
      breakShell,
      setCrack,
      lockScroll,
      releaseScroll,
      scrollLocked,
      nudges,
      act,
      reduced,
      lowPower,
    }),
    [
      subscribe,
      started,
      start,
      broken,
      breakShell,
      setCrack,
      lockScroll,
      releaseScroll,
      scrollLocked,
      nudges,
      act,
      reduced,
      lowPower,
    ],
  );

  return <ExperienceContext.Provider value={api}>{children}</ExperienceContext.Provider>;
}
