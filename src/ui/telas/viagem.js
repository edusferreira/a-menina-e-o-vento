// Aeroporto (escolha do destino) e chegada a uma capital errada (seções 5.1 e 11: o erro também ensina).

import { html, cru } from '../dom.js';
import { hud, balao, nomeCapital } from '../comum.js';
import { desenharMapa } from '../mapa.js';
import { cenaCapital } from '../cenas.js';
import { distanciaKm } from '../../engine/geo.js';
import { custoViagem, momento } from '../../engine/tempo.js';
import { viajar, voltar as voltarDaErrada } from '../../engine/jogo.js';
import { variante, preencher } from '../../engine/falas.js';

const formatarKm = (km) => `${Math.round(km).toLocaleString('pt-BR')} km`;

export function aeroporto(api) {
  const j = api.jogo;
  const { porId, capitais, regras, dialogos } = api.dados;
  const parada = j.caso.paradas[j.parada];
  const tentadas = j.erros[j.parada] ?? [];
  const escolha = api.params.escolha;
  const opcoes = parada.opcoes.map((id) => {
    const km = distanciaKm(porId[j.capitalAtual], porId[id]);
    return { id, km, custo: custoViagem(km, regras), tentada: tentadas.includes(id) };
  });
  const sugestao = parada.crispina && !tentadas.includes(parada.crispina) ? parada.crispina : null;
  const destaque = { atual: j.capitalAtual, opcoes: parada.opcoes, rota: j.caso.rota.slice(0, j.parada + 1), erradas: tentadas };
  const escolhida = opcoes.find((o) => o.id === escolha);
  return {
    html: html`${hud(api)}<main class="tela aeroporto">
      <h1>Aeroporto de ${porId[j.capitalAtual].nome}</h1>
      <div class="moldura">${cru(desenharMapa({ capitais, porId, destaque, rotulo: 'Mapa com os destinos possíveis numerados' }))}</div>
      ${sugestao ? balao(api, 'crispina', preencher(variante(dialogos.crispinaAeroporto, `${j.semente}:${j.parada}`), { capital: porId[sugestao].nome })) : ''}
      <h2>Para onde o Vento levou Maria?</h2>
      <ol class="destinos">${opcoes.map((o, i) => html`<li>
        <button class="destino ${o.id === escolha ? 'escolhido' : ''}" data-acao="escolher" data-id="${o.id}" ${o.tentada ? 'disabled' : ''}>
          <span class="destino-num">${i + 1}</span>
          <span class="destino-nome">${nomeCapital(api, o.id)}</span>
          <span class="destino-info">${o.tentada ? 'Ela não passou por lá' : `${formatarKm(o.km)} · ${o.custo} período${o.custo > 1 ? 's' : ''}`}</span>
        </button></li>`)}</ol>
      ${escolhida ? html`<section class="confirmar" aria-live="polite">
        <p>Viajar para <strong>${nomeCapital(api, escolhida.id)}</strong>? Custa ${escolhida.custo} período${escolhida.custo > 1 ? 's' : ''}.</p>
        <button class="btn primario" data-acao="confirmar" data-foco>Confirmar viagem</button>
        <button class="btn secundario" data-acao="cancelar">Escolher outro</button></section>` : ''}
      <p class="dica">${dialogos.dicas.aeroporto}</p>
      <div class="acoes"><button class="btn" data-acao="diario">Diário</button><button class="btn" data-acao="mapa">Mapa com camadas</button>
        <button class="btn secundario" data-acao="voltar">Voltar à cidade</button></div>
    </main>`,
    acoes: {
      escolher: ({ id }) => api.ir('aeroporto', { escolha: id }),
      cancelar: () => api.ir('aeroporto'),
      confirmar: () => {
        const r = viajar(j, escolha, api.dados);
        if (r.erro) return;
        api.definirJogo(r.estado);
        api.som.vento();
        if (r.estado.fase === 'fim') return api.ir('final');
        if (!r.evento.certa) { api.som.erro(); return api.ir('errada'); }
        api.som.acerto();
        return api.irParaFase({ chegada: 'certa' });
      },
      diario: () => api.ir('diario', { voltar: 'aeroporto', voltarParams: api.params }),
      mapa: () => api.ir('mapa', { voltar: 'aeroporto', voltarParams: api.params }),
      voltar: () => api.ir('capital'),
    },
  };
}

export function errada(api) {
  const j = api.jogo;
  const { porId, dialogos, regras } = api.dados;
  const cap = porId[j.capitalAtual];
  const anterior = porId[j.caso.rota[j.parada]];
  const { periodo } = momento(j.gastos, j.porDia, regras);
  const chave = `${j.semente}:${cap.id}`;
  return {
    html: html`${hud(api)}<main class="tela errada">
      <h1>${preencher(dialogos.chegada.errou, { capital: nomeCapital(api, cap.id) })}</h1>
      <div class="moldura">${cru(cenaCapital(cap, periodo, { comVento: false }))}</div>
      <p class="vinheta">${cap.vinheta}</p>
      ${balao(api, 'velha', variante(dialogos.velhaNaoViu, chave))}
      <section class="cartao-novo"><h2>Cartão guardado no Álbum do Brasil</h2>
        <p><strong>${cap.nome}</strong>, ${cap.estado} · ${cap.regiao} · ${cap.bioma}</p>
        <p class="curiosidade">${variante(cap.curiosidades, chave)}</p></section>
      <div class="acoes"><button class="btn primario" data-acao="retornar">Voltar para ${anterior.nome} (1 período)</button>
        <button class="btn" data-acao="diario">Diário</button></div>
    </main>`,
    acoes: {
      // "retornar" e não "voltar": Esc nunca deve gastar período sem o jogador pedir.
      retornar: () => {
        const r = voltarDaErrada(j, api.dados);
        if (r.erro) return;
        api.definirJogo(r.estado);
        api.som.vento();
        if (r.estado.fase === 'fim') return api.ir('final');
        return api.ir('aeroporto');
      },
      diario: () => api.ir('diario', { voltar: 'errada' }),
    },
  };
}
