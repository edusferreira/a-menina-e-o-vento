// Peças de figurino dos personagens, desenhadas como camadas extras do avatar (data/avatar.json "extras").
// Seguem as descrições do figurino do espetáculo; cada peça marca data-camada para os testes acharem.

const SVG_PERIGO = /["<>&]/g;
const limpa = (cor) => String(cor ?? '').replace(SVG_PERIGO, '');

/** Pontos ao longo de uma curva de Bézier quadrática (colar de pérolas). */
function pontosNaCurva([x0, y0], [x1, y1], [x2, y2], quantos) {
  return Array.from({ length: quantos }, (_, i) => {
    const t = i / (quantos - 1);
    const a = (1 - t) ** 2;
    const b = 2 * (1 - t) * t;
    const c = t ** 2;
    return [a * x0 + b * x1 + c * x2, a * y0 + b * y1 + c * y2];
  });
}

const PEROLAS = pontosNaCurva([41, 86], [50, 101], [59, 86], 9)
  .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="#fbf8f0" stroke="#0002" stroke-width=".5"/>`).join('');

const BABADOS = [88, 95, 102, 109]
  .map((y) => [41, 47, 53].map((x) => `<path d="M${x} ${y} q3 6 6 0" fill="#fff" stroke="#0002"/>`).join('')).join('');

const brilhos = (cor) => [[30, 100], [40, 108], [58, 96], [68, 104], [46, 118], [62, 116], [24, 116], [76, 118], [52, 106]]
  .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.1 : 1.5}" fill="${i % 3 ? limpa(cor) : '#e9e5dc'}"/>`).join('');

const bolinhas = (cor) => [[44, 97], [56, 97], [50, 104], [43, 111], [57, 111], [50, 118], [30, 112], [70, 112], [24, 119], [76, 119]]
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.3" fill="${limpa(cor)}"/>`).join('');

/** Calça aparecendo na base do busto, lisa ou xadrez (quadriculada). */
function calca({ cor, xadrez }) {
  const linhas = xadrez
    ? [20, 26, 32, 38, 44, 56, 62, 68, 74, 80].map((x) => `<path d="M${x} 112 V122" stroke="${limpa(xadrez)}" stroke-width="1.2" opacity=".7"/>`).join('')
      + [115, 119].map((y) => `<path d="M17 ${y} H83" stroke="${limpa(xadrez)}" stroke-width="1.2" opacity=".7"/>`).join('')
    : '';
  return `<g data-camada="calca"><path d="M17 112 H83 L84 122 H16Z" fill="${limpa(cor)}"/>${linhas}<path d="M50 112 V122" stroke="#0004"/></g>`;
}

/** Detalhes desenhados sobre o tecido: estampa, peito de renda, saia, calça e faixa na cintura. */
export function detalhesDaRoupa(cfg) {
  const desenho = { bolinhas, brilhos }[cfg.estampa?.tipo];
  const estampa = desenho ? `<g data-camada="estampa">${desenho(cfg.estampa.cor)}</g>` : '';
  const pontos = [[40, 96], [46, 100], [54, 100], [60, 96], [43, 106], [50, 108], [57, 106]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${limpa(cfg.renda)}"/>`).join('');
  const peito = cfg.renda ? `<path d="M36 90 Q50 98 64 90 L62 112 Q50 117 38 112Z" fill="${limpa(cfg.renda)}" opacity=".45"/>${pontos}` : '';
  const pregas = [30, 42, 58, 70].map((x) => `<path d="M${x} 114 V122" stroke="#0003" stroke-width="1.2"/>`).join('');
  const saia = cfg.saia ? `<path d="M17 112 H83 L84 122 H16Z" fill="${limpa(cfg.saia)}"/>${pregas}` : '';
  const pernas = cfg.calca ? calca(cfg.calca) : '';
  const cinto = cfg.cinto ? `<path data-camada="cinto" d="M17 109 H83 L83 113.5 H17Z" fill="${limpa(cfg.cinto)}"/>` : '';
  return estampa + peito + saia + pernas + cinto;
}

export const FIGURINOS = {
  colar: () => '<g data-camada="colar"><path d="M42 86 Q50 101 58 86" stroke="#d9b45a" stroke-width="1.4" fill="none"/><circle cx="50" cy="99" r="2.4" fill="#d9b45a"/></g>',
  // Maria: laço vermelho no cabelo, gola branca redonda com detalhes na frente, mangas bufantes.
  laco: () => '<g data-camada="laco"><path d="M50 19 Q36 5 28 13 Q30 25 50 21Z" fill="#d6262b"/><path d="M50 19 Q64 5 72 13 Q70 25 50 21Z" fill="#d6262b"/><path d="M48 20 L43 28 L46.5 27.5 L50 22 L53.5 27.5 L57 28 L52 20Z" fill="#b51d22"/><ellipse cx="50" cy="20" rx="4" ry="3.5" fill="#b51d22"/></g>',
  golaRedonda: () => '<g data-camada="gola-redonda"><path d="M50 85 Q37 83 31 90 Q33 100 46 98 Q50 93 50 85Z" fill="#fff" stroke="#0002"/><path d="M50 85 Q63 83 69 90 Q67 100 54 98 Q50 93 50 85Z" fill="#fff" stroke="#0002"/><circle cx="50" cy="106" r="2" fill="#fff"/><circle cx="50" cy="114" r="2" fill="#fff"/></g>',
  mangasBufantes: (cfg) => `<g data-camada="mangas-bufantes">${[21, 79].map((x) => `<ellipse cx="${x}" cy="101" rx="9.5" ry="8.5" fill="${limpa(cfg.roupa)}" stroke="#0003"/><path d="M${x - 5} 97 q5 -3 10 0" stroke="#ffffff55" stroke-width="1.5" fill="none"/>`).join('')}</g>`,
  // Pedro: colete azul de botões dourados sobre a camisa branca, gravata-borboleta vermelha.
  // Colete (Pedro, Crispina, Atlântica): azul de botões dourados por padrão; cor, botões e bordado configuráveis.
  colete: (cfg) => {
    const cor = limpa(cfg.colete?.cor ?? '#2c3f8f');
    const botoes = limpa(cfg.colete?.botoes ?? '#d9b45a');
    const bordado = cfg.colete?.bordado
      ? `<path data-camada="bordado" d="M29 96 q3 -3 6 0 q3 3 6 0 M59 96 q3 -3 6 0 q3 3 6 0 M29 116 q3 -3 6 0 q3 3 6 0 M59 116 q3 -3 6 0 q3 3 6 0" stroke="${limpa(cfg.colete.bordado)}" stroke-width="1" fill="none"/>`
      : '';
    return `<g data-camada="colete"><path d="M25 122 Q26 93 40 86 L50 104 V122Z" fill="${cor}"/><path d="M75 122 Q74 93 60 86 L50 104 V122Z" fill="${cor}"/><path d="M50 104 V122" stroke="#0004"/>${[108, 114, 120].map((y) => `<circle cx="52.5" cy="${y}" r="1.7" fill="${botoes}"/>`).join('')}<path d="M31 108 h7 M62 108 h7" stroke="${botoes}" stroke-width="1.6"/>${bordado}</g>`;
  },
  // Crispina e Atlântica: boina vermelha (com borda de outra cor, se houver), brincos e microfone de rosto.
  boinaVermelha: (cfg) => {
    const cor = limpa(cfg.boina?.cor ?? '#c8262b');
    const borda = limpa(cfg.boina?.borda ?? cor);
    return `<g data-camada="boina-vermelha"><path d="M25 31 Q22 15 47 12 Q77 9 79 25 Q75 31 50 30 Q36 29 25 31Z" fill="${cor}"/><path d="M27 30 Q50 35 73 29 L73 32.5 Q50 38.5 27 33.5Z" fill="${borda}"/><rect x="48" y="8.5" width="3" height="4" rx="1" fill="${cor}"/><path d="M34 18 Q50 13 66 16" stroke="#ffffff33" stroke-width="2" fill="none"/></g>`;
  },
  brincos: () => '<g data-camada="brincos"><circle cx="27.5" cy="58" r="1.7" fill="#e8c46a"/><circle cx="72.5" cy="58" r="1.7" fill="#e8c46a"/></g>',
  microfoneRosto: () => '<g data-camada="microfone-rosto"><path d="M72.5 49 Q71 60 61.5 63" stroke="#d8c3a5" stroke-width="1.3" fill="none"/><circle cx="61" cy="63.2" r="1.5" fill="#2b2b2b"/></g>',
  gravataBorboleta: () => '<g data-camada="gravata-borboleta"><path d="M43 84 L50 90 L46 93Z M57 84 L50 90 L54 93Z" fill="#fff" stroke="#0002"/><path d="M50 89 L41 84 L41 94Z M50 89 L59 84 L59 94Z" fill="#d6262b"/><circle cx="50" cy="89" r="2.4" fill="#b51d22"/></g>',
  // Mãe: blusa branca de mangas curtas aberta sobre o vestido, pérolas, adereço azul-claro e a folha-carta na mão.
  blusaBranca: () => '<g data-camada="blusa-branca"><path d="M16 122 Q18 88 40 85 L38 122Z" fill="#fbf8f2" stroke="#0002"/><path d="M84 122 Q82 88 60 85 L62 122Z" fill="#fbf8f2" stroke="#0002"/><ellipse cx="21" cy="100" rx="9.5" ry="8" fill="#fbf8f2" stroke="#0002"/><ellipse cx="79" cy="100" rx="9.5" ry="8" fill="#fbf8f2" stroke="#0002"/></g>',
  perolas: () => `<g data-camada="perolas">${PEROLAS}</g>`,
  fascinador: () => '<g data-camada="fascinador"><circle cx="33" cy="22" r="7" fill="#a9d4f5" opacity=".9"/><circle cx="40" cy="17" r="5.5" fill="#bfe0fa" opacity=".9"/><circle cx="28" cy="15" r="5" fill="#bfe0fa" opacity=".9"/><path d="M26 22 q7 -6 14 0 M30 14 q4 6 10 4" stroke="#fff" stroke-width="1.2" fill="none"/><circle cx="34" cy="19" r="2" fill="#6fa8dc"/></g>',
  folhaNaMao: () => '<g data-camada="folha-na-mao" transform="translate(70 110) rotate(-25)"><path d="M-13 0 Q0 -8 13 0 Q0 8 -13 0Z" fill="#7cbf5a" stroke="#4f8f36"/><path d="M-13 0 H12" stroke="#4f8f36"/><path d="M-13 0 l-5 1.5" stroke="#6b4a2b" stroke-width="1.6"/></g>',
  // Vovó: chapeuzinho escuro com brilhos e blusa branca de babados.
  chapeuzinho: () => `<g data-camada="chapeuzinho"><ellipse cx="50" cy="20" rx="15" ry="5" fill="#2a2433"/><path d="M38 20 Q38 10 50 10 Q62 10 62 20Z" fill="#2a2433"/>${[[42, 15], [50, 13], [58, 15], [46, 18], [54, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#e8d9a8"/>`).join('')}</g>`,
  babados: () => `<g data-camada="babados"><path d="M38 82 q3 6 6 0 q3 6 6 0 q3 6 6 0 q3 6 6 0" fill="#fff" stroke="#0002"/>${BABADOS}</g>`,
  // Velha que Viu: echarpe longa e clara sobre os ombros, por cima da roupa preta.
  // Peças de terno e de jornalista: paletó aberto até a cintura, gravata, boina, óculos grandes, microfone.
  paleto: (cfg) => `<g data-camada="paleto"><path d="M16 113 Q18 88 40 85 L46 104 L45 113Z" fill="${limpa(cfg.paleto)}"/><path d="M84 113 Q82 88 60 85 L54 104 L55 113Z" fill="${limpa(cfg.paleto)}"/><path d="M40 85 L46 104 L41 97Z M60 85 L54 104 L59 97Z" fill="#0003"/></g>`,
  gravata: (cfg) => {
    const cor = limpa(cfg.gravata?.cor ?? '#c8262b');
    const detalhes = cfg.gravata?.detalhe ? [[49, 95], [51, 99], [49, 103]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="${limpa(cfg.gravata.detalhe)}"/>`).join('') : '';
    return `<g data-camada="gravata"><path d="M46 84 L50 89 L54 84 L52 83 H48Z" fill="#fff" stroke="#0002"/><path d="M47.6 87.5 H52.4 L51.6 91 H48.4Z" fill="${cor}"/><path d="M48.4 91 L46.2 105 L50 109 L53.8 105 L51.6 91Z" fill="${cor}"/>${detalhes}</g>`;
  },
  boina: () => '<g data-camada="boina"><path d="M27 33 Q26 15 50 14 Q76 14 74 32 Q60 26 50 27 Q38 27 27 33Z" fill="#1c1c22"/><path d="M50 15 V27" stroke="#0004"/><circle cx="50" cy="15" r="2" fill="#2c2c34"/><path d="M28 32 Q50 40 72 32 L72 35.5 Q50 44 28 35.5Z" fill="#111"/></g>',
  oculosGrandes: () => '<g data-camada="oculos-grandes"><circle cx="40" cy="49" r="8.5" fill="#ffffff2a" stroke="#1a1a1a" stroke-width="2.4"/><circle cx="60" cy="49" r="8.5" fill="#ffffff2a" stroke="#1a1a1a" stroke-width="2.4"/><path d="M48.5 49 h3 M31.5 48 L27 47 M68.5 48 L73 47" stroke="#1a1a1a" stroke-width="2.2" fill="none"/></g>',
  microfone: () => '<g data-camada="microfone"><rect x="74" y="94" width="4.5" height="18" rx="2" fill="#2b2b2b"/><circle cx="76.2" cy="91" r="5.5" fill="#f2c14e" stroke="#c99a2e"/><path d="M71.5 91 h9.4 M72.4 88.4 h7.6 M72.4 93.6 h7.6" stroke="#c99a2e" stroke-width=".8"/></g>',
  // Fotógrafa: boné azul-escuro, casaco de explorador com bolsos, câmera no pescoço e bolsa transversal.
  boneEscuro: () => '<g data-camada="bone-escuro"><path d="M28 34 Q28 15 50 15 Q72 15 72 34Z" fill="#1f2a44"/><path d="M50 32 Q78 30 86 37 Q72 40 50 37Z" fill="#151d31"/><circle cx="50" cy="16" r="2" fill="#151d31"/></g>',
  bolsos: () => '<g data-camada="bolsos">' + [22, 66].map((x) => `<rect x="${x}" y="98" width="12" height="9" rx="1.5" fill="#0002" stroke="#0003"/><path d="M${x} 101 h12" stroke="#0004"/><circle cx="${x + 6}" cy="99.5" r="1" fill="#d9b45a"/>`).join('') + '</g>',
  camera: () => '<g data-camada="camera"><path d="M42 86 L40 95 M58 86 L60 95" stroke="#2a2420" stroke-width="1.6"/><rect x="38" y="94" width="24" height="16" rx="3" fill="#333"/><circle cx="50" cy="102" r="5" fill="#8fd0ff" stroke="#111" stroke-width="2"/><rect x="40" y="91" width="6" height="4" fill="#333"/></g>',
  bolsaTransversal: () => '<g data-camada="bolsa-transversal"><path d="M70 87 L30 111" stroke="#2a2420" stroke-width="2.5"/><rect x="19" y="108" width="16" height="11" rx="2.5" fill="#2a2420"/><path d="M19 111 h16" stroke="#0005"/></g>',
  // Comissário Plácido: uma lupa enorme de armação branca pendurada no peito.
  lupa: () => '<g data-camada="lupa"><path d="M58 112 L68 122" stroke="#5a4a3a" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="104" r="11" fill="#cfe9f7" fill-opacity=".55" stroke="#fff" stroke-width="3.5"/><circle cx="50" cy="104" r="12.8" fill="none" stroke="#0002"/><path d="M44 99 q3 -3 7 -2" stroke="#fff" stroke-width="1.5" fill="none"/></g>',
  echarpe: () => '<g data-camada="echarpe"><path d="M37 84 Q29 100 31 122 L40 122 Q38 100 45 87Z" fill="#d8d4cc"/><path d="M63 84 Q71 100 69 122 L60 122 Q62 100 55 87Z" fill="#d8d4cc"/><path d="M37 84 Q50 92 63 84 L61 89 Q50 96 39 89Z" fill="#e6e2da"/><path d="M34 96 Q33 108 35 120 M66 96 Q67 108 65 120" stroke="#fff9" stroke-width="1.2" fill="none"/></g>',
};
