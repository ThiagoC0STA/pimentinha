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
>
> *20 de julho de 2026*
> [as bolhas de conversa, em `app/components/chat.tsx`]
>
> Eu te chamei pra jantar no Tokomfome.
> Tava tão cheio que a gente **nem entrou**.
>
> E virou o melhor encontro que nunca aconteceu,
> porque a gente ficou ali, juntinho,
> e eu não queria ir embora.

**Nota:** as quatro mensagens do chat são um espaço reservado (`oi, tudo bem?` /
`oi, tudo sim` / `vamo jantar um dia desses?` / `vamo`). Se você tiver os prints
da conversa real, troque em `app/components/chat.tsx`. Fica muito mais forte.

## Ato 3 — Eu tentei te afastar · `app/acts/a3-afastar.tsx`

> Uma vez.
>
> E depois de novo.
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
> **[ela segura o dedo por 2 segundos]**
>
> E aí a casca quebrou.

## Ato 5 — Quem é você · `app/acts/a5-voce.tsx`

> Aí eu comecei a reparar em tudo.
>
> No seu sorriso, que é o mais bonito que eu já vi.
> No seu jeito de falar, que me pega toda vez.
> Nos seus olhos grandes. E na gente se olhando sem precisar falar nada.
> Nos seus pezinhos virados pra dentro, que eu acho a coisa mais fofa do mundo.
> Em você animadinha.
> E em você carinhosa, do jeito que você diz que aprendeu comigo.
>
> e em você falando
> *você é muito apaixonado*
>
> Sou.
> Todo dia um pouco mais.

Cada frase vem com uma foto (fotos 1 a 6). As legendas das polaroids estão
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
> [esteira com as fotos 7 a 11]
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
> Eu vejo você mãe, porque eu já vi como você olha pra criança.
>
> Eu vejo a gente.
>
> faz **[dias desde 20/07/2026]** dias que a gente conversa
>
> E pela primeira vez em muito tempo eu não tô com medo do que vem depois.

## Ato 9 — A pergunta · `app/acts/a9-pergunta.tsx`

> Eu te prometi que ia te dar o meu melhor.
> Isso aqui é uma parte dele.
>
> Por isso, Sophya,
> eu quero te fazer uma pergunta.
>
> # Agora olha pra mim.
>
> t.

Se você for ficar atrás dela em vez de na frente, troque a última linha por
"Agora olha pra trás." (última `RevealWords` do arquivo).

---

## O que ficou de fora, de propósito

O que você me contou de mais íntimo (corpo, hábitos, vinho) não entrou. Ela vai
ver isso com você do lado e provavelmente vai mostrar pra mãe e pro Gabriel
depois. O que entrou é o que é dela sem expor: sorriso, olhos, jeito de falar,
os pezinhos, o carinho.

O site também está com `noindex`: não aparece em busca nenhuma.
