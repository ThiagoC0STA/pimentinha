"use client";

import { Act, ActMark, Beat, Frame } from "@/app/components/act";
import { HoldToBreak } from "@/app/components/hold-to-break";
import { Reveal, RevealWords } from "@/app/components/reveal";
import { Rosa } from "@/app/components/rosa";
import { useExperience } from "@/app/providers/experience";
import { useSectionProgress } from "@/lib/use-section-progress";
import { cn } from "@/lib/cn";

export function Quebra() {
  const { broken } = useExperience();
  // O container alto e quem mede o scroll; a rosa fica parada no meio da tela
  // herdando `--sp` daqui e abrindo pétala por pétala.
  const jardim = useSectionProgress<HTMLDivElement>();

  return (
    <Act index={4} full={false}>
      <Frame>
        <Beat height="46vh" className="justify-end">
          <ActMark n="iv" title="e você não desistiu" />
        </Beat>

        <Beat height="50vh">
          <RevealWords text="Você ficou." className="type-act font-display" stagger={90} />
        </Beat>

        <Beat>
          <RevealWords
            text="Continuou gostando de mim enquanto eu te dava motivo pra ir embora."
            className="type-line text-fg/85"
            stagger={42}
          />
        </Beat>

        <Beat>
          <RevealWords
            text="Ninguém nunca tinha feito isso por mim."
            className="type-act font-display"
            stagger={70}
          />
        </Beat>
      </Frame>

      {/* O toque dela. A casca so quebra com a mao de quem quebrou de verdade. */}
      <div className="relative h-[150vh] w-full">
        <div className="sticky top-0 flex h-[100dvh] flex-col items-center justify-center gap-12 px-6">
          <Reveal
            className={cn(
              "text-center transition-opacity duration-1000",
              broken && "opacity-0",
            )}
          >
            <p className="type-small max-w-xs text-balance text-muted">essa parte é sua.</p>
          </Reveal>

          <HoldToBreak />

          <p
            className={cn(
              // pointer-events-none e obrigatorio: esse paragrafo fica por cima
              // do botao de segurar, e invisivel ele roubaria o toque dela.
              "type-act font-display pointer-events-none absolute text-center transition-all duration-[1800ms]",
              broken ? "translate-y-0 opacity-100 blur-0" : "translate-y-6 opacity-0 blur-sm",
            )}
          >
            E aí a casca <span className="text-accent italic">quebrou</span>.
          </p>
        </div>
      </div>

      {/* O buquê. A flor abre no ritmo do dedo dela. */}
      <div ref={jardim} className="relative h-[170vh] w-full">
        <div className="sticky top-0 flex h-[100dvh] flex-col items-center justify-center gap-6 px-6">
          <Reveal className="text-center">
            <p className="type-line text-balance text-fg/85">
              No primeiro buquê que eu te dei, as rosas estavam fechadas.
            </p>
          </Reveal>

          <Rosa className="w-60 max-w-[66vw] sm:w-72" />

          <Reveal delay={400} className="text-center">
            <p className="type-small text-muted">Foi de propósito.</p>
            <p className="type-act font-display mt-3">
              Porque o nosso ainda ia <span className="text-accent italic">desabrochar</span>.
            </p>
          </Reveal>
        </div>
      </div>
    </Act>
  );
}
