// O Vento: figura mística e andrógina, envolta em faixas de tecido (figurino do espetáculo). A nuvem antiga fica para comparação.
import { describe, it, expect } from 'vitest';
import { desenharVento } from '../src/ui/vento.js';

const camadas = (svg) => [...svg.matchAll(/data-camada="([^"]+)"/g)].map((m) => m[1]);

describe('desenharVento', () => {
  it('por padrão desenha a figura: manto de mangas largas, faixas de tecido, capuz, rosto e mãos', () => {
    const svg = desenharVento();
    expect(camadas(svg)).toEqual(expect.arrayContaining(['vento-figura', 'mangas', 'manto', 'faixas', 'capuz', 'rosto', 'maos']));
    expect(svg).toMatch(/aria-label="O Vento, figura mística/);
    expect(svg).not.toMatch(/undefined|NaN/);
  });

  it('tem expressões diferentes para calmo, bravo e dormindo', () => {
    const calmo = desenharVento();
    const bravo = desenharVento({ bravo: true });
    const dormindo = desenharVento({ dormindo: true });
    expect(new Set([calmo, bravo, dormindo]).size).toBe(3);
  });

  it('a nuvem antiga continua disponível para comparação', () => {
    expect(desenharVento({ estilo: 'nuvem' })).toMatch(/aria-label="O Vento, uma nuvem/);
  });

  it('repassa classe e atributos de posição para usar dentro das cenas', () => {
    const svg = desenharVento({ classe: 'grande', attrs: 'x="10" y="20" width="100" height="73"' });
    expect(svg).toContain('class="vento grande"');
    expect(svg).toContain('x="10" y="20" width="100" height="73"');
  });
});
