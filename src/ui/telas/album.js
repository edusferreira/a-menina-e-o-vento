// Álbum do Brasil (seção 10.3): 27 cartões liberados ao visitar, mais o cartão do espetáculo e a carta secreta.
// Passeio de domingo (seção 11): viagem livre e sem relógio pelas capitais, pensada para professores.

import { html, cru } from '../dom.js';
import { balao, folhaCarta } from '../comum.js';
import { cenaCapital } from '../cenas.js';
import { falaInformante } from '../../engine/falas.js';
import { patente } from '../../engine/pontos.js';
import { desbloqueios } from '../../app/perfil.js';

const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

function detalheCartao(api, c) {
  const registro = api.perfil.album[c.id] ?? {};
  return html`<article class="cartao-detalhe">
    <h2>${c.nome} <small>${c.estado} (${c.uf})</small></h2>
    <dl class="ficha">
      <div><dt>Região</dt><dd>${c.regiao}</dd></div>
      <div><dt>Bioma</dt><dd>${c.bioma}</dd></div>
      <div><dt>Água</dt><dd>${c.rio}</dd></div>
    </dl>
    <h3>Curiosidades</h3>
    <ul>${c.curiosidades.map((x) => html`<li>${x}</li>`)}</ul>
    ${registro.carta ? folhaCarta(api, registro.carta, { chave: c.id }) : html`<p class="nota">Carta de Maria ainda não recebida aqui.</p>`}
  </article>`;
}

export function album(api) {
  const { capitais, porId, finais } = api.dados;
  const filtro = api.params.regiao ?? 'Todas';
  const cartao = api.params.cartao;
  const visitada = (id) => Boolean(api.perfil.album[id]?.visitada);
  const lista = capitais.filter((c) => filtro === 'Todas' || c.regiao === filtro);
  const total = capitais.filter((c) => visitada(c.id)).length;
  const des = desbloqueios(api.perfil);
  return {
    html: html`<main class="tela album">
      <h1>Álbum do Brasil</h1>
      <p>${total} de 27 cartões · cada capital visitada, mesmo por engano, vira um cartão.</p>
      <div class="abas" role="group" aria-label="Filtrar por região">${['Todas', ...REGIOES].map((r) => html`<button class="btn pequeno ${r === filtro ? 'ativo' : ''}" aria-pressed="${r === filtro}" data-acao="filtro" data-regiao="${r}">${r}</button>`)}</div>
      ${cartao && porId[cartao] && visitada(cartao) ? detalheCartao(api, porId[cartao]) : ''}
      <ul class="cartoes">${lista.map((c) => html`<li>
        <button class="cartao ${visitada(c.id) ? '' : 'bloqueado'} regiao-${c.regiao.replace(/\W/g, '')}" data-acao="cartao" data-id="${c.id}" ${visitada(c.id) ? '' : 'disabled'}>
          <span class="cartao-uf">${visitada(c.id) ? c.uf : '?'}</span>
          <span class="cartao-nome">${visitada(c.id) ? c.nome : 'Não visitada'}</span>
          <span class="cartao-regiao">${c.regiao}${api.perfil.album[c.id]?.carta ? ' · carta' : ''}</span>
        </button></li>`)}</ul>
      <section class="cartao-extra"><h2>Cartão 28: ${finais.espetaculo.titulo}</h2><p>${finais.espetaculo.texto}</p><p>${finais.espetaculo.temporada}</p></section>
      ${des.vistoDoAlto ? html`<section class="carta-secreta"><h2>Carta secreta: Visto do alto</h2>${folhaCarta(api, finais.vistoDoAlto, { completa: true })}</section>` : ''}
      <div class="acoes"><button class="btn primario" data-acao="voltar">Voltar</button></div>
    </main>`,
    acoes: {
      filtro: ({ regiao }) => api.ir('album', { regiao }),
      cartao: ({ id }) => api.ir('album', { ...api.params, cartao: id }),
      voltar: () => api.ir('abertura'),
    },
  };
}

export function passeio(api) {
  const { capitais, porId, pistas, dialogos } = api.dados;
  const todas = patente(api.perfil.pontos, api.perfil.finaisVistos, api.dados.regras).atual.id === 'furacao';
  const liberadas = capitais.filter((c) => todas || api.perfil.album[c.id]?.visitada);
  const atual = porId[api.params.capital] ?? null;
  const { informantes } = api.dados.regras;
  // Cada pista na voz de quem costuma entregar aquela categoria (seção 7.1), alternando quando há dois.
  const voz = (p, i) => informantes[p.cat][i % informantes[p.cat].length];
  return {
    html: html`<main class="tela passeio">
      <h1>Passeio de domingo</h1>
      <p>Sem relógio: visite ${todas ? 'qualquer capital' : 'as capitais do seu Álbum'}, ouça todos os informantes e leia tudo com calma.</p>
      <label class="campo">Capital
        <select name="capital">${[html`<option value="">Escolha…</option>`, ...liberadas.map((c) => html`<option value="${c.id}" ${atual?.id === c.id ? 'selected' : ''}>${c.nome} (${c.uf})</option>`)]}</select>
      </label>
      ${atual ? html`<div class="moldura">${cru(cenaCapital(atual, 1))}</div>
        <p class="vinheta">${atual.vinheta}</p>
        <h2>O que dizem as pistas que apontam para ${atual.nome}</h2>
        ${pistas[atual.id].map((p, i) => balao(api, voz(p, i), falaInformante(voz(p, i), p, dialogos, `${atual.id}:${i}`)))}
        <h2>Lugares</h2>
        <ul>${atual.locais.map((l) => html`<li><strong>${l.nome}:</strong> Maria ${l.rastro}.</li>`)}</ul>
        <h2>Curiosidades</h2><ul>${atual.curiosidades.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
      <div class="acoes"><button class="btn primario" data-acao="voltar">Voltar</button></div>
    </main>`,
    aoMudar: (el) => { if (el.name === 'capital') api.ir('passeio', { capital: el.value }); },
    acoes: { voltar: () => api.ir('abertura') },
  };
}
