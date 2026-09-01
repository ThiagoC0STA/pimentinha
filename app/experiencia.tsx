"use client";

import dynamic from "next/dynamic";
import { Experience, useExperience } from "./providers/experience";
import { SmoothScroll } from "./providers/smooth-scroll";
import { Ambient } from "./components/ambient";
import { AudioController } from "./components/audio-controller";
import { ActProgress, Atmosphere, Cursor, ReadingBar, ScrollCue } from "./components/chrome";
import { Gate } from "./components/gate";
import { Abertura } from "./acts/a0-abertura";
import { Antes } from "./acts/a1-antes";
import { Chegada } from "./acts/a2-chegada";
import { Afastar } from "./acts/a3-afastar";
import { Quebra } from "./acts/a4-quebra";
import { Voce } from "./acts/a5-voce";
import { SemPerceber } from "./acts/a6-sem-perceber";
import { Quilometros } from "./acts/a7-km";
import { Futuro } from "./acts/a8-futuro";
import { Pergunta } from "./acts/a9-pergunta";
import { cn } from "@/lib/cn";

// WebGL nunca no servidor.
const Scene = dynamic(() => import("./scene"), { ssr: false });

function Palco() {
  const { started, reduced, broken } = useExperience();

  return (
    <>
      {/* O estouro. Um clarao quente atravessa a tela inteira no instante em
          que ela quebra a casca, por cima de tudo, e some sozinho. */}
      {broken && !reduced && (
        <div
          className="crack-flash pointer-events-none fixed inset-0 z-[45]"
          style={{
            background:
              "radial-gradient(60% 45% at 50% 50%, rgb(255 214 170 / 0.85), rgb(255 150 120 / 0.35) 45%, transparent 75%)",
          }}
          aria-hidden
        />
      )}

      {/* A cena vive atras de tudo e atravessa a historia inteira. Ela acende
          junto com a musica, quando a Sophya toca no portao. */}
      {!reduced && (
        <div
          className={cn(
            "pointer-events-none fixed inset-0 z-0 transition-opacity duration-[2500ms]",
            started ? "opacity-100" : "opacity-0",
          )}
        >
          <Scene />
        </div>
      )}

      <Atmosphere />
      <Ambient />
      <Cursor />
      <ReadingBar />
      <ActProgress />
      <ScrollCue />
      <Gate />
      <AudioController />

      <main className="relative z-10">
        <Abertura />
        <Antes />
        <Chegada />
        <Afastar />
        <Quebra />
        <Voce />
        <SemPerceber />
        <Quilometros />
        <Futuro />
        <Pergunta />
      </main>
    </>
  );
}

export function Experiencia() {
  return (
    <Experience>
      <SmoothScroll>
        <Palco />
      </SmoothScroll>
    </Experience>
  );
}
