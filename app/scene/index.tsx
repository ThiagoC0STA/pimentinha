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

  const himCount = lowPower ? 2200 : 5200;
  const herCount = lowPower ? 1100 : 2600;

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
        size={lowPower ? 5.4 : 6}
        cold={["#6f88ab", "#2b4266"]}
        warm={["#ffe0c6", "#e89a5c"]}
        opacity={0.72}
      />

      {/* Ela: o unico ponto quente da tela enquanto tudo ainda e frio. */}
      <PointCloud
        role="her"
        count={herCount}
        frame={frame}
        size={lowPower ? 5.8 : 6.5}
        cold={["#ffc98a", "#ff8fa3"]}
        warm={["#ffdcb0", "#ff7f9c"]}
        opacity={0.85}
        fadeInPhase={0.9}
      />

      <Shell frame={frame} detail={lowPower ? 3 : 5} />
      <Shards frame={frame} count={lowPower ? 64 : 96} />
      <Shockwave frame={frame} />
    </Canvas>
  );
}
