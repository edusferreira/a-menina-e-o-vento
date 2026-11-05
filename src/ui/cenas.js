// Ilustrações provisórias (arte plana em SVG), no espírito do cartaz: céu verde, catavento, o Vento de faixas de pano.
// Uma paisagem por região substitui, no protótipo, as 108 ilustrações finais previstas na seção 12.

import { desenharAvatar } from './avatar.js';
import { desenharVento } from './vento.js';

/** Céu por período do dia: manhã, tarde, fim de tarde, noite, madrugada. */
const CEUS = [['#bfe8c9', '#f3fbe8'], ['#8fd0ff', '#dcf3ff'], ['#ff9f6b', '#ffd9a0'], ['#1f2d5c', '#3d4f8f'], ['#100c2a', '#2a2050']];

function ceu(periodo, id) {
  const [topo, base] = CEUS[periodo] ?? CEUS[0];
  const noite = periodo >= 3;
  const astro = noite
    ? '<circle cx="330" cy="38" r="16" fill="#f4f1d0"/><circle cx="337" cy="33" r="14" fill="' + topo + '"/>'
    : `<circle cx="330" cy="42" r="20" fill="${periodo === 2 ? '#ffcf6b' : '#ffe68a'}"/>`;
  const estrelas = noite ? [[40, 30], [90, 18], [150, 40], [220, 22], [270, 50], [380, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('') : '';
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${topo}"/><stop offset="1" stop-color="${base}"/></linearGradient></defs>
    <rect width="400" height="180" fill="url(#${id})"/>${estrelas}${astro}`;
}

const coqueiro = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q6 -30 2 -60" stroke="#8a5a2b" stroke-width="5" fill="none"/>${[-60, -20, 20, 60, 100].map((a) => `<ellipse cx="2" cy="-60" rx="22" ry="5" fill="#2f9e5b" transform="rotate(${a} 2 -60) translate(16 0)"/>`).join('')}</g>`;
const araucaria = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-60" width="4" height="60" fill="#6b4a2b"/>${[0, 1, 2].map((i) => `<path d="M${-26 + i * 5} ${-50 - i * 12} Q0 ${-62 - i * 12} ${26 - i * 5} ${-50 - i * 12}" stroke="#2f6f4f" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
const cerradoArv = (x, y, cor) => `<g transform="translate(${x} ${y})"><path d="M0 0 Q-6 -14 4 -26" stroke="#6b4a2b" stroke-width="4" fill="none"/><circle cx="4" cy="-34" r="13" fill="${cor}"/></g>`;
const copas = (y, cor, n = 14) => Array.from({ length: n }, (_, i) => `<circle cx="${i * 31 + 10}" cy="${y + (i % 3) * 4}" r="${18 + (i % 4) * 3}" fill="${cor}"/>`).join('');

const PAISAGENS = {
  Norte: () => `${copas(118, '#1f7a4a', 14)}${copas(130, '#2f9e5b', 14)}<path d="M0 150 Q120 138 220 152 T400 146 V180 H0Z" fill="#b98a54"/><path d="M0 160 Q140 150 260 162 T400 158" stroke="#d9b27a" stroke-width="3" fill="none"/>`,
  Nordeste: () => `<rect y="120" width="400" height="30" fill="#3fb0c9"/><path d="M0 148 Q200 136 400 148 V180 H0Z" fill="#f3dc9b"/>${coqueiro(70, 158)}${coqueiro(110, 162, 0.8)}${coqueiro(320, 160, 0.95)}<path d="M200 128 l20 0 l-6 6 h-10Z M210 128 v-16 l10 12Z" fill="#fff"/>`,
  Sudeste: () => `<path d="M0 140 Q50 70 100 130 Q150 60 210 128 Q260 90 300 130 Q340 80 400 120 V180 H0Z" fill="#4fb36f"/>${[150, 172, 194, 228, 250, 272].map((x, i) => `<rect x="${x}" y="${108 - (i % 3) * 18}" width="18" height="${72 + (i % 3) * 18}" fill="${['#c9d6df', '#e3e8ec', '#aebfcc'][i % 3]}"/>`).join('')}<rect y="160" width="400" height="20" fill="#3fb0c9"/>`,
  Sul: () => `<path d="M0 132 Q100 110 200 130 T400 124 V180 H0Z" fill="#7cc48a"/><path d="M0 152 Q120 140 240 154 T400 150 V180 H0Z" fill="#5aa86c"/>${araucaria(60, 150)}${araucaria(140, 140, 0.8)}${araucaria(300, 148, 1.1)}${araucaria(360, 138, 0.7)}`,
  'Centro-Oeste': () => `<path d="M0 130 Q200 118 400 132 V180 H0Z" fill="#d9a066"/><path d="M0 150 Q200 140 400 152 V180 H0Z" fill="#c0784a"/>${cerradoArv(60, 150, '#6aa84f')}${cerradoArv(150, 140, '#f2c14e')}${cerradoArv(250, 152, '#6aa84f')}${cerradoArv(330, 142, '#e06aa8')}`,
};

/** Folhas e chapéus voando: o sinal de que o Vento passou por ali. */
const RASTRO_VENTO = `<g class="rajada">${[[30, 70], [90, 52], [160, 86], [230, 60], [300, 92]].map(([x, y], i) => `<path d="M${x} ${y} q8 -8 16 0 q-8 8 -16 0Z" fill="${i % 2 ? '#e8b84a' : '#6aa84f'}" class="folha f${i}"/>`).join('')}<path d="M20 40 q40 -14 80 0 M140 30 q50 -12 100 2" stroke="#ffffffaa" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;

export function cenaCapital(capital, periodo, { comVento = true } = {}) {
  const id = `ceu-${capital.id}-${periodo}`;
  const rotulo = `Ilustração de uma paisagem da região ${capital.regiao}`;
  return `<svg class="cena" viewBox="0 0 400 180" role="img" aria-label="${rotulo}">${ceu(periodo, id)}${(PAISAGENS[capital.regiao] ?? PAISAGENS.Norte)()}${comVento ? RASTRO_VENTO : ''}</svg>`;
}

function praia(id, periodo = 1) {
  return `${ceu(periodo, id)}<rect y="110" width="400" height="40" fill="#3fb0c9"/><path d="M0 140 Q200 126 400 140 V180 H0Z" fill="#f3dc9b"/>`;
}

/** Redemoinho de vento em funil: anéis atrás e na frente de quem está dentro, com folhas girando. */
function redemoinho(cx, topo, largura, altura) {
  const aneis = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    return { x: cx + Math.sin(i * 1.3) * 6, y: topo + altura * t, rx: (largura / 2) * (1 - t * 0.75), ry: 6 - t * 3 };
  });
  const tras = aneis.map((a) => `<ellipse cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" rx="${a.rx.toFixed(1)}" ry="${a.ry.toFixed(1)}" fill="none" stroke="#cfe8c3" stroke-width="2.5" opacity=".45"/>`).join('');
  const frente = aneis.map((a) => `<path d="M${(a.x - a.rx).toFixed(1)} ${a.y.toFixed(1)} A${a.rx.toFixed(1)} ${a.ry.toFixed(1)} 0 0 0 ${(a.x + a.rx).toFixed(1)} ${a.y.toFixed(1)}" fill="none" stroke="#eef8ec" stroke-width="3" stroke-linecap="round"/>`).join('');
  const folhas = [[-34, 12], [26, 44], [-20, 78], [14, 104]].map(([dx, dy], i) => `<path d="M${cx + dx} ${topo + dy} q6 -6 12 0 q-6 6 -12 0Z" fill="${i % 2 ? '#e8b84a' : '#6aa84f'}"/>`).join('');
  const [esq, dir, base] = [cx - largura / 2, cx + largura / 2, topo + altura];
  const funil = `<path d="M${esq} ${topo} Q${cx - largura * 0.2} ${topo + altura * 0.6} ${cx - largura * 0.1} ${base} L${cx + largura * 0.1} ${base} Q${cx + largura * 0.2} ${topo + altura * 0.6} ${dir} ${topo}Z" fill="#cfe8c3" opacity=".14"/>`;
  const riscos = [[0.18, 1], [0.42, -1], [0.66, 1]].map(([t, lado]) => {
    const y = topo + altura * t;
    const meia = (largura / 2) * (1 - t * 0.7);
    return `<path d="M${cx - meia * lado} ${y - 6} q${meia * lado} 14 ${2 * meia * lado} 4" stroke="#eef8ec" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>`;
  }).join('');
  return { tras: `<g data-camada="redemoinho" opacity=".9">${funil}${tras}${riscos}${folhas}</g>`, frente: `<g opacity=".9">${frente}</g>` };
}

const caverna = '<path d="M250 180 Q250 60 330 60 Q410 60 410 180Z" fill="#6b5a4a"/><path d="M285 180 Q290 100 330 100 Q370 100 372 180Z" fill="#2a211b"/>';

export function cenaPrologo(n, opcoes, personagens) {
  const pessoa = (id, x, y, w, extra = '') => desenharAvatar(personagens[id], { opcoes, rotulo: id, attrs: `x="${x}" y="${y}" width="${w}" height="${w * 1.2}" ${extra}` });
  const vento = (x, y, w, jeito = {}) => desenharVento({ ...jeito, attrs: `x="${x}" y="${y}" width="${w}" height="${w * 0.73}"` });
  // Cena 3: o Vento sopra Pedro de volta para casa, girando num redemoinho, com cara de assustado.
  const pedroAssustado = { ...personagens.pedro, olhos: 'redondos', boca: 'assustada', extras: [...(personagens.pedro.extras ?? []), 'sobrancelhasErguidas'] };
  const giro = redemoinho(70, 22, 110, 138);
  const pedroNoRedemoinho = () => `${giro.tras}${desenharAvatar(pedroAssustado, { opcoes, rotulo: 'Pedro, assustado, girando num redemoinho', attrs: 'x="44" y="34" width="52" height="62.4" class="voando"' })}${giro.frente}`;
  const cenas = [
    () => `${praia('p1')}${caverna}${pessoa('maria', 120, 96, 60)}${pessoa('pedro', 60, 100, 56)}`,
    () => `<rect width="400" height="180" fill="#2a211b"/><path d="M0 180 Q200 130 400 180Z" fill="#4a3a2e"/>${vento(112, 71, 170, { dormindo: true, deitado: true })}<text x="150" y="86" class="cena-zzz">Z z z</text>${pessoa('maria', 40, 96, 56)}${pessoa('pedro', 0, 104, 50)}`,
    () => `<rect width="400" height="180" fill="#2a211b"/>${vento(180, 30, 170, { bravo: true })}${pedroNoRedemoinho()}${pessoa('maria', 124, 96, 60)}`,
    () => `${praia('p4', 2)}${vento(220, 20, 150)}${pessoa('maria', 120, 90, 66)}<g stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"><path d="M200 100 q-20 -6 -40 0"/><path d="M210 120 q-30 -4 -50 4"/></g>`,
    () => `${praia('p5', 2)}${vento(160, 4, 130)}${pessoa('maria', 240, 8, 34)}${['adelaide', 'adalgisa', 'aurelia'].map((id, i) => pessoa(id, 30 + i * 46, 112, 46)).join('')}`,
  ];
  return `<svg class="cena" viewBox="0 0 400 180" role="img" aria-label="Cena ${n + 1} do prólogo">${cenas[n]()}</svg>`;
}

export function cenaFinal(tipo, opcoes, personagens, avatarJogador) {
  const pessoa = (cfg, x, y, w, rotulo, extra = '') => desenharAvatar(cfg, { opcoes, rotulo, attrs: `x="${x}" y="${y}" width="${w}" height="${w * 1.2}" ${extra}` });
  const p = (id, x, y, w, extra) => pessoa(personagens[id], x, y, w, id, extra);
  const vento = (x, y, w, attrs = '') => desenharVento({ attrs: `x="${x}" y="${y}" width="${w}" height="${w * 0.73}" ${attrs}` });
  // Na derrota, Maria vira brisa: o corpo do Vento, meio transparente, com a cabeça dela (recortada do avatar).
  // Ela é criança, então aparece a 70% do tamanho do Vento, pisando na mesma altura que ele.
  const mariaBrisa = (x, y, w) => desenharVento({
    brisa: true,
    rotulo: 'Maria virando brisa: o rosto dela com o corpo do Vento',
    cabeca: desenharAvatar(personagens.maria, { opcoes, rotulo: 'Maria', recorte: '20 0 64 80', attrs: 'x="58" y="2" width="34" height="42.5"' }),
    attrs: `x="${x}" y="${y}" width="${w}" height="${w * 0.73}"`,
  });
  // Todo o elenco aparece em todo final, como no agradecimento da peça: quem não está na ação da cena entra nas fileiras.
  const quem = (id, x, y, w, ajuste = {}) => (id === 'voce' ? pessoa(avatarJogador, x, y, w, 'Você') : pessoa({ ...personagens[id], ...ajuste }, x, y, w, id));
  const fileiras = (tras, frente, ajustes = {}) => {
    const linha = (ids, y, w) => {
      const passo = 400 / ids.length;
      return ids.map((id, i) => quem(id, (passo * i + (passo - w) / 2).toFixed(1), y, w, ajustes[id])).join('');
    };
    return `<g data-camada="elenco">${linha(tras, 104, 34)}${linha(frente, 126, 42)}</g>`;
  };
  const cenas = {
    // 1. Maria segue com o Vento; Plácido fica pendurado na árvore; Pedro ri.
    final1: () => `${praia('f1', 2)}<rect x="40" y="40" width="10" height="110" fill="#6b4a2b"/><circle cx="45" cy="44" r="38" fill="#2f9e5b"/>${p('placido', 26, 14, 40)}${vento(200, 0, 130)}${p('maria', 322, 6, 38)}`
      + fileiras(['vovo', 'velha', 'reporter', 'fotografa', 'adalgisa', 'aurelia'], ['crispina', 'atlantica', 'pedro', 'voce', 'mae', 'adelaide'], { pedro: { boca: 'aberta', olhos: 'sorriso' } }),
    // 2. Aurélia voa com o Ventinho; Adelaide tenta proibir e Adalgisa concorda com as duas.
    final2: () => `${praia('f2', 1)}${vento(150, 0, 130)}${p('aurelia', 282, 2, 40, 'class="voando"')}`
      + fileiras(['vovo', 'velha', 'reporter', 'fotografa', 'placido', 'crispina', 'atlantica'], ['pedro', 'maria', 'adelaide', 'adalgisa', 'mae', 'voce']),
    // 3. Maria fica com a Mãe e o Vento passa a visitar; a cidade inteira aparece.
    final3: () => `${ceu(2, 'f3')}<rect y="130" width="400" height="50" fill="#7cc48a"/><path d="M40 130 V80 L90 50 L140 80 V130Z" fill="#f4efe6"/><path d="M30 82 L90 44 L150 82" stroke="#d94f3d" stroke-width="8" fill="none"/>${vento(240, 0, 130)}`
      + fileiras(['adelaide', 'adalgisa', 'aurelia', 'vovo', 'velha', 'reporter', 'fotografa'], ['placido', 'pedro', 'mae', 'maria', 'voce', 'crispina', 'atlantica']),
    // Derrota: Maria virou brisa ao lado do Vento; todos olham da praia.
    derrota: () => `${praia('fd', 3)}${caverna}${vento(150, 8, 120)}${mariaBrisa(20, 34, 84)}`
      + fileiras(['adelaide', 'adalgisa', 'aurelia', 'vovo', 'velha', 'reporter'], ['fotografa', 'pedro', 'mae', 'voce', 'placido', 'crispina', 'atlantica']),
  };
  return `<svg class="cena" viewBox="0 0 400 180" role="img" aria-label="Cena final">${(cenas[tipo] ?? cenas.derrota)()}</svg>`;
}
