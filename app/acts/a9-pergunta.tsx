"use client";

import { Act, Beat, Frame } from "@/app/components/act";
import { Reveal, RevealWords } from "@/app/components/reveal";

/**
 * O fim do site e o comeco da parte de verdade.
 *
 * A musica recua, a cena apaga, e a ultima coisa na tela e a frase que abre a
 * pergunta. Nada depois dela: quem fala a seguir e o Thiago.
 */
export function Pergunta() {
  return (
    <Act index={9} full={false}>
      <Frame>
        <Beat height="75vh" className="items-center text-center">
          <RevealWords
            text="Eu te prometi que ia te dar o meu melhor."
            className="type-line text-fg/85"
            stagger={55}
          />
          <Reveal delay={1400}>
            <p className="type-line mt-8 text-muted">Isso aqui é uma parte dele.</p>
          </Reveal>
        </Beat>

        <Beat height="100vh" className="items-center text-center">
          <RevealWords
            text="Por isso, Sophya,"
            className="type-act font-display"
            delay={400}
            stagger={130}
          />
          <RevealWords
            text="eu quero te fazer uma pergunta."
            className="type-hero font-display mt-6 italic"
            delay={1800}
            stagger={150}
          />
        </Beat>
      </Frame>
    </Act>
  );
}
