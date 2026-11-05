// Diário da Aventura (seção 8.1), derivado do estado: nada é digitado pelo jogador, Atlântica anota.
// Cada página tem 3 espaços do que Maria fez (um por local) e 2 de para onde ela foi.

function paginaFinal(estado, i) {
  const parada = estado.caso.paradas[i];
  const certo = parada.locais[estado.caso.final.localCerto];
  return {
    indice: i, capital: parada.capital, ultima: true,
    rastros: [certo.rastro], destino: [], postal: true, aurelia: false, completa: true,
  };
}

export function paginaDiario(estado, i) {
  if (i === estado.caso.paradas.length - 1) return paginaFinal(estado, i);
  const parada = estado.caso.paradas[i];
  const vistos = new Set(estado.visitados[i] ?? []);
  const visto = (k) => vistos.has(k);
  const destino = parada.locais
    .map((l, k) => ({ ...l, k }))
    .filter((l) => l.tipo === 'destino')
    .map((l) => (visto(l.k) ? { pista: l.pista, informante: l.informante } : null));
  return {
    indice: i,
    capital: parada.capital,
    ultima: false,
    rastros: parada.locais.map((l, k) => (visto(k) ? l.rastro : null)),
    destino,
    postal: parada.locais.some((l, k) => l.tipo === 'postal' && visto(k)),
    aurelia: parada.locais.some((l, k) => l.informante === 'aurelia' && visto(k)),
    completa: vistos.size === parada.locais.length,
  };
}

export function resumoDiario(estado) {
  const total = estado.caso.rota.length;
  const paginas = Array.from({ length: estado.parada + 1 }, (_, i) => paginaDiario(estado, i));
  const chegouAoFim = paginas.length === total;
  const completas = paginas.filter((p) => p.completa).length;
  return {
    paginas,
    total,
    completas,
    diarioCompleto: chegouAoFim && completas === total,
    todosPostais: chegouAoFim && paginas.every((p) => p.postal),
    postais: paginas.filter((p) => p.postal && !p.ultima).length,
    aureliaCapitais: paginas.filter((p) => p.aurelia).length,
  };
}
