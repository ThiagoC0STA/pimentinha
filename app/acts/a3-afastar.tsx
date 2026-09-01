"use client";

import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Reveal, RevealChars, RevealWords } from "@/app/components/reveal";
import { useSectionProgress } from "@/lib/use-section-progress";

export function Afastar() {
  // As duas frases derivam pra lados opostos conforme ela desce: e o gesto de
  // empurrar alguem pra longe, feito com o scroll dela.
  const primeira = useSectionProgress<HTMLDivElement>();
  const segunda = useSectionProgress<HTMLDivElement>();

  return (
    <Act index={3} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="iii" title="e eu tentei te afastar" />
        </Beat>

        <Beat height="45vh">
          <div ref={primeira}>
            <RevealChars
              text="Uma vez."
              className="type-act font-display drift-left"
              stagger={55}
            />
          </div>
        </Beat>

        <Beat height="45vh" className="items-end text-right">
          <div ref={segunda}>
            <RevealChars
              text="E depois de novo."
              className="type-act font-display drift-right"
              stagger={45}
            />
          </div>
        </Beat>

        <Beat>
          <RevealWords text="Não era você." className="type-act font-display" stagger={80} />
          <Reveal delay={1000}>
            <p className="type-line mt-8 text-fg/80">
              Era eu com medo de gostar de alguém outra vez.
            </p>
          </Reveal>
        </Beat>

        <Beat>
          <RevealWords
            text="Eu te empurrei sabendo exatamente o que eu tava fazendo."
            className="type-line text-fg/70"
            stagger={40}
          />
        </Beat>
      </Frame>
    </Act>
  );
}
