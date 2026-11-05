// Relógio da investigação (seção 6): uma semana dividida em períodos; cada ação gasta períodos.
// O estado guarda só "gastos" (quantos períodos já foram usados); dia e período são derivados.

export function totalPeriodos(porDia, regras) {
  return regras.dias.length * porDia;
}

export function momento(gastos, porDia, regras) {
  const total = totalPeriodos(porDia, regras);
  const usado = Math.min(gastos, total - 1);
  const dia = Math.floor(usado / porDia);
  const periodo = usado % porDia;
  return {
    dia,
    diaNome: regras.dias[dia],
    periodo,
    periodoNome: regras.periodos[periodo],
    restantes: Math.max(0, total - gastos),
    total,
  };
}

export function custoViagem(km, regras) {
  return km > regras.custos.limiteKm ? regras.custos.viagemLonga : regras.custos.viagemCurta;
}

const SABADO = 5;
const NOITE = 3;
const OPACIDADE_MINIMA = 0.25;

/** Maria some aos poucos dos postais a partir da noite de sábado (seção 6.1). */
export function opacidadeMaria(gastos, porDia) {
  const inicio = SABADO * porDia + NOITE;
  const fim = 7 * porDia;
  if (gastos < inicio) return 1;
  const progresso = Math.min(1, (gastos - inicio + 1) / (fim - inicio + 1));
  return 1 - (1 - OPACIDADE_MINIMA) * progresso;
}
