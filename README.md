# Linhas

A história do Metrô de São Paulo contada pelo scroll. Cada linha aparece no mapa no ano em que abriu, de 1974 até as inaugurações de 2026.

Projeto de portfólio de front-end feito por Arthur Monteiro, estudante de Ciência da Computação na UNINOVE.

## Stack

- [Astro](https://astro.build), saída estática
- [GSAP](https://gsap.com) + ScrollTrigger para as animações ligadas ao scroll
- [Lenis](https://lenis.darkroom.engineering) para o scroll suave
- CSS puro com custom properties e cascade layers
- Deploy na Vercel

## Rodando

O projeto é editado no github.dev e compilado pela Vercel a cada push. Para rodar localmente:

```bash
npm install
npm run dev
```

## Acessibilidade

Com `prefers-reduced-motion` ativo, o scroll suave e as animações são desligados e o mapa aparece completo.

## Fontes dos dados

Os dados ficam em `src/data/linhas.json`. Itens com `"verificado": false` ainda precisam de confirmação em fonte primária.

- Diário do Transporte, cobertura dos 52 anos do Metrô (set/2026), da Linha 17-Ouro e da Linha 6-Laranja (2026)
- Band Jornalismo, inauguração da Linha 6-Laranja (jul/2026)

Este projeto não tem vínculo com a Companhia do Metropolitano de São Paulo. A identidade visual é própria.
