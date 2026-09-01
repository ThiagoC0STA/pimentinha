# SPEC — Meu Futuro (declaração para Sophya Pimenta)

**Data:** 2026-09-01
**Autor:** Thiago Costa
**Objetivo:** experiência web que termina abrindo o pedido de namoro, feito pessoalmente
**Stack:** Next 16.3.4, React 19.2.8, Tailwind 4, TypeScript, R3F + three, GSAP/ScrollTrigger, Lenis
**Regra dura:** sem biblioteca `motion`. IntersectionObserver + CSS vars + rAF (ver brain: "Motion library banida")

---

## 1. Ideia central

O site é a história real: um cara fechado depois de um relacionamento ruim, uma menina que não desistiu, a casca que quebra, e o futuro que passa a ter nome.

A cena WebGL não é decoração de fundo. Ela é o personagem:

- Um enxame de partículas frias e dispersas (ele), preso dentro de uma casca
- Um segundo enxame quente e dourado (ela) que aparece, se aproxima e insiste
- A casca estilhaça quando ela segura o dedo na tela
- A partir daí o site inteiro muda de temperatura: de azul-aço para âmbar e rosa
- No fim, os dois enxames viram uma órbita dupla estável, e depois quase tudo se apaga

Uma única cena persistente atravessando o site inteiro, dirigida por um progresso global de scroll. Diferente do lilicarvalho, onde o 3D vivia só no hero.

## 2. Arco (9 atos)

| # | Ato | O que acontece na tela |
|---|---|---|
| 0 | Portão | Preto. Nome dela. "Segura o dedo aqui." Hold de 2s destrava o áudio e acende a cena |
| 1 | Antes de você | Frio, escuro, partículas dispersas. A casca aparece |
| 2 | Você chegou | Bolhas de mensagem. O Tokomfome cheio, o não-encontro |
| 3 | Eu tentei te afastar | A casca fecha, o enxame dela é empurrado pra fora e volta |
| 4 | Você não desistiu | **Hold interativo.** A casca racha e explode. O site ganha cor |
| 5 | Quem é você | Inventário do que ele ama. Fotos em polaroid empilhada |
| 6 | O que você fez sem perceber | Avós, mãe, Gabriel, as inseguranças que sumiram |
| 7 | Os 25 km | Traço de luz percorrendo o trajeto. 25 km, quatro vezes |
| 8 | Você é o meu futuro | Constelação. Médica, mãe, os dois |
| 9 | A pergunta | Música abaixa, tudo apaga, sobra a frase. "Agora olha pra mim." |

## 3. Momento interativo único (ato 4)

Ela segura o dedo na tela por 2 segundos. A rachadura se espalha, a casca estilhaça, cor invade tudo.
Simbolismo direto: ela quebrou a casca dele na vida real, e quebra de novo aqui, com a mão dela.
Um único gesto no site inteiro, pra não virar joguinho.

**A página trava até isso acontecer.** Quando o botão chega ao centro da tela, o scroll é bloqueado (`wheel`, `touchmove` e teclas, com `passive: false`, mais um snap-back no rAF que pega o momentum do iOS). Se desse pra rolar, ela rolaria sem tocar e o momento se perderia. Depois de duas tentativas de rolar, a dica aparece maior explicando o que fazer. A única saída é o dedo dela.

## 4. Direção visual

**Temperatura como narrativa.** Uma CSS var global (`--warmth`, 0 a 1) controlada pelo progresso do scroll.

```
Frio (atos 0-3)     Quente (atos 4-9)
#07090d fundo       #0d0708 fundo
#7d8ea8 traço       #f0b071 âmbar
#aeb9c9 texto       #ffd9c2 creme
                    #ff8fa3 rosa suave
```

Tipografia: Instrument Serif italic nos momentos de peso, Instrument Sans no corpo. Sem fonte de convite de casamento.

Mobile-first de verdade: ela vai ver no celular, com o Thiago do lado. Desktop é a versão cinematográfica.

## 5. Áudio — duas trilhas

| Trilha | Arquivo | Quando |
|---|---|---|
| Fria | `public/audio/song-first.mp3`, entrando aos **21s** | Do portão até a casca quebrar |
| Dela | `public/audio/song.mp3` (Fala Só de Amor, Edson Gomes) | Do estouro até o fim |

A troca acontece no instante exato da quebra, em crossfade de ~3s: a fria desce e pausa sozinha, a dela entra do segundo zero. O som conta a mesma história que a cor.

Detalhes que importam:

- Nenhuma das duas pode tocar sozinha: o navegador exige gesto. O toque no portão dá play na fria **e** destrava a segunda (play seguido de pause imediato), senão o play da troca seria bloqueado por falta de interação recente
- A fria não usa `loop` nativo, que voltaria ao segundo zero. Ela reinicia na mão a partir dos 21s
- Botão de mute sempre visível, e volume caindo para 16% no ato 9 pra última frase acontecer quase no silêncio
- Se `song-first.mp3` sumir, o site toca só a música dela do início ao fim e ninguém percebe falta

## 6. Fora do escopo (deliberado)

Nada de conteúdo íntimo ou privado no site. O contexto que o Thiago passou sobre corpo, vinho e outros hábitos serviu pra eu conhecer ela, não pra ir pra tela. Ela vai ver isso com ele do lado, e talvez mostre pra mãe depois.

`robots: noindex, nofollow`. Isso não é pra internet, é pra uma pessoa.

## 7. Performance

- Partículas: 4000 desktop, 1400 mobile, `Points` com shader custom
- Sem postprocessing no mobile (bloom só desktop)
- `frameloop` pausado quando a aba sai de foco
- Fotos via `next/image`, AVIF, com blur placeholder
- Lenis só em ponteiro fino (no touch o scroll nativo ganha)
- `prefers-reduced-motion`: versão estática legível de ponta a ponta
