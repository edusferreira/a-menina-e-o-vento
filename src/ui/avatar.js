// Avatar 2D em camadas SVG (seção 4.3): cada opção é uma camada, então qualquer combinação funciona
// sem desenhar uma imagem por combinação. O mesmo desenho serve para o recruta e para os personagens.

import { FIGURINOS, detalhesDaRoupa } from './figurinos.js';

const CONTORNO = '#3b2a20';

const ROSTOS = {
  oval: (c) => `<ellipse cx="50" cy="48" rx="20" ry="24" fill="${c}"/>`,
  redondo: (c) => `<circle cx="50" cy="49" r="23" fill="${c}"/>`,
  quadrado: (c) => `<rect x="28" y="25" width="44" height="47" rx="13" fill="${c}"/>`,
  coracao: (c) => `<path d="M27 42 Q27 24 50 24 Q73 24 73 42 Q73 62 50 73 Q27 62 27 42Z" fill="${c}"/>`,
  // Mais largo embaixo, com bochechas e papada.
  bochechudo: (c) => `<path d="M26 46 Q26 25 50 25 Q74 25 74 46 Q78 64 66 73 Q58 79 50 79 Q42 79 34 73 Q22 64 26 46Z" fill="${c}"/><path d="M39 74.5 Q50 80 61 74.5" stroke="#0002" stroke-width="1.4" fill="none"/>`,
};

const OLHOS = {
  pontos: () => `<circle cx="41" cy="49" r="2.2" fill="${CONTORNO}"/><circle cx="59" cy="49" r="2.2" fill="${CONTORNO}"/>`,
  redondos: () => [41, 59].map((x) => `<circle cx="${x}" cy="49" r="4.2" fill="#fff"/><circle cx="${x + 0.6}" cy="49.6" r="2.4" fill="${CONTORNO}"/><circle cx="${x + 1.4}" cy="48.4" r=".8" fill="#fff"/>`).join(''),
  sorriso: () => `<path d="M37 50 Q41 45 45 50 M55 50 Q59 45 63 50" stroke="${CONTORNO}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  cilios: () => [41, 59].map((x) => `<circle cx="${x}" cy="49.5" r="3.2" fill="${CONTORNO}"/><path d="M${x - 4} 46 l-2 -2 M${x} 45 v-3 M${x + 4} 46 l2 -2" stroke="${CONTORNO}" stroke-width="1.3" stroke-linecap="round"/>`).join(''),
  paraCima: () => [41, 59].map((x) => `<circle cx="${x}" cy="49" r="4.2" fill="#fff"/><circle cx="${x + 0.5}" cy="46.9" r="2.3" fill="${CONTORNO}"/>`).join(''),
  deLado: () => [41, 59].map((x) => `<circle cx="${x}" cy="49" r="4.2" fill="#fff"/><circle cx="${x + 2}" cy="49.4" r="2.3" fill="${CONTORNO}"/>`).join(''),
};

const BOCAS = {
  sorriso: () => `<path d="M43 60 Q50 67 57 60" stroke="${CONTORNO}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  aberta: () => `<path d="M42 59 Q50 59 58 59 Q57 69 50 69 Q43 69 42 59Z" fill="#7a2e2e"/><path d="M45 65 Q50 62 55 65 Q50 69 45 65Z" fill="#e86f6f"/>`,
  timida: () => `<path d="M46 62 Q50 64 54 62" stroke="${CONTORNO}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
};

const cachos = (cx, cy, r, n, raio, cor) => Array.from({ length: n }, (_, i) => {
  const a = (Math.PI * 2 * i) / n;
  return `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.9).toFixed(1)}" r="${raio}" fill="${cor}"/>`;
}).join('');

const TOPO = (c) => `<path d="M28 44 Q27 20 50 20 Q73 20 72 44 Q66 31 50 31 Q34 31 28 44Z" fill="${c}"/>`;

/** Cada cabelo tem uma camada de trás (atrás do rosto) e uma da frente. */
const CABELOS = {
  curto: { tras: () => '', frente: TOPO },
  liso: {
    tras: (c) => `<path d="M26 40 Q25 17 50 17 Q75 17 74 40 L77 96 Q50 101 23 96Z" fill="${c}"/>`,
    frente: (c) => `<path d="M28 44 Q29 19 52 19 Q73 21 72 42 Q61 29 45 33 Q34 36 28 44Z" fill="${c}"/>`,
  },
  chanel: {
    tras: (c) => `<path d="M25 42 Q25 17 50 17 Q75 17 75 42 L76 72 Q50 76 24 72Z" fill="${c}"/>`,
    frente: (c) => `<path d="M28 42 Q27 19 50 19 Q73 19 72 42 L72 37 Q50 34 28 37Z" fill="${c}"/>`,
  },
  cacheado: {
    tras: (c) => cachos(50, 44, 25, 14, 9, c),
    frente: (c) => `${cachos(50, 27, 14, 7, 6.5, c)}<circle cx="50" cy="24" r="9" fill="${c}"/>`,
  },
  crespo: {
    tras: (c) => `<circle cx="50" cy="38" r="33" fill="${c}"/>`,
    frente: (c) => `<path d="M27 42 Q27 24 50 24 Q73 24 73 42 Q66 33 50 33 Q34 33 27 42Z" fill="${c}"/>`,
  },
  trancas: {
    tras: (c) => [30, 70].map((x) => Array.from({ length: 6 }, (_, i) => `<ellipse cx="${x}" cy="${58 + i * 7}" rx="4.5" ry="4" fill="${c}"/>`).join('')).join(''),
    frente: (c) => `${TOPO(c)}<path d="M50 20 V31" stroke="#0003" stroke-width="1.2"/>`,
  },
  coque: {
    tras: (c) => `<circle cx="50" cy="17" r="10" fill="${c}"/>`,
    frente: TOPO,
  },
  rabo: {
    tras: (c) => `<path d="M66 26 Q90 34 82 74 Q78 56 68 40Z" fill="${c}"/>`,
    frente: TOPO,
  },
  topete: {
    tras: () => '',
    frente: (c) => `<path d="M29 40 Q29 23 44 21 Q52 9 66 16 Q75 22 71 40 Q62 28 46 30 Q35 30 29 40Z" fill="${c}"/>`,
  },
  raspado: { tras: () => '', frente: (c) => `<path d="M29 42 Q29 24 50 24 Q71 24 71 42 Q64 30 50 30 Q36 30 29 42Z" fill="${c}" opacity=".55"/>` },
  // Cacheado volumoso preso no alto (Maria): os cachos ficam num pompom no topo da cabeça.
  puffAlto: {
    tras: (c) => `${cachos(50, 15, 9, 9, 6.5, c)}<circle cx="50" cy="15" r="9" fill="${c}"/>`,
    frente: (c) => `<path d="M28 45 Q26 21 50 21 Q74 21 72 45 Q70 33 60 29 Q50 26 40 29 Q30 33 28 45Z" fill="${c}"/>`,
  },
  // Curto, liso e repartido de lado (Pedro).
  repartido: {
    tras: () => '',
    frente: (c) => `<path d="M28 44 Q26 20 48 19 Q72 18 73 40 Q66 30 56 28 Q44 27 36 33 Q30 37 28 44Z" fill="${c}"/><path d="M40 22 Q37 27 36 33" stroke="#0003" stroke-width="1.4" fill="none"/>`,
  },
  // Curto e levemente ondulado (Vovó).
  ondulado: {
    tras: (c) => `<path d="M25 52 Q20 36 28 26 Q50 12 72 26 Q80 36 75 52 Q72 47 70 50 L30 50 Q28 47 25 52Z" fill="${c}"/>`,
    frente: (c) => `<path d="M27 46 Q25 24 50 21 Q75 24 73 46 Q70 40 66 42 Q66 34 58 32 Q54 36 50 32 Q46 36 42 32 Q34 34 34 42 Q30 40 27 46Z" fill="${c}"/>`,
  },
  // Longo e ondulado (Velha que Viu).
  onduladoLongo: {
    tras: (c) => `<path d="M26 40 Q25 17 50 17 Q75 17 74 40 Q81 58 74 72 Q81 86 72 98 Q50 103 28 98 Q19 86 26 72 Q19 58 26 40Z" fill="${c}"/>`,
    frente: (c) => `<path d="M28 44 Q29 19 52 19 Q73 21 72 42 Q64 32 52 33 Q40 34 28 44Z" fill="${c}"/><path d="M33 30 q4 -4 8 0" stroke="#0002" stroke-width="1.2" fill="none"/>`,
  },
  // Escuro e preso para trás (Crispina e Atlântica): sem franja, com o volume escondido atrás da cabeça.
  presoAtras: {
    tras: (c) => `<path d="M26 50 Q24 30 34 24 L66 24 Q76 30 74 50 Q72 58 70 58 L30 58 Q28 58 26 50Z" fill="${c}"/>`,
    frente: (c) => `<path d="M28 45 Q27 21 50 21 Q73 21 72 45 Q69 31 50 29 Q31 31 28 45Z" fill="${c}"/><path d="M34 31 Q42 27 50 28 M66 31 Q58 27 50 28" stroke="#0003" stroke-width="1" fill="none"/>`,
  },
  // Coque alto das tias (figurino do espetáculo): cabelo todo puxado para cima, sem franja.
  coqueAlto: {
    tras: (c) => `<ellipse cx="50" cy="11" rx="11" ry="9" fill="${c}"/><path d="M41 16 Q50 22 59 16 L60 25 H40Z" fill="${c}"/>`,
    frente: (c) => `<path d="M28 45 Q26 21 50 21 Q74 21 72 45 Q70 33 60 29 Q50 26 40 29 Q30 33 28 45Z" fill="${c}"/><path d="M38 25 Q44 23 50 27 Q56 23 62 25" stroke="#0003" stroke-width="1.2" fill="none"/>`,
  },
};

/** Chapéu de aba do início do século XX, inclinado e com enfeite (pena e/ou flor) do lado esquerdo. Aba larga ou curta. */
function chapeuAba({ cor, enfeite, corEnfeite, faixa = '#0003', palha = false, aba = 'larga' }) {
  const flor = (x, y) => [0, 72, 144, 216, 288]
    .map((a) => `<ellipse rx="4" ry="6" transform="translate(${x} ${y}) rotate(${a}) translate(0 -4.5)" fill="${corEnfeite}" stroke="#0002" stroke-width=".6"/>`)
    .join('') + `<circle cx="${x}" cy="${y}" r="3" fill="${corEnfeite}" stroke="#0003" stroke-width=".8"/>`;
  const pena = `<path d="M41 15 Q22 13 19 1 Q31 7 47 11Z" fill="${corEnfeite}"/><path d="M42 14 Q29 10 22 3" stroke="#0004" stroke-width="1" fill="none"/>`;
  const tramas = palha ? '<ellipse cx="50" cy="24" rx="33" ry="6" fill="none" stroke="#0002"/><ellipse cx="50" cy="24" rx="25" ry="4.5" fill="none" stroke="#0002"/>' : '';
  const enfeites = { pena: pena + flor(42, 19), flor: flor(35, 17), 'flor-pena': pena + flor(35, 17) + flor(42, 14) };
  return `<g data-camada="chapeu-aba" transform="rotate(-8 50 24)">
    <ellipse cx="50" cy="25.5" rx="${aba === 'curta' ? 30 : 41}" ry="${aba === 'curta' ? 7.5 : 9.5}" fill="${cor}" stroke="#0003" stroke-width="1.2"/>${tramas}
    <path d="M31 24 Q31 4 50 4 Q69 4 69 24Z" fill="${cor}" stroke="#0003" stroke-width="1.2"/>
    <path d="M31 19 Q50 24 69 19 L69 24 Q50 29 31 24Z" fill="${faixa}"/>${enfeites[enfeite] ?? ''}</g>`;
}

/** Gola alta de renda cobrindo o pescoço (blusas das tias). */
function golaAlta(roupa, renda) {
  const bordado = Array.from({ length: 5 }, (_, i) => `<circle cx="${42 + i * 4}" cy="66" r="2" fill="${renda}"/>`).join('');
  return `<g data-camada="gola-alta"><path d="M41 66 H59 L60 86 Q50 89 40 86Z" fill="${roupa}"/><path d="M41 71 H59 M41 77 H59" stroke="${renda}" stroke-width="1.4"/>${bordado}</g>`;
}

const ACESSORIOS = {
  nenhum: () => '',
  oculos: () => `<g fill="none" stroke="${CONTORNO}" stroke-width="1.8"><circle cx="41" cy="49" r="7"/><circle cx="59" cy="49" r="7"/><path d="M48 49 h4"/></g>`,
  bone: () => '<path d="M28 34 Q28 15 50 15 Q72 15 72 34Z" fill="#d94f3d"/><path d="M50 32 Q78 30 86 37 Q72 40 50 37Z" fill="#a83426"/><circle cx="50" cy="16" r="2" fill="#a83426"/>',
  chapeu: () => '<ellipse cx="50" cy="29" rx="38" ry="8.5" fill="#e8c46a" stroke="#b8923a" stroke-width="1.2"/><path d="M33 29 Q33 9 50 9 Q67 9 67 29Z" fill="#e1b955" stroke="#b8923a" stroke-width="1.2"/><path d="M33 24 Q50 28 67 24 L67 28 Q50 32 33 28Z" fill="#2f7d4f"/>',
  catavento: () => '<g><path d="M88 120 V82" stroke="#8a5a2b" stroke-width="2.4"/><g class="gira" style="transform-origin:88px 80px"><path d="M88 80 L88 66 L97 72Z" fill="#e8b84a"/><path d="M88 80 L102 80 L96 89Z" fill="#3a8fb7"/><path d="M88 80 L88 94 L79 88Z" fill="#d94f3d"/><path d="M88 80 L74 80 L80 71Z" fill="#2f9e5b"/><circle cx="88" cy="80" r="2" fill="#fff"/></g></g>',
};

const EXTRAS = {
  ...FIGURINOS,
  bigode: () => `<path d="M40 60 Q45 55 50 59 Q55 55 60 60 Q55 63 50 60 Q45 63 40 60Z" fill="${CONTORNO}"/>`,
  quepe: () => '<path d="M28 33 Q29 15 50 15 Q71 15 72 33Z" fill="#1f2f5c"/><rect x="27" y="30" width="46" height="5" rx="2" fill="#111"/><path d="M50 18 l2.5 5 h-5Z" fill="#f2c14e"/>',
  flor: () => '<g transform="translate(69 27)">' + [0, 72, 144, 216, 288].map((a) => `<ellipse rx="3" ry="5" transform="rotate(${a}) translate(0 -4)" fill="#ff9bd0"/>`).join('') + '<circle r="2.5" fill="#f2c14e"/></g>',
  lenco: () => '<path d="M25 44 Q24 14 50 14 Q76 14 75 44 Q70 30 50 30 Q30 30 25 44Z" fill="#7b4fa0"/><circle cx="40" cy="22" r="2" fill="#f2c14e"/><circle cx="56" cy="20" r="2" fill="#f2c14e"/><circle cx="66" cy="28" r="2" fill="#f2c14e"/>',
  rugas: () => `<path d="M33 41 q3 -2 6 0 M61 41 q3 -2 6 0" stroke="${CONTORNO}" stroke-width="1" fill="none" opacity=".6"/>`,
  telefone: () => '<path d="M74 70 q6 -2 8 4 l-2 16 q-1 6 -8 5Z" fill="#d94f3d"/>',
  sobrancelhas: () => `<path d="M35 41 L45 44 M65 41 L55 44" stroke="${CONTORNO}" stroke-width="2.2" stroke-linecap="round"/>`,
};

function corpo(cfg, uniforme) {
  const roupa = cfg.roupa ?? '#f4efe6';
  const gola = cfg.corpo === 'menino' ? 'M43 85 L50 94 L57 85' : 'M42 85 Q50 95 58 85';
  const decote = cfg.renda ? '' : `<path d="${gola}" stroke="#0002" stroke-width="2" fill="none"/>`;
  const camiseta = `<path d="M16 122 Q18 87 50 84 Q82 87 84 122Z" fill="${roupa}" stroke="#0001"/>${decote}${detalhesDaRoupa(cfg)}`;
  if (cfg.roupa || !uniforme) return camiseta;
  return `${camiseta}<path d="M16 122 Q18 88 40 85 L46 122Z" fill="${uniforme.cor}"/><path d="M84 122 Q82 88 60 85 L54 122Z" fill="${uniforme.cor}"/><path d="M66 96 l2.4 4.8 5.3.8 -3.8 3.7 .9 5.3 -4.8-2.5 -4.8 2.5 .9-5.3 -3.8-3.7 5.3-.8Z" fill="${uniforme.detalhe}"/>`;
}

/** Porte do corpo: o gordinho estica a roupa para os lados; cabeça e objetos (lupa, câmera, microfone) não esticam. */
// O gordinho também sobe os ombros (y 84 vira 80) sem descolar a base, o que deixa o pescoço mais curto.
const LARGURAS = { gordinho: 'matrix(1.18 0 0 1.105 -9 -12.8)' };
const PESCOCOS = { normal: 'x="43" y="66" width="14" height="20"', gordinho: 'x="38" y="66" width="24" height="16"' };
const ESTICAVEIS = new Set(['paleto', 'gravata', 'colete', 'gravataBorboleta', 'golaRedonda', 'mangasBufantes', 'blusaBranca', 'babados', 'echarpe', 'bolsos', 'colar', 'perolas']);

function noPorte(cfg, svg) {
  const largura = LARGURAS[cfg.porte];
  return largura && svg ? `<g data-camada="porte-${cfg.porte}" transform="${largura}">${svg}</g>` : svg;
}

const CAPA = '<path d="M18 80 Q50 70 82 80 L96 124 Q50 114 4 124Z" fill="#cfe8c3" opacity=".9"/><path d="M14 100 q10 -4 20 0 M66 104 q10 -4 20 0" stroke="#2f7d4f" stroke-width="1.5" fill="none" opacity=".6"/>';

function cor(valor, paleta) {
  return typeof valor === 'number' ? paleta[valor] ?? paleta[0] : valor;
}

/**
 * @param {object} cfg - avatar (ver data/avatar.json "padrao") e, para personagens, roupa/extras.
 * @param {{opcoes: object, uniforme?: object, rotulo?: string, classe?: string, opacidade?: number}} ctx
 */
export function desenharAvatar(cfg, { opcoes, uniforme, rotulo = 'Avatar', classe = '', opacidade = 1, attrs = '' }) {
  const pele = cor(cfg.pele, opcoes.pele);
  const cabeloCor = cor(cfg.corCabelo, opcoes.corCabelo);
  const cabelo = CABELOS[cfg.cabelo] ?? CABELOS.curto;
  const extras = cfg.extras ?? [];
  const sobreCabeca = extras.includes('quepe') || extras.includes('lenco');
  const camadas = [
    uniforme?.capa ? CAPA : '',
    noPorte(cfg, corpo(cfg, uniforme)),
    `<rect data-camada="pescoco" ${PESCOCOS[cfg.porte] ?? PESCOCOS.normal} rx="5" fill="${pele}"/>`,
    cfg.renda ? golaAlta(cfg.roupa, cfg.renda) : '',
    // Sob um chapéu de aba, o coque fica escondido pela copa (como nas fotos do espetáculo).
    sobreCabeca || (cfg.chapeuAba && cfg.cabelo?.startsWith('coque')) ? '' : cabelo.tras(cabeloCor),
    `<ellipse cx="28" cy="51" rx="4" ry="6" fill="${pele}"/><ellipse cx="72" cy="51" rx="4" ry="6" fill="${pele}"/>`,
    (ROSTOS[cfg.rosto] ?? ROSTOS.oval)(pele),
    '<circle cx="36" cy="58" r="4" fill="#ff8f8f" opacity=".35"/><circle cx="64" cy="58" r="4" fill="#ff8f8f" opacity=".35"/>',
    (OLHOS[cfg.olhos] ?? OLHOS.redondos)(),
    (BOCAS[cfg.boca] ?? BOCAS.sorriso)(),
    sobreCabeca ? '' : cabelo.frente(cabeloCor),
    ...extras.map((e) => (ESTICAVEIS.has(e) ? noPorte(cfg, EXTRAS[e]?.(cfg) ?? '') : EXTRAS[e]?.(cfg) ?? '')),
    (ACESSORIOS[cfg.acessorio] ?? ACESSORIOS.nenhum)(),
    cfg.chapeuAba ? chapeuAba(cfg.chapeuAba) : '',
  ];
  const nome = rotulo.replace(/["<>&]/g, '');
  return `<svg class="avatar ${classe}" ${attrs} viewBox="0 0 104 124" role="img" aria-label="${nome}" style="opacity:${opacidade}">${camadas.join('')}</svg>`;
}

/** O Vento: nuvem velha, bochechuda e rabugenta, soprando. */
export function desenharVento({ classe = '', bravo = false, attrs = '' } = {}) {
  const nuvem = [[38, 52, 24], [62, 44, 26], [86, 54, 22], [56, 68, 26], [28, 70, 16], [92, 74, 16]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#eef8ec" stroke="#9ccfa8" stroke-width="2"/>`).join('');
  const sobrancelha = bravo ? 'M40 44 l14 6 M86 44 l-14 6' : 'M40 46 q8 -6 14 0 M72 46 q8 -6 14 0';
  return `<svg class="vento ${classe}" ${attrs} viewBox="0 0 150 110" role="img" aria-label="O Vento, uma nuvem com rosto de velho rabugento">
    <g class="flutua">${nuvem}
      <path d="${sobrancelha}" stroke="#4a6b55" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="48" cy="56" r="3.5" fill="#2e4437"/><circle cx="78" cy="56" r="3.5" fill="#2e4437"/>
      <circle cx="40" cy="66" r="7" fill="#ffb3b3" opacity=".5"/><circle cx="88" cy="66" r="7" fill="#ffb3b3" opacity=".5"/>
      <ellipse cx="64" cy="72" rx="6" ry="7" fill="#2e4437"/>
      <path d="M58 84 q6 8 12 0" stroke="#c9e2cf" stroke-width="5" fill="none"/>
    </g>
    <g class="sopro" stroke="#7fbf95" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 66 q14 -4 26 2"/><path d="M104 76 q16 2 30 -2"/><path d="M98 86 q12 6 24 4"/>
    </g>
  </svg>`;
}
