// O Vento, desenhado à parte dos outros personagens. Figura mística e andrógina do espetáculo: manto claro de mangas
// largas que abrem como asas, faixas de tecido esfarrapadas em tons de vermelho e terra, capuz de tiras, rosto claro de
// olhos escuros e braços erguidos. A nuvem rabugenta da primeira versão fica disponível em { estilo: 'nuvem' }.
// O mesmo corpo serve para a Maria virando brisa, na derrota: { cabeca: <svg da cabeça dela>, brisa: true }.

const MANTO = '#ece3d3';
const DOBRA = '#d3c6ad';
const PELE = '#f3e9e3';
const TINTA = '#2a1e2a';
const FAIXAS = ['#b8322c', '#c4622d', '#7a2330', '#5a3a2a', '#d9853b', '#9c2a2f'];

/** Fita de pano caindo com leve curva; a ponta reta lembra tecido rasgado. */
function fita([x, largura, comprimento, curva, cor], topo) {
  return `<path d="M${x} ${topo} q${curva} ${comprimento / 2} ${(curva * 0.3).toFixed(1)} ${comprimento}" stroke="${FAIXAS[cor]}" stroke-width="${largura}" fill="none"/>`;
}

// [x, largura, comprimento, curva, cor]. As do meio começam abaixo do queixo; as das laterais emolduram o rosto.
const FITAS_FRENTE = [[59, 4, 70, -3, 0], [63, 5, 58, 2, 2], [67, 3.5, 46, -2, 1], [70.5, 5, 58, 3, 3], [75, 4.5, 52, -2, 0],
  [79.5, 5, 60, 2, 4], [83, 3.5, 44, -3, 2], [87, 5, 72, 3, 5], [91, 4, 64, -2, 1]];
const FITAS_COSTAS = [[49, 6, 62, -3, 3], [55, 5, 56, 2, 5], [95, 5, 58, -2, 2], [101, 6, 62, 3, 3]];
const PENDURADAS = [[24, 3, 14, -2, 0], [31, 4, 18, 2, 2], [39, 3, 12, -1, 4], [47, 3.5, 16, 2, 1]];

const ehLateral = ([x]) => x < 64 || x > 86;
const fitasFrente = (topoLateral) => FITAS_FRENTE.map((f) => fita(f, ehLateral(f) ? topoLateral : 50)).join('');
const fitasCostas = () => FITAS_COSTAS.map((f) => fita(f, 44)).join('');
const PONTAS_MANGA = [[26, 82], [33, 84], [41, 82], [49, 78]];
const penduradas = () => PENDURADAS.map((f, i) => fita([PONTAS_MANGA[i][0], ...f.slice(1)], PONTAS_MANGA[i][1] - 4)).join('');
// Tiras enroladas no braço, seguindo a manga do ombro até a mão.
const ENROLADAS = `<path d="M56 52 Q40 44 27 31" stroke="${FAIXAS[2]}" stroke-width="3" fill="none" opacity=".85"/><path d="M57 60 Q42 54 30 44" stroke="${FAIXAS[1]}" stroke-width="2.5" fill="none" opacity=".8"/>`;
// Pano enrolado no pescoço, por baixo do queixo.
const GOLA = `<path d="M60 49 Q75 57 90 49" stroke="${FAIXAS[1]}" stroke-width="5" fill="none"/><path d="M58 55 Q75 63 92 55" stroke="${FAIXAS[2]}" stroke-width="4" fill="none"/>`;

const MANGA = 'M60 50 Q44 42 26 26 Q20 20 17 24 Q12 40 16 56 Q20 70 26 84 L30 80 L33 86 L37 79 L41 84 L45 76 L49 80 L52 72 Q57 66 60 62Z';
// Contorno suave para a mão e o manto não sumirem em fundo claro.
const DEDOS = 'M15 21 l-3 -7 M17.5 20 l-1 -8 M20 20 l1.5 -7.5 M22 22 l4 -5';
const MAO = `<path d="${DEDOS}" stroke="#0003" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="18" cy="24" rx="4.2" ry="4.6" fill="${PELE}" stroke="#0003" stroke-width=".8"/><path d="${DEDOS}" stroke="${PELE}" stroke-width="2.2" stroke-linecap="round"/>`;
const espelho = (svg) => `<g transform="translate(150 0) scale(-1 1)">${svg}</g>`;

function rosto({ bravo, dormindo }) {
  const sombra = [70.5, 79.5].map((x) => `<ellipse cx="${x}" cy="33" rx="4" ry="2.6" fill="#5b3b5e" opacity=".55"/>`).join('');
  const olhos = dormindo
    ? `<path d="M67.5 33.5 q3 2 6 0 M76.5 33.5 q3 2 6 0" stroke="${TINTA}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
    : `<path d="M67.5 33.5 q3 -2.4 6 0 q-3 1.6 -6 0Z M76.5 33.5 q3 -2.4 6 0 q-3 1.6 -6 0Z" fill="${TINTA}"/>`;
  const sobrancelhas = bravo ? `<path d="M66.5 29 l7 2.6 M83.5 29 l-7 2.6" stroke="${TINTA}" stroke-width="1.6" stroke-linecap="round"/>` : '';
  let boca = '<path d="M71.5 41.5 q3.5 2.5 7 0" stroke="#7a2330" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  if (bravo) boca = '<ellipse cx="75" cy="42.5" rx="2.4" ry="3" fill="#5a1a24"/>';
  if (dormindo) boca = '<ellipse cx="75" cy="42.5" rx="1.6" ry="1.8" fill="#5a1a24"/>';
  return `<g data-camada="rosto"><ellipse cx="75" cy="35" rx="10.5" ry="12.5" fill="${PELE}"/>${sombra}${olhos}${sobrancelhas}${boca}</g>`;
}

const CAPUZ = '<path d="M52 42 Q49 10 75 8 Q101 10 98 42 Q94 30 88 26 Q75 20 62 26 Q56 30 52 42Z" fill="#a83a2c"/>'
  + '<path d="M58 14 l8 -5 l10 3 l9 -2 l7 6 l-6 3 l-8 -2 l-9 3 l-7 -2Z" fill="#c4622d"/>'
  + '<path d="M53 27 l6 -7 l6 4 l-4 6Z M97 27 l-6 -7 l-6 4 l4 6Z" fill="#7a2330"/>';
const FRANJA = '<path d="M62 24 L65.5 30 L68.5 25 L71.5 31 L75 25 L78.5 31 L81.5 25 L84.5 30 L88 24 Q75 18 62 24Z" fill="#b8322c"/>';

// Rajadas brancas nas laterais, fora da figura.
const SOPRO = '<g class="sopro" stroke="#ffffffcc" stroke-width="2.4" fill="none" stroke-linecap="round">'
  + '<path d="M4 98 q12 -6 26 0"/><path d="M10 106 q10 -4 20 0"/><path d="M120 98 q12 -6 26 0"/><path d="M120 106 q10 -4 20 0"/></g>';

function figura({ bravo, dormindo, cabeca, deitado }) {
  // Dormindo, os braços descem (giram no ombro) e as tiras penduradas somem.
  // Deitado, os braços ficam ao longo do corpo (giram mais); em pé dormindo, só descem.
  const giroBraco = deitado ? -124 : -94;
  const braco = (svg) => (dormindo ? `<g transform="rotate(${giroBraco} 58 52)">${svg}</g>` : svg);
  const manga = braco(`<path d="${MANGA}" fill="${MANTO}" stroke="#0003" stroke-width="1.2"/><path d="M54 57 Q40 50 23 35" stroke="${DOBRA}" stroke-width="1.2" fill="none"/>${ENROLADAS}`);
  const pontas = dormindo ? '' : `${penduradas()}${espelho(penduradas())}`;
  return `<g ${deitado ? '' : 'class="flutua" '}data-camada="vento-figura">
    <g data-camada="faixas-costas" class="esvoaca" style="transform-origin:75px 44px">${fitasCostas()}</g>
    <g data-camada="mangas" opacity=".96">${manga}${espelho(manga)}
      <g class="esvoaca" style="transform-origin:40px 80px">${pontas}</g></g>
    <g data-camada="maos">${braco(MAO)}${espelho(braco(MAO))}</g>
    <g data-camada="manto"><path d="M58 46 Q75 40 92 46 L112 108 Q75 112 38 108Z" fill="${MANTO}" stroke="#0003" stroke-width="1.2"/><path d="M66 60 L60 106 M84 60 L90 106" stroke="${DOBRA}" stroke-width="1.4"/></g>
    ${cabeca ?? `<g data-camada="capuz">${CAPUZ}</g>${rosto({ bravo, dormindo })}${FRANJA}`}
    <g data-camada="faixas"><g>${GOLA}</g><g class="esvoaca" style="transform-origin:75px 40px">${fitasFrente(cabeca ? 46 : 30)}</g></g>
  </g>${dormindo ? '' : SOPRO}`;
}

/** A primeira versão: nuvem velha, bochechuda e rabugenta, soprando. */
function nuvem({ bravo }) {
  const bolhas = [[38, 52, 24], [62, 44, 26], [86, 54, 22], [56, 68, 26], [28, 70, 16], [92, 74, 16]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#eef8ec" stroke="#9ccfa8" stroke-width="2"/>`).join('');
  const sobrancelha = bravo ? 'M40 44 l14 6 M86 44 l-14 6' : 'M40 46 q8 -6 14 0 M72 46 q8 -6 14 0';
  return `<g class="flutua">${bolhas}
      <path d="${sobrancelha}" stroke="#4a6b55" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="48" cy="56" r="3.5" fill="#2e4437"/><circle cx="78" cy="56" r="3.5" fill="#2e4437"/>
      <circle cx="40" cy="66" r="7" fill="#ffb3b3" opacity=".5"/><circle cx="88" cy="66" r="7" fill="#ffb3b3" opacity=".5"/>
      <ellipse cx="64" cy="72" rx="6" ry="7" fill="#2e4437"/>
      <path d="M58 84 q6 8 12 0" stroke="#c9e2cf" stroke-width="5" fill="none"/>
    </g>
    <g class="sopro" stroke="#7fbf95" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 66 q14 -4 26 2"/><path d="M104 76 q16 2 30 -2"/><path d="M98 86 q12 6 24 4"/>
    </g>`;
}

// Brisa: o corpo fica meio transparente, com um brilho verde-claro atrás e redemoinhos em volta.
const BRILHO = '<defs><radialGradient id="brilho-brisa"><stop offset="0" stop-color="#e9fbef" stop-opacity=".9"/><stop offset="1" stop-color="#cfe8c3" stop-opacity="0"/></radialGradient></defs>'
  + '<ellipse data-camada="brisa" cx="75" cy="58" rx="74" ry="54" fill="url(#brilho-brisa)"/>';
const REDEMOINHOS = '<g stroke="#ffffffcc" stroke-width="2" fill="none" stroke-linecap="round"><path d="M10 40 q8 -8 16 0 q-8 6 -4 12"/><path d="M128 60 q8 -8 16 0 q-8 6 -4 12"/><path d="M30 104 q14 -6 28 0"/><path d="M94 104 q14 -6 28 0"/></g>';

const ROTULOS = {
  figura: ({ bravo, dormindo, deitado }) => {
    if (deitado) return 'O Vento, figura mística envolta em faixas de tecido, dormindo deitado no chão';
    return `O Vento, figura mística envolta em faixas de tecido, de braços erguidos${dormindo ? ', dormindo' : ''}${bravo ? ', bravo' : ''}`;
  },
  nuvem: () => 'O Vento, uma nuvem com rosto de velho rabugento',
};

/**
 * @param {{classe?: string, bravo?: boolean, dormindo?: boolean, attrs?: string, estilo?: 'figura'|'nuvem',
 *   cabeca?: string, brisa?: boolean, rotulo?: string}} opcoes
 * `attrs` posiciona o desenho dentro de uma cena (x, y, width, height); `cabeca` troca o capuz e o rosto por outro SVG.
 */
export function desenharVento({ classe = '', bravo = false, dormindo = false, deitado = false, attrs = '', estilo = 'figura', cabeca, brisa = false, rotulo } = {}) {
  const emPe = estilo === 'nuvem' ? nuvem({ bravo }) : figura({ bravo, dormindo: dormindo || deitado, cabeca, deitado });
  // Deitado: a figura inteira gira 90° (cabeça à esquerda, pés à direita) e continua cabendo na mesma caixa.
  const desenho = deitado ? `<g transform="rotate(-90 75 55)">${emPe}</g>` : emPe;
  const corpo = brisa ? `${BRILHO}<g opacity=".72">${desenho}</g>${REDEMOINHOS}` : desenho;
  const nome = (rotulo ?? (ROTULOS[estilo] ?? ROTULOS.figura)({ bravo, dormindo, deitado })).replace(/["<>&]/g, '');
  return `<svg class="vento ${classe}" ${attrs} viewBox="0 0 150 110" role="img" aria-label="${nome}">${corpo}</svg>`;
}
