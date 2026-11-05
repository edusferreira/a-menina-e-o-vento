# A Menina e o Vento: Onde está Maria?

Jogo de investigação no estilo Carmen Sandiego pelas 27 capitais do Brasil, feito a partir da especificação "A Menina e o Vento: Especificação do Jogo". É web estático, sem backend e sem dependências em produção.

**Jogar online:** https://edusferreira.github.io/a-menina-e-o-vento/

## Rodar

```bash
npm install      # só para os testes (vitest)
npm run dev      # http://localhost:5173
npm test         # motor, conteúdo e renderização das telas
```

O jogo precisa ser servido por HTTP, porque carrega o conteúdo JSON com `fetch`. Abrir o `index.html` direto do disco não funciona.

## Onde está cada coisa

| Pasta | Conteúdo |
| --- | --- |
| `data/` | Conteúdo editável sem mexer em código: `capitais.json`, `pistas.json`, `dialogos.json`, `finais.json`, `avatar.json` e `regras.json` (balanceamento de tempo e pontos) |
| `src/engine/` | Regras puras e testadas: semente, rota, tempo, caso, ações, diário, teste do Vento, pontuação |
| `src/app/` | Casca: roteador de telas, perfil e partida no `localStorage`, som sintetizado |
| `src/ui/` | Avatar em camadas SVG, mapa do Brasil, cenas e as telas da seção 12 |
| `tests/` | Testes do motor, validação do conteúdo e renderização de cada tela |

## Decisões tomadas onde a especificação deixava margem

- **Página completa do Diário** = os 3 locais da capital visitados. Cada local preenche um espaço de "o que Maria fez", e no local da Mãe chega uma carta de Maria.
- **Cartas de Maria**: como na peça, chegam escritas em folhas de árvore que o vento leva até a Mãe, em primeira pessoa (campo `carta` de cada local em `capitais.json`). O Diário guarda a versão em terceira pessoa (`rastro`), anotada pela Atlântica.
- **Capital final**: não tem informantes. A última carta de Maria aponta em qual dos 3 locais ela está.
- **Teste do Vento**: o resultado vem dos acertos nas 3 perguntas (3 acertos: digno; 2: zomba; 0 ou 1: soprado). O Diário pode ser consultado durante o teste, então quem completou as páginas consegue responder.
- **Semana**: de segunda a domingo (28 períodos; 35 no difícil). Maria some no domingo anterior, no prólogo.

## O que falta para a v1

- O banco tem 439 pistas, com pelo menos 16 por capital e 2 em cada uma das 8 categorias da seção 7.1. A arte é provisória (SVG por região) e o áudio é sintetizado.
- Os links de ingressos, lojinha e Instagram e os patrocinadores estão vazios em `data/finais.json`. Enquanto isso, os botões aparecem como "em breve".
- **Revisão de conteúdo obrigatória**: os fatos das pistas precisam ser conferidos por um professor. Pontos de atenção:
  - a especificação chama Aracaju de "primeira capital planejada (1855)", mas Teresina foi planejada em 1852. O jogo usa só "planejada em 1855";
  - os biomas de São Luís e Fortaleza;
  - apelidos e expressões menos documentados: "Cidade Presépio" (Vitória), "País do Forró" (Sergipe), "Paraíso das Águas" (Alagoas), "beradeiro" (Rondônia), "chambari" e "súcia" (Tocantins), "pit dog" (Goiânia);
  - datas e números: aniversário de Boa Vista (9/7/1890), marés de até 7 m em São Luís, Fortaleza como cidade mais populosa do Nordeste no Censo 2022.
- **Direitos (seção 14)**: personagens, enredo e o verso "O vento é verde..." dependem da autorização dos detentores dos direitos de Maria Clara Machado.

---

Código e conteúdo produzidos com apoio de IA e sujeitos a revisão humana, testes e homologação antes do uso.
