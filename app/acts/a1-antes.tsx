"use client";

import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Reveal, RevealWords } from "@/app/components/reveal";

export function Antes() {
  return (
    <Act index={1} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="i" title="antes de você" />
        </Beat>

        <Beat>
          <RevealWords
            text="Antes de você, eu tava fechado."
            className="type-act font-display"
            stagger={80}
          />
        </Beat>

        <Beat>
          <RevealWords
            text="Eu tinha acabado de sair de um lugar que me machucou."
            className="type-line text-fg/85"
            stagger={45}
          />
          <Reveal delay={900}>
            <p className="type-line mt-6 text-fg/85">
              E tinha certeza que não tava pronto pra mais ninguém.
            </p>
          </Reveal>
        </Beat>

        <Beat>
          <RevealWords
            text="Então eu construí uma casca."
            className="type-act font-display"
            stagger={75}
          />
          <Reveal delay={1200}>
            <p className="type-line mt-8 text-muted">E ela funcionava bem.</p>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
