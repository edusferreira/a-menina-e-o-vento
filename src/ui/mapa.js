// Mapa do Brasil em SVG, desenhado a partir de latitude/longitude (contorno simplificado, ilustrativo).
// Camadas (seção 11): regiões, biomas, rios e fusos. Também desenha a rota do Vento, erros (X) e opções do aeroporto.

const K = 10;
const px = (lon) => ((lon + 74.5) * K).toFixed(1);
const py = (lat) => ((5.8 - lat) * K).toFixed(1);
const ponto = ([lon, lat]) => `${px(lon)},${py(lat)}`;

const CONTORNO = [
  [-51.6, 4.3], [-51.1, 3.9], [-50.7, 2.9], [-50, 1.8], [-49.9, 1], [-50.3, 0.3], [-49, -0.1], [-48.4, -0.6], [-47.6, -0.7],
  [-46.5, -1], [-45.3, -1.6], [-44.4, -2.3], [-43.4, -2.4], [-41.8, -2.8], [-40.5, -2.8], [-39.3, -3.2], [-38.5, -3.7],
  [-37.3, -4.6], [-36.2, -5], [-35.3, -5.3], [-35, -6.2], [-34.8, -7.2], [-34.9, -8.2], [-35.2, -9], [-35.8, -9.7],
  [-36.4, -10.5], [-37.1, -11], [-37.7, -12], [-38.4, -12.9], [-38.9, -13.7], [-39, -15], [-38.9, -16], [-39.2, -17.6],
  [-39.7, -18.6], [-39.8, -19.6], [-40.3, -20.3], [-40.9, -21.3], [-41, -22], [-42, -22.9], [-43.2, -23], [-44.6, -23.3],
  [-45.4, -23.8], [-46.3, -24], [-47.3, -24.6], [-48, -25.3], [-48.6, -26.2], [-48.6, -27], [-48.5, -27.9], [-48.8, -28.6],
  [-49.7, -29.3], [-50.3, -30.4], [-51, -31.2], [-52.1, -32.2], [-52.6, -33.1], [-53.4, -33.7], [-53.6, -32.5], [-54.6, -31.5],
  [-55.6, -30.9], [-56.5, -30.4], [-57.6, -30.2], [-57.2, -29.8], [-56.4, -29], [-55.6, -28.2], [-54.7, -27.6], [-53.8, -27.1],
  [-53.7, -26.3], [-53.8, -25.6], [-54.6, -25.6], [-54.4, -24.5], [-54.3, -24], [-55, -23.9], [-55.5, -23.3], [-55.7, -22.5],
  [-56.5, -22.2], [-57.9, -22.1], [-57.9, -21], [-57.8, -20], [-57.6, -19], [-58, -17.5], [-58.4, -16.3], [-60.2, -16.3],
  [-60.2, -15.1], [-60.5, -13.8], [-61.8, -13.5], [-62.6, -13], [-63.8, -12.5], [-64.9, -12], [-65.3, -11], [-65.4, -9.8],
  [-66.6, -9.9], [-67.6, -10.4], [-68.6, -11], [-69.6, -10.95], [-70.6, -11], [-70.5, -9.5], [-71.3, -9.95], [-72.2, -10],
  [-72.4, -9.5], [-73.2, -9.4], [-73, -8.6], [-73.8, -7.4], [-73.1, -6.4], [-72.9, -5.1], [-71.5, -4.5], [-70, -4.3],
  [-69.4, -1.4], [-69.9, -0.3], [-70, 0.6], [-69.3, 0.9], [-69.8, 1.7], [-68.2, 1.8], [-67.3, 2], [-66.9, 1.2], [-66.3, 0.8],
  [-65.6, 0.9], [-64.8, 1.4], [-64.1, 1.9], [-64, 2.5], [-64.5, 3.8], [-63.6, 3.9], [-62.8, 3.8], [-62.7, 4.2], [-61.3, 4.5],
  [-60.9, 5], [-60.7, 5.2], [-60.1, 5.2], [-59.6, 3.9], [-59.8, 3], [-59.9, 2.4], [-59.7, 1.8], [-58.8, 1.2], [-57.6, 1.7],
  [-56.5, 1.9], [-55.9, 1.8], [-55, 2.5], [-54, 2.2], [-53.3, 2.3], [-52.2, 3], [-51.7, 4],
];

const RIOS = [
  { nome: 'Amazonas', pos: [-56, -2.9], linha: [[-69.9, -4.2], [-67.5, -3.5], [-64.7, -3.4], [-62.5, -3.6], [-60, -3.2], [-58.4, -3.2], [-56, -2.3], [-54.7, -2.3], [-52.5, -1.6], [-51, -0.9], [-50, -0.1]] },
  { nome: 'Negro', pos: [-65, 0.2], linha: [[-67.1, 1], [-66.2, -0.2], [-64.8, -0.5], [-62.9, -1], [-61.3, -2.2], [-60, -3.2]] },
  { nome: 'Madeira', pos: [-62, -7.6], linha: [[-65.3, -10.8], [-64.4, -9.4], [-63.9, -8.8], [-62.5, -7.3], [-61.3, -5.8], [-59.6, -4.4], [-58.8, -3.4]] },
  { nome: 'Tocantins', pos: [-47.4, -9.5], linha: [[-48.7, -15], [-48.4, -12.5], [-48.3, -10.2], [-48, -8.5], [-47.4, -6.8], [-47.6, -5.4], [-49.1, -4.6], [-49.6, -3.8], [-49.3, -1.8]] },
  { nome: 'Araguaia', pos: [-52, -12.5], linha: [[-52.9, -17.8], [-51.7, -15], [-50.6, -12.5], [-49.8, -9.5], [-48.9, -6.5], [-48.4, -5.4]] },
  { nome: 'São Francisco', pos: [-43.2, -15.5], linha: [[-46.4, -20.3], [-45.3, -18.6], [-44.9, -17.3], [-44.3, -15.5], [-43.4, -13.3], [-43.1, -11.1], [-41.8, -9.8], [-40.5, -9.4], [-38.2, -9.4], [-36.4, -10.5]] },
  { nome: 'Parnaíba', pos: [-44.6, -7], linha: [[-45.9, -10.3], [-44.2, -7.8], [-43, -6.8], [-42.8, -5.1], [-42.3, -3.9], [-41.8, -2.9]] },
  { nome: 'Paraná', pos: [-52.6, -23.4], linha: [[-51, -20.1], [-51.9, -21.9], [-53, -22.8], [-54.2, -24], [-54.6, -25.5]] },
  { nome: 'Paraguai', pos: [-59.3, -18.5], linha: [[-57.6, -16.1], [-57.6, -18], [-57.6, -19], [-57.9, -20.5], [-57.9, -22.1]] },
];

export const CAMADAS = {
  regioes: {
    nome: 'Regiões',
    valor: (c) => c.regiao,
    cores: { Norte: '#2f9e5b', Nordeste: '#e0912f', Sudeste: '#3a8fb7', Sul: '#7b5fb0', 'Centro-Oeste': '#c0504d' },
  },
  biomas: {
    nome: 'Biomas',
    valor: (c) => c.bioma.split(' (')[0],
    cores: { Amazônia: '#1f7a4a', 'Mata Atlântica': '#4fb36f', Cerrado: '#d4a72c', Caatinga: '#c46b3c', Pampa: '#7fb2d6' },
  },
  rios: { nome: 'Rios', valor: (c) => c.rio, cores: {} },
  fusos: {
    nome: 'Fusos',
    valor: (c) => (c.fuso === -3 ? 'Brasília' : `Brasília − ${-3 - c.fuso} h`),
    rotulo: (c) => (c.fuso === -3 ? '' : `−${-3 - c.fuso}h`),
    cores: { Brasília: '#3a8fb7', 'Brasília − 1 h': '#e0912f', 'Brasília − 2 h': '#d94f3d' },
  },
};

function linhaRio(rio) {
  const d = rio.linha.map((p, i) => `${i ? 'L' : 'M'}${ponto(p)}`).join(' ');
  return `<path d="${d}" stroke="#4a9fd8" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function rotuloRio(rio) {
  return `<text x="${px(rio.pos[0])}" y="${py(rio.pos[1])}" class="mapa-rio">${rio.nome}</text>`;
}

function corDe(capital, camada) {
  const cfg = CAMADAS[camada];
  return cfg?.cores[cfg.valor(capital)] ?? '#556b5d';
}

function marcador(c, { camada, destaque }) {
  const x = px(c.lon);
  const y = py(c.lat);
  const idxOpcao = destaque.opcoes?.indexOf(c.id) ?? -1;
  const naRota = destaque.rota?.includes(c.id);
  const raio = c.id === destaque.atual ? 7 : idxOpcao >= 0 ? 8 : naRota ? 5.5 : 4;
  const partes = [`<circle cx="${x}" cy="${y}" r="${raio}" fill="${corDe(c, camada)}" stroke="#fff" stroke-width="1.6"/>`];
  if (idxOpcao >= 0) partes.push(`<text x="${x}" y="${(+y + 4).toFixed(1)}" class="mapa-num">${idxOpcao + 1}</text>`);
  if (c.id === destaque.atual) partes.push(`<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="#1d2b22" stroke-width="2" class="pulsa"/>`);
  if (destaque.erradas?.includes(c.id)) {
    partes.push(`<path d="M${+x - 6} ${+y - 6} l12 12 M${+x + 6} ${+y - 6} l-12 12" stroke="#b3261e" stroke-width="3" stroke-linecap="round"/>`);
  }
  const rotulo = camada === 'fusos' ? `${c.uf} ${CAMADAS.fusos.rotulo(c)}` : c.uf;
  partes.push(`<text x="${(+x + 7).toFixed(1)}" y="${(+y - 5).toFixed(1)}" class="mapa-uf">${rotulo}</text>`);
  return partes.join('');
}

function linhaRota(ids, porId) {
  if (!ids || ids.length < 2) return '';
  const d = ids.map((id, i) => `${i ? 'L' : 'M'}${px(porId[id].lon)},${py(porId[id].lat)}`).join(' ');
  return `<path d="${d}" class="mapa-rota" fill="none"/>`;
}

function linhasOpcoes(atual, opcoes, porId) {
  if (!atual || !opcoes?.length) return '';
  const a = porId[atual];
  return opcoes.map((id) => `<path d="M${px(a.lon)},${py(a.lat)} L${px(porId[id].lon)},${py(porId[id].lat)}" class="mapa-opcao"/>`).join('');
}

/**
 * @param {{capitais: object[], porId: object, camada?: string, destaque?: object, rotulo?: string, mostrarTodas?: boolean}} p
 */
export function desenharMapa({ capitais, porId, camada = 'regioes', destaque = {}, rotulo = 'Mapa do Brasil', mostrarTodas = true }) {
  const visiveis = mostrarTodas ? capitais : capitais.filter((c) => destaque.rota?.includes(c.id) || destaque.opcoes?.includes(c.id) || destaque.erradas?.includes(c.id) || c.id === destaque.atual);
  const rios = camada === 'rios' ? RIOS.map((r) => linhaRio(r) + rotuloRio(r)).join('') : RIOS.map(linhaRio).join('');
  return `<svg class="mapa" viewBox="0 0 425 400" role="img" aria-label="${rotulo}">
    <rect width="425" height="400" fill="var(--mar)"/>
    <polygon points="${CONTORNO.map(ponto).join(' ')}" class="mapa-terra"/>
    <g opacity="${camada === 'rios' ? 1 : 0.45}">${rios}</g>
    ${linhaRota(destaque.rota, porId)}
    ${linhasOpcoes(destaque.atual, destaque.opcoes, porId)}
    ${visiveis.map((c) => marcador(c, { camada, destaque })).join('')}
  </svg>`;
}

/** Legenda em texto (a informação nunca depende só da cor). */
export function legendaMapa(capitais, camada) {
  const cfg = CAMADAS[camada];
  const grupos = new Map();
  capitais.forEach((c) => {
    const chave = cfg.valor(c);
    grupos.set(chave, [...(grupos.get(chave) ?? []), c]);
  });
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')).map(([chave, lista]) => ({
    chave, cor: cfg.cores[chave] ?? '#556b5d', capitais: lista,
  }));
}
