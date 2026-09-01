/**
 * Dados reais da historia. Tudo que o Thiago pode querer ajustar depois mora
 * aqui, pra nao precisar caçar string dentro de componente.
 */

/** Dia em que eles comecaram a conversar. Mes e 0-indexed no Date do JS. */
export const DIA_UM = new Date(2026, 6, 20);

/** Distancia de uma perna do trajeto ate a casa dela. */
export const KM_POR_PERNA = 25;

/** Ida, buscar, levar de volta, voltar. */
export const PERNAS_POR_VISITA = 4;

export const KM_POR_VISITA = KM_POR_PERNA * PERNAS_POR_VISITA;

export function diasJuntos(hoje: Date = new Date()) {
  const a = Date.UTC(DIA_UM.getFullYear(), DIA_UM.getMonth(), DIA_UM.getDate());
  const b = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.max(0, Math.round((b - a) / 86400000));
}

/** As 11 fotos. `tall` marca as retrato (todas menos a 6). */
export const FOTOS = [
  { src: "/fotos/1.jpeg", w: 1200, h: 1600 },
  { src: "/fotos/2.jpeg", w: 900, h: 1600 },
  { src: "/fotos/3.jpeg", w: 1200, h: 1600 },
  { src: "/fotos/4.jpeg", w: 1200, h: 1600 },
  { src: "/fotos/5.jpeg", w: 1200, h: 1600 },
  { src: "/fotos/6.jpeg", w: 1600, h: 1200 },
  { src: "/fotos/7.jpeg", w: 960, h: 1280 },
  { src: "/fotos/8.jpeg", w: 828, h: 1472 },
  { src: "/fotos/9.jpeg", w: 828, h: 1472 },
  { src: "/fotos/10.jpeg", w: 720, h: 1280 },
  { src: "/fotos/11.jpeg", w: 828, h: 1472 },
] as const;

export type Foto = (typeof FOTOS)[number];

export const ATOS = [
  "Portão",
  "Antes de você",
  "Você chegou",
  "Eu tentei te afastar",
  "Você não desistiu",
  "Quem é você",
  "Sem perceber",
  "Cem quilômetros",
  "Meu futuro",
  "A pergunta",
] as const;

export const TOTAL_ATOS = ATOS.length;

/** Ato em que a casca quebra e o site esquenta. */
export const ATO_QUEBRA = 4;

/**
 * Duas trilhas: uma pro frio e outra pro calor.
 *
 * A fria toca do portao ate a casca quebrar. No instante da quebra entra a
 * musica dela, em crossfade de uns tres segundos. Se `antes.mp3` nao existir,
 * o site toca a musica dela do comeco ao fim e ninguem percebe falta.
 */
export const MUSICA = {
  fria: {
    src: "/audio/song-first.mp3",
    titulo: "trilha do antes",
    /** Comeca aos 21s: a introducao fica de fora, entra direto no ponto. */
    inicio: 21,
  },
  quente: {
    src: "/audio/song.mp3",
    titulo: "Fala So de Amor",
    artista: "Edson Gomes",
    inicio: 0,
  },
};
