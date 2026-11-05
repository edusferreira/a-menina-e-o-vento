// Monta o "caso" inteiro a partir da semente: rota, quem está em cada local, que pista cada um dá,
// opções do aeroporto e o local do encontro final. Tudo é decidido no início, então o mesmo código
// de caso sempre conta a mesma história (seção 5).

import { criarRng, hashTexto, embaralhar, escolher, inteiro } from './rng.js';
import { sortearRota, opcoesDestino } from './rota.js';

const INFORMANTES_DESTINO = ['aurelia', 'velha', 'reporter', 'fotografa', 'pedro', 'vovo'];

/** Escolhe as pistas de destino na ordem de níveis pedida (ex.: ["direta", "dedutiva"]). */
function escolherPistas(banco, niveis, rng) {
  const usadas = new Set();
  const escolhidas = niveis.map((nivel) => {
    const doNivel = banco.filter((p, i) => p.nivel === nivel && !usadas.has(i));
    const livres = doNivel.length ? doNivel : banco.filter((_, i) => !usadas.has(i));
    const pista = escolher(livres, rng);
    usadas.add(banco.indexOf(pista));
    return pista;
  });
  const sobra = banco.filter((p, i) => !usadas.has(i) && p.nivel === 'dedutiva');
  return { escolhidas, bonus: sobra.length ? escolher(sobra, rng) : null };
}

/** Cada categoria tem seus informantes (regras.informantes); ninguém fala duas vezes na mesma capital. */
function escolherInformante(pista, usados, regras, rng) {
  const daCategoria = (regras.informantes[pista.cat] ?? []).filter((id) => !usados.has(id));
  const livres = daCategoria.length ? daCategoria : INFORMANTES_DESTINO.filter((id) => !usados.has(id));
  return escolher(livres, rng);
}

function montarLocais(pistasDestino, regras, rng) {
  const usados = new Set(['mae']);
  const destino = pistasDestino.map((pista) => {
    const informante = escolherInformante(pista, usados, regras, rng);
    usados.add(informante);
    return { tipo: 'destino', informante, pista };
  });
  return embaralhar([...destino, { tipo: 'postal', informante: 'mae' }], rng);
}

function sugestaoCrispina(opcoes, certa, acerto, rng) {
  if (rng.random() < acerto) return certa;
  return escolher(opcoes.filter((id) => id !== certa), rng);
}

/** Copia nome e rastro (o que Maria fez ali) de cada local da capital para a parada. */
const comLugar = (locais, capital) => locais.map((l, k) => ({ ...l, nome: capital.locais[k].nome, rastro: capital.locais[k].rastro }));

function montarParada(i, rota, cfg, dados, rng, opcoesExtras) {
  const capital = rota[i];
  const proxima = rota[i + 1];
  const sinal = inteiro(rng, 1000);
  const lugar = dados.porId[capital];
  if (!proxima) {
    const locais = comLugar([0, 1, 2].map(() => ({ tipo: 'encontro' })), lugar);
    return { capital, locais, opcoes: [], crispina: null, bonus: null, sinal };
  }
  const { escolhidas, bonus } = escolherPistas(dados.pistas[proxima], cfg.pistas, rng);
  const opcoes = opcoesDestino(proxima, dados.porId, { excluir: rota.slice(0, i + 1), quantidade: cfg.opcoes }, rng);
  return {
    capital,
    locais: comLugar(montarLocais(escolhidas, dados.regras, rng), lugar),
    opcoes,
    crispina: sugestaoCrispina(opcoes, proxima, opcoesExtras.crispinaAcerto ?? 0, rng),
    bonus,
    sinal,
  };
}

/**
 * @param {{semente: string, nivel: string, dados: object, opcoes?: {crispinaAcerto?: number}}} params
 */
export function criarCaso({ semente, nivel, dados, opcoes = {} }) {
  const cfg = dados.regras.niveis[nivel];
  if (!cfg) throw new Error(`Nível desconhecido: ${nivel}`);
  const rng = criarRng(hashTexto(`${semente}:${nivel}`));
  const rota = sortearRota(dados.capitais, cfg.capitais, rng);
  const diretas = dados.pistas[rota[0]].filter((p) => p.nivel === 'direta');
  const pedro = escolher(diretas.length ? diretas : dados.pistas[rota[0]], rng);
  const paradas = rota.map((_, i) => montarParada(i, rota, cfg, dados, rng, opcoes));
  return { semente, nivel, rota, paradas, pedro, final: { localCerto: inteiro(rng, 3) } };
}
