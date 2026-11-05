// Diário da Aventura (seção 8.1) e mapa com camadas (seção 11). Os dois são grátis: não gastam período.

import { html, cru } from '../dom.js';
import { hud, balao, nomeCapital } from '../comum.js';
import { desenharMapa, legendaMapa, CAMADAS } from '../mapa.js';
import { resumoDiario } from '../../engine/diario.js';
import { recapAtlantica } from '../../engine/falas.js';

const VAZIO = '— espaço vazio —';

function destaqueDaRota(j) {
  const rota = j.caso.rota.slice(0, j.parada + 1);
  const erradas = Object.values(j.erros).flat();
  return { rota, erradas, atual: j.capitalAtual };
}

function pagina(api, p) {
  const { dialogos } = api.dados;
  const pistas = p.destino.filter(Boolean).map((d) => d.pista);
  return html`<article class="pagina ${p.completa ? 'completa' : ''}">
    <h2>${nomeCapital(api, p.capital)} ${p.completa ? html`<span class="selo">Página completa</span>` : ''}</h2>
    <h3>O que Maria fez</h3>
    <ul class="espacos">${p.rastros.map((r) => html`<li class="${r ? '' : 'vazio'}">${r ? `Maria ${r}.` : VAZIO}</li>`)}</ul>
    ${p.ultima ? '' : html`<h3>Para onde ela foi</h3>
      <ul class="espacos">${p.destino.map((d) => html`<li class="${d ? '' : 'vazio'}">${d ? html`<strong>${dialogos.personagens[d.informante].nome}:</strong> ${d.pista.texto}` : VAZIO}</li>`)}</ul>
      <p class="postal-status">${p.postal ? '✓ Postal da Mãe coletado' : '○ Postal da Mãe ainda não coletado'}</p>`}
    ${p.ultima ? '' : balao(api, 'atlantica', recapAtlantica(pistas, dialogos), { classe: 'pequena' })}
  </article>`;
}

export function diario(api) {
  const j = api.jogo;
  const { capitais, porId } = api.dados;
  const r = resumoDiario(j);
  const voltar = () => api.ir(api.params.voltar ?? 'capital', api.params.voltarParams ?? {});
  return {
    html: html`${hud(api)}<main class="tela diario">
      <h1>Diário da Aventura</h1>
      <p>${r.completas} de ${r.total} páginas completas · ${r.postais} postal(is) · Tia Aurélia ouvida em ${r.aureliaCapitais} capital(is)</p>
      <div class="moldura mapa-capa">${cru(desenharMapa({ capitais, porId, destaque: destaqueDaRota(j), rotulo: 'Mapa da rota percorrida; capitais erradas marcadas com X', mostrarTodas: false }))}</div>
      <p class="nota">A linha tracejada é o caminho do Vento até agora. Um X marca capital errada.</p>
      ${r.paginas.slice().reverse().map((p) => pagina(api, p))}
      <div class="acoes"><button class="btn primario" data-acao="voltar">Fechar o Diário</button></div>
    </main>`,
    acoes: { voltar },
  };
}

export function mapa(api) {
  const { capitais, porId } = api.dados;
  const camada = api.params.camada ?? 'regioes';
  const j = api.jogo;
  const voltarPara = api.params.voltar ?? 'abertura';
  const legenda = camada === 'rios' ? [] : legendaMapa(capitais, camada);
  return {
    html: html`${j ? hud(api) : ''}<main class="tela mapa-tela">
      <h1>Mapa do Brasil</h1>
      <div class="abas" role="group" aria-label="Camadas do mapa">${Object.entries(CAMADAS).map(([id, c]) => html`<button class="btn pequeno ${id === camada ? 'ativo' : ''}" aria-pressed="${id === camada}" data-acao="camada" data-camada="${id}">${c.nome}</button>`)}</div>
      <div class="moldura">${cru(desenharMapa({ capitais, porId, camada, destaque: j ? destaqueDaRota(j) : {}, rotulo: `Mapa do Brasil por ${CAMADAS[camada].nome.toLowerCase()}` }))}</div>
      ${camada === 'rios'
        ? html`<ul class="legenda">${capitais.map((c) => html`<li><strong>${c.uf}</strong> ${c.nome}: ${c.rio}</li>`)}</ul>`
        : html`<ul class="legenda">${legenda.map((g) => html`<li><span class="amostra" style="--amostra:${g.cor}"></span><strong>${g.chave}:</strong> ${g.capitais.map((c) => c.uf).join(', ')}</li>`)}</ul>`}
      <p class="nota">Consultar o mapa não gasta período. Contorno simplificado, só para orientação.</p>
      <div class="acoes"><button class="btn primario" data-acao="voltar">Voltar</button></div>
    </main>`,
    acoes: {
      camada: ({ camada: c }) => api.ir('mapa', { ...api.params, camada: c }),
      voltar: () => api.ir(voltarPara, api.params.voltarParams ?? {}),
    },
  };
}
