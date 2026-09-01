"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildFormations, type Role } from "./formations";
import type { Frame } from "@/app/providers/experience";

/* --------------------------------------------------------------------------
   Shader

   O morph entre as cinco formacoes acontece inteiro na GPU: cada particula
   carrega as cinco posicoes e o vertex shader mistura as duas mais proximas
   da fase atual. O lilicarvalho recalculava 3600 matrizes por frame na CPU;
   aqui a CPU so escreve um float por frame.
   -------------------------------------------------------------------------- */

const VERT = /* glsl */ `
  uniform float uPhase;
  uniform float uTime;
  uniform float uBurst;
  uniform float uPull;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uSpread;
  uniform vec2 uPointer;

  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute float aSeed;

  varying float vSeed;
  varying float vGlow;

  float weight(float phase, float idx) {
    return clamp(1.0 - abs(phase - idx), 0.0, 1.0);
  }

  void main() {
    vSeed = aSeed;

    vec3 pos =
      aP0 * weight(uPhase, 0.0) +
      aP1 * weight(uPhase, 1.0) +
      aP2 * weight(uPhase, 2.0) +
      aP3 * weight(uPhase, 3.0) +
      aP4 * weight(uPhase, 4.0);

    // Respiracao quase imperceptivel: a cena tem que dar sinal de vida sem
    // roubar o olho da carta. Amplitude grande aqui vira formigueiro.
    float wob = 0.08 + aSeed * 0.14;
    pos.x += sin(uTime * 0.22 + aSeed * 24.0) * wob;
    pos.y += cos(uTime * 0.19 + aSeed * 17.0) * wob;
    pos.z += sin(uTime * 0.15 + aSeed * 31.0) * wob * 0.8;

    // Enquanto ela segura o dedo, o universo inteiro e puxado pra dentro,
    // prendendo a respiracao junto com ela.
    pos = mix(pos, pos * 0.42, uPull * (0.35 + aSeed * 0.4));

    // O estouro da casca empurra tudo pra fora por um instante, de leve:
    // a onda passa pela nuvem, nao explode a nuvem.
    pos += normalize(pos + 0.0001) * uBurst * (1.1 + aSeed * 3.4);

    // Sopro do ponteiro: a nuvem sente o dedo dela passando, de leve.
    vec2 toPointer = pos.xy - uPointer * 12.0;
    float d = length(toPointer);
    pos.xy += normalize(toPointer + 0.0001) * (1.2 / (1.0 + d * d * 0.06));

    pos *= uSpread;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Ponto pequeno e nitido. Grande demais vira mancha de leite e come o texto.
    float size = uSize * (0.45 + aSeed * 1.1) * (1.0 + uBurst * 1.2);
    gl_PointSize = clamp(size * uPixelRatio * (52.0 / max(1.0, -mv.z)), 0.5, 26.0);

    // Quem esta mais perto brilha mais forte.
    vGlow = clamp(1.0 - (-mv.z) / 78.0, 0.05, 1.0);
  }
`;

// Sem redeclarar precision aqui: o three ja injeta highp no prefixo, e baixar
// pra mediump so no fragment faz os varyings nao baterem com os do vertex, o
// que quebra o link do programa inteiro (tela preta, zero erro util no console).
const FRAG = /* glsl */ `
  uniform vec3 uColdA;
  uniform vec3 uColdB;
  uniform vec3 uWarmA;
  uniform vec3 uWarmB;
  uniform float uWarmth;
  uniform float uOpacity;
  uniform float uBurst;

  varying float vSeed;
  varying float vGlow;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Disco com queda suave: vira glow sem precisar de postprocessing.
    float a = smoothstep(0.5, 0.0, d);
    float core = pow(a, 8.0);
    a = pow(a, 3.2);

    vec3 cold = mix(uColdA, uColdB, vSeed);
    vec3 warm = mix(uWarmA, uWarmB, vSeed);
    vec3 col = mix(cold, warm, uWarmth);
    col += core * (0.28 + uBurst * 0.9);

    gl_FragColor = vec4(col, a * vGlow * uOpacity);
  }
`;

interface PointCloudProps {
  role: Role;
  count: number;
  frame: Frame;
  size?: number;
  /** Multiplicador de escala da formacao inteira. */
  spread?: number;
  cold: [string, string];
  warm: [string, string];
  /** Opacidade base, antes do fade final. */
  opacity?: number;
  /** Ela so aparece de verdade quando chega (ato 2 em diante). */
  fadeInPhase?: number;
}

export function PointCloud({
  role,
  count,
  frame,
  size = 9,
  spread = 1,
  cold,
  warm,
  opacity = 1,
  fadeInPhase = 0,
}: PointCloudProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const { positions, seeds } = buildFormations(count, role);
    const g = new THREE.BufferGeometry();
    // `position` existe so pra o three nao reclamar: a posicao real sai do morph.
    g.setAttribute("position", new THREE.BufferAttribute(positions[0], 3));
    g.setAttribute("aP0", new THREE.BufferAttribute(positions[0], 3));
    g.setAttribute("aP1", new THREE.BufferAttribute(positions[1], 3));
    g.setAttribute("aP2", new THREE.BufferAttribute(positions[2], 3));
    g.setAttribute("aP3", new THREE.BufferAttribute(positions[3], 3));
    g.setAttribute("aP4", new THREE.BufferAttribute(positions[4], 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count, role]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPhase: { value: 0 },
        uTime: { value: 0 },
        uBurst: { value: 0 },
        uPull: { value: 0 },
        uSize: { value: size },
        uSpread: { value: spread },
        uPixelRatio: { value: 1 },
        uPointer: { value: new THREE.Vector2() },
        uWarmth: { value: 0 },
        uOpacity: { value: 0 },
        uColdA: { value: new THREE.Color(cold[0]) },
        uColdB: { value: new THREE.Color(cold[1]) },
        uWarmA: { value: new THREE.Color(warm[0]) },
        uWarmB: { value: new THREE.Color(warm[1]) },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const m = matRef.current ?? material;
    const u = m.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPhase.value = frame.phase;
    u.uBurst.value = frame.burst * frame.burst;
    // A succao do hold solta rapido no estouro (dissolve sobe em ~1s).
    u.uPull.value = frame.crack * (1 - Math.min(1, frame.dissolve * 2.5));
    u.uWarmth.value = frame.warmth;
    u.uSize.value = size;
    u.uSpread.value = spread;
    u.uPixelRatio.value = Math.min(state.viewport.dpr ?? 1, 2);
    u.uPointer.value.set(frame.pointerX, frame.pointerY);

    // Fade de entrada por fase (ela so chega no ato 2) e fade final.
    const enter = fadeInPhase > 0 ? THREE.MathUtils.smoothstep(frame.phase, fadeInPhase - 0.85, fadeInPhase) : 1;
    const target = opacity * enter * (1 - frame.fade);
    u.uOpacity.value = THREE.MathUtils.lerp(u.uOpacity.value, target, 0.06);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}
