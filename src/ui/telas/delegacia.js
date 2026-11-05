// Delegacia (hub) e briefing do Comissário (seções 4.2 e 4.4): escolha de nível, código de caso e início.

import { html } from '../dom.js';
import { retrato, avatarJogador, balao, nomeRecruta } from '../comum.js';
import { normalizarSemente, gerarSemente } from '../../engine/rng.js';
import { totalPeriodos } from '../../engine/tempo.js';
import { novoJogo } from '../../engine/jogo.js';
import { preencher } from '../../engine/falas.js';
import { perksDoPerfil } from '../../app/perfil.js';

export function delegacia(api) {
  const { regras } = api.dados;
  const escolhido = api.params.nivel ?? 'medio';
  const emAndamento = api.jogo && api.jogo.fase !== 'fim';
  let codigo = api.params.codigo ?? '';

  const nivelCard = ([id, n]) => html`<label class="nivel">
    <input type="radio" name="nivel" value="${id}" ${id === escolhido ? 'checked' : ''}>
    <span class="nivel-nome">${n.nome} <em>(${n.apelido})</em></span>
    <span>${n.capitais} capitais · ${totalPeriodos(n.porDia, regras)} períodos · ${n.opcoes} destinos no aeroporto</span>
    ${id === 'dificil' ? html`<span>Pistas só dedutivas e plantão de madrugada</span>` : ''}
  </label>`;

  return {
    html: html`<main class="tela delegacia">
      <h1>Delegacia do Comissário Plácido</h1>
      <div class="equipe" aria-hidden="true">${retrato(api, 'placido')}${retrato(api, 'crispina')}${retrato(api, 'atlantica')}${avatarJogador(api)}</div>
      ${balao(api, 'placido', `Ah, ${nomeRecruta(api)}. As tias da Maria estão aí fora fazendo um escândalo. Escolha o nível do caso.`)}
      <form class="formulario">
        <fieldset class="niveis"><legend>Dificuldade</legend>${Object.entries(regras.niveis).map(nivelCard)}</fieldset>
        <label class="campo-codigo">Código do caso (opcional, para repetir ou jogar o caso de um amigo)
          <input type="text" name="codigo" maxlength="4" value="${codigo}" placeholder="Ex.: 4F2A" autocomplete="off">
        </label>
        <p class="erro" id="erro-codigo" role="alert"></p>
      </form>
      ${emAndamento ? html`<p class="aviso">Começar um caso novo substitui o caso ${api.jogo.semente} em andamento.</p>` : ''}
      <div class="acoes">
        <button class="btn primario" data-acao="comecar">Começar investigação</button>
        <button class="btn secundario" data-acao="recruta">Editar recruta</button>
        <button class="btn secundario" data-acao="voltar">Menu</button>
      </div>
    </main>`,
    aoMudar: (el) => {
      if (el.name === 'codigo') codigo = el.value;
    },
    acoes: {
      comecar: (_, botao) => {
        const form = botao.closest('main').querySelector('form');
        const nivel = form.querySelector('input[name="nivel"]:checked')?.value ?? 'medio';
        const digitado = codigo.trim();
        const semente = digitado ? normalizarSemente(digitado) : gerarSemente();
        if (!semente) {
          form.querySelector('#erro-codigo').textContent = 'Código inválido: use 4 caracteres (letras sem I e O, números de 2 a 9).';
          return;
        }
        const estado = novoJogo({ semente, nivel, dados: api.dados, perks: perksDoPerfil(api.perfil, regras) });
        api.definirJogo(estado);
        api.ir('briefing');
      },
      recruta: () => api.ir('recruta'),
      voltar: () => api.ir('abertura'),
    },
  };
}

export function briefing(api) {
  const { dialogos, porId } = api.dados;
  const j = api.jogo;
  const nome = nomeRecruta(api);
  const primeira = porId[j.caso.rota[0]];
  const chute = porId[primeira.distratores[0]];
  const b = dialogos.briefing;
  const falasPlacido = b.placido.map((f) => preencher(f, { nome }));
  if (j.perks.placidoChamaPeloNome) falasPlacido.push(preencher(b.placidoComNome, { nome }));
  return {
    html: html`<main class="tela briefing">
      <h1>Briefing: o caso da menina e o vento</h1>
      <p class="codigo-caso">Caso ${j.semente} · ${api.dados.regras.niveis[j.nivel].nome}</p>
      ${falasPlacido.map((f) => balao(api, 'placido', f))}
      ${balao(api, 'atlantica', b.atlantica)}
      ${balao(api, 'pedro', preencher(b.pedro, { pista: j.caso.pedro.texto }))}
      ${balao(api, 'crispina', preencher(b.crispina, { capital: chute.nome }))}
      <p class="narracao">${b.partida}</p>
      <div class="acoes"><button class="btn primario" data-acao="partir">Partir</button></div>
    </main>`,
    acoes: {
      partir: () => {
        api.som.vento();
        api.ir('capital', { chegada: 'inicio' });
      },
    },
  };
}
