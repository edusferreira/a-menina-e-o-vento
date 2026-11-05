// Aleatoriedade com semente: o mesmo código de caso ("4F2A") sempre gera a mesma partida,
// para repetir ou compartilhar casos (seção 5.3). Mulberry32 é pequeno, rápido e suficiente para jogo.

/** Sem I, O, 0 e 1 para o código não ser lido errado em voz alta ou num quadro de sala de aula. */
export const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const TAMANHO_SEMENTE = 4;

export function normalizarSemente(texto) {
  const limpo = String(texto ?? '').trim().toUpperCase();
  if (limpo.length !== TAMANHO_SEMENTE) return null;
  return [...limpo].every((c) => ALFABETO.includes(c)) ? limpo : null;
}

export function gerarSemente(random = Math.random) {
  return Array.from({ length: TAMANHO_SEMENTE }, () => ALFABETO[Math.floor(random() * ALFABETO.length)]).join('');
}

/** FNV-1a de 32 bits: transforma texto em estado inicial numérico. */
export function hashTexto(texto) {
  let h = 0x811c9dc5;
  for (const ch of String(texto)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Um passo puro do mulberry32: devolve o valor em [0, 1) e o próximo estado. */
export function proximo(estado) {
  const novo = (estado + 0x6d2b79f5) >>> 0;
  let t = novo;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const valor = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { valor, estado: novo };
}

/** Versão com estado interno, para uso local dentro de funções que montam o caso. */
export function criarRng(semente) {
  let estado = semente >>> 0;
  return {
    random() {
      const r = proximo(estado);
      estado = r.estado;
      return r.valor;
    },
    estado: () => estado,
  };
}

export function inteiro(rng, max) {
  return Math.floor(rng.random() * max);
}

export function escolher(lista, rng) {
  return lista[inteiro(rng, lista.length)];
}

export function embaralhar(lista, rng) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = inteiro(rng, i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Sorteio ponderado: pesos = { chave: peso }. */
export function sortearPeso(pesos, rng) {
  const entradas = Object.entries(pesos).filter(([, p]) => p > 0);
  const total = entradas.reduce((s, [, p]) => s + p, 0);
  let alvo = rng.random() * total;
  for (const [chave, peso] of entradas) {
    alvo -= peso;
    if (alvo < 0) return chave;
  }
  return entradas.at(-1)[0];
}
