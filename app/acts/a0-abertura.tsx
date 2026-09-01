"use client";

import { Act, Frame } from "@/app/components/act";
import { Reveal, RevealWords } from "@/app/components/reveal";

export function Abertura() {
  return (
    <Act index={0} className="items-center justify-center text-center">
      <Frame>
        <RevealWords
          text="Eu fiz uma coisa pra você."
          className="type-act font-display"
          delay={1700}
          stagger={90}
        />

        <Reveal delay={3200}>
          <p className="type-small mt-10 text-balance text-muted">
            é longo, e é devagar. foi de propósito.
          </p>
        </Reveal>
      </Frame>
    </Act>
  );
}
