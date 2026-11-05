// Telas fora da partida: abertura (menu), patente e créditos.

import { html, cru } from '../dom.js';
import { desenharVento } from '../vento.js';
import { retrato, avatarJogador, uniformeAtual } from '../comum.js';
import { patente } from '../../engine/pontos.js';
import { desbloqueios } from '../../app/perfil.js';

function proximaTelaDeJogo(api) {
  if (!api.perfil.prologoVisto) return 'prologo';
  return api.perfil.temAvatar ? 'delegacia' : 'recruta';
}

export function abertura(api) {
  const { perfil, dados } = api;
  const pt = patente(perfil.pontos, perfil.finaisVistos, dados.regras);
  const temPartida = api.jogo && api.jogo.fase !== 'fim';
  const des = desbloqueios(perfil);
  const config = (chave, valor) => api.definirPerfil({ ...perfil, config: { ...perfil.config, [chave]: valor } });
  return {
    html: html`<main class="tela abertura">
      <header class="logo">
        <p class="sobretitulo">A Menina e o Vento</p>
        <h1>Onde está Maria?</h1>
        ${pt.atual.id === 'ventarolador' ? html`<p class="titulo-honra">Ventarolador ${perfil.avatar.nome}</p>` : ''}
      </header>
      <div class="abertura-arte" aria-hidden="true">${retrato(api, 'maria', { classe: 'grande' })}${cru(desenharVento({ classe: 'grande' }))}</div>
      <p class="verso">${dados.finais.verso}</p>
      <nav class="menu" aria-label="Menu principal">
        <button class="btn primario" data-acao="jogar">${temPartida ? 'Novo caso' : 'Jogar'}</button>
        ${temPartida ? html`<button class="btn primario" data-acao="continuar">Continuar o caso ${api.jogo.semente}</button>` : ''}
        <button class="btn" data-acao="album">Álbum do Brasil</button>
        <button class="btn" data-acao="patente">Patente: ${pt.atual.nome}</button>
        ${des.passeio ? html`<button class="btn" data-acao="passeio">Passeio de domingo</button>` : ''}
        <button class="btn" data-acao="prologo">Ver o prólogo</button>
        <button class="btn" data-acao="creditos">Créditos</button>
        <button class="btn secundario" data-acao="peca">Veja a peça</button>
      </nav>
      <section class="config" aria-label="Configurações">
        <label><input type="checkbox" data-config="som" ${perfil.config.som ? 'checked' : ''}> Som</label>
        <label><input type="checkbox" data-config="textoGrande" ${perfil.config.textoGrande ? 'checked' : ''}> Texto maior</label>
        <button class="btn pequeno perigo" data-acao="apagar">Apagar meus dados</button>
      </section>
    </main>`,
    acoes: {
      jogar: () => api.ir(proximaTelaDeJogo(api)),
      continuar: () => api.irParaFase(),
      album: () => api.ir('album'),
      patente: () => api.ir('patente'),
      passeio: () => api.ir('passeio'),
      prologo: () => api.ir('prologo', { n: 0, revisao: true }),
      creditos: () => api.ir('creditos'),
      peca: () => api.abrirExterno(dados.finais.links.peca),
      apagar: () => {
        if (!window.confirm('Apagar avatar, pontos, Álbum e a partida salva neste aparelho?')) return;
        api.apagarTudo();
        api.ir('abertura');
      },
    },
    aoMudar: (el) => {
      if (!el.dataset.config) return;
      config(el.dataset.config, el.checked);
    },
  };
}

export function telaPatente(api) {
  const { perfil, dados } = api;
  const pt = patente(perfil.pontos, perfil.finaisVistos, dados.regras);
  const progresso = pt.proxima ? Math.min(100, Math.round((perfil.pontos / pt.proxima.pontos) * 100)) : 100;
  const finais = ['final1', 'final2', 'final3'].map((f) => ({ id: f, titulo: dados.finais.finais[f].titulo, visto: perfil.finaisVistos.includes(f) }));
  return {
    html: html`<main class="tela">
      <h1>Patente: ${pt.atual.nome}</h1>
      <div class="patente-topo">${avatarJogador(api, { classe: 'grande' })}
        <div>
          <p><strong>${perfil.avatar.nome || 'Recruta'}</strong> · ${uniformeAtual(api).nome}</p>
          <p>${perfil.pontos} pontos · ${perfil.partidas} partida(s) · ${perfil.vitorias} vitória(s)</p>
          ${pt.proxima ? html`<p>Faltam ${pt.faltam} pontos para ${pt.proxima.nome}${pt.proxima.exigeTodosFinais ? ' (e ver os 3 finais felizes)' : ''}.</p>` : html`<p>Você chegou à patente máxima.</p>`}
          <div class="barra" role="progressbar" aria-valuenow="${progresso}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progresso}%"></span></div>
        </div>
      </div>
      <h2>Patentes</h2>
      <ol class="lista-patentes">${dados.regras.patentes.map((p) => html`<li class="${p.id === pt.atual.id ? 'atual' : ''}"><strong>${p.nome}</strong> · ${p.pontos} pontos${p.exigeTodosFinais ? ' e os 3 finais felizes' : ''}<br><small>${p.libera}</small></li>`)}</ol>
      <h2>Finais vistos</h2>
      <ul class="lista-finais">${finais.map((f) => html`<li>${f.visto ? '✓' : '○'} ${f.titulo}</li>`)}</ul>
      <button class="btn" data-acao="voltar">Voltar</button>
    </main>`,
    acoes: { voltar: () => api.ir('abertura') },
  };
}

export function creditos(api) {
  const { espetaculo, patrocinio } = api.dados.finais;
  const cotas = ['ventania', 'vento', 'brisa'].map((c) => ({ cota: c, nomes: patrocinio[c] }));
  return {
    html: html`<main class="tela creditos">
      <h1>Créditos</h1>
      <p>Jogo de investigação inspirado no musical infantil <strong>A Menina e o Vento</strong>. ${espetaculo.texto}</p>
      <p>Protótipo com texto próprio e personagens ilustrados de forma genérica, até a liberação dos direitos (seção 14 da especificação).</p>
      <h2>Patrocínio</h2>
      <ul>${cotas.map((c) => html`<li>Cota ${c.cota}: ${c.nomes.length ? c.nomes.join(', ') : 'a definir'}</li>`)}</ul>
      <h2>Privacidade</h2>
      <p>O jogo não coleta dados pessoais. O nome do recruta e o progresso ficam só neste aparelho.</p>
      <p class="nota-ia">Conteúdo produzido com apoio de IA e sujeito a revisão humana. Os fatos culturais e geográficos das pistas precisam ser validados por um professor antes do lançamento.</p>
      <button class="btn" data-acao="voltar">Voltar</button>
    </main>`,
    acoes: { voltar: () => api.ir('abertura') },
  };
}
