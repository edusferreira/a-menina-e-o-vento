// Valida o conteúdo editável (data/*.json): o roteirista pode mexer nos textos e este teste avisa se algo quebrou.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { novoJogo, visitarLocal, viajar } from '../src/engine/jogo.js';
import { regras } from './fixture.js';

const ler = (nome) => JSON.parse(readFileSync(new URL(`../data/${nome}.json`, import.meta.url), 'utf8'));
const capitais = ler('capitais');
const pistas = ler('pistas');
const dialogos = ler('dialogos');
const finais = ler('finais');
const porId = Object.fromEntries(capitais.map((c) => [c.id, c]));
const dados = { capitais, porId, pistas, regras };
const REGIOES = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

describe('capitais.json', () => {
  it('tem as 27 capitais, com ids únicos e regiões válidas', () => {
    expect(capitais).toHaveLength(27);
    expect(new Set(capitais.map((c) => c.id)).size).toBe(27);
    capitais.forEach((c) => expect(REGIOES).toContain(c.regiao));
  });

  it.each(capitais.map((c) => [c.id, c]))('%s tem locais, curiosidades e distratores válidos', (_, c) => {
    expect(c.locais).toHaveLength(3);
    c.locais.forEach((l) => expect(l.nome && l.rastro).toBeTruthy());
    expect(c.curiosidades).toHaveLength(3);
    expect(c.distratores.length).toBeGreaterThanOrEqual(2);
    c.distratores.forEach((id) => {
      expect(porId[id], `${c.id} → ${id}`).toBeTruthy();
      expect(id).not.toBe(c.id);
    });
    expect(Math.abs(c.lat)).toBeLessThan(35);
    expect(c.lon).toBeLessThan(-34);
  });

  it('cada local tem uma carta de Maria em primeira pessoa, que não entrega a capital', () => {
    capitais.forEach((c) => c.locais.forEach((l) => {
      expect(l.carta, `${c.id}/${l.nome}`).toBeTruthy();
      expect(l.carta).not.toMatch(/^Maria\b/);
      expect(l.carta).toMatch(/[.!]$/);
      expect(semAcento(l.carta), c.id).not.toContain(semAcento(c.nome));
    }));
  });

  it('vinhetas e rastros não entregam o nome da capital', () => {
    capitais.forEach((c) => {
      const nome = semAcento(c.nome);
      expect(semAcento(c.vinheta), c.id).not.toContain(nome);
      c.locais.forEach((l) => expect(semAcento(l.rastro), c.id).not.toContain(nome));
    });
  });
});

describe('pistas.json', () => {
  const CATEGORIAS = Object.keys(regras.informantes);

  it.each(capitais.map((c) => [c.id]))('%s tem 16+ pistas, 2+ por categoria (seção 7), sem o nome da capital', (id) => {
    const banco = pistas[id];
    expect(banco.length).toBeGreaterThanOrEqual(16);
    CATEGORIAS.forEach((cat) => expect(banco.filter((p) => p.cat === cat).length, `${id}/${cat}`).toBeGreaterThanOrEqual(2));
    expect(banco.filter((p) => p.nivel === 'direta').length).toBeGreaterThanOrEqual(4);
    expect(banco.filter((p) => p.nivel === 'dedutiva').length).toBeGreaterThanOrEqual(4);
    expect(new Set(banco.map((p) => p.texto)).size).toBe(banco.length);
    banco.forEach((p) => {
      expect(Object.keys(regras.informantes)).toContain(p.cat);
      expect(p.porque).toBeTruthy();
      expect(semAcento(p.texto)).not.toContain(semAcento(porId[id].nome));
    });
  });
});

describe('dialogos.json e finais.json', () => {
  it('todo informante de destino tem falas com {pista}', () => {
    const usados = new Set(Object.values(regras.informantes).flat());
    usados.forEach((id) => {
      expect(dialogos.informantes[id]?.length, id).toBeGreaterThan(0);
      dialogos.informantes[id].forEach((f) => expect(/\{pista\}/i.test(f)).toBe(true));
    });
  });

  it('nenhuma fala monta "Recruta {nome}" (vira "Recruta Recruta" sem nome); usa {recruta}', () => {
    expect(JSON.stringify(dialogos)).not.toMatch(/Recruta \{nome\}/);
  });

  it('o prólogo descreve o Vento como o desenho atual (figura mística), não como o velho barrigudo da nuvem', () => {
    const textos = dialogos.prologo.map((c) => c.texto).join(' ');
    expect(textos).not.toMatch(/velho e barrigudo/);
    expect(dialogos.prologo[1].texto).toMatch(/faixas/);
  });

  it('a derrota conta que Maria virou brisa ao lado do Vento (como a cena mostra), sem dizer que ele está sozinho', () => {
    const cena = finais.finais.derrota.cena.join(' ');
    expect(cena).not.toMatch(/está sozinho/);
    expect(cena).toMatch(/vive nas rajadas/);
  });

  it('o prólogo tem 5 cenas e há 3 finais felizes mais a derrota', () => {
    expect(dialogos.prologo).toHaveLength(5);
    expect(Object.keys(finais.finais)).toEqual(['final1', 'final2', 'final3', 'derrota']);
  });
});

describe('partida completa com o conteúdo real', () => {
  it.each(['facil', 'medio', 'dificil'])('nível %s: dá para chegar ao encontro visitando 2 locais por capital', (nivel) => {
    for (const semente of ['4F2A', 'B7K9', 'ZZ22', 'MAR1'.replace('1', 'A')]) {
      let e = novoJogo({ semente, nivel, dados, perks: { semInterferencia: true } });
      while (e.fase === 'capital') {
        e = visitarLocal(e, 0, dados).estado;
        e = visitarLocal(e, 1, dados).estado;
        e = viajar(e, e.caso.rota[e.parada + 1], dados).estado;
      }
      expect(e.fase, `${nivel}/${semente}`).toBe('encontro');
    }
  });
});
