// Tela final (seções 9, 10 e 14): cena do final, pontuação, patente, convite ao espetáculo.
// Na derrota, mostra a rota certa e o que ficou para trás, para o erro também ensinar.

import { html, cru } from '../dom.js';
import { cenaFinal } from '../cenas.js';
import { desenharMapa } from '../mapa.js';
import { nomeCapital } from '../comum.js';
import { pontuacaoPartida, patente } from '../../engine/pontos.js';
import { resumoDiario } from '../../engine/diario.js';
import { novoJogo } from '../../engine/jogo.js';
import { perksDoPerfil } from '../../app/perfil.js';

function oQueFaltou(api, j) {
  const r = resumoDiario(j);
  const chegou = new Set(r.paginas.map((p) => p.capital));
  return j.caso.rota.map((id, i) => {
    const p = r.paginas[i];
    if (!chegou.has(id)) return { id, texto: 'Você não chegou até aqui.' };
    if (p.completa) return { id, texto: 'Página completa.' };
    const vazios = p.rastros.filter((x) => !x).length;
    return { id, texto: `${vazios} local(is) sem visita${p.postal ? '' : '; postal da Mãe não coletado'}.` };
  });
}

function textoCompartilhar(api, j) {
  const dias = Math.floor(j.gastos / j.porDia) + 1;
  const nivel = api.dados.regras.niveis[j.nivel].nome;
  return j.fim.tipo === 'derrota'
    ? `Quase encontrei a Maria no caso ${j.semente} (nível ${nivel}). Você consegue? A Menina e o Vento: Onde está Maria?`
    : `Encontrei a Maria em ${dias} dia(s) no caso ${j.semente} (nível ${nivel})! A Menina e o Vento: Onde está Maria?`;
}

export function final(api) {
  const j = api.jogo;
  const { finais, avatar, regras, capitais, porId } = api.dados;
  const derrota = j.fim.tipo === 'derrota';
  const f = finais.finais[j.fim.tipo];
  const pontos = pontuacaoPartida(j, regras);
  const pt = patente(api.perfil.pontos, api.perfil.finaisVistos, regras);
  const compartilhar = textoCompartilhar(api, j);
  return {
    html: html`<main class="tela final ${derrota ? 'derrota' : 'vitoria'}">
      <p class="sobretitulo">${derrota ? 'Fim da semana' : 'Caso encerrado'}</p>
      <h1>${f.titulo}</h1>
      <div class="moldura">${cru(cenaFinal(j.fim.tipo, avatar, avatar.personagens, api.perfil.avatar))}</div>
      ${derrota ? '' : html`<p class="fala-escolhida">Você disse: “${f.fala}”</p>`}
      ${f.cena.map((p) => html`<p class="narracao">${p}</p>`)}
      <p class="verso">${finais.verso}</p>
      ${derrota ? html`<section><h2>A rota de Maria</h2>
        <div class="moldura">${cru(desenharMapa({ capitais, porId, destaque: { rota: j.caso.rota, erradas: Object.values(j.erros).flat() }, rotulo: 'Mapa com a rota correta de Maria', mostrarTodas: false }))}</div>
        <ol class="faltou">${oQueFaltou(api, j).map((x) => html`<li><strong>${nomeCapital(api, x.id)}:</strong> ${x.texto}</li>`)}</ol></section>` : ''}
      <section class="placar"><h2>Pontuação: ${pontos.total}</h2>
        <ul>${pontos.itens.map((it) => html`<li><span>${it.rotulo}</span><strong>+${it.pontos}</strong></li>`)}</ul>
        <p>Total acumulado: ${api.perfil.pontos} pontos · patente ${pt.atual.nome}${pt.proxima ? ` (faltam ${pt.faltam} para ${pt.proxima.nome})` : ''}.</p>
        ${j.fim.subiu ? html`<p class="subiu">Promoção! Agora você é ${j.fim.subiu.nome}: ${j.fim.subiu.libera}.</p>` : ''}
        ${!derrota && f.desbloqueia ? html`<p class="desbloqueio">Desbloqueado: ${f.desbloqueia}.</p>` : ''}
      </section>
      <section class="convite"><h2>${derrota ? finais.convidaDerrota : finais.convite}</h2>
        <p>${finais.espetaculo.texto} ${finais.espetaculo.temporada}.</p>
        <div class="acoes"><button class="btn primario" data-acao="ingressos">Ingressos${finais.links.ingressos ? '' : ' (em breve)'}</button>
          <button class="btn" data-acao="lojinha">Lojinha${finais.links.lojinha ? '' : ' (em breve)'}</button></div>
      </section>
      <section class="compartilhar"><h2>Compartilhar</h2><p class="texto-compartilhar">${compartilhar}</p>
        <button class="btn" data-acao="compartilhar">Copiar ou compartilhar</button></section>
      <div class="acoes">
        ${derrota ? html`<button class="btn primario" data-acao="mesmo">Recomeçar o mesmo caso</button>` : ''}
        <button class="btn ${derrota ? '' : 'primario'}" data-acao="novo">Caso novo</button>
        <button class="btn secundario" data-acao="menu">Menu</button>
      </div>
    </main>`,
    acoes: {
      ingressos: () => api.abrirExterno(finais.links.ingressos),
      lojinha: () => api.abrirExterno(finais.links.lojinha),
      compartilhar: async () => {
        try {
          if (navigator.share) await navigator.share({ text: compartilhar });
          else { await navigator.clipboard.writeText(compartilhar); api.avisar('Texto copiado.'); }
        } catch { api.avisar('Não deu para compartilhar agora.'); }
      },
      mesmo: () => {
        api.definirJogo(novoJogo({ semente: j.semente, nivel: j.nivel, dados: api.dados, perks: perksDoPerfil(api.perfil, regras) }));
        api.ir('briefing');
      },
      novo: () => { api.definirJogo(null); api.ir('delegacia', { nivel: j.nivel }); },
      menu: () => { api.definirJogo(null); api.ir('abertura'); },
    },
  };
}
