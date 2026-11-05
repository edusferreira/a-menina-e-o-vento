// Montagem segura de HTML por template: tudo que entra por ${} é escapado, exceto o que vier de cru().
// Evita injeção (o nome do recruta é texto livre) sem precisar de framework.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

class Cru {
  constructor(texto) { this.texto = texto; }
  toString() { return this.texto; }
}

export const cru = (texto) => new Cru(String(texto));

function formatar(valor) {
  if (valor instanceof Cru) return valor.texto;
  if (Array.isArray(valor)) return valor.map(formatar).join('');
  if (valor === false || valor === null || valor === undefined) return '';
  return esc(valor);
}

export function html(partes, ...valores) {
  return cru(partes.reduce((acc, parte, i) => acc + parte + (i < valores.length ? formatar(valores[i]) : ''), ''));
}
