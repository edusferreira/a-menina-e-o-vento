// Pontuação da partida, condições dos finais e patentes (seções 9 e 10).

import { resumoDiario } from './diario.js';

/**
 * Quais finais a conversa com Maria oferece. `faltam` lista o que o jogador ainda precisava ter feito,
 * para a tela explicar (o jogo ensina mostrando o que ficou para trás).
 */
export function finaisDisponiveis(estado, resumo = resumoDiario(estado)) {
  const nivel = estado.encontro?.nivelTeste;
  const passou = nivel === 'digno' || nivel === 'zomba';
  const faltam2 = [
    nivel !== 'digno' && 'testePerfeito',
    resumo.aureliaCapitais < 2 && 'aurelia',
    !resumo.diarioCompleto && 'diario',
  ].filter(Boolean);
  const faltam3 = [!passou && 'teste', !resumo.todosPostais && 'postais'].filter(Boolean);
  return {
    final1: { ok: passou, faltam: passou ? [] : ['teste'] },
    final2: { ok: faltam2.length === 0, faltam: faltam2 },
    final3: { ok: faltam3.length === 0, faltam: faltam3 },
  };
}

function pontosCapital(erros, p) {
  if (erros === 0) return p.primeira;
  return erros === 1 ? p.umErro : p.maisErros;
}

export function pontuacaoPartida(estado, regras) {
  const p = regras.pontos;
  const itens = [];
  for (let i = 1; i <= estado.parada; i += 1) {
    const erros = (estado.erros[i - 1] ?? []).length;
    itens.push({ chave: 'capital', rotulo: `Capital ${i + 1} encontrada${erros ? ` após ${erros} erro(s)` : ' de primeira'}`, pontos: pontosCapital(erros, p) });
  }
  const { completas } = resumoDiario(estado);
  if (completas) itens.push({ chave: 'pagina', rotulo: `${completas} página(s) do Diário completas`, pontos: completas * p.pagina });
  const tipo = estado.fim?.tipo;
  if (tipo && tipo !== 'derrota') {
    const sobra = Math.max(0, estado.total - estado.gastos);
    if (sobra) itens.push({ chave: 'periodo', rotulo: `${sobra} período(s) de sobra`, pontos: sobra * p.periodo });
    itens.push({ chave: 'final', rotulo: 'Maria encontrada', pontos: p.final });
    if (tipo === 'final2' || tipo === 'final3') itens.push({ chave: 'especial', rotulo: 'Final especial', pontos: p.finalEspecial });
  }
  return { itens, total: itens.reduce((s, it) => s + it.pontos, 0) };
}

const TODOS_FINAIS = ['final1', 'final2', 'final3'];

export function patente(pontosTotais, finaisVistos, regras) {
  const viuTodos = TODOS_FINAIS.every((f) => finaisVistos.includes(f));
  const alcancadas = regras.patentes.filter((pt) => pontosTotais >= pt.pontos && (!pt.exigeTodosFinais || viuTodos));
  const atual = alcancadas.at(-1);
  const proxima = regras.patentes[regras.patentes.indexOf(atual) + 1] ?? null;
  return { atual, proxima, faltam: proxima ? Math.max(0, proxima.pontos - pontosTotais) : 0, viuTodos };
}
