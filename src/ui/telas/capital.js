// Rodada numa capital (seção 5.1): chegada, sinal do Vento, 3 locais com informantes e o caminho ao aeroporto.

import { html, cru } from '../dom.js';
import { hud, balao, retrato, nomeCapital, nomeRecruta } from '../comum.js';
import { cenaCapital } from '../cenas.js';
import { momento } from '../../engine/tempo.js';
import { visitarLocal } from '../../engine/jogo.js';
import { variante, falaInformante, falaMae, ecoAdalgisa, preencher } from '../../engine/falas.js';

/** Bloco de chegada: confirma o acerto e explica por que as pistas apontavam para cá (seção 11). */
export function blocoChegada(api, tipo) {
  const j = api.jogo;
  const { dialogos, porId } = api.dados;
  const cap = porId[j.capitalAtual];
  if (tipo === 'inicio') {
    return html`<section class="chegada certa"><h2>Pedro tinha razão: ${nomeCapital(api, cap.id)}</h2>
      <p>${j.caso.pedro.porque}</p><p class="curiosidade">${variante(cap.curiosidades.slice(1), j.semente)}</p></section>`;
  }
  if (tipo !== 'certa') return '';
  const anterior = j.caso.paradas[j.parada - 1];
  const motivos = anterior.locais.filter((l) => l.tipo === 'destino').map((l) => l.pista.porque);
  return html`<section class="chegada certa">
    <h2>${preencher(dialogos.chegada.acertou, { capital: nomeCapital(api, cap.id) })}</h2>
    <p>${dialogos.chegada.porque}</p>
    <ul>${motivos.map((m) => html`<li>${m}</li>`)}</ul>
    <p class="curiosidade">${variante(cap.curiosidades, `${j.semente}:${cap.id}`)}</p>
  </section>`;
}

export function sinalDoVento(api, parada) {
  return html`<p class="sinal-vento"><strong>Sinal do Vento:</strong> ${variante(api.dados.dialogos.sinaisVento, String(parada.sinal))}</p>`;
}

function cartaoLocal(api, parada, l, i, vistos) {
  const visto = vistos.includes(i);
  return html`<li class="local ${visto ? 'visto' : ''}">
    <button class="local-botao" data-acao="visitar" data-idx="${i}">
      <span class="local-nome">${l.nome}</span>
      <span class="local-info">${visto ? 'Visitado · rever a conversa (grátis)' : 'Visitar · 1 período'}</span>
      ${visto ? html`<span class="local-quem">${retrato(api, l.informante, { classe: 'mini' })}</span>` : ''}
    </button>
  </li>`;
}

export function capital(api) {
  const j = api.jogo;
  const { porId, dialogos } = api.dados;
  const parada = j.caso.paradas[j.parada];
  const cap = porId[parada.capital];
  const { periodo } = momento(j.gastos, j.porDia, api.dados.regras);
  const vistos = j.visitados[j.parada] ?? [];
  const bonus = j.perks.aureliaBonus && parada.bonus;
  return {
    html: html`${hud(api)}<main class="tela capital">
      <h1>${api.params.chegada ? nomeCapital(api, cap.id) : `Investigando em ${nomeCapital(api, cap.id)}`}</h1>
      <div class="moldura">${cru(cenaCapital(cap, periodo))}</div>
      ${blocoChegada(api, api.params.chegada)}
      <p class="vinheta">${cap.vinheta}</p>
      ${sinalDoVento(api, parada)}
      ${bonus ? html`<p class="bilhete">${preencher(dialogos.aureliaBonus, { pista: parada.bonus.texto })}</p>` : ''}
      <h2>Onde investigar?</h2>
      <ul class="locais">${parada.locais.map((l, i) => cartaoLocal(api, parada, l, i, vistos))}</ul>
      <p class="dica">${dialogos.dicas.capital}</p>
      <div class="acoes">
        <button class="btn primario" data-acao="aeroporto">Ir ao aeroporto</button>
        <button class="btn" data-acao="mapa">Mapa</button>
        <button class="btn" data-acao="diario">Diário</button>
        <button class="btn secundario" data-acao="menu">Menu</button>
      </div>
    </main>`,
    acoes: {
      visitar: ({ idx }) => {
        const r = visitarLocal(j, Number(idx), api.dados);
        if (r.erro) return;
        api.definirJogo(r.estado);
        if (!r.evento.repetida) api.som.clique();
        if (r.estado.fase === 'fim') return api.ir('final');
        return api.ir('local', { idx: Number(idx), evento: r.evento });
      },
      aeroporto: () => api.ir('aeroporto'),
      mapa: () => api.ir('mapa', { voltar: 'capital' }),
      diario: () => api.ir('diario', { voltar: 'capital' }),
      menu: () => api.ir('abertura'),
    },
  };
}

function blocoInterferencia(api, interferencia, pistasOuvidas, chave) {
  if (!interferencia) return '';
  const { dialogos, porId } = api.dados;
  const nome = nomeRecruta(api);
  const i = dialogos.interferencias;
  if (interferencia.tipo === 'adelaide') {
    return html`<section class="interferencia">
      ${balao(api, 'adelaide', preencher(variante(i.adelaide, chave), { nome }))}
      ${balao(api, 'adalgisa', ecoAdalgisa(pistasOuvidas, dialogos, chave))}
      <p class="custo">${i.adelaideCusto}</p></section>`;
  }
  if (interferencia.tipo === 'crispina') {
    return html`<section class="interferencia">${balao(api, 'crispina', preencher(variante(i.crispina, chave), { capital: porId[interferencia.capital].nome }))}</section>`;
  }
  return html`<section class="interferencia bonus"><p>${variante(i.vento, chave)}</p><p class="custo">${i.ventoBonus}</p></section>`;
}

export function local(api) {
  const j = api.jogo;
  const { dialogos } = api.dados;
  const { idx, evento } = api.params;
  const parada = j.caso.paradas[j.parada];
  const l = parada.locais[idx];
  const chave = `${j.semente}:${j.parada}:${idx}`;
  const ouvidas = (j.visitados[j.parada] ?? []).filter((k) => k !== idx).map((k) => parada.locais[k]).filter((x) => x.pista).map((x) => x.pista);
  const conteudo = l.tipo === 'postal'
    ? html`<p class="narracao">${dialogos.maeLocal}</p>${balao(api, 'mae', falaMae(l.rastro, nomeRecruta(api), dialogos, chave))}
      <div class="postal"><p class="postal-titulo">Postal de Maria</p><p>Maria ${l.rastro}.</p></div>`
    : html`${balao(api, l.informante, falaInformante(l.informante, l.pista, dialogos, chave))}
      <p class="testemunha">Testemunhas contam que a menina ${l.rastro}.</p>`;
  return {
    html: html`${hud(api)}<main class="tela local">
      <h1>${l.nome}</h1>
      ${blocoInterferencia(api, evento?.interferencia, ouvidas, chave)}
      ${conteudo}
      <p class="anotado">Atlântica anotou no Diário.</p>
      <div class="acoes"><button class="btn primario" data-acao="voltar">Voltar à cidade</button>
        <button class="btn" data-acao="diario">Diário</button></div>
    </main>`,
    acoes: {
      voltar: () => api.ir('capital'),
      diario: () => api.ir('diario', { voltar: 'local', voltarParams: api.params }),
    },
  };
}
