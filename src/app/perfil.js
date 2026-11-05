// Progresso salvo no navegador (seção 13): perfil (avatar, pontos, Álbum, patente) e a partida em andamento.
// Funções puras recebem e devolvem objetos; só as funções carregar/salvar tocam o storage.

import { resumoDiario } from '../engine/diario.js';
import { patente } from '../engine/pontos.js';

const CHAVE_PERFIL = 'amev:perfil:v1';
const CHAVE_PARTIDA = 'amev:partida:v1';

export function perfilVazio(avatarPadrao) {
  return {
    avatar: { ...avatarPadrao },
    temAvatar: false,
    pontos: 0,
    finaisVistos: [],
    album: {},
    prologoVisto: false,
    partidas: 0,
    vitorias: 0,
    melhorDias: null,
    config: { som: true, textoGrande: false },
  };
}

function lerJson(storage, chave) {
  try {
    const bruto = storage?.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function gravarJson(storage, chave, valor) {
  try {
    storage?.setItem(chave, JSON.stringify(valor));
  } catch {
    // Sem storage (aba anônima, cota cheia): o jogo segue, só não lembra depois.
  }
}

export function carregarPerfil(storage, avatarPadrao) {
  const salvo = lerJson(storage, CHAVE_PERFIL);
  const vazio = perfilVazio(avatarPadrao);
  return salvo ? { ...vazio, ...salvo, config: { ...vazio.config, ...salvo.config } } : vazio;
}

export const salvarPerfil = (storage, perfil) => gravarJson(storage, CHAVE_PERFIL, perfil);
export const carregarPartida = (storage) => lerJson(storage, CHAVE_PARTIDA);
export const salvarPartida = (storage, estado) => gravarJson(storage, CHAVE_PARTIDA, estado);

export function apagarPartida(storage) {
  try { storage?.removeItem(CHAVE_PARTIDA); } catch { /* idem */ }
}

export function apagarTudo(storage) {
  try {
    storage?.removeItem(CHAVE_PERFIL);
    storage?.removeItem(CHAVE_PARTIDA);
  } catch { /* idem */ }
}

/** Álbum: toda capital visitada (mesmo por engano) vira cartão; as cartas de Maria recebidas ficam guardadas. */
export function sincronizarAlbum(perfil, estado) {
  const album = { ...perfil.album };
  estado.visitadas.forEach((id) => { album[id] = { ...album[id], visitada: true }; });
  resumoDiario(estado).paginas.forEach((p) => {
    if (!p.postal) return;
    const { locais } = estado.caso.paradas[p.indice];
    const local = p.ultima ? locais[estado.caso.final.localCerto] : locais.find((l) => l.tipo === 'postal');
    album[p.capital] = { ...album[p.capital], visitada: true, carta: local.carta };
  });
  return { ...perfil, album };
}

export function desbloqueios(perfil) {
  const viu = (f) => perfil.finaisVistos.includes(f);
  return { vistoDoAlto: viu('final1'), catavento: viu('final2'), aureliaBonus: viu('final2'), passeio: viu('final3') };
}

/** Soma a partida encerrada ao perfil. Chamar uma vez por partida (o app marca fim.registrado). */
export function registrarFim(perfil, estado, regras) {
  const comAlbum = sincronizarAlbum(perfil, estado);
  const venceu = estado.fim.tipo !== 'derrota';
  const dias = Math.floor(estado.gastos / estado.porDia) + 1;
  const finaisVistos = venceu && !comAlbum.finaisVistos.includes(estado.fim.tipo)
    ? [...comAlbum.finaisVistos, estado.fim.tipo]
    : comAlbum.finaisVistos;
  const antes = patente(perfil.pontos, perfil.finaisVistos, regras).atual;
  const novo = {
    ...comAlbum,
    pontos: perfil.pontos + estado.fim.pontos,
    finaisVistos,
    partidas: perfil.partidas + 1,
    vitorias: perfil.vitorias + (venceu ? 1 : 0),
    melhorDias: venceu ? Math.min(perfil.melhorDias ?? dias, dias) : perfil.melhorDias,
  };
  const depois = patente(novo.pontos, novo.finaisVistos, regras).atual;
  return { perfil: novo, subiu: depois.id !== antes.id ? depois : null };
}

/** Vantagens que a patente e os finais dão na próxima partida (seção 10.2). */
export function perksDoPerfil(perfil, regras) {
  const ids = regras.patentes.map((p) => p.id);
  const nivel = ids.indexOf(patente(perfil.pontos, perfil.finaisVistos, regras).atual.id);
  return {
    crispinaAcerto: nivel >= ids.indexOf('brisa') ? regras.crispinaAcertoComPerk : 0,
    ventoFrequente: nivel >= ids.indexOf('vento'),
    placidoChamaPeloNome: nivel >= ids.indexOf('ventania'),
    aureliaBonus: desbloqueios(perfil).aureliaBonus,
  };
}
