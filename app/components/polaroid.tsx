"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useTilt } from "@/lib/use-tilt";
import type { Foto } from "@/lib/constants";
import { RevealScale } from "./reveal";

/**
 * Foto em moldura polaroid, com inclinacao propria e tilt no mouse.
 * A legenda e escrita a mao pelo Thiago em cada uso.
 */
export function Polaroid({
  foto,
  caption,
  rot = -2,
  delay = 0,
  className,
  sizes = "(max-width: 768px) 70vw, 340px",
  priority = false,
}: {
  foto: Foto;
  caption?: string;
  rot?: number;
  delay?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const tiltRef = useTilt<HTMLDivElement>(7);
  const isLandscape = foto.w > foto.h;

  return (
    <RevealScale delay={delay} className={className}>
      <div ref={tiltRef} className="tilt">
        <figure className="polaroid" style={{ "--rot": `${rot}deg` } as CSSProperties}>
          <div
            className={cn(
              "relative w-full overflow-hidden bg-black/40",
              isLandscape ? "aspect-[4/3]" : "aspect-[3/4]",
            )}
          >
            <Image
              src={foto.src}
              alt={caption ?? "Sophya"}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
            />
          </div>
          {caption && (
            <figcaption className="pt-3 text-center font-display text-[15px] leading-tight text-neutral-700 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      </div>
    </RevealScale>
  );
}

/** Foto sem moldura, sangrando na tela. Pros momentos mais serios. */
export function BleedPhoto({
  foto,
  className,
  delay = 0,
  sizes = "(max-width: 768px) 100vw, 640px",
}: {
  foto: Foto;
  className?: string;
  delay?: number;
  sizes?: string;
}) {
  return (
    <RevealScale delay={delay} className={className}>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
        <Image src={foto.src} alt="Sophya" fill sizes={sizes} className="object-cover" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--c-bg) 92%, transparent), transparent 45%)," +
              "radial-gradient(70% 60% at 50% 40%, transparent, color-mix(in srgb, var(--c-bg) 60%, transparent))",
          }}
        />
      </div>
    </RevealScale>
  );
}
