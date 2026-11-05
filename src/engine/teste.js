// Teste do Vento no encontro final (seção 8.2): 3 perguntas sobre o que Maria fez pela rota.
// As respostas estão no Diário, então quem completou as páginas consegue responder.

import { criarRng, embaralhar, escolher } from './rng.js';

const ALTERNATIVAS = 4;

function rastrosDeOutras(capitalId, capitais) {
  return capitais.filter((c) => c.id !== capitalId).flatMap((c) => c.locais.map((l) => l.rastro));
}

function montarPergunta(estado, i, capitais, rng) {
  const parada = estado.caso.paradas[i];
  const correta = escolher(parada.locais, rng).rastro;
  const daRota = estado.caso.paradas.slice(0, -1).filter((_, j) => j !== i).flatMap((p) => p.locais.map((l) => l.rastro));
  const outras = rastrosDeOutras(parada.capital, capitais);
  const pool = [...new Set([...embaralhar(daRota, rng).slice(0, 1), ...embaralhar(outras, rng)])].filter((r) => r !== correta);
  const opcoes = embaralhar([correta, ...pool.slice(0, ALTERNATIVAS - 1)], rng);
  return { parada: i, capital: parada.capital, opcoes, correta: opcoes.indexOf(correta) };
}

/** Sorteia perguntas de capitais diferentes da rota (menos a final). Devolve o novo estado do rng. */
export function montarTeste(estado, capitais, rngEstado, quantidade = 3) {
  const rng = criarRng(rngEstado);
  const indices = embaralhar(estado.caso.paradas.slice(0, -1).map((_, i) => i), rng).slice(0, quantidade);
  const perguntas = indices.sort((a, b) => a - b).map((i) => montarPergunta(estado, i, capitais, rng));
  return { perguntas, rngEstado: rng.estado() };
}

export function avaliarTeste(perguntas, respostas) {
  const acertos = perguntas.filter((q, i) => respostas[i] === q.correta).length;
  const total = perguntas.length;
  let nivel = 'soprado';
  if (acertos === total) nivel = 'digno';
  else if (acertos > total / 2) nivel = 'zomba';
  return { acertos, total, nivel };
}
