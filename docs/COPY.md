# COPY — Meu Futuro

Todo texto que está no ar, na ordem em que ela lê, com o arquivo de cada um.
Voz do Thiago: frases curtas, sem literatura pomposa, sem em-dash.

Para editar, é só abrir o arquivo indicado e trocar a frase. Nada de texto
escondido em componente.

---

## Ato 0 — Portão · `app/components/gate.tsx` + `app/acts/a0-abertura.tsx`

> para
> **Sophya**
> [toca aqui]
> aumenta o volume, e vai devagar.
> eu levei um tempo fazendo isso.

Depois do toque:

> Eu fiz uma coisa pra você.
>
> é longo, e é devagar. foi de propósito.

## Ato 1 — Antes de você · `app/acts/a1-antes.tsx`

> Antes de você, eu tava fechado.
>
> Eu tinha acabado de sair de um lugar que me machucou.
> E tinha certeza que não tava pronto pra mais ninguém.
>
> Então eu construí uma casca.
> E ela funcionava bem.

## Ato 2 — Aí você chegou · `app/acts/a2-chegada.tsx`

> A gente se conheceu por mensagem.
> Sem cinema, sem destino escrito no céu. Só uma conversa.

Aí entra a conversa real do Instagram, transcrita do print, em
`app/components/chat.tsx`, com os horários e tudo:

> *20 de jul., 11:23*
> **Oii**
> *20 de jul., 13:12*
> oiie
> **Bem melhor aquii**
> **Orra e tu é uma gatinha em**
> **Gostei**
> **Hahah**
> kkkkkkkk ah obrigada
> que bom que gostou
> vc tbm é um gatinho
> dos olhos claros
> [e o "digitando" continua pulsando, porque a conversa não acabou]

Depois:

> Eu te chamei pra jantar no Tokomfome.
> Tava tão cheio que a gente **nem entrou**.
>
> A gente achou outro lugar pra ir.
> E o que aconteceu depois é só nosso.
>
> Eu só sei que eu não queria ir embora.

## Ato 3 — Eu tentei te afastar · `app/acts/a3-afastar.tsx`

As duas frases derivam para lados opostos conforme ela rola: o scroll dela faz
o gesto de empurrar.

> Uma vez.
>
> E depois de novo.
> Duas vezes. E você continuou aí.
>
> Não era você.
> Era eu com medo de gostar de alguém outra vez.
>
> Eu te empurrei sabendo exatamente o que eu tava fazendo.

## Ato 4 — Você não desistiu · `app/acts/a4-quebra.tsx`

> Você ficou.
>
> Continuou gostando de mim enquanto eu te dava motivo pra ir embora.
>
> Ninguém nunca tinha feito isso por mim.
>
> essa parte é sua.
> **[ela segura o dedo por 2 segundos, e a página fica travada até ela segurar]**
>
> E aí a casca quebrou.

E logo depois, o buquê (`app/components/rosa.tsx`):

> No primeiro buquê que eu te dei, as rosas estavam fechadas.
>
> [a rosa abre pétala por pétala conforme ela rola: as de fora primeiro,
> depois as do meio, depois o miolo]
>
> Foi de propósito.
> Porque o nosso ainda ia **desabrochar**.

## Ato 5 — Quem é você · `app/acts/a5-voce.tsx`

> Aí eu comecei a reparar em tudo.
>
> No seu sorriso, que é o mais bonito que eu já vi.
> No seu jeito de falar, que me pega toda vez.
> No seu sotaque de Belém, que eu peço pra você repetir só pra ouvir de novo.
> Nos seus olhos grandes, que eu fico olhando mais tempo do que devia.
> E na gente se olhando sem precisar falar nada.
> Nos seus pezinhos virados pra dentro, que eu acho a coisa mais fofa do mundo.
> Em você animadinha.
> E em você carinhosa, do jeito que você diz que aprendeu comigo.
>
> e no nome que eu te dou quando é só a gente
> *minha pimentinha*
>
> e em você falando
> *você é muito é apaixonado*
>
> Sou.
> Todo dia um pouco mais.

Cada frase vem com uma foto (fotos 1 a 7). As legendas das polaroids estão
vazias de propósito: se quiser escrever à mão embaixo de cada foto, passe
`legenda="..."` no `<Detalhe>`.

## Ato 6 — O que você fez sem perceber · `app/acts/a6-sem-perceber.tsx`

> Você me apresentou pros seus avós.
> Que você não via há sete anos.
>
> Me apresentou pra sua mãe.
> E eu entendi de onde vem o seu jeito.
>
> Seu irmão me chamou de Brad Pitt da Sophya.
> Valeu, Gabriel.
>
> E foi tirando, uma por uma, insegurança que eu carregava há anos.
> Sem nunca fazer disso um favor.
>
> [esteira com as fotos 8 a 11]
>
> Eu mudei da noite pro dia.
> E foi por você.

## Ato 7 — Cem quilômetros · `app/acts/a7-km.tsx` + `app/components/journey.tsx`

> Da minha casa até a sua são 25 km.
>
> [o trajeto se desenhando: eu vou · eu te busco · eu te levo em casa · eu volto]
>
> **100 km** toda vez que eu te vejo
>
> E se você perguntar se vale a pena:
> eu faço de novo hoje, amanhã **e depois**.
> Nem que eu tenha que viajar um milhão de quilômetros pra te ver.

## Ato 8 — O que eu vejo daqui · `app/acts/a8-futuro.tsx`

> A gente fala isso um pro outro.
>
> **Você é o meu futuro.**
> E eu não falo por falar.
>
> [a constelação se desenhando]
>
> Eu vejo você médica, cuidando da cabeça das pessoas do jeito que você cuidou
> da minha sem nem perceber.
>
> Eu vejo você mãe. Porque eu já vi como você fica quando vê uma criança.
>
> Eu vejo a gente.
>
> faz **[dias desde 20/07/2026]** dias que a gente conversa
>
> E pela primeira vez em muito tempo eu não tô com medo do que vem depois.

O contador é calculado no navegador dela, no dia em que ela abrir. Hoje marca
43. Se ela abrir daqui a duas semanas, marca 57. Não precisa mexer em nada.

## Ato 9 — A pergunta · `app/acts/a9-pergunta.tsx`

> Eu te prometi que ia te dar o meu melhor.
> Isso aqui é uma parte dele.
>
> Por isso, Sophya,
>
> # eu quero te fazer uma pergunta.

E acabou. Nada depois disso: quem fala a seguir é você.

---

## O que ficou de fora, de propósito

O que você me contou de mais íntimo não entrou literalmente. O motel virou "a
gente achou outro lugar pra ir, e o que aconteceu depois é só nosso": quem
viveu entende, e quem ler por cima do ombro dela não.

O site também está com `noindex`: não aparece em busca nenhuma.
