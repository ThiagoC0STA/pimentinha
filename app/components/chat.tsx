"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useReveal } from "@/lib/use-reveal";

/**
 * O comeco: uma conversa. Sem cinema, sem destino escrito no ceu.
 *
 * Thiago: se quiser, troque por trechos reais da conversa de voces. Quanto
 * mais verdadeiro, mais forte. `from` aceita "ele" ou "ela".
 */
const MENSAGENS: { from: "ele" | "ela"; text: string; gap?: number }[] = [
  { from: "ele", text: "oi, tudo bem?" },
  { from: "ela", text: "oi, tudo sim" },
  { from: "ele", text: "vamo jantar um dia desses?", gap: 700 },
  { from: "ela", text: "vamo" },
];

export function Chat() {
  const [ref, isIn] = useReveal<HTMLDivElement>({ rootMargin: "0px 0px -25% 0px" });

  let clock = 300;

  return (
    <div ref={ref} className="mx-auto flex w-full max-w-sm flex-col gap-2.5">
      {MENSAGENS.map((m, i) => {
        clock += (m.gap ?? 420) + m.text.length * 12;
        const delay = clock;
        const mine = m.from === "ele";
        return (
          <div
            key={i}
            className={cn("flex", mine ? "justify-end" : "justify-start")}
            style={{ opacity: isIn ? undefined : 0 }}
          >
            <span
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
                "border backdrop-blur-sm",
                mine
                  ? "rounded-br-sm border-white/10 bg-white/6 text-fg"
                  : "rounded-bl-sm border-accent/25 bg-accent/10 text-fg",
                isIn && "bubble-in",
              )}
              style={{ "--bubble-delay": `${delay}ms` } as CSSProperties}
            >
              {m.text}
            </span>
          </div>
        );
      })}

      {/* Digitando: fica pulsando depois da ultima mensagem, como se a
          conversa nunca tivesse acabado. Porque nao acabou. */}
      <div
        className={cn("flex justify-start", isIn && "bubble-in")}
        style={{ "--bubble-delay": `${clock + 900}ms`, opacity: isIn ? undefined : 0 } as CSSProperties}
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
