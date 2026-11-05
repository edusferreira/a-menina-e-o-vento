// Encontro final (seção 8.2): achar Maria na cidade, passar no teste do Vento e escolher o final na conversa.

import { html, cru } from '../dom.js';
import { hud, balao, retrato, avatarJogador, nomeCapital, nomeRecruta, folhaCarta, tintaDaMaria } from '../comum.js';
import { cenaCapital } from '../cenas.js';
import { desenharVento } from '../vento.js';
import { blocoChegada, sinalDoVento } from './capital.js';
import { momento } from '../../engine/tempo.js';
import { escolherLocalEncontro, iniciarTeste, responderTeste, escolherFinal } from '../../engine/jogo.js';
import { finaisDisponiveis } from '../../engine/pontos.js';
import { variante, preencher } from '../../engine/falas.js';

function aposAcao(api, r, telaSeguinte, params = {}) {
  if (r.erro) return;
  api.definirJogo(r.estado);
  if (r.estado.fase === 'fim') api.ir('final');
  else api.ir(telaSeguinte, params);
}

export function encontro(api) {
  const j = api.jogo;
  const { porId, dialogos, regras } = api.dados;
  const parada = j.caso.paradas[j.parada];
  const cap = porId[parada.capital];
  const certo = parada.locais[j.caso.final.localCerto];
  const { periodo } = momento(j.gastos, j.porDia, regras);
  const e = dialogos.encontro;
  const soprado = j.encontro.achou;
  return {
    html: html`${hud(api)}<main class="tela encontro">
      <h1>${soprado ? `De volta a ${cap.nome}` : e.titulo}</h1>
      <div class="moldura">${cru(cenaCapital(cap, periodo))}</div>
      ${blocoChegada(api, api.params.chegada)}
      <p class="vinheta">${cap.vinheta}</p>
      ${sinalDoVento(api, parada)}
      ${balao(api, 'mae', e.carta)}
      ${folhaCarta(api, certo.carta, { chave: `${j.semente}:final`, tinta: tintaDaMaria(api), reserva: certo.rastro })}
      ${api.params.crispina ? balao(api, 'crispina', variante(dialogos.crispinaComemora, `${j.gastos}`)) : ''}
      ${soprado
        ? html`<section class="soprado">${cru(desenharVento({ bravo: true }))}<p class="balao solto">${e.soprado}</p><p>${e.soproCusto}</p>
            <button class="btn primario" data-acao="novoTeste">Enfrentar o Vento de novo</button></section>`
        : html`<h2>Escolha onde procurar em ${nomeCapital(api, cap.id)}</h2>
            <ul class="locais">${parada.locais.map((l, i) => html`<li class="local ${j.encontro.errados.includes(i) ? 'visto' : ''}">
              <button class="local-botao" data-acao="procurar" data-idx="${i}" ${j.encontro.errados.includes(i) ? 'disabled' : ''}>
                <span class="local-nome">${l.nome}</span>
                <span class="local-info">${j.encontro.errados.includes(i) ? 'Ela não está aqui' : 'Procurar · errar custa 1 período'}</span>
              </button></li>`)}</ul>
            <p class="dica">${dialogos.dicas.encontro}</p>`}
      <div class="acoes"><button class="btn" data-acao="diario">Diário</button><button class="btn" data-acao="mapa">Mapa</button></div>
    </main>`,
    acoes: {
      procurar: ({ idx }) => {
        const r = escolherLocalEncontro(j, Number(idx), api.dados);
        if (r.evento?.tipo === 'achou') { api.som.vento(); return aposAcao(api, r, 'teste'); }
        api.som.erro();
        return aposAcao(api, r, 'encontro', { crispina: true });
      },
      novoTeste: () => aposAcao(api, iniciarTeste(j, api.dados), 'teste'),
      diario: () => api.ir('diario', { voltar: 'encontro' }),
      mapa: () => api.ir('mapa', { voltar: 'encontro' }),
    },
  };
}

export function teste(api) {
  const j = api.jogo;
  const { dialogos, porId } = api.dados;
  const e = dialogos.encontro;
  const respostas = [...(api.params.respostas ?? j.encontro.teste.map(() => null))];
  return {
    html: html`${hud(api)}<main class="tela teste">
      <h1>O teste do Vento</h1>
      <div class="vento-palco">${cru(desenharVento({ bravo: true, classe: 'grande' }))}</div>
      <p class="balao solto">${e.vento}</p>
      <form class="formulario">${j.encontro.teste.map((q, qi) => html`<fieldset class="pergunta">
        <legend>${qi + 1}. ${preencher(e.pergunta, { capital: porId[q.capital].nome })}</legend>
        ${q.opcoes.map((o, oi) => html`<label class="opcao-texto"><input type="radio" name="q${qi}" value="${oi}" ${respostas[qi] === oi ? 'checked' : ''}> <span>${o.charAt(0).toUpperCase() + o.slice(1)}.</span></label>`)}
      </fieldset>`)}</form>
      <p class="erro" id="erro-teste" role="alert"></p>
      <div class="acoes"><button class="btn primario" data-acao="responder">Responder ao Vento</button>
        <button class="btn" data-acao="diario">Consultar o Diário</button></div>
    </main>`,
    aoMudar: (el) => {
      const m = /^q(\d+)$/.exec(el.name ?? '');
      if (m) respostas[Number(m[1])] = Number(el.value);
    },
    acoes: {
      responder: (_, botao) => {
        if (respostas.some((r) => r === null)) {
          botao.closest('main').querySelector('#erro-teste').textContent = 'Responda às três perguntas antes. O Vento não tem paciência.';
          return;
        }
        const r = responderTeste(j, respostas, api.dados);
        if (r.evento?.nivel === 'soprado') { api.som.vento(2); return aposAcao(api, r, 'encontro'); }
        api.som.acerto();
        return aposAcao(api, r, 'conversa', { acertos: r.evento.acertos });
      },
      diario: () => api.ir('diario', { voltar: 'teste', voltarParams: { respostas } }),
    },
  };
}

export function conversa(api) {
  const j = api.jogo;
  const { dialogos, finais } = api.dados;
  const e = dialogos.encontro;
  const disponiveis = finaisDisponiveis(j);
  const falaVento = j.encontro.nivelTeste === 'digno' ? e.digno : e.zomba;
  return {
    html: html`${hud(api)}<main class="tela conversa">
      <h1>Maria!</h1>
      <p class="resultado-teste">Você acertou ${j.encontro.acertos} de ${j.encontro.teste.length} perguntas.</p>
      <div class="vento-palco">${cru(desenharVento({ classe: 'grande' }))}</div>
      <p class="balao solto">${falaVento}</p>
      <div class="encontro-par">${retrato(api, 'maria', { classe: 'grande ventarolando' })}${avatarJogador(api, { classe: 'grande' })}</div>
      <p class="narracao">${e.maria}</p>
      <h2>O que você diz, ${nomeRecruta(api)}?</h2>
      <ul class="falas-final">${['final1', 'final2', 'final3'].map((id) => {
        const d = disponiveis[id];
        return html`<li><button class="fala-final" data-acao="final" data-final="${id}" ${d.ok ? '' : 'disabled'}>
          <span>“${finais.finais[id].fala}”</span>
          ${d.ok ? '' : html`<small>Para esta fala aparecer, faltou: ${d.faltam.map((f) => dialogos.faltam[f]).join('; ')}.</small>`}
        </button></li>`;
      })}</ul>
    </main>`,
    acoes: {
      final: ({ final }) => {
        const r = escolherFinal(j, final, api.dados);
        if (r.erro) return;
        api.som.final();
        aposAcao(api, r, 'final');
      },
    },
  };
}
