// Ações do jogador como funções puras: (estado, entrada) -> { estado, evento } ou { estado, erro }.
// O estado é serializável (vai inteiro para o localStorage) e nunca é alterado no lugar.
// Fases: capital → (errada) → ... → encontro → teste → conversa → fim.

import { criarCaso } from './caso.js';
import { hashTexto, criarRng, sortearPeso, escolher } from './rng.js';
import { totalPeriodos, custoViagem } from './tempo.js';
import { distanciaKm } from './geo.js';
import { montarTeste, avaliarTeste } from './teste.js';
import { finaisDisponiveis, pontuacaoPartida } from './pontos.js';
import { resumoDiario } from './diario.js';

export function novoJogo({ semente, nivel, dados, perks = {} }) {
  const caso = criarCaso({ semente, nivel, dados, opcoes: { crispinaAcerto: perks.crispinaAcerto ?? 0 } });
  const { porDia } = dados.regras.niveis[nivel];
  return {
    versao: 1,
    semente,
    nivel,
    porDia,
    total: totalPeriodos(porDia, dados.regras),
    perks,
    caso,
    gastos: 0,
    parada: 0,
    fase: 'capital',
    capitalAtual: caso.rota[0],
    visitados: {},
    interferencias: {},
    erros: {},
    visitadas: [caso.rota[0]],
    rngEstado: hashTexto(`${semente}:${nivel}:eventos`),
    encontro: { errados: [], achou: false, teste: null, nivelTeste: null, acertos: null, tentativas: 0 },
    fim: null,
  };
}

const recusa = (estado, erro) => ({ estado, erro });

/** Gasta períodos; se a semana acabar, a partida termina em derrota (seção 6.4). */
function gastar(estado, periodos, regras) {
  const gastos = Math.max(0, estado.gastos + periodos);
  const depois = { ...estado, gastos };
  if (gastos < estado.total || estado.fim) return depois;
  const fim = { tipo: 'derrota' };
  return { ...depois, fase: 'fim', fim: { ...fim, pontos: pontuacaoPartida({ ...depois, fim }, regras).total } };
}

function sortearInterferencia(estado, regras) {
  if (estado.perks.semInterferencia) return { interferencia: null, rngEstado: estado.rngEstado };
  const rng = criarRng(estado.rngEstado);
  const cfg = regras.interferencia;
  if (rng.random() >= cfg.chance) return { interferencia: null, rngEstado: rng.estado() };
  const tipo = sortearPeso(estado.perks.ventoFrequente ? cfg.pesosVentoFrequente : cfg.pesos, rng);
  const parada = estado.caso.paradas[estado.parada];
  const certa = estado.caso.rota[estado.parada + 1];
  const capital = tipo === 'crispina' ? escolher(parada.opcoes.filter((id) => id !== certa), rng) : null;
  return { interferencia: { tipo, capital }, rngEstado: rng.estado() };
}

function custoVisita(interferencia, custos) {
  if (interferencia?.tipo === 'adelaide') return custos.visita + custos.adelaide;
  if (interferencia?.tipo === 'vento') return custos.visita - custos.ventoBonus;
  return custos.visita;
}

export function visitarLocal(estado, idx, dados) {
  if (estado.fase !== 'capital') return recusa(estado, 'fora-de-hora');
  const local = estado.caso.paradas[estado.parada].locais[idx];
  if (!local) return recusa(estado, 'local-invalido');
  const chave = `${estado.parada}:${idx}`;
  const vistos = estado.visitados[estado.parada] ?? [];
  if (vistos.includes(idx)) {
    return { estado, evento: { tipo: 'visita', idx, local, repetida: true, interferencia: estado.interferencias[chave] ?? null } };
  }
  const { interferencia, rngEstado } = sortearInterferencia(estado, dados.regras);
  const marcado = {
    ...estado,
    rngEstado,
    visitados: { ...estado.visitados, [estado.parada]: [...vistos, idx] },
    interferencias: interferencia ? { ...estado.interferencias, [chave]: interferencia } : estado.interferencias,
  };
  const depois = gastar(marcado, custoVisita(interferencia, dados.regras.custos), dados.regras);
  return { estado: depois, evento: { tipo: 'visita', idx, local, repetida: false, interferencia } };
}

export function viajar(estado, destinoId, dados) {
  if (estado.fase !== 'capital') return recusa(estado, 'fora-de-hora');
  const parada = estado.caso.paradas[estado.parada];
  if (!parada.opcoes.includes(destinoId)) return recusa(estado, 'destino-invalido');
  const km = distanciaKm(dados.porId[estado.capitalAtual], dados.porId[destinoId]);
  const custo = custoViagem(km, dados.regras);
  const certa = destinoId === estado.caso.rota[estado.parada + 1];
  const visitadas = estado.visitadas.includes(destinoId) ? estado.visitadas : [...estado.visitadas, destinoId];
  const ultima = estado.parada + 1 === estado.caso.rota.length - 1;
  const movido = certa
    ? { ...estado, visitadas, parada: estado.parada + 1, capitalAtual: destinoId, fase: ultima ? 'encontro' : 'capital' }
    : {
      ...estado,
      visitadas,
      capitalAtual: destinoId,
      fase: 'errada',
      erros: { ...estado.erros, [estado.parada]: [...(estado.erros[estado.parada] ?? []), destinoId] },
    };
  return { estado: gastar(movido, custo, dados.regras), evento: { tipo: 'viagem', certa, destino: destinoId, km, custo } };
}

export function voltar(estado, dados) {
  if (estado.fase !== 'errada') return recusa(estado, 'fora-de-hora');
  const volta = { ...estado, fase: 'capital', capitalAtual: estado.caso.rota[estado.parada] };
  return { estado: gastar(volta, dados.regras.custos.voltar, dados.regras), evento: { tipo: 'volta' } };
}

export function iniciarTeste(estado, dados) {
  if (estado.fase !== 'encontro' || !estado.encontro.achou) return recusa(estado, 'fora-de-hora');
  const { perguntas, rngEstado } = montarTeste(estado, dados.capitais, estado.rngEstado);
  return {
    estado: { ...estado, rngEstado, fase: 'teste', encontro: { ...estado.encontro, teste: perguntas } },
    evento: { tipo: 'teste' },
  };
}

export function escolherLocalEncontro(estado, idx, dados) {
  if (estado.fase !== 'encontro') return recusa(estado, 'fora-de-hora');
  if (idx === estado.caso.final.localCerto) {
    const achou = { ...estado, encontro: { ...estado.encontro, achou: true } };
    return { ...iniciarTeste(achou, dados), evento: { tipo: 'achou', idx } };
  }
  const errados = [...new Set([...estado.encontro.errados, idx])];
  const depois = gastar({ ...estado, encontro: { ...estado.encontro, errados } }, dados.regras.custos.localErradoEncontro, dados.regras);
  return { estado: depois, evento: { tipo: 'local-errado', idx } };
}

export function responderTeste(estado, respostas, dados) {
  if (estado.fase !== 'teste') return recusa(estado, 'fora-de-hora');
  const resultado = avaliarTeste(estado.encontro.teste, respostas);
  if (resultado.nivel === 'soprado') {
    const encontro = { ...estado.encontro, teste: null, tentativas: estado.encontro.tentativas + 1, acertos: resultado.acertos };
    const depois = gastar({ ...estado, fase: 'encontro', encontro }, dados.regras.custos.sopro, dados.regras);
    return { estado: depois, evento: { tipo: 'resultado-teste', ...resultado } };
  }
  const encontro = { ...estado.encontro, nivelTeste: resultado.nivel, acertos: resultado.acertos };
  return { estado: { ...estado, fase: 'conversa', encontro }, evento: { tipo: 'resultado-teste', ...resultado } };
}

export function escolherFinal(estado, final, dados) {
  if (estado.fase !== 'conversa') return recusa(estado, 'fora-de-hora');
  const disponiveis = finaisDisponiveis(estado, resumoDiario(estado));
  if (!disponiveis[final]?.ok) return recusa(estado, 'final-bloqueado');
  const fim = { tipo: final };
  const pontos = pontuacaoPartida({ ...estado, fim }, dados.regras).total;
  return { estado: { ...estado, fase: 'fim', fim: { ...fim, pontos } }, evento: { tipo: 'final', final } };
}

