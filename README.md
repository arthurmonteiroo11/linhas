# Linhas

![Cartaz do projeto Linhas com o mapa esquemático do Metrô de São Paulo](public/og.png)

A história do Metrô de São Paulo contada pelo scroll. Em 1974 eram sete estações entre o Jabaquara e a Vila Mariana. Em 2026, a rede ganhou o monotrilho até Congonhas e a Linha Laranja. Cada linha se desenha no mapa no ano em que abriu.

**[linhas.vercel.app](https://linhas.vercel.app)**

Projeto de portfólio de front-end feito por Arthur Monteiro, estudante de Ciência da Computação.

## O que tem na página

- **Mapa que se desenha.** Um mapa esquemático em SVG, com linhas a 45° e 90°, como nos mapas de transporte. Cada capítulo desenha a sua linha, as estações "pulam" no fim do traço e os nomes aparecem por último.
- **Fundo em retícula.** Um shader WebGL escrito à mão, sem biblioteca, que imita o meio-tom de impressão. Os pontos acompanham a cor da linha que está na tela.
- **Viagem guiada.** Um vagão fixo na base da tela leva o visitante de capítulo em capítulo. Ele troca de cor com a linha e vira monotrilho, com viga de concreto no lugar do trilho, nas linhas Prata e Ouro. Foi pensado para quem tem um mouse ruim ou só quer assistir.
- **Curiosidades em trilho horizontal.** Uma seção pinada em que o scroll vertical move os cards para o lado.
- **Hero com fonte variável.** O título anima o eixo de largura da Archivo e entra largo, estreitando até a forma condensada.

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build), saída estática |
| Animação | [GSAP](https://gsap.com) + ScrollTrigger |
| Scroll suave | [Lenis](https://lenis.darkroom.engineering) |
| Fundo | WebGL puro (GLSL) |
| Estilo | CSS com custom properties e `@layer`, sem framework |
| Fontes | Archivo, Source Serif 4 e IBM Plex Mono, servidas pelo próprio site via Fontsource |
| Deploy | Vercel |

## Decisões que valem contar

**Sem terminal.** O projeto inteiro foi escrito no github.dev, o editor que roda no navegador. Sem `npm install` local e sem servidor de desenvolvimento. Quem compila é a Vercel, a cada push, e a URL de preview faz o papel do `localhost`. Por isso o toolchain é enxuto e o código é JavaScript, não TypeScript: um erro de tipo só apareceria no build.

**Dados separados da apresentação.** As linhas, o traçado do mapa e as curiosidades ficam em JSON (`src/data`). Cada fato tem a fonte registrada no próprio arquivo. Para adicionar uma linha nova, basta acrescentar o dado e o traçado, sem mexer no componente.

**Movimento com regras.** Só três curvas de easing, nomeadas nos tokens. Só `transform`, `opacity` e `stroke-dashoffset` são animados. Com "reduzir movimento" ligado no sistema, o scroll suave e as animações saem, e o conteúdo aparece completo.

**Desempenho.** O shader carrega só depois que a página está pronta (`import()` em idle), limita a resolução e pausa quando a aba fica em segundo plano.

### Bugs que viraram regra

- **Safari e `pathLength`.** Desenhar a linha com `pathLength="1"` e `stroke-dasharray` funcionava no Chrome, mas no iPhone as linhas apareciam inteiras desde o início. A solução foi medir cada traço com `getTotalLength()` e animar em pixels.
- **CSS `scale` contra GSAP.** Esconder as estações com a propriedade CSS `scale: 0` e deixar o GSAP fazê-las crescer travava tudo em zero, porque as duas transformações se somam. Agora o estado inicial é definido só pelo GSAP.

## Estrutura

```
src/
  components/   LineMap, TourControl, Curiosidades
  data/         linhas.json, mapa.json, curiosidades.json
  layouts/      Base.astro
  pages/        index.astro, 404.astro
  scripts/      motion, tour, station-hover, backdrop (WebGL)
  styles/       tokens.css, base.css
```

## Rodando localmente

```bash
npm install
npm run dev
```

## Fontes dos dados

Datas, extensões e números vêm de imprensa e de documentos públicos. A URL de cada fonte está no campo `fonte` de cada item, em `src/data`. As principais:

- Diário do Transporte: 52 anos do Metrô (set/2026), Linha 17-Ouro (2026), Linha 6-Laranja (2026) e 10 anos do monotrilho (2024)
- Band Jornalismo: inauguração da Linha 6-Laranja (jul/2026)
- Exame: abertura da Linha 4-Amarela (2010)
- Alstom: lançamento da Linha 5 (2002)
- nycsubway.org: histórico das linhas 2 e 3

O mapa é esquemático e foi desenhado do zero, com base na topologia da rede. O projeto não tem vínculo com a Companhia do Metropolitano de São Paulo e não usa a identidade visual dela.
