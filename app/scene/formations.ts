/**
 * As cinco formacoes que a nuvem atravessa. Cada particula guarda as cinco
 * posicoes de uma vez, como attributes, e o vertex shader interpola entre
 * elas conforme o scroll. Custo por frame na CPU: zero.
 *
 *   0  disperso     ele antes dela, tudo espalhado e longe
 *   1  casca        ele fechado numa esfera
 *   2  estilhaco    o instante em que ela quebra a casca
 *   3  orbita       os dois viajando juntos (os 25 km, quatro vezes)
 *   4  constelacao  o futuro, la em cima
 */

export type Role = "him" | "her";

/** RNG deterministico: a mesma nuvem toda vez que o site carrega. */
function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

export interface Formations {
  positions: Float32Array[];
  seeds: Float32Array;
  count: number;
}

export function buildFormations(count: number, role: Role): Formations {
  const rng = mulberry32(role === "him" ? 20260720 : 1907);
  const p0 = new Float32Array(count * 3);
  const p1 = new Float32Array(count * 3);
  const p2 = new Float32Array(count * 3);
  const p3 = new Float32Array(count * 3);
  const p4 = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const k = i * 3;
    const t = i / count;
    const seed = rng();
    seeds[i] = seed;

    // Angulos reaproveitados entre formacoes pra o morph nao embaralhar tudo.
    const theta = rng() * TAU;
    const phi = Math.acos(2 * rng() - 1);
    const sx = Math.sin(phi) * Math.cos(theta);
    const sy = Math.sin(phi) * Math.sin(theta);
    const sz = Math.cos(phi);

    /* 0 — disperso ------------------------------------------------------- */
    if (role === "him") {
      // Poeira fria e vazia, mais densa no meio, sumindo pras bordas.
      const spread = 16 + rng() * 26;
      p0[k] = sx * spread * 1.5;
      p0[k + 1] = sy * spread * 0.7;
      p0[k + 2] = sz * spread - 6;
    } else {
      // Ela ainda nao chegou: fica fora de quadro, agrupada, a direita.
      p0[k] = 46 + rng() * 16;
      p0[k + 1] = (rng() - 0.5) * 18;
      p0[k + 2] = -10 + (rng() - 0.5) * 16;
    }

    /* 1 — casca ---------------------------------------------------------- */
    if (role === "him") {
      // Superficie de esfera: ele virou parede.
      const r = 4.55 + (rng() - 0.5) * 0.35;
      p1[k] = sx * r;
      p1[k + 1] = sy * r;
      p1[k + 2] = sz * r;
    } else {
      // Ela orbita do lado de fora, insistindo, num anel inclinado.
      const a = t * TAU * 3 + rng() * 0.4;
      const ringR = 8.4 + Math.sin(a * 3) * 0.7 + rng() * 0.9;
      const tilt = 0.42;
      const x = Math.cos(a) * ringR;
      const z = Math.sin(a) * ringR;
      p1[k] = x;
      p1[k + 1] = z * Math.sin(tilt) + (rng() - 0.5) * 1.2;
      p1[k + 2] = z * Math.cos(tilt);
    }

    /* 2 — estilhaco ------------------------------------------------------ */
    {
      const r = role === "him" ? 7 + rng() * 12 : 6 + rng() * 10;
      p2[k] = sx * r * 1.35;
      p2[k + 1] = sy * r;
      p2[k + 2] = sz * r * 1.1;
    }

    /* 3 — orbita dupla --------------------------------------------------- */
    {
      // Duas correntes entrelaçadas viajando no eixo X. Ele numa, ela na
      // outra, sempre na mesma direcao, sempre na mesma distancia.
      const len = 46;
      const u = t * TAU * 3.4;
      const phase = role === "him" ? 0 : Math.PI;
      const radius = 3.1 + (rng() - 0.5) * 0.8;
      p3[k] = t * len - len / 2 + (rng() - 0.5) * 0.8;
      p3[k + 1] = Math.sin(u + phase) * radius + Math.sin(t * 6.0) * 1.4;
      p3[k + 2] = Math.cos(u + phase) * radius - 2;
    }

    /* 4 — constelacao ---------------------------------------------------- */
    {
      // Ceu aberto e alto. Perto o bastante pra encher a tela: la longe demais
      // vira um punhado de pontinhos e o ato do futuro fica vazio.
      const spread = 22 + rng() * 20;
      const y = 1 + rng() * 16;
      p4[k] = (rng() - 0.5) * spread * 2.4;
      p4[k + 1] = role === "him" ? y : y + 1.5;
      p4[k + 2] = -4 - rng() * 22;
    }
  }

  return { positions: [p0, p1, p2, p3, p4], seeds, count };
}
