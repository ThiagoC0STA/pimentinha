"use client";

import type { ReactNode } from "react";
import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Pimenta } from "@/app/components/pimenta";
import { Polaroid } from "@/app/components/polaroid";
import { Reveal, RevealScale, RevealWords } from "@/app/components/reveal";
import { FOTOS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/** Um detalhe dela + a foto que prova. Alterna de lado no desktop. */
function Detalhe({
  texto,
  fotoIndex,
  rot = -3,
  flip = false,
  legenda,
  children,
  priority = false,
}: {
  texto: string;
  fotoIndex: number;
  rot?: number;
  flip?: boolean;
  legenda?: string;
  children?: ReactNode;
  /** A primeira foto da secao carrega antes das outras. */
  priority?: boolean;
}) {
  return (
    <Beat height="78vh">
      <div
        className={cn(
          "flex flex-col items-center gap-8 sm:gap-16",
          flip ? "sm:flex-row-reverse" : "sm:flex-row",
        )}
      >
        <div className="w-full sm:w-1/2">
          <RevealWords text={texto} className="type-line text-fg/90" stagger={45} />
          {children}
        </div>
        {/* No desktop a foto tem teto: sem isso a polaroid vira um poster de
            660px de altura e o par texto/foto nao cabe mais numa tela. */}
        <div className="w-[66%] sm:w-1/2 sm:max-w-75">
          <Polaroid foto={FOTOS[fotoIndex]} rot={rot} caption={legenda} delay={200} priority={priority} />
        </div>
      </div>
    </Beat>
  );
}

export function Voce() {
  return (
    <Act index={5} full={false}>
      <Frame className="max-w-5xl">
        <Beat height="46vh" className="justify-end">
          <ActMark n="v" title="e aí eu reparei em tudo" />
          <RevealWords
            text="Aí eu comecei a reparar em tudo."
            className="type-act font-display"
            stagger={70}
          />
        </Beat>

        <Detalhe
          texto="No seu sorriso, que é o mais bonito que eu já vi."
          fotoIndex={3}
          priority
          rot={-3.5}
        />

        <Detalhe
          texto="No seu jeito de falar, que me pega toda vez."
          fotoIndex={1}
          rot={2.5}
          flip
        />

        <Detalhe
          texto="No seu sotaque de Belém, que eu peço pra você repetir só pra ouvir de novo."
          fotoIndex={2}
          rot={-2}
        />

        <Detalhe
          texto="Nos seus olhos grandes, que eu fico olhando mais tempo do que devia."
          fotoIndex={0}
          rot={3}
          flip
        >
          <Reveal delay={900}>
            <p className="type-line mt-6 text-muted">
              E na gente se olhando sem precisar falar nada.
            </p>
          </Reveal>
        </Detalhe>

        <Detalhe
          texto="Nos seus pezinhos virados pra dentro, que eu acho a coisa mais fofa do mundo."
          fotoIndex={4}
          rot={-2.5}
        />

        <Detalhe texto="Em você animadinha." fotoIndex={5} rot={2} flip />

        <Detalhe
          texto="E em você carinhosa, do jeito que você diz que aprendeu comigo."
          fotoIndex={6}
          rot={-3}
        />

        {/* As quatro fotos que sobraram: nenhuma dela fica de fora deste ato. */}
        <Beat height="85vh">
          <Reveal className="mb-10 text-center">
            <p className="type-line">E de você em todas as versões.</p>
          </Reveal>
          <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
            {[7, 8, 9, 10].map((i, ordem) => (
              <Polaroid
                key={i}
                foto={FOTOS[i]}
                rot={[-3, 2.5, -2, 3.5][ordem]}
                delay={ordem * 140}
                sizes="(max-width: 768px) 45vw, 200px"
              />
            ))}
          </div>
        </Beat>

        <Beat height="75vh" className="items-center text-center">
          <Reveal>
            <p className="type-small text-muted">e no nome que eu te dou quando é só a gente</p>
          </Reveal>
          <RevealScale delay={500} className="mt-8">
            <Pimenta className="h-28 w-auto sm:h-32" />
          </RevealScale>
          <RevealWords
            text="minha pimentinha"
            className="type-act font-display mt-6 italic text-accent"
            delay={900}
            stagger={110}
          />
        </Beat>

        <Beat height="80vh" className="items-center text-center">
          <Reveal>
            <p className="type-label text-muted">e em você falando</p>
          </Reveal>
          <RevealWords
            text="você é muito é apaixonado"
            className="type-act font-display mt-6 italic text-accent"
            delay={500}
            stagger={80}
          />
          <Reveal delay={2000}>
            <p className="type-line mt-12">Sou.</p>
          </Reveal>
          <Reveal delay={2600}>
            <p className="type-line text-muted">Todo dia um pouco mais.</p>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
