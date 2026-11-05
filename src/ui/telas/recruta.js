// Criação do recruta (seção 4.3): avatar por camadas com prévia ao vivo. O nome fica só no aparelho.

import { html, cru } from '../dom.js';
import { avatarJogador } from '../comum.js';
import { desbloqueios } from '../../app/perfil.js';

const LIMITE_NOME = 12;

function grupo(titulo, campo, opcoes, atual) {
  return html`<fieldset class="opcoes">
    <legend>${titulo}</legend>
    ${opcoes.map((o) => html`<label class="opcao ${o.cor ? 'cor' : ''}" ${o.cor ? cru(`style="--amostra:${o.cor}"`) : ''}>
      <input type="radio" name="${campo}" value="${o.valor}" ${String(o.valor) === String(atual) ? 'checked' : ''} ${o.bloqueado ? 'disabled' : ''}>
      <span>${o.nome}${o.bloqueado ? ' (bloqueado)' : ''}</span>
    </label>`)}
  </fieldset>`;
}

export function recruta(api) {
  const op = api.dados.avatar;
  const rascunho = { ...api.perfil.avatar };
  const temCatavento = desbloqueios(api.perfil).catavento;
  let raiz = null;
  const lista = (itens) => itens.map((i) => ({ valor: i.id, nome: i.nome, bloqueado: i.exige === 'final2' && !temCatavento }));
  const cores = (paleta, rotulos) => paleta.map((cor, i) => ({ valor: i, nome: rotulos[i], cor }));

  return {
    html: html`<main class="tela recruta">
      <h1>Crie seu recruta</h1>
      <div class="recruta-grade">
        <div class="previa" id="previa" aria-live="polite">${avatarJogador(api, { classe: 'grande', rascunho })}</div>
        <form class="formulario">
          <label class="campo-nome">Nome (até ${LIMITE_NOME} letras)
            <input type="text" name="nome" maxlength="${LIMITE_NOME}" value="${rascunho.nome}" autocomplete="off" placeholder="Ex.: Bia">
          </label>
          ${grupo('Corpo', 'corpo', lista(op.corpo), rascunho.corpo)}
          ${grupo('Tom de pele', 'pele', cores(op.pele, ['Tom 1', 'Tom 2', 'Tom 3', 'Tom 4', 'Tom 5', 'Tom 6']), rascunho.pele)}
          ${grupo('Rosto', 'rosto', lista(op.rosto), rascunho.rosto)}
          ${grupo('Olhos', 'olhos', lista(op.olhos), rascunho.olhos)}
          ${grupo('Boca', 'boca', lista(op.boca), rascunho.boca)}
          ${grupo('Cabelo', 'cabelo', lista(op.cabelo), rascunho.cabelo)}
          ${grupo('Cor do cabelo', 'corCabelo', cores(op.corCabelo, ['Preto', 'Castanho escuro', 'Castanho claro', 'Loiro', 'Ruivo', 'Grisalho']), rascunho.corCabelo)}
          ${grupo('Acessório', 'acessorio', lista(op.acessorio), rascunho.acessorio)}
          <p class="nota">Uniforme: colete de recruta. Novas versões chegam com as patentes.</p>
        </form>
      </div>
      <div class="acoes">
        <button class="btn primario" data-acao="pronto">Pronto</button>
        ${api.perfil.temAvatar ? html`<button class="btn secundario" data-acao="voltar">Cancelar</button>` : ''}
      </div>
    </main>`,
    montar: (r) => { raiz = r; },
    aoMudar: (el) => {
      if (!el.name) return;
      const numerico = el.name === 'pele' || el.name === 'corCabelo';
      rascunho[el.name] = numerico ? Number(el.value) : el.value.slice(0, LIMITE_NOME);
      raiz.querySelector('#previa').innerHTML = String(avatarJogador(api, { classe: 'grande', rascunho }));
    },
    acoes: {
      pronto: () => {
        const nome = rascunho.nome.trim() || 'Recruta';
        api.definirPerfil({ ...api.perfil, avatar: { ...rascunho, nome }, temAvatar: true });
        api.ir('delegacia');
      },
      voltar: () => (api.perfil.temAvatar ? api.ir('delegacia') : undefined),
    },
  };
}
