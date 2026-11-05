// Distância entre capitais em km (fórmula de haversine): define se a viagem custa 1 ou 2 períodos.

const RAIO_TERRA_KM = 6371;
const rad = (graus) => (graus * Math.PI) / 180;

export function distanciaKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
}
