// Prólogo em 5 cenas (seção 4.1). Pulável depois da primeira vez.

import { html, cru } from '../dom.js';
import { cenaPrologo } from '../cenas.js';

export function prologo(api) {
  const { dialogos, avatar } = api.dados;
  const n = api.params.n ?? 0;
  const cena = dialogos.prologo[n];
  const ultima = n === dialogos.prologo.length - 1;
  const podePular = api.perfil.prologoVisto;

  function terminar() {
    if (!api.perfil.prologoVisto) api.definirPerfil({ ...api.perfil, prologoVisto: true });
    if (api.params.revisao) return api.ir('abertura');
    return api.ir(api.perfil.temAvatar ? 'delegacia' : 'recruta');
  }

  return {
    html: html`<main class="tela prologo">
      <p class="cena-num">Cena ${n + 1} de ${dialogos.prologo.length}</p>
      <h1>${cena.titulo}</h1>
      <div class="moldura">${cru(cenaPrologo(n, avatar, avatar.personagens))}</div>
      <p class="narracao">${cena.texto}</p>
      <div class="acoes">
        ${n > 0 ? html`<button class="btn secundario" data-acao="anterior">Voltar</button>` : ''}
        <button class="btn primario" data-acao="proxima">${ultima ? (api.params.revisao ? 'Fim' : 'Começar a investigação') : 'Continuar'}</button>
        ${podePular && !ultima ? html`<button class="btn secundario" data-acao="pular">Pular</button>` : ''}
      </div>
    </main>`,
    acoes: {
      proxima: () => (ultima ? terminar() : api.ir('prologo', { ...api.params, n: n + 1 })),
      anterior: () => api.ir('prologo', { ...api.params, n: n - 1 }),
      pular: terminar,
      voltar: () => (podePular ? terminar() : undefined),
    },
  };
}
