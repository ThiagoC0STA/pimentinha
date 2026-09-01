"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useReveal } from "@/lib/use-reveal";

/**
 * As primeiras mensagens de verdade, do Instagram, 20 de julho de 2026.
 * Transcritas do print que o Thiago mandou, inclusive o intervalo de quase
 * duas horas entre o "Oii" dele e o "oiie" dela.
 */
type Item =
  | { tipo: "hora"; texto: string }
  | { tipo: "msg"; de: "ele" | "ela"; texto: string };

const CONVERSA: Item[] = [
  { tipo: "hora", texto: "20 de jul., 11:23" },
  { tipo: "msg", de: "ele", texto: "Oii" },
  { tipo: "hora", texto: "20 de jul., 13:12" },
  { tipo: "msg", de: "ela", texto: "oiie" },
  { tipo: "msg", de: "ele", texto: "Bem melhor aquii" },
  { tipo: "msg", de: "ele", texto: "Orra e tu é uma gatinha em" },
  { tipo: "msg", de: "ele", texto: "Gostei" },
  { tipo: "msg", de: "ele", texto: "Hahah" },
  { tipo: "msg", de: "ela", texto: "kkkkkkkk ah obrigada" },
  { tipo: "msg", de: "ela", texto: "que bom que gostou" },
  { tipo: "msg", de: "ela", texto: "vc tbm é um gatinho" },
  { tipo: "msg", de: "ela", texto: "dos olhos claros" },
];

export function Chat() {
  const [ref, isIn] = useReveal<HTMLDivElement>({ rootMargin: "0px 0px -25% 0px" });

  // Relogio acumulado: cada mensagem entra depois da anterior, no ritmo de
  // quem esta digitando do outro lado.
  let clock = 200;

  return (
    <div ref={ref} className="mx-auto flex w-full max-w-sm flex-col gap-2">
      {CONVERSA.map((item, i) => {
        clock += item.tipo === "hora" ? 700 : 380 + item.texto.length * 11;
        const delay = clock;

        if (item.tipo === "hora") {
          return (
            <div
              key={i}
              className={cn("py-3 text-center", isIn && "bubble-in")}
              style={{ "--bubble-delay": `${delay}ms`, opacity: isIn ? undefined : 0 } as CSSProperties}
            >
              <span className="type-label text-[10px] text-muted/70">{item.texto}</span>
            </div>
          );
        }

        const meu = item.de === "ele";
        return (
          <div
            key={i}
            className={cn("flex", meu ? "justify-end" : "justify-start")}
            style={{ opacity: isIn ? undefined : 0 }}
          >
            <span
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
                "border backdrop-blur-sm",
                meu
                  ? "rounded-br-sm border-white/10 bg-white/6 text-fg"
                  : "rounded-bl-sm border-accent/25 bg-accent/10 text-fg",
                isIn && "bubble-in",
              )}
              style={{ "--bubble-delay": `${delay}ms` } as CSSProperties}
            >
              {item.texto}
            </span>
          </div>
        );
      })}

      {/* Digitando: continua pulsando depois da ultima mensagem, como se a
          conversa nunca tivesse acabado. Porque nao acabou. */}
      <div
        className={cn("flex justify-start pt-1", isIn && "bubble-in")}
        style={{ "--bubble-delay": `${clock + 800}ms`, opacity: isIn ? undefined : 0 } as CSSProperties}
      >
        <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-accent/20 bg-accent/8 px-4 py-3">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="typing-dot h-1.5 w-1.5 rounded-full bg-accent"
              style={{ "--dot-delay": `${d * 0.16}s` } as CSSProperties}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
