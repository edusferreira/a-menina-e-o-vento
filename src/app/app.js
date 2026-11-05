// Casca do aplicativo: guarda perfil e partida, troca de tela e repassa cliques para as ações da tela atual.
// Cada tela é uma função (api) => { html, acoes?, aoMudar?, montar? }; o estado do jogo vive no motor (src/engine).

import { TELAS } from '../ui/telas/index.js';
import {
  carregarPerfil, salvarPerfil, carregarPartida, salvarPartida, apagarPartida, apagarTudo, sincronizarAlbum, registrarFim,
} from './perfil.js';
import { criarSom } from './som.js';

const TELA_DA_FASE = { capital: 'capital', errada: 'errada', encontro: 'encontro', teste: 'teste', conversa: 'conversa', fim: 'final' };
const VERSAO_PARTIDA = 1;
const TELAS_DE_JOGO = new Set(['briefing', 'capital', 'local', 'diario', 'aeroporto', 'errada', 'encontro', 'teste', 'conversa', 'final']);

export function criarApp({ raiz, dados, storage }) {
  const partidaSalva = carregarPartida(storage);
  const memoria = {
    perfil: carregarPerfil(storage, dados.avatar.padrao),
    jogo: partidaSalva?.versao === VERSAO_PARTIDA ? partidaSalva : null,
    tela: 'abertura',
    params: {},
  };
  const som = criarSom(() => memoria.perfil.config.som);
  const avisos = document.getElementById('aviso');
  let atual = null;

  function aplicarConfig() {
    document.documentElement.classList.toggle('texto-grande', Boolean(memoria.perfil.config.textoGrande));
  }

  function registrarSeAcabou(jogo) {
    if (jogo?.fase !== 'fim' || jogo.fim.registrado) return jogo;
    const { perfil, subiu } = registrarFim(memoria.perfil, jogo, dados.regras);
    memoria.perfil = perfil;
    return { ...jogo, fim: { ...jogo.fim, registrado: true, subiu } };
  }

  const api = {
    dados,
    som,
    get perfil() { return memoria.perfil; },
    get jogo() { return memoria.jogo; },
    get params() { return memoria.params; },
    get tela() { return memoria.tela; },
    ir(tela, params = {}) {
      const semPartida = TELAS_DE_JOGO.has(tela) && !memoria.jogo;
      memoria.tela = TELAS[tela] && !semPartida ? tela : 'abertura';
      memoria.params = params;
      render();
    },
    irParaFase(params = {}) { api.ir(TELA_DA_FASE[memoria.jogo?.fase] ?? 'abertura', params); },
    definirJogo(novo) {
      if (!novo) {
        memoria.jogo = null;
        apagarPartida(storage);
        return;
      }
      memoria.perfil = sincronizarAlbum(memoria.perfil, novo);
      memoria.jogo = registrarSeAcabou(novo);
      salvarPartida(storage, memoria.jogo);
      salvarPerfil(storage, memoria.perfil);
    },
    definirPerfil(novo) {
      memoria.perfil = novo;
      salvarPerfil(storage, novo);
      aplicarConfig();
    },
    apagarTudo() {
      apagarTudo(storage);
      memoria.perfil = carregarPerfil(null, dados.avatar.padrao);
      memoria.jogo = null;
      aplicarConfig();
    },
    avisar(mensagem) {
      if (!avisos) return;
      avisos.textContent = '';
      setTimeout(() => { avisos.textContent = mensagem; }, 30);
    },
    abrirExterno(url) {
      if (!url) return api.avisar('Link em breve.');
      // Público infantil: confirmação antes de sair do jogo (seção 13, links externos).
      if (window.confirm(dados.finais.aviso)) window.open(url, '_blank', 'noopener');
      return undefined;
    },
  };

  /** Ações disponíveis em qualquer tela de jogo (ex.: o botão Diário do HUD). */
  const acoesGerais = {
    diario: () => {
      if (memoria.tela !== 'diario') api.ir('diario', { voltar: memoria.tela, voltarParams: memoria.params });
    },
  };

  function focar() {
    const alvo = raiz.querySelector('[data-foco]') ?? raiz.querySelector('h1, h2');
    if (!alvo) return;
    const explicito = alvo.hasAttribute('data-foco');
    if (!explicito) alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
    if (explicito) alvo.scrollIntoView({ block: 'center' });
  }

  function render() {
    atual = (TELAS[memoria.tela] ?? TELAS.abertura)(api);
    raiz.innerHTML = String(atual.html);
    window.scrollTo(0, 0);
    atual.montar?.(raiz);
    focar();
  }

  raiz.addEventListener('click', (ev) => {
    const alvo = ev.target.closest('[data-acao]');
    if (!alvo || !raiz.contains(alvo) || alvo.disabled) return;
    const acao = atual?.acoes?.[alvo.dataset.acao] ?? acoesGerais[alvo.dataset.acao];
    if (!acao) return;
    ev.preventDefault();
    acao(alvo.dataset, alvo);
  });
  raiz.addEventListener('input', (ev) => atual?.aoMudar?.(ev.target));
  raiz.addEventListener('change', (ev) => atual?.aoMudar?.(ev.target));
  raiz.addEventListener('submit', (ev) => ev.preventDefault());
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && atual?.acoes?.voltar) atual.acoes.voltar({});
  });

  aplicarConfig();
  render();
  return api;
}
