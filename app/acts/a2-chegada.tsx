"use client";

import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { Chat } from "@/app/components/chat";
import { Reveal, RevealLine, RevealWords } from "@/app/components/reveal";

export function Chegada() {
  return (
    <Act index={2} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="ii" title="aí você chegou" />
        </Beat>

        <Beat>
          <RevealWords
            text="A gente se conheceu por mensagem."
            className="type-act font-display"
            stagger={70}
          />
          <Reveal delay={1000}>
            <p className="type-line mt-8 text-fg/80">
              Sem cinema, sem destino escrito no céu. Só uma conversa.
            </p>
          </Reveal>
        </Beat>

        <Beat>
          <Reveal className="mb-10 text-center">
            <span className="type-label text-accent">20 de julho de 2026</span>
          </Reveal>
          <Chat />
        </Beat>

        <Beat>
          <RevealWords
            text="Eu te chamei pra jantar no Tokomfome."
            className="type-line text-fg/85"
            stagger={45}
          />
          <Reveal delay={1100}>
            <p className="type-act font-display mt-8">
              Tava tão cheio que a gente <span className="text-accent italic">nem entrou</span>.
            </p>
          </Reveal>
        </Beat>

        <Beat>
          <p className="type-line text-fg/85">
            <RevealLine>A gente achou outro lugar pra ir.</RevealLine>
            <RevealLine delay={300}>E o que aconteceu depois é só nosso.</RevealLine>
          </p>
          <Reveal delay={1200}>
            <p className="type-line mt-10 text-muted">
              Eu só sei que eu não queria ir embora.
            </p>
          </Reveal>
        </Beat>
      </Frame>
    </Act>
  );
}
