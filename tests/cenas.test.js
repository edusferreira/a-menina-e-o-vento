// Cenas ilustradas: em todo final o elenco inteiro aparece, como no agradecimento da peça.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { cenaFinal } from '../src/ui/cenas.js';

const avatar = JSON.parse(readFileSync(new URL('../data/avatar.json', import.meta.url), 'utf8'));
const ELENCO = Object.keys(avatar.personagens);

describe('cenaFinal', () => {
  it.each(['final1', 'final2', 'final3', 'derrota'])('%s mostra todo o elenco, o Vento e o recruta', (tipo) => {
    const cena = cenaFinal(tipo, avatar, avatar.personagens, avatar.padrao);
    ELENCO.filter((id) => !(tipo === 'derrota' && id === 'maria'))
      .forEach((id) => expect(cena, `${tipo}: ${id}`).toContain(`aria-label="${id}"`));
    if (tipo === 'derrota') expect(cena).toContain('aria-label="Maria virando brisa');
    expect(cena).toMatch(/aria-label="O Vento/);
    expect(cena).toContain('aria-label="Você"');
    expect(cena).toContain('data-camada="elenco"');
  });

  it('cada personagem aparece uma vez só em cada final', () => {
    ['final1', 'final2', 'final3', 'derrota'].forEach((tipo) => {
      const cena = cenaFinal(tipo, avatar, avatar.personagens, avatar.padrao);
      ELENCO.forEach((id) => expect(cena.split(`aria-label="${id}"`).length - 1, `${tipo}: ${id}`).toBeLessThanOrEqual(1));
    });
  });
});
