"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useExperience } from "@/app/providers/experience";
import { PointCloud } from "./point-cloud";
import { Rig } from "./rig";

/**
 * Governanta de qualidade: mede o FPS real e rebaixa a cena quando a maquina
 * nao acompanha (aceleracao de hardware desligada, GPU fraca, notebook em
 * economia de energia). Melhor uma cena mais rala a 60fps do que a cena cheia
 * a 12fps parecendo site quebrado.
 */
function Governanta({ onRebaixar }: { onRebaixar: () => void }) {
  const frames = useRef(0);
  const inicio = useRef(0);

  useFrame((state) => {
    frames.current += 1;
    const t = state.clock.elapsedTime;
    if (inicio.current === 0) inicio.current = t;
    const janela = t - inicio.current;
    if (janela >= 2) {
      const fps = frames.current / janela;
      frames.current = 0;
      inicio.current = t;
      if (fps < 27) onRebaixar();
    }
  });

  return null;
}

/**
 * Uma unica cena atravessa o site inteiro. Ela nao e papel de parede: e a
 * historia. Ele disperso, ele fechado numa casca, ela chegando por fora e
 * insistindo, a casca estourando, os dois virando uma coisa so, e o ceu.
 */
export default function Scene() {
  const { frame, lowPower } = useExperience();
  const [visible, setVisible] = useState(true);

  // Aba escondida nao renderiza. Bateria dela agradece.
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /**
   * Densidade por area de tela, nao por aparelho.
   *
   * Contagem fixa faz a mesma nuvem parecer poeira num monitor de 27" e uma
   * tempestade num celular de 6". Aqui a conta e uma particula a cada N pixels,
   * entao a cena tem o mesmo peso visual em qualquer tela. Esse componente so
   * monta no cliente, entao ler `window` no estado inicial e seguro.
   */
  const [area] = useState(() => window.innerWidth * window.innerHeight);

  // Celular sob pressao de GPU pode derrubar o contexto WebGL no meio do
  // scroll: a cena pisca ou vira um retangulo preto, e parece que o site
  // recarregou. Quando isso acontecer, recriamos o canvas inteiro em meio
  // segundo, e a historia continua de onde estava.
  const [geracao, setGeracao] = useState(0);

  // 0 = cena cheia; 1 = economia; 2 = minimo. A Governanta sobe isso quando o
  // FPS medido fica abaixo de 27 por dois segundos.
  const [nivel, setNivel] = useState(0);
  const fator = nivel === 0 ? 1 : nivel === 1 ? 0.5 : 0.28;
  const himCount = Math.round(Math.min(3200, Math.max(520, area / 760)) * fator);
  const herCount = Math.round(himCount * 0.45);
  const dprMax = nivel === 0 ? (lowPower ? 1.4 : 1.8) : nivel === 1 ? 1.2 : 1;

  return (
    <Canvas
      key={geracao}
      frameloop={visible ? "always" : "never"}
      dpr={[1, dprMax]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 30], fov: 48, near: 0.1, far: 200 }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          // Sem o preventDefault o contexto morre pra sempre.
          e.preventDefault();
          setTimeout(() => setGeracao((g) => g + 1), 500);
        });
      }}
    >
      {nivel < 2 && <Governanta onRebaixar={() => setNivel((n) => Math.min(2, n + 1))} />}
      <Rig frame={frame} />

      {/* Ele: frio, disperso, fechado. Esquenta quando ela quebra a casca. */}
      <PointCloud
        role="him"
        count={himCount}
        frame={frame}
        size={lowPower ? 3.2 : 4.4}
        cold={["#cfdcf5", "#5c78b5"]}
        warm={["#ffe0c6", "#e89a5c"]}
        opacity={lowPower ? 0.3 : 0.4}
      />

      {/* Ela: o unico ponto quente da tela enquanto tudo ainda e frio. */}
      <PointCloud
        role="her"
        count={herCount}
        frame={frame}
        size={lowPower ? 3.4 : 4.6}
        cold={["#ffc98a", "#ff8fa3"]}
        warm={["#ffdcb0", "#ff7f9c"]}
        opacity={lowPower ? 0.34 : 0.46}
        fadeInPhase={0.9}
      />

      {/* Sem a esfera 3D: ela lia como "um planeta ai", e a parte fria inteira
          sofria por causa dela. A casca vive na narrativa e no gesto do hold;
          na cena, "fechado" e o nucleo denso de pontos da formacao 1. */}
    </Canvas>
  );
}
