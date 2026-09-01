"use client";

/**
 * A pimentinha. Sobrenome dela, apelido que e so deles.
 *
 * Silhueta de chili de verdade: corpo comprido com barriga de um lado,
 * afinando ate uma ponta curvada. Pendurada pelo cabinho, balancando devagar
 * como pingente. SVG a mao, sem emoji.
 */
export function Pimenta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="pimenta-corpo" x1="0.7" y1="0.1" x2="0.25" y2="0.95">
          <stop offset="0%" stopColor="#ff6152" />
          <stop offset="50%" stopColor="#e3303a" />
          <stop offset="100%" stopColor="#a01727" />
        </linearGradient>
        <radialGradient id="pimenta-halo" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#ff5a4e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ff5a4e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="pimenta-balanca">
        {/* halo discreto, quente */}
        <circle cx="55" cy="88" r="54" fill="url(#pimenta-halo)" />

        {/* cabinho */}
        <path
          d="M60 36 C 60 26, 66 16, 76 12"
          stroke="#4d7a4f"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* corpo: desce reto afinando e a ponta vira pra esquerda */}
        <path
          d="M47 44
             C 44 68, 44 98, 34 122
             C 31 129, 25 132, 28 137
             C 31 141, 41 139, 46 131
             C 60 112, 72 94, 75 70
             C 76 58, 75 48, 73 41
             C 64 46, 54 47, 47 44
             Z"
          fill="url(#pimenta-corpo)"
        />

        {/* calice: folhinhas cobrindo o topo do corpo */}
        <path
          d="M44 42
             C 46 32, 56 28, 62 30
             C 70 26, 76 32, 76 40
             C 70 46, 64 40, 60 44
             C 55 40, 48 47, 44 42
             Z"
          fill="#5d8f5e"
        />

        {/* brilho na barriga */}
        <ellipse
          cx="69"
          cy="68"
          rx="4.5"
          ry="15"
          transform="rotate(10 69 68)"
          fill="#ffffff"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}
