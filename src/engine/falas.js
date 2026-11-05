// Encaixa pistas e rastros nas falas de cada personagem (dialogos.json).
// A variação é escolhida por um hash estável, para a mesma visita sempre mostrar a mesma frase.

import { hashTexto } from './rng.js';

export function variante(lista, chave) {
  if (!lista?.length) return '';
  return lista[hashTexto(chave) % lista.length];
}

export function preencher(modelo, valores) {
  return modelo.replace(/\{(\w+)\}/g, (inteiro, campo) => {
    const valor = valores[campo.toLowerCase()];
    if (valor === undefined) return inteiro;
    return campo === campo.toUpperCase() && campo.length > 1 ? String(valor).toUpperCase() : String(valor);
  });
}

export function falaInformante(informante, pista, dialogos, chave) {
  const modelo = variante(dialogos.informantes[informante], chave);
  return preencher(modelo, { pista: pista.texto });
}

export function falaMae(rastro, nome, dialogos, chave) {
  return preencher(variante(dialogos.mae, chave), { rastro, nome });
}

/** Tia Adalgisa ecoa, distorcido, um pedaço de pista já ouvida nesta capital. */
export function ecoAdalgisa(pistasOuvidas, dialogos, chave) {
  if (!pistasOuvidas.length) return dialogos.interferencias.adalgisaSemEco;
  const pista = variante(pistasOuvidas, chave);
  const pedaco = pista.texto.split(' ').slice(-5).join(' ');
  return preencher(variante(dialogos.interferencias.adalgisa, chave), { eco: pedaco });
}

/** Resumo da Atlântica: repete as pistas coletadas, sem interpretar. */
export function recapAtlantica(pistas, dialogos) {
  if (!pistas.length) return dialogos.atlanticaVazia;
  const lista = pistas.map((p) => p.texto.split(' ').slice(-4).join(' ')).join('; ');
  return preencher(dialogos.atlantica, { lista });
}
