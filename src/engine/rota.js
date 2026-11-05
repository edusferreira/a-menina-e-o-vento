// Sorteio da rota de Maria e das opções do aeroporto (seções 5.1 e 5.3).
// A similaridade entre capitais (distratores) é conteúdo (capitais.json), não código.

import { embaralhar } from './rng.js';
import { distanciaKm } from './geo.js';

/** Rota sem repetição, com dois saltos seguidos sempre em regiões diferentes. */
export function sortearRota(capitais, tamanho, rng) {
  const rota = [];
  let restantes = embaralhar(capitais, rng);
  while (rota.length < tamanho) {
    const anterior = rota.at(-1);
    const idx = restantes.findIndex((c) => !anterior || c.regiao !== anterior.regiao);
    if (idx < 0) throw new Error('Não há capitais suficientes para montar a rota');
    rota.push(restantes[idx]);
    restantes = restantes.filter((_, i) => i !== idx);
  }
  return rota.map((c) => c.id);
}

/**
 * Opções do aeroporto: a capital certa + distratores parecidos com ela.
 * Ordem de preferência: tabela de distratores, mesma região, mesmo bioma, mais próximas.
 */
export function opcoesDestino(certaId, porId, { excluir = [], quantidade }, rng) {
  const certa = porId[certaId];
  const bloqueadas = new Set([certaId, ...excluir]);
  const livres = (ids) => ids.filter((id) => porId[id] && !bloqueadas.has(id));
  const todas = Object.keys(porId);
  const porDistancia = livres(todas).sort((a, b) => distanciaKm(certa, porId[a]) - distanciaKm(certa, porId[b]));
  const candidatas = [
    ...livres(certa.distratores ?? []),
    ...embaralhar(livres(todas.filter((id) => porId[id].regiao === certa.regiao)), rng),
    ...embaralhar(livres(todas.filter((id) => porId[id].bioma === certa.bioma)), rng),
    ...porDistancia,
  ];
  const distratores = [...new Set(candidatas)].slice(0, quantidade - 1);
  return embaralhar([certaId, ...distratores], rng);
}
