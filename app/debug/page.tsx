"use client";

import { useEffect, useState } from "react";

/**
 * Raio-x da maquina onde o site esta rodando. Existe pra responder de vez a
 * pergunta "por que buga no desktop e nao no celular": abre /debug na maquina
 * problematica e as respostas estao na tela.
 */

interface Diag {
  userAgent: string;
  viewport: string;
  dpr: number;
  reducedMotion: boolean;
  pointerCoarse: boolean;
  webgl: string;
  webglOk: boolean;
  cores: number;
  fps: number | null;
}

function medirWebgl(): { ok: boolean; renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return { ok: false, renderer: "sem contexto WebGL" };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    return { ok: true, renderer };
  } catch {
    return { ok: false, renderer: "erro ao criar contexto" };
  }
}

export default function DebugPage() {
  const [diag, setDiag] = useState<Diag | null>(null);

  useEffect(() => {
    const webgl = medirWebgl();
    const base: Diag = {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth} x ${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
      webgl: webgl.renderer,
      webglOk: webgl.ok,
      cores: navigator.hardwareConcurrency ?? 0,
      fps: null,
    };
    setDiag(base);

    // FPS cru do navegador por 3 segundos.
    let frames = 0;
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      frames += 1;
      if (performance.now() - t0 < 3000) {
        raf = requestAnimationFrame(tick);
      } else {
        setDiag((d) => (d ? { ...d, fps: Math.round(frames / 3) } : d));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!diag) return null;

  const softwareGl = /swiftshader|software|llvmpipe|basic render/i.test(diag.webgl);

  const linhas: [string, string, boolean][] = [
    ["navegador", diag.userAgent, false],
    ["tela", `${diag.viewport} @ ${diag.dpr}x`, false],
    ["nucleos de cpu", String(diag.cores), false],
    ["ponteiro", diag.pointerCoarse ? "touch (celular)" : "fino (desktop)", false],
    [
      "reduced motion",
      diag.reducedMotion ? "ATIVO (Windows com animacoes desligadas)" : "desligado",
      diag.reducedMotion,
    ],
    ["webgl", diag.webgl, !diag.webglOk || softwareGl],
    [
      "fps do navegador",
      diag.fps === null ? "medindo (3s)..." : `${diag.fps}`,
      diag.fps !== null && diag.fps < 40,
    ],
  ];

  return (
    <main className="min-h-screen bg-neutral-950 p-8 font-mono text-sm text-neutral-300">
      <h1 className="mb-2 text-lg text-white">raio-x desta maquina</h1>
      <p className="mb-8 text-neutral-500">
        manda um print dessa tela. linha vermelha = provavel culpado.
      </p>
      <dl className="flex max-w-3xl flex-col gap-3">
        {linhas.map(([nome, valor, alerta]) => (
          <div key={nome} className="grid grid-cols-[160px_1fr] gap-4 border-b border-neutral-800 pb-3">
            <dt className="text-neutral-500">{nome}</dt>
            <dd className={alerta ? "font-bold text-red-400" : "text-neutral-200"}>
              {valor}
              {alerta && softwareGl && nome === "webgl" && (
                <span className="mt-1 block font-normal text-red-300">
                  renderizacao por software: a aceleracao de hardware do navegador esta
                  desligada (Configuracoes → Sistema → &quot;Usar aceleracao grafica&quot;)
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
