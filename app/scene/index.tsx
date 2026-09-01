"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useExperience } from "@/app/providers/experience";
import { PointCloud } from "./point-cloud";
import { Rig } from "./rig";
import { Shell, Shards, Shockwave } from "./shell";

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
  const himCount = Math.round(Math.min(3200, Math.max(520, area / 760)));
  const herCount = Math.round(himCount * 0.45);

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={lowPower ? [1, 1.4] : [1, 1.8]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 30], fov: 48, near: 0.1, far: 200 }}
      style={{ pointerEvents: "none" }}
    >
      <Rig frame={frame} />

      {/* Ele: frio, disperso, fechado. Esquenta quando ela quebra a casca. */}
      <PointCloud
        role="him"
        count={himCount}
        frame={frame}
        size={lowPower ? 3.2 : 4.4}
        cold={["#6f88ab", "#2b4266"]}
        warm={["#ffe0c6", "#e89a5c"]}
        opacity={lowPower ? 0.26 : 0.36}
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

      <Shell frame={frame} detail={lowPower ? 3 : 5} />
      <Shards frame={frame} count={lowPower ? 64 : 96} />
      <Shockwave frame={frame} />
    </Canvas>
  );
}
