// Peças de interface reaproveitadas pelas telas: retratos, balões de fala, avatar do jogador e HUD da semana.

import { html, cru } from './dom.js';
import { desenharAvatar } from './avatar.js';
import { momento, opacidadeMaria } from '../engine/tempo.js';
import { patente } from '../engine/pontos.js';
import { desbloqueios } from '../app/perfil.js';
import { variante, tratamentos } from '../engine/falas.js';

export function retrato(api, id, { classe = 'retrato', opacidade = 1 } = {}) {
  const { avatar, dialogos } = api.dados;
  return cru(desenharAvatar(avatar.personagens[id], { opcoes: avatar, rotulo: dialogos.personagens[id]?.nome ?? id, classe, opacidade }));
}

export function uniformeAtual(api) {
  const pt = patente(api.perfil.pontos, api.perfil.finaisVistos, api.dados.regras).atual;
  return api.dados.avatar.uniformes[pt.id] ?? api.dados.avatar.uniformes.recruta;
}

export function avatarJogador(api, { classe = 'retrato', rascunho } = {}) {
  const cfg = rascunho ?? api.perfil.avatar;
  const seguro = cfg.acessorio === 'catavento' && !desbloqueios(api.perfil).catavento ? { ...cfg, acessorio: 'nenhum' } : cfg;
  return cru(desenharAvatar(seguro, { opcoes: api.dados.avatar, uniforme: uniformeAtual(api), rotulo: `Recruta ${cfg.nome || ''}`.trim(), classe }));
}

/** {nome} e {recruta} para as falas, a partir do nome digitado na criação do recruta. */
export const tratamento = (api) => tratamentos(api.perfil.avatar.nome);

/** Nome para o jogador ler na tela; sem nome, "Recruta". */
export const nomeRecruta = (api) => (tratamento(api).nome === 'recruta' ? 'Recruta' : tratamento(api).nome);

export function balao(api, id, texto, { classe = '' } = {}) {
  const nome = api.dados.dialogos.personagens[id]?.nome ?? id;
  return html`<figure class="fala ${classe}">
    ${retrato(api, id)}
    <figcaption><strong>${nome}</strong><span class="balao">${texto}</span></figcaption>
  </figure>`;
}

export function nomeCapital(api, id) {
  const c = api.dados.porId[id];
  return `${c.nome} (${c.uf})`;
}

/** Calendário da semana no topo de toda tela de jogo (seção 12). */
export function hud(api) {
  const j = api.jogo;
  const { regras } = api.dados;
  const m = momento(j.gastos, j.porDia, regras);
  const dias = regras.dias.map((dia, d) => {
    const celulas = Array.from({ length: j.porDia }, (_, p) => {
      const idx = d * j.porDia + p;
      const classe = idx < j.gastos ? 'gasto' : idx === j.gastos ? 'agora' : '';
      return `<i class="${classe}"></i>`;
    }).join('');
    return `<div class="dia ${d === m.dia ? 'hoje' : ''}"><span>${dia.slice(0, 3)}</span><div class="periodos">${celulas}</div></div>`;
  }).join('');
  const opacidade = opacidadeMaria(j.gastos, j.porDia);
  return html`<header class="hud ceu-${m.periodo}">
    <div class="hud-texto">
      <p class="hud-quando"><strong>${m.diaNome}, ${m.periodoNome}</strong></p>
      <p class="hud-resta">${m.restantes} período${m.restantes === 1 ? '' : 's'} até o fim do prazo · caso ${j.semente}</p>
    </div>
    <div class="calendario" aria-hidden="true">${cru(dias)}</div>
    <div class="hud-retratos">
      ${opacidade < 1 ? html`<span class="maria-some" title="Maria está virando brisa">${retrato(api, 'maria', { classe: 'mini', opacidade })}</span>` : ''}
      ${avatarJogador(api, { classe: 'mini' })}
      <button class="btn pequeno" data-acao="diario">Diário</button>
    </div>
  </header>`;
}

/** Na partida, a tinta das cartas some junto com Maria a partir da noite de sábado (seção 6.1), sem ficar ilegível. */
export function tintaDaMaria(api) {
  const j = api.jogo;
  return j ? Math.max(0.55, opacidadeMaria(j.gastos, j.porDia)) : 1;
}

/**
 * Carta de Maria escrita numa folha de árvore, como na peça: o vento leva as folhas até a Mãe.
 * `carta` é o miolo em primeira pessoa; com `completa`, o texto já traz saudação e despedida.
 * `reserva` (o rastro em terceira pessoa) cobre o caso raro de dados antigos ainda em cache, sem a carta.
 */
export function folhaCarta(api, carta, { chave = '', completa = false, tinta = 1, reserva } = {}) {
  if (!carta && reserva) return folhaCarta(api, `Maria ${reserva}.`, { completa: true, tinta });
  const despedida = completa ? '' : variante(api.dados.dialogos.cartaDespedida, chave);
  return html`<figure class="folha-carta" role="group" aria-label="Carta de Maria escrita numa folha de árvore">
    <blockquote style="opacity:${tinta}">
      <p>${completa ? carta : `Mãe, ${carta}`}</p>
      ${despedida ? html`<p class="assinatura">${despedida}</p>` : ''}
    </blockquote>
  </figure>`;
}

export function botaoVoltar(rotulo = 'Voltar', acao = 'voltar') {
  return html`<button class="btn secundario" data-acao="${acao}">${rotulo}</button>`;
}
