import { describe, it, expect } from 'vitest';
import {
  novoJogo, visitarLocal, viajar, voltar, escolherLocalEncontro, iniciarTeste, responderTeste, escolherFinal,
} from '../src/engine/jogo.js';
import { resumoDiario } from '../src/engine/diario.js';
import { finaisDisponiveis, pontuacaoPartida, patente } from '../src/engine/pontos.js';
import { avaliarTeste } from '../src/engine/teste.js';
import { distanciaKm } from '../src/engine/geo.js';
import { custoViagem } from '../src/engine/tempo.js';
import { dados, regras } from './fixture.js';

const SEM_INTERFERENCIA = { semInterferencia: true };
const jogo = (nivel = 'facil', perks = SEM_INTERFERENCIA) => novoJogo({ semente: '4F2A', nivel, dados, perks });

/** Visita os locais pedidos e viaja para a capital certa, parada a parada, até o encontro. */
function jogarAteEncontro(estado, locaisPorParada = [0, 1, 2]) {
  let e = estado;
  while (e.fase === 'capital') {
    for (const idx of locaisPorParada) e = visitarLocal(e, idx, dados).estado;
    e = viajar(e, e.caso.rota[e.parada + 1], dados).estado;
  }
  return e;
}

function respostasCertas(e) {
  return e.encontro.teste.map((q) => q.correta);
}

describe('ações de uma rodada', () => {
  it('começa na primeira capital da rota, segunda de manhã', () => {
    const e = jogo();
    expect(e.fase).toBe('capital');
    expect(e.capitalAtual).toBe(e.caso.rota[0]);
    expect(e.gastos).toBe(0);
  });

  it('visitar um local custa 1 período e revisitar é de graça', () => {
    let e = jogo();
    e = visitarLocal(e, 0, dados).estado;
    expect(e.gastos).toBe(1);
    const again = visitarLocal(e, 0, dados);
    expect(again.estado.gastos).toBe(1);
    expect(again.evento.repetida).toBe(true);
  });

  it('não altera o estado anterior (imutável)', () => {
    const e0 = jogo();
    visitarLocal(e0, 0, dados);
    expect(e0.gastos).toBe(0);
    expect(e0.visitados).toEqual({});
  });

  it('viagem certa avança a parada e cobra pela distância', () => {
    const e0 = jogo();
    const destino = e0.caso.rota[1];
    const km = distanciaKm(dados.porId[e0.caso.rota[0]], dados.porId[destino]);
    const { estado, evento } = viajar(e0, destino, dados);
    expect(evento.certa).toBe(true);
    expect(estado.parada).toBe(1);
    expect(estado.gastos).toBe(custoViagem(km, regras));
  });

  it('viagem errada leva à capital sem sinal; voltar custa 1 e conta o erro', () => {
    const e0 = jogo();
    const errada = e0.caso.paradas[0].opcoes.find((id) => id !== e0.caso.rota[1]);
    let r = viajar(e0, errada, dados);
    expect(r.evento.certa).toBe(false);
    expect(r.estado.fase).toBe('errada');
    expect(r.estado.visitadas).toContain(errada);
    const gastosNaErrada = r.estado.gastos;
    r = voltar(r.estado, dados);
    expect(r.estado.fase).toBe('capital');
    expect(r.estado.capitalAtual).toBe(e0.caso.rota[0]);
    expect(r.estado.gastos).toBe(gastosNaErrada + 1);
    expect(r.estado.erros[0]).toEqual([errada]);
  });

  it('interferências usam a semente: Adelaide custa 1 a mais, o Vento devolve 1', () => {
    const tipos = new Set();
    for (const semente of ['AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF', 'GGGG', 'HHHH']) {
      let e = novoJogo({ semente, nivel: 'medio', dados, perks: {} });
      for (const idx of [0, 1, 2]) {
        const antes = e.gastos;
        const r = visitarLocal(e, idx, dados);
        const tipo = r.evento.interferencia?.tipo;
        if (tipo) tipos.add(tipo);
        const esperado = { adelaide: 2, vento: 0, crispina: 1 }[tipo] ?? 1;
        expect(r.estado.gastos - antes).toBe(esperado);
        e = r.estado;
      }
    }
    expect(tipos.size).toBeGreaterThan(0);
  });

  it('acaba em derrota quando os períodos se esgotam', () => {
    let e = jogo('medio');
    let guard = 0;
    while (e.fase !== 'fim' && guard < 100) {
      const errada = e.caso.paradas[e.parada].opcoes.find((id) => id !== e.caso.rota[e.parada + 1]);
      e = viajar(e, errada, dados).estado;
      if (e.fase === 'errada') e = voltar(e, dados).estado;
      guard += 1;
    }
    expect(e.fase).toBe('fim');
    expect(e.fim.tipo).toBe('derrota');
  });
});

describe('diário', () => {
  it('página completa exige os 3 locais; postal vem da Mãe', () => {
    let e = jogo();
    e = visitarLocal(e, 0, dados).estado;
    e = visitarLocal(e, 1, dados).estado;
    let r = resumoDiario(e);
    expect(r.paginas[0].completa).toBe(false);
    e = visitarLocal(e, 2, dados).estado;
    r = resumoDiario(e);
    expect(r.paginas[0].completa).toBe(true);
    expect(r.paginas[0].postal).toBe(true);
    expect(r.paginas[0].destino.filter(Boolean)).toHaveLength(2);
    expect(r.paginas[0].rastros.filter(Boolean)).toHaveLength(3);
  });
});

describe('encontro e finais', () => {
  it('local errado custa 1; o certo abre o teste do Vento', () => {
    let e = jogarAteEncontro(jogo());
    expect(e.fase).toBe('encontro');
    const errado = [0, 1, 2].find((i) => i !== e.caso.final.localCerto);
    const antes = e.gastos;
    e = escolherLocalEncontro(e, errado, dados).estado;
    expect(e.gastos).toBe(antes + 1);
    e = escolherLocalEncontro(e, e.caso.final.localCerto, dados).estado;
    expect(e.fase).toBe('teste');
    expect(e.encontro.teste).toHaveLength(3);
  });

  it('teste: todas certas = digno, mais da metade = zomba, resto = soprado', () => {
    const t = [{ correta: 0 }, { correta: 1 }, { correta: 2 }];
    expect(avaliarTeste(t, [0, 1, 2]).nivel).toBe('digno');
    expect(avaliarTeste(t, [0, 1, 0]).nivel).toBe('zomba');
    expect(avaliarTeste(t, [0, 0, 0]).nivel).toBe('soprado');
  });

  it('ser soprado custa 2 períodos e permite novo teste', () => {
    let e = jogarAteEncontro(jogo());
    e = escolherLocalEncontro(e, e.caso.final.localCerto, dados).estado;
    const antes = e.gastos;
    const erradas = e.encontro.teste.map((q) => (q.correta + 1) % q.opcoes.length);
    e = responderTeste(e, erradas, dados).estado;
    expect(e.gastos).toBe(antes + 2);
    expect(e.fase).toBe('encontro');
    e = iniciarTeste(e, dados).estado;
    expect(e.fase).toBe('teste');
  });

  it('diário completo + Aurélia em 2 capitais + teste perfeito libera os 3 finais', () => {
    let e = jogarAteEncontro(jogo('facil'));
    e = escolherLocalEncontro(e, e.caso.final.localCerto, dados).estado;
    e = responderTeste(e, respostasCertas(e), dados).estado;
    expect(e.fase).toBe('conversa');
    const r = resumoDiario(e);
    const finais = finaisDisponiveis(e, r);
    expect(finais.final1.ok).toBe(true);
    expect(finais.final3.ok).toBe(true);
    expect(finais.final2.ok).toBe(r.aureliaCapitais >= 2);
  });

  it('pular o postal bloqueia o final 3 e pular locais bloqueia o final 2', () => {
    let e = jogo('facil');
    while (e.fase === 'capital') {
      const p = e.caso.paradas[e.parada];
      const semPostal = p.locais.map((l, i) => (l.tipo === 'postal' ? -1 : i)).filter((i) => i >= 0);
      for (const idx of semPostal) e = visitarLocal(e, idx, dados).estado;
      e = viajar(e, e.caso.rota[e.parada + 1], dados).estado;
    }
    e = escolherLocalEncontro(e, e.caso.final.localCerto, dados).estado;
    e = responderTeste(e, respostasCertas(e), dados).estado;
    const finais = finaisDisponiveis(e, resumoDiario(e));
    expect(finais.final1.ok).toBe(true);
    expect(finais.final2.ok).toBe(false);
    expect(finais.final3.ok).toBe(false);
    expect(escolherFinal(e, 'final3', dados).erro).toBeTruthy();
  });

  it('final escolhido encerra com pontuação da seção 10', () => {
    let e = jogarAteEncontro(jogo('facil'));
    e = escolherLocalEncontro(e, e.caso.final.localCerto, dados).estado;
    e = responderTeste(e, respostasCertas(e), dados).estado;
    e = escolherFinal(e, 'final1', dados).estado;
    expect(e.fase).toBe('fim');
    const p = pontuacaoPartida(e, regras);
    // 4 capitais certas de primeira (100 cada) + 5 páginas (30) + final (200) + períodos restantes (10 cada)
    const restantes = 28 - e.gastos;
    expect(p.total).toBe(400 + 150 + 200 + restantes * 10);
    expect(e.fim.pontos).toBe(p.total);
  });
});

describe('patentes', () => {
  it('sobe com pontos acumulados; Furacão exige os 3 finais', () => {
    expect(patente(0, [], regras).atual.id).toBe('recruta');
    expect(patente(1500, [], regras).atual.id).toBe('vento');
    expect(patente(7000, ['final1'], regras).atual.id).toBe('ventania');
    expect(patente(7000, ['final1', 'final2', 'final3'], regras).atual.id).toBe('furacao');
    expect(patente(600, [], regras).proxima.id).toBe('vento');
  });

  it('a patente 5 se chama Furacão', () => {
    expect(regras.patentes[4]).toMatchObject({ id: 'furacao', nome: 'Furacão' });
    expect(JSON.stringify(regras)).not.toMatch(/ventarolador/i);
  });
});
