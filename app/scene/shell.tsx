"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Frame } from "@/app/providers/experience";

/* --------------------------------------------------------------------------
   A casca

   Uma esfera que existe entre os atos 1 e 4. As rachaduras sao procedurais:
   linhas onde um ruido 3D cruza o zero, ficando mais grossas e mais quentes
   conforme ela segura o dedo na tela. Quando quebra, a esfera some, os
   estilhacos voam e uma onda de choque atravessa a tela.
   -------------------------------------------------------------------------- */

const NOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const SHELL_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uCrack;

  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;

  ${NOISE}

  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);

    // Respiracao lenta. Quando ela comeca a segurar, a casca treme.
    float breath = sin(uTime * 0.7) * 0.05;
    float tremor = snoise(position * 3.0 + uTime * 6.0) * uCrack * 0.16;
    vec3 p = position * (1.0 + breath + tremor);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const SHELL_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uCrack;
  uniform float uOpacity;
  uniform vec3 uRim;
  uniform vec3 uCrackColor;

  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;

  ${NOISE}

  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.2);

    // Rachaduras: onde o ruido cruza o zero. Engrossam com uCrack.
    float n1 = snoise(vPos * 1.25);
    float n2 = snoise(vPos * 2.9 + 11.0);
    float w1 = 0.012 + uCrack * 0.075;
    float w2 = 0.008 + uCrack * 0.05;

    float lines = 1.0 - smoothstep(0.0, w1, abs(n1));
    lines += (1.0 - smoothstep(0.0, w2, abs(n2))) * smoothstep(0.35, 0.9, uCrack);
    lines = clamp(lines, 0.0, 1.0) * uCrack;

    // Pulso percorrendo as fissuras enquanto ela segura.
    float pulse = 0.65 + 0.35 * sin(uTime * 5.0 + vPos.y * 2.0);

    vec3 col = uRim * fres * 0.5 + uCrackColor * lines * pulse * 1.35;
    float alpha = (fres * 0.3 + lines * 0.9) * uOpacity;

    if (alpha < 0.002) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function Shell({ frame, detail = 4 }: { frame: Frame; detail?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SHELL_VERT,
        fragmentShader: SHELL_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uCrack: { value: 0 },
          uOpacity: { value: 0 },
          uRim: { value: new THREE.Color("#7fa0cc") },
          uCrackColor: { value: new THREE.Color("#ffb066") },
        },
      }),
    [],
  );

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(4.75, detail), [detail]);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uCrack.value = frame.crack;
    u.uOpacity.value = frame.shell * (1 - frame.fade);

    const mesh = meshRef.current;
    if (mesh) {
      mesh.rotation.y = state.clock.elapsedTime * 0.06;
      mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.13) * 0.12;
      // No estouro, a casca infla um instante antes de sumir.
      const s = 1 + frame.burst * 0.55;
      mesh.scale.setScalar(s);
      mesh.visible = u.uOpacity.value > 0.004;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </mesh>
  );
}

/* --------------------------------------------------------------------------
   Estilhacos
   -------------------------------------------------------------------------- */

export function Shards({ frame, count = 56 }: { frame: Frame; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const dirs = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      // Distribuicao esferica uniforme (espiral de Fibonacci).
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963;
      out.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    return out;
  }, [count]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;

    const b = frame.burst;
    mesh.visible = b > 0.01;
    if (!mesh.visible) return;

    const p = 1 - b; // 0 no estouro, 1 quando terminou
    for (let i = 0; i < count; i++) {
      const d = dirs[i];
      const dist = 4.75 + p * (14 + (i % 7) * 2.2);
      dummy.position.set(d.x * dist, d.y * dist * 0.85, d.z * dist);
      dummy.rotation.set(p * (3 + i * 0.21), p * (2.4 + i * 0.17), p * 1.8);
      dummy.scale.setScalar(Math.max(0.001, b * 0.34));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <tetrahedronGeometry args={[0.62, 0]} />
      <meshBasicMaterial
        color="#ffd0a0"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* --------------------------------------------------------------------------
   Onda de choque
   -------------------------------------------------------------------------- */

const WAVE_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(0.72, 0.98, d) * (1.0 - smoothstep(0.98, 1.0, d));
    float glow = smoothstep(1.0, 0.4, d) * 0.18;
    float a = (ring + glow) * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const WAVE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function Shockwave({ frame }: { frame: Frame }) {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: WAVE_VERT,
        fragmentShader: WAVE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uOpacity: { value: 0 },
          uColor: { value: new THREE.Color("#ffc48a") },
        },
      }),
    [],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const b = frame.burst;
    mesh.visible = b > 0.01;
    if (!mesh.visible) return;

    const p = 1 - b;
    mesh.scale.setScalar(6 + p * 60);
    mesh.quaternion.copy(state.camera.quaternion);
    material.uniforms.uOpacity.value = b * b * 0.9;
  });

  return (
    <mesh ref={ref} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
