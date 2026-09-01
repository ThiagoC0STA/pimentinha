"use client";

import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Journey } from "@/app/components/journey";
import { Reveal, RevealWords } from "@/app/components/reveal";

export function Quilometros() {
  return (
    <Act index={7} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="vii" title="cem quilômetros" />
        </Beat>

        <Beat height="55vh">
          <RevealWords
            text="Da minha casa até a sua são 25 km."
            className="type-act font-display"
            stagger={60}
          />
        </Beat>

        <Beat height="90vh">
          <Journey />
        </Beat>

        <Beat height="70vh" className="items-center text-center">
          <RevealWords
            text="E se você perguntar se vale a pena:"
            className="type-line text-muted"
            stagger={45}
          />
          <Reveal delay={1100}>
            <p className="type-act font-display mt-8">
              eu faço de novo hoje, amanhã <span className="text-accent italic">e depois</span>.
            </p>
          </Reveal>
          <Reveal delay={2100}>
            <p className="type-line mt-10 text-balance text-fg/85">
              Nem que eu tenha que viajar um milhão de quilômetros pra te ver.
            </p>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
