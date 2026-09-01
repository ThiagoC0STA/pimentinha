"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Frame } from "@/app/providers/experience";

/**
 * Camera dirigida por ato. Cada ato tem um ponto no espaco e um alvo de olhar,
 * e a camera passeia entre eles conforme o scroll. Nada de OrbitControls: a
 * direcao da cena e narrativa, nao brinquedo.
 */

const POS: [number, number, number][] = [
  [0, 0, 30], // 0 portao, tudo longe
  [0, 1.6, 25], // 1 antes de voce
  [2.2, 0.8, 18], // 2 voce chegou
  [1.2, 0, 13.5], // 3 eu tentei te afastar
  [0, 0, 14.5], // 4 a quebra, perto sem engolir a tela
  [0, 0, 20], // 5 quem e voce
  [0, 0.5, 22], // 6 sem perceber
  [0, 2.4, 23], // 7 cem quilometros
  [0, 4, 19], // 8 o futuro, olhando pra cima
  [0, 2, 34], // 9 a pergunta, tudo recuando
];

const LOOK: [number, number, number][] = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 5, -8],
  [0, 1, 0],
];

const v = (a: [number, number, number]) => new THREE.Vector3(a[0], a[1], a[2]);

export function Rig({ frame }: { frame: Frame }) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const points = useMemo(() => POS.map(v), []);
  const looks = useMemo(() => LOOK.map(v), []);

  useFrame((state, delta) => {
    const i = Math.min(POS.length - 1, Math.floor(frame.actFloat));
    const j = Math.min(POS.length - 1, i + 1);
    const t = frame.actFloat - i;

    target.copy(points[i]).lerp(points[j], t);
    lookTarget.copy(looks[i]).lerp(looks[j], t);

    // No ato dos 25 km a camera viaja junto com a corrente de particulas.
    if (frame.act === 7) {
      const travel = (frame.actProgress - 0.5) * 26;
      target.x += travel;
      lookTarget.x += travel;
    }

    // Parallax do ponteiro: a cena responde ao dedo dela sem virar brinquedo.
    target.x += frame.pointerX * 1.8;
    target.y += frame.pointerY * 1.1;

    // Tranco no instante da quebra: um tremor curto, nao um terremoto.
    const shake = frame.burst * frame.burst;
    if (shake > 0.001) {
      target.x += (Math.random() - 0.5) * shake * 0.7;
      target.y += (Math.random() - 0.5) * shake * 0.7;
    }

    const ease = 1 - Math.pow(0.001, delta);
    state.camera.position.lerp(target, ease * 0.85);
    currentLook.lerp(lookTarget, ease * 0.85);
    state.camera.lookAt(currentLook);
  });

  return null;
}
