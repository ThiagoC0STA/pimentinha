"use client";

/**
 * A pimentinha. Sobrenome dela, apelido que e so deles.
 *
 * Desenhada a mao no mesmo espirito da rosa: SVG com gradiente, nada de
 * emoji. Fica pendurada pelo cabinho e balanca devagar, como um pingente.
 */
export function Pimenta({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="pimenta-corpo" x1="0.3" y1="0.1" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#ff5a4e" />
          <stop offset="55%" stopColor="#e02f38" />
          <stop offset="100%" stopColor="#9c1526" />
        </linearGradient>
        <radialGradient id="pimenta-halo" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#ff5a4e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ff5a4e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="pimenta-balanca">
        {/* halo discreto, quente */}
        <circle cx="58" cy="86" r="52" fill="url(#pimenta-halo)" />

        {/* cabinho */}
        <path
          d="M76 10 C 66 12, 60 20, 62 32"
          stroke="#4d7a4f"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* calice */}
        <path
          d="M48 36 C 52 26, 72 26, 76 36 C 68 42, 56 42, 48 36 Z"
          fill="#5d8f5e"
        />

        {/* corpo curvado de pimenta de verdade */}
        <path
          d="M62 38
             C 88 44, 97 74, 87 102
             C 79 126, 55 142, 37 131
             C 26 124, 30 111, 41 112
             C 55 114, 67 104, 71 85
             C 75 65, 71 50, 58 43
             Z"
          fill="url(#pimenta-corpo)"
        />

        {/* brilho */}
        <ellipse
          cx="72"
          cy="62"
          rx="6"
          ry="14"
          transform="rotate(18 72 62)"
          fill="#ffffff"
          opacity="0.28"
        />
      </g>
    </svg>
  );
}
