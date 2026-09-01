"use client";

import type { CSSProperties } from "react";

/**
 * A rosa fechada que abre.
 *
 * O primeiro buquê que ele deu pra ela era de rosas fechadas, escolhidas
 * assim de propósito: o que os dois tinham ainda ia desabrochar. Aqui ela
 * abre no ritmo do dedo dela, sem clique nenhum, só rolando.
 *
 * Três camadas de pétalas, cada uma com seu atraso, e um miolo que só aparece
 * no fim. A abertura inteira é CSS: o JS só escreve `--sp` na seção.
 */

/** Pétala larga e arredondada no topo, afinando até o ponto de junção. */
const PETALA =
  "M100 106 C 80 96, 70 66, 78 44 C 84 28, 116 28, 122 44 C 130 66, 120 96, 100 106 Z";

/**
 * Ângulos de cada camada, de fora pra dentro.
 *
 * Todos centrados em zero de propósito: como o ângulo é multiplicado pelo
 * progresso, a flor abre como um leque simétrico pros dois lados. Com a lista
 * indo de 0 a 309, o meio da animação jogava todas as pétalas pro mesmo lado.
 */
const CAMADAS = [
  {
    angulos: [-154, -103, -51, 0, 51, 103, 154],
    escala: 1,
    cor: "url(#petala-fora)",
    o: "--o1",
  },
  {
    angulos: [-145, -87, -29, 29, 87, 145],
    escala: 0.72,
    cor: "url(#petala-meio)",
    o: "--o2",
  },
  { angulos: [-144, -72, 0, 72, 144], escala: 0.48, cor: "url(#petala-dentro)", o: "--o3" },
];

/**
 * Herda `--sp` de um ancestral: quem monta a seção decide qual trecho de
 * scroll abre a flor. Assim a rosa pode ficar parada no meio da tela (sticky)
 * enquanto o container alto por trás dela é que mede o progresso.
 */
export function Rosa({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 200 200" className="rosa w-full" fill="none" aria-hidden>
        <defs>
          <radialGradient id="petala-fora" cx="50%" cy="80%" r="70%">
            <stop offset="0%" stopColor="#7d1f34" />
            <stop offset="60%" stopColor="#c2415c" />
            <stop offset="100%" stopColor="#ff9fb0" />
          </radialGradient>
          <radialGradient id="petala-meio" cx="50%" cy="80%" r="70%">
            <stop offset="0%" stopColor="#6d1a2d" />
            <stop offset="65%" stopColor="#b8394f" />
            <stop offset="100%" stopColor="#f58098" />
          </radialGradient>
          <radialGradient id="petala-dentro" cx="50%" cy="85%" r="70%">
            <stop offset="0%" stopColor="#5c1526" />
            <stop offset="70%" stopColor="#a32f45" />
            <stop offset="100%" stopColor="#e0697f" />
          </radialGradient>
          <radialGradient id="rosa-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--c-glow)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--c-glow)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo que cresce junto com a flor */}
        <circle className="rosa-glow" cx="100" cy="104" r="78" fill="url(#rosa-halo)" />

        {/* Caule e folhas: discretos, a flor é que fala */}
        {/* Começa abaixo do miolo: subindo mais, a ponta do caule aparecia
            como um pontinho verde no meio da flor aberta. */}
        <path
          d="M100 132 C 98 148, 101 164, 100 186"
          stroke="#3f5f43"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M100 148 C 84 142, 74 148, 70 160 C 84 166, 96 160, 100 148 Z"
          fill="#3f5f43"
          opacity="0.85"
        />
        <path
          d="M100 164 C 116 158, 126 164, 130 176 C 116 182, 104 176, 100 164 Z"
          fill="#35533a"
          opacity="0.8"
        />

        {CAMADAS.map((camada, i) =>
          camada.angulos.map((a) => (
            <path
              key={`${i}-${a}`}
              d={PETALA}
              className="petala"
              fill={camada.cor}
              style={
                {
                  "--a": a,
                  "--s": camada.escala,
                  "--o": `var(${camada.o})`,
                } as CSSProperties
              }
            />
          )),
        )}

        {/* Miolo: a última coisa a aparecer */}
        <circle
          cx="100"
          cy="96"
          r="7"
          fill="#4a1020"
          style={{ opacity: "var(--o3)" } as CSSProperties}
        />
      </svg>
    </div>
  );
}
