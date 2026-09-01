"use client";

import { Act, Beat, Frame } from "@/app/components/act";
import { Reveal, RevealWords } from "@/app/components/reveal";

/**
 * O fim do site e o comeco da parte de verdade.
 *
 * Aqui a musica recua, a cena apaga, e sobra a frase sozinha na tela. A ultima
 * linha existe pra ela levantar os olhos e encontrar o Thiago de joelho.
 */
export function Pergunta() {
  return (
    <Act index={9} full={false}>
      <Frame>
        <Beat height="70vh" className="items-center text-center">
          <RevealWords
            text="Eu te prometi que ia te dar o meu melhor."
            className="type-line text-fg/85"
            stagger={55}
          />
          <Reveal delay={1400}>
            <p className="type-line mt-8 text-muted">Isso aqui é uma parte dele.</p>
          </Reveal>
        </Beat>

        <Beat height="90vh" className="items-center text-center">
          <RevealWords
            text="Por isso, Sophya,"
            className="type-act font-display"
            stagger={110}
          />
          <RevealWords
            text="eu quero te fazer uma pergunta."
            className="type-act font-display mt-4"
            delay={1600}
            stagger={90}
          />
        </Beat>

        <Beat height="100vh" className="items-center text-center">
          <RevealWords
            text="Agora olha pra mim."
            className="type-hero font-display italic"
            delay={600}
            stagger={200}
          />
        </Beat>

        <Beat height="45vh" className="items-center text-center">
          <Reveal delay={800}>
            <span className="type-label text-muted/50">t.</span>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
