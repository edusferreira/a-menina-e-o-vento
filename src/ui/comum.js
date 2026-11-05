// Peças de interface reaproveitadas pelas telas: retratos, balões de fala, avatar do jogador e HUD da semana.

import { html, cru } from './dom.js';
import { desenharAvatar } from './avatar.js';
import { momento, opacidadeMaria } from '../engine/tempo.js';
import { patente } from '../engine/pontos.js';
import { desbloqueios } from '../app/perfil.js';

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

export const nomeRecruta = (api) => api.perfil.avatar.nome || 'Recruta';

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

export function botaoVoltar(rotulo = 'Voltar', acao = 'voltar') {
  return html`<button class="btn secundario" data-acao="${acao}">${rotulo}</button>`;
}
