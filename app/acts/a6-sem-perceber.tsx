"use client";

import Image from "next/image";
import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Reveal, RevealWords } from "@/app/components/reveal";
import { FOTOS } from "@/lib/constants";
import { useExperience } from "@/app/providers/experience";
import type { CSSProperties } from "react";

const FATOS = [
  {
    texto: "Você me apresentou pros seus avós.",
    detalhe: "Que você não via há sete anos.",
  },
  {
    texto: "Me apresentou pra sua mãe.",
    detalhe: "E eu entendi de onde vem o seu jeito.",
  },
  {
    texto: "Seu irmão me chamou de Brad Pitt da Sophya.",
    detalhe: "Valeu, Gabriel.",
  },
  {
    texto: "E foi tirando, uma por uma, insegurança que eu carregava há anos.",
    detalhe: "Sem nunca fazer disso um favor.",
  },
];

/** Esteira com o resto das fotos. Passa devagar, como memoria mesmo. */
function Esteira() {
  const { lowPower } = useExperience();
  // Todas as onze: a esteira e o filme da memoria, revisitar e o ponto.
  // Duas copias exatas, nao tres: o keyframe anda -50% do trilho, entao so
  // um numero PAR de copias fecha o loop sem salto no fim do ciclo.
  const fotos = FOTOS;
  const fila = [...fotos, ...fotos];

  return (
    <div className="relative w-full overflow-hidden py-4" aria-hidden>
      <div
        className="marquee-track flex w-max gap-4"
        style={{ ["--marquee-dur" as string]: lowPower ? "70s" : "95s" }}
      >
        {fila.map((foto, i) => (
          <div
            key={`${foto.src}-${i}`}
            className="relative h-40 w-28 shrink-0 overflow-hidden rounded-sm sm:h-56 sm:w-40"
            style={{ ["--rot" as string]: `${(i % 3) - 1}deg`, transform: "rotate(var(--rot))" } as CSSProperties}
          >
            <Image
              src={foto.src}
              alt=""
              fill
              sizes="(max-width: 768px) 30vw, 160px"
              className="object-cover opacity-80"
            />
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--c-bg), transparent 12%, transparent 88%, var(--c-bg))",
        }}
      />
    </div>
  );
}

export function SemPerceber() {
  return (
    <Act index={6} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="vi" title="o que você fez sem perceber" />
        </Beat>

        <div className="relative pl-8 sm:pl-12">
          {/* Linha do tempo que se desenha junto com a leitura */}
          <span className="absolute top-2 bottom-2 left-0 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent" />

          {FATOS.map((fato, i) => (
            <Beat key={fato.texto} height="52vh">
              <Reveal className="relative">
                <span className="absolute top-3 -left-8 h-1.5 w-1.5 rounded-full bg-accent sm:-left-12" />
                <p className="type-line text-fg/90">{fato.texto}</p>
                <p className="type-small mt-4 text-muted">{fato.detalhe}</p>
              </Reveal>
            </Beat>
          ))}
        </div>
      </Frame>

      <Beat height="60vh">
        <Esteira />
      </Beat>

      <Frame>
        <Beat height="80vh" className="items-center text-center">
          <RevealWords
            text="Eu mudei da noite pro dia."
            className="type-act font-display"
            stagger={75}
          />
          <Reveal delay={1400}>
            <p className="type-line mt-8 text-accent italic font-display">E foi por você.</p>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
